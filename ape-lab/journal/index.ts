import { ExecutionJournal } from './executions/index.js';
import { DiscoveriesJournal } from './discoveries/index.js';
import { ChangesJournal } from './changes/index.js';

export * from './executions/index.js';
export * from './discoveries/index.js';
export * from './changes/index.js';

export class JournalManager {
  public executions = new ExecutionJournal();
  public discoveries = new DiscoveriesJournal();
  public changes = new ChangesJournal();
}
