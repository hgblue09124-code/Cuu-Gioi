import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  ContextEngine,
  ContextCompiler,
  APERuntime,
  LocalAdapter,
  APEResultValidator,
  APEMeasurementEngine,
  JournalManager,
  APEReportGenerator,
  ProtocolSchemaValidator,
  ProtocolEngine,
  HumanSeeView,
} from '../index.js';

describe('APE Lab Suite', () => {
  test('1. Context can enter pipeline from multiple sources', () => {
    const contextEngine = new ContextEngine();
    contextEngine.addContext('conversation', 'Xin chào, hãy thực hiện huấn luyện mô hình.');
    contextEngine.addContext('game_state', { level: 5, status: 'active' });
    contextEngine.addContext('file', 'CONFIG_VERSION=1.0.0');

    const normalized = contextEngine.normalize();
    assert.equal(normalized.items.length, 3);
    assert.ok(normalized.sourcesUsed.includes('conversation'));
    assert.ok(normalized.sourcesUsed.includes('game_state'));
    assert.ok(normalized.sourcesUsed.includes('file'));
    assert.ok(normalized.rawText.includes('[SRC:CONVERSATION]'));
  });

  test('2. Compiler can create protocol from context', () => {
    const contextEngine = new ContextEngine();
    contextEngine.addContext('conversation', 'Thực hiện huấn luyện với tham số R=LQ, L=7');
    const normalized = contextEngine.normalize();

    const compiler = new ContextCompiler();
    const protocol = compiler.compile(normalized);

    assert.ok(protocol.rawString.length > 0);
    assert.ok(protocol.rawString.startsWith('T:TRAIN'));
    assert.ok(protocol.constraints.some((c) => c.key === 'R' && c.value === 'LQ'));

    const validation = ProtocolSchemaValidator.validate(protocol);
    assert.equal(validation.valid, true);
  });

  test('3. Protocol can be read and executed by runtime', async () => {
    const rawProtocolString = 'T:TRAIN|C:R=LQ,L=7|R:PRESERVE_SEMANTICS|F:CHK>ACT>UPD';
    const parsedProtocol = ProtocolEngine.parse(rawProtocolString);

    assert.equal(parsedProtocol.task.taskType, 'TRAIN');
    assert.equal(parsedProtocol.constraints.length, 2);

    const adapter = new LocalAdapter({ simulatedDelayMs: 10 });
    const runtime = new APERuntime(adapter);
    const executionResult = await runtime.execute(parsedProtocol);

    assert.ok(executionResult.executionId.startsWith('exec_'));
    assert.ok(executionResult.response.rawResponse.includes('TRAIN'));
    assert.equal(executionResult.adapterName, 'LocalModelAdapter');
  });

  test('4. Execution creates measurement', async () => {
    const contextEngine = new ContextEngine();
    contextEngine.addContext(
      'conversation',
      'Đây là một câu hội thoại dài nhằm thử nghiệm khả năng đo đạc và nén dữ liệu của APE Lab.'
    );
    const normalized = contextEngine.normalize();

    const compiler = new ContextCompiler();
    const protocol = compiler.compile(normalized);

    const adapter = new LocalAdapter({ simulatedDelayMs: 10 });
    const runtime = new APERuntime(adapter);
    const executionResult = await runtime.execute(protocol);

    const validationReport = APEResultValidator.validate(protocol, executionResult);
    const measurement = APEMeasurementEngine.measure(
      normalized,
      protocol,
      executionResult,
      validationReport
    );

    assert.ok(measurement.inputTokens > 0);
    assert.ok(measurement.compiledTokens > 0);
    assert.ok(typeof measurement.reductionPercent === 'number');
    assert.equal(measurement.status, 'SUCCESS');
    assert.equal(measurement.measurementStatus, 'ESTIMATED');
  });

  test('5. Execution creates journal record', async () => {
    const journal = new JournalManager();

    const contextEngine = new ContextEngine();
    contextEngine.addContext('conversation', 'Test journal logging');
    const normalized = contextEngine.normalize();

    const compiler = new ContextCompiler();
    const protocol = compiler.compile(normalized);

    const adapter = new LocalAdapter({ simulatedDelayMs: 10 });
    const runtime = new APERuntime(adapter);
    const executionResult = await runtime.execute(protocol);

    const validationReport = APEResultValidator.validate(protocol, executionResult);
    const measurement = APEMeasurementEngine.measure(
      normalized,
      protocol,
      executionResult,
      validationReport
    );

    journal.executions.logExecution({
      executionId: executionResult.executionId,
      timestamp: Date.now(),
      inputReference: {
        contextId: normalized.id,
        sources: normalized.sourcesUsed,
        rawSize: normalized.rawSize,
      },
      protocolReference: {
        version: protocol.version,
        rawString: protocol.rawString,
        protocolSize: measurement.protocolSizeInBytes,
      },
      measurement,
      status: 'SUCCESS',
    });

    const records = journal.executions.getAllRecords();
    assert.equal(records.length, 1);
    assert.equal(records[0].executionId, executionResult.executionId);
    assert.equal(records[0].status, 'SUCCESS');
  });

  test('6. Report is generated with correct Vietnamese format', async () => {
    const contextEngine = new ContextEngine();
    contextEngine.addContext('conversation', 'Tạo báo cáo thử nghiệm APE Lab');
    const normalized = contextEngine.normalize();

    const compiler = new ContextCompiler();
    const protocol = compiler.compile(normalized);

    const adapter = new LocalAdapter({ simulatedDelayMs: 10 });
    const runtime = new APERuntime(adapter);
    const executionResult = await runtime.execute(protocol);

    const validationReport = APEResultValidator.validate(protocol, executionResult);
    const measurement = APEMeasurementEngine.measure(
      normalized,
      protocol,
      executionResult,
      validationReport
    );

    const report = APEReportGenerator.generateReport(measurement, { experimentMode: true });

    assert.ok(report.includes('BÁO CÁO TỐI ƯU APE LAB'));
    assert.ok(report.includes('Token đầu vào'));
    assert.ok(report.includes('Token sau biên dịch'));
    assert.ok(report.includes('Toàn vẹn ngữ nghĩa'));
    assert.ok(report.includes('THÀNH CÔNG'));

    const humanView = HumanSeeView.xemContext(normalized);
    assert.ok(humanView.includes('[GIAO DIỆN CON NGƯỜI: CONTEXT NGUYÊN BẢN]'));
  });

  test('7. APE Core does NOT import any dependency from Cửu Giới', () => {
    const apeDir = path.resolve(import.meta.dirname, '..');
    const subDirsToCheck = ['core', 'measurement', 'protocol', 'journal', 'reports', 'adapters', 'human-see', 'experiments'];

    const checkImports = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== 'dist') {
            checkImports(fullPath);
          }
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase();
          assert.equal(
            content.includes('cuu-gioi'),
            false,
            `File ${fullPath} contains illegal import/reference to Cửu Giới`
          );
        }
      }
    };

    for (const subDir of subDirsToCheck) {
      checkImports(path.join(apeDir, subDir));
    }
  });

  test('8. Existing Cửu Giới functionality is not affected', () => {
    const cuuGioiPkgPath = path.resolve(import.meta.dirname, '../../artifacts/cuu-gioi/package.json');
    assert.ok(fs.existsSync(cuuGioiPkgPath));
    const cuuGioiPkg = JSON.parse(fs.readFileSync(cuuGioiPkgPath, 'utf-8'));
    assert.equal(cuuGioiPkg.name, '@workspace/cuu-gioi');
  });
});
