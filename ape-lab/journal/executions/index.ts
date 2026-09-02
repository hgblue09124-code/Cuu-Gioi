import { APEMeasurementResult } from '../../measurement/index.js';

export interface ExecutionRecord {
  executionId: string;
  timestamp: number;
  inputReference: {
    contextId: string;
    sources: string[];
    rawSize: number;
  };
  protocolReference: {
    version: string;
    rawString: string;
    protocolSize: number;
  };
  measurement: APEMeasurementResult;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  error?: string;
  metadata?: Record<string, unknown>;
}

export class ExecutionJournal {
  private records: ExecutionRecord[] = [];

  public logExecution(record: ExecutionRecord): void {
    this.records.push(record);
  }

  public getRecordById(id: string): ExecutionRecord | undefined {
    return this.records.find((r) => r.executionId === id);
  }

  public getAllRecords(): ExecutionRecord[] {
    return [...this.records];
  }

  public clear(): void {
    this.records = [];
  }
}
