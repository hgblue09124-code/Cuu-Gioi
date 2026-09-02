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

export async function runExperiment001() {
  console.log('=== APE LAB — EXPERIMENT #001: MINIMAL TOKEN TEST ===\n');

  // 1. Context input
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
  const adapter = new LocalAdapter({ modelName: 'ape-local-v1', simulatedDelayMs: 25 });
  const runtime = new APERuntime(adapter);
  const executionResult = await runtime.execute(protocol);

  console.log(HumanSeeView.xemKetQua(executionResult));
  console.log('\n');

  // 5. Validator
  const validationReport = APEResultValidator.validate(protocol, executionResult);

  // 6. Measurement (useTokenHeuristic = false because no actual LLM tokenizer is present -> NOT_AVAILABLE)
  const measurement = APEMeasurementEngine.measure(
    normalizedContext,
    protocol,
    executionResult,
    validationReport,
    false // DO NOT fake token counts; set measurementStatus: 'NOT_AVAILABLE'
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
    'Experiment #001 - Minimal Token Test Completed',
    `Protocol generated: ${protocol.rawString}. Pipeline validated without modifying Cửu Giới source code.`
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
  runExperiment001().catch(console.error);
}
