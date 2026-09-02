export interface DiscoveryRecord {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  tags: string[];
}

export class DiscoveriesJournal {
  private records: DiscoveryRecord[] = [];

  public logDiscovery(title: string, description: string, tags: string[] = []): DiscoveryRecord {
    const record: DiscoveryRecord = {
      id: `disc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      timestamp: Date.now(),
      tags,
    };
    this.records.push(record);
    return record;
  }

  public getDiscoveries(): DiscoveryRecord[] {
    return [...this.records];
  }
}
