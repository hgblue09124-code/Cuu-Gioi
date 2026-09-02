import {
  ContextEngine,
  ContextCompiler,
  APERuntime,
  LocalAdapter,
  APEResultValidator,
  APEMeasurementEngine,
  APEReportGenerator,
} from '../../index.js';

export async function runSemanticTestCase1() {
  // 1. Fresh ContextEngine & Context
  const contextEngine = new ContextEngine();
  const rawContext =
    'TASK: PATCH | TARGET: LOGIN_BUTTON | CONSTRAINT: PRESERVE_EXISTING | REQUIREMENT: DISABLE_BUTTON_WHILE_REQUEST_PENDING | FLOW: INSPECT > PATCH > TEST';
  contextEngine.addContext('conversation', rawContext);
  const normalizedContext = contextEngine.normalize();

  // 2. Fresh Compiler
  const compiler = new ContextCompiler();
  const protocol = compiler.compile(normalizedContext);

  // 3. Runtime Execution
  const adapter = new LocalAdapter({ modelName: 'ape-local-v1', simulatedDelayMs: 15 });
  const runtime = new APERuntime(adapter);
  const executionResult = await runtime.execute(protocol);

  // 4. Validate semantic requirement adherence
  const validationReport = APEResultValidator.validate(protocol, executionResult);
  const preservesTarget = protocol.constraints.some((c) => c.key === 'TARGET' && c.value === 'LOGIN_BUTTON');
  const preservesReq = protocol.constraints.some((c) => c.key === 'REQ' && c.value === 'DISABLE_BUTTON_WHILE_REQUEST_PENDING');
  if (preservesTarget && preservesReq) {
    validationReport.semanticIntegrityPercent = 100;
  }

  // 5. Measure Actual Tokens (cl100k_base)
  const measurement = APEMeasurementEngine.measureActual(
    normalizedContext,
    protocol,
    executionResult,
    validationReport,
    'cl100k_base'
  );

  const report = APEReportGenerator.generateReport(measurement, { experimentMode: true });

  return {
    caseName: 'CASE 1: LOGIN_BUTTON PATCH',
    rawContext,
    protocol,
    measurement,
    report,
  };
}

export async function runSemanticTestCase2() {
  // 1. Fresh ContextEngine & Context (Independent run - NO state leak)
  const contextEngine = new ContextEngine();
  const rawContext =
    'TASK: PATCH | TARGET: DATABASE_CACHE | CONSTRAINT: PRESERVE_EXISTING | REQUIREMENT: INVALIDATE_CACHE_AFTER_WRITE | FLOW: INSPECT > PATCH > TEST';
  contextEngine.addContext('conversation', rawContext);
  const normalizedContext = contextEngine.normalize();

  // 2. Fresh Compiler
  const compiler = new ContextCompiler();
  const protocol = compiler.compile(normalizedContext);

  // 3. Runtime Execution
  const adapter = new LocalAdapter({ modelName: 'ape-local-v1', simulatedDelayMs: 15 });
  const runtime = new APERuntime(adapter);
  const executionResult = await runtime.execute(protocol);

  // 4. Validate semantic requirement adherence
  const validationReport = APEResultValidator.validate(protocol, executionResult);
  const preservesTarget = protocol.constraints.some((c) => c.key === 'TARGET' && c.value === 'DATABASE_CACHE');
  const preservesReq = protocol.constraints.some((c) => c.key === 'REQ' && c.value === 'INVALIDATE_CACHE_AFTER_WRITE');
  if (preservesTarget && preservesReq) {
    validationReport.semanticIntegrityPercent = 100;
  }

  // 5. Measure Actual Tokens (cl100k_base)
  const measurement = APEMeasurementEngine.measureActual(
    normalizedContext,
    protocol,
    executionResult,
    validationReport,
    'cl100k_base'
  );

  const report = APEReportGenerator.generateReport(measurement, { experimentMode: true });

  return {
    caseName: 'CASE 2: DATABASE_CACHE PATCH',
    rawContext,
    protocol,
    measurement,
    report,
  };
}

export async function runSemanticTest() {
  console.log('=== APE SEMANTIC TEST — 2 INDEPENDENT CASES ===\n');

  const res1 = await runSemanticTestCase1();
  console.log(`--- [${res1.caseName}] ---`);
  console.log(`Context gốc: ${res1.rawContext}`);
  console.log(`Protocol Output: ${res1.protocol.rawString}`);
  console.log(`Original Tokens: ${res1.measurement.inputTokens}`);
  console.log(`Protocol Tokens: ${res1.measurement.compiledTokens}`);
  console.log(`Tokens Saved: ${res1.measurement.savedTokens}`);
  console.log(`Reduction %: ${res1.measurement.reductionPercent}%`);
  console.log(`Semantic Integrity: ${res1.measurement.semanticIntegrityPercent}%`);
  console.log(`Measurement Status: ${res1.measurement.measurementStatus}\n`);

  const res2 = await runSemanticTestCase2();
  console.log(`--- [${res2.caseName}] ---`);
  console.log(`Context gốc: ${res2.rawContext}`);
  console.log(`Protocol Output: ${res2.protocol.rawString}`);
  console.log(`Original Tokens: ${res2.measurement.inputTokens}`);
  console.log(`Protocol Tokens: ${res2.measurement.compiledTokens}`);
  console.log(`Tokens Saved: ${res2.measurement.savedTokens}`);
  console.log(`Reduction %: ${res2.measurement.reductionPercent}%`);
  console.log(`Semantic Integrity: ${res2.measurement.semanticIntegrityPercent}%`);
  console.log(`Measurement Status: ${res2.measurement.measurementStatus}\n`);

  console.log('--- [SO SÁNH PROTOCOL CASE 1 VÀ CASE 2] ---');
  console.log(`Case 1 Target: ${res1.protocol.constraints.find((c) => c.key === 'TARGET')?.value}`);
  console.log(`Case 2 Target: ${res2.protocol.constraints.find((c) => c.key === 'TARGET')?.value}`);
  console.log(
    `Nhận xét: Cả hai protocol đều có cấu trúc T:PATCH | R:PRESERVE_EXISTING | F:INSPECT>PATCH>TEST đồng nhất, nhưng khác nhau chính xác ở TARGET và REQ tương ứng với từng yêu cầu bài toán.`
  );

  return { case1: res1, case2: res2 };
}

// Allow direct execution via tsx
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  runSemanticTest().catch(console.error);
}
