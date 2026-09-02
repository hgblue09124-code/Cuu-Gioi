import {
  ContextEngine,
  ContextCompiler,
  APERuntime,
  LocalAdapter,
  APEResultValidator,
  APEMeasurementEngine,
  JournalManager,
  APEReportGenerator,
  HumanSeeView,
} from '../../index.js';

export async function runExperiment002() {
  console.log('=== APE LAB — EXPERIMENT #002: REAL TOKEN MEASUREMENT ===\n');

  // 1. Context input (Same baseline context as Experiment #001)
  const contextEngine = new ContextEngine();
  contextEngine.addContext(
    'conversation',
    'Runtime Console của Cửu Giới cần sửa lỗi cuộn nội dung. Giữ nguyên các chức năng hiện có. Sau khi sửa phải kiểm tra lại Runtime Console.'
  );

  // 2. Normalize
  const normalizedContext = contextEngine.normalize();
  console.log(HumanSeeView.xemContext(normalizedContext));
  console.log('\n');

  // 3. Compiler: Infer Task -> Resolve Context -> Build Protocol
  const compiler = new ContextCompiler();
  const protocol = compiler.compile(normalizedContext);

  console.log(HumanSeeView.xemProtocol(protocol));
  console.log('\n');

  // 4. Runtime execution via LocalAdapter
  const adapter = new LocalAdapter({ modelName: 'ape-local-v1', simulatedDelayMs: 20 });
  const runtime = new APERuntime(adapter);
  const executionResult = await runtime.execute(protocol);

  console.log(HumanSeeView.xemKetQua(executionResult));
  console.log('\n');

  // 5. Validator
  const validationReport = APEResultValidator.validate(protocol, executionResult);

  // 6. REAL TOKEN MEASUREMENT using tiktoken cl100k_base
  const measurement = APEMeasurementEngine.measureActual(
    normalizedContext,
    protocol,
    executionResult,
    validationReport,
    'cl100k_base'
  );

  // 7. Log to Journal
  const journal = new JournalManager();
  journal.executions.logExecution({
    executionId: executionResult.executionId,
    timestamp: executionResult.timestamp,
    inputReference: {
      contextId: normalizedContext.id,
      sources: normalizedContext.sourcesUsed,
      rawSize: normalizedContext.rawSize,
    },
    protocolReference: {
      version: protocol.version,
      rawString: protocol.rawString,
      protocolSize: measurement.protocolSizeInBytes,
    },
    measurement,
    status: measurement.status,
  });

  journal.discoveries.logDiscovery(
    'Experiment #002 - Real Token Measurement Completed',
    `Original Tokens: ${measurement.inputTokens}, Protocol Tokens: ${measurement.compiledTokens}, Saved: ${measurement.savedTokens} (${measurement.reductionPercent}%). Tokenizer: ${measurement.tokenizerInfo}`
  );

  // 8. Generate Vietnamese Report
  const report = APEReportGenerator.generateReport(measurement, { experimentMode: true });
  console.log(report);

  return {
    normalizedContext,
    protocol,
    executionResult,
    measurement,
    report,
  };
}

// Allow direct execution via tsx
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  runExperiment002().catch(console.error);
}
