export interface ChangeRecord {
  id: string;
  component: 'COMPILER' | 'PROTOCOL' | 'RUNTIME' | 'VALIDATOR' | 'ADAPTER';
  changeSummary: string;
  timestamp: number;
  author?: string;
}

export class ChangesJournal {
  private records: ChangeRecord[] = [];

  public logChange(
    component: ChangeRecord['component'],
    changeSummary: string,
    author?: string
  ): ChangeRecord {
    const record: ChangeRecord = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      component,
      changeSummary,
      timestamp: Date.now(),
      author,
    };
    this.records.push(record);
    return record;
  }

  public getChanges(): ChangeRecord[] {
    return [...this.records];
  }
}
