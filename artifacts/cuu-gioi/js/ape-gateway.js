import {
  ContextEngine,
  ContextCompiler,
  APERuntime,
  LocalAdapter,
  APEResultValidator,
  APEMeasurementEngine,
  APEReportGenerator,
} from '@workspace/ape-lab';

export const APEGatewayUI = {
  async compileContext() {
    const textarea = document.getElementById('apeContextInput');
    const resultArea = document.getElementById('apeResultArea');
    const errorArea = document.getElementById('apeErrorDisplay');

    if (!textarea || !resultArea || !errorArea) return;

    resultArea.style.display = 'none';
    errorArea.style.display = 'none';

    const contextText = textarea.value.trim();
    if (!contextText) {
      errorArea.innerText = 'Vui lòng nhập Context trước khi biên dịch!';
      errorArea.style.display = 'block';
      return;
    }

    try {
      // 1. Ingest context into APE Context Engine
      const contextEngine = new ContextEngine();
      contextEngine.addContext('conversation', contextText);
      const normalizedContext = contextEngine.normalize();

      // 2. Compile via APE Compiler
      const compiler = new ContextCompiler();
      const protocol = compiler.compile(normalizedContext);

      // 3. Execute via APERuntime & Adapter
      const adapter = new LocalAdapter({ modelName: 'ape-local-v1', simulatedDelayMs: 20 });
      const runtime = new APERuntime(adapter);
      const executionResult = await runtime.execute(protocol);

      // 4. Validate output
      const validationReport = APEResultValidator.validate(protocol, executionResult);

      // 5. Measure via APEMeasurementEngine using real tiktoken cl100k_base
      const measurement = APEMeasurementEngine.measureActual(
        normalizedContext,
        protocol,
        executionResult,
        validationReport,
        'cl100k_base'
      );

      // 6. Generate Vietnamese Report
      const report = APEReportGenerator.generateReport(measurement, { experimentMode: true });

      // Render results to UI
      const taskDisplay = document.getElementById('apeTaskDisplay');
      const protocolDisplay = document.getElementById('apeProtocolDisplay');
      const originalTokensDisplay = document.getElementById('apeOriginalTokens');
      const protocolTokensDisplay = document.getElementById('apeProtocolTokens');
      const savedTokensDisplay = document.getElementById('apeSavedTokens');
      const reductionDisplay = document.getElementById('apeReduction');
      const semanticDisplay = document.getElementById('apeSemanticIntegrity');
      const execTimeDisplay = document.getElementById('apeExecutionTime');
      const statusDisplay = document.getElementById('apeMeasurementStatus');
      const reportDisplay = document.getElementById('apeFullReport');

      if (taskDisplay) taskDisplay.innerText = `Task: ${protocol.task.taskType}`;
      if (protocolDisplay) protocolDisplay.innerText = protocol.rawString;

      const isMeasured = measurement.measurementStatus !== 'NOT_AVAILABLE';
      if (originalTokensDisplay) originalTokensDisplay.innerText = isMeasured ? String(measurement.inputTokens) : 'NOT_AVAILABLE';
      if (protocolTokensDisplay) protocolTokensDisplay.innerText = isMeasured ? String(measurement.compiledTokens) : 'NOT_AVAILABLE';
      if (savedTokensDisplay) savedTokensDisplay.innerText = isMeasured ? String(measurement.savedTokens) : 'NOT_AVAILABLE';
      if (reductionDisplay) reductionDisplay.innerText = isMeasured ? `${measurement.reductionPercent}%` : 'NOT_AVAILABLE';

      if (semanticDisplay) semanticDisplay.innerText = `${measurement.semanticIntegrityPercent}%`;
      if (execTimeDisplay) execTimeDisplay.innerText = `${measurement.executionTimeSeconds}s`;
      if (statusDisplay) statusDisplay.innerText = measurement.measurementStatus;
      if (reportDisplay) reportDisplay.innerText = report;

      resultArea.style.display = 'block';
    } catch (err) {
      errorArea.innerText = `Lỗi thực thi APE: ${err instanceof Error ? err.message : String(err)}`;
      errorArea.style.display = 'block';
    }
  },
};

// Explicitly expose on global scope for inline HTML onclick handlers
if (typeof globalThis !== 'undefined') {
  globalThis.APEGatewayUI = APEGatewayUI;
}
if (typeof window !== 'undefined') {
  window.APEGatewayUI = APEGatewayUI;
}
