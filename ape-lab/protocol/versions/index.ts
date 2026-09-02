import { APEProtocol } from '../../core/protocol/types.js';

export interface ProtocolVersionInfo {
  version: string;
  description: string;
  releasedAt: string;
}

export class ProtocolVersionRegistry {
  private static versions: Map<string, ProtocolVersionInfo> = new Map([
    [
      'v0.1',
      {
        version: 'v0.1',
        description: 'Initial APE concise protocol specification',
        releasedAt: '2025-01-01',
      },
    ],
  ]);

  public static isSupported(version: string): boolean {
    return this.versions.has(version);
  }

  public static getInfo(version: string): ProtocolVersionInfo | undefined {
    return this.versions.get(version);
  }

  public static listVersions(): ProtocolVersionInfo[] {
    return Array.from(this.versions.values());
  }

  public static migrate(protocol: APEProtocol, targetVersion: string): APEProtocol {
    if (protocol.version === targetVersion) {
      return protocol;
    }
    if (!this.isSupported(targetVersion)) {
      throw new Error(`Unsupported target protocol version: ${targetVersion}`);
    }
    return {
      ...protocol,
      version: targetVersion,
    };
  }
}
