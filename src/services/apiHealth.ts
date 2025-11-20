// Fix: Populated file with full implementation of the API Health Monitoring service.
import { AiProvider } from '../types';

export interface ApiProviderStatus {
  id: string;
  name: string;
  status: 'active' | 'error' | 'quota_exceeded' | 'unconfigured';
  hasVision: boolean;
  hasKey?: boolean; // Optional, inferred from check
  lastChecked: Date;
  responseTime?: number;
  errorMessage?: string;
  costPer1M: number;
}

export const PROVIDER_CONFIGS: Record<string, { id: string; name: string; hasVision: boolean; costPer1M: number; priority: number; }> = {
  perplexity: { id: 'perplexity', name: 'Perplexity AI', hasVision: false, costPer1M: 0.20, priority: 1 },
  openai: { id: 'openai', name: 'OpenAI (Sora-2)', hasVision: true, costPer1M: 0, priority: 2 },
  moonshot: { id: 'moonshot', name: 'Moonshot AI', hasVision: false, costPer1M: 2.0, priority: 3 },
  gemini: { id: 'gemini', name: 'Google Gemini', hasVision: true, costPer1M: 0, priority: 4 },
  claude: { id: 'claude', name: 'Claude (Anthropic)', hasVision: true, costPer1M: 3.0, priority: 5 },
  xai: { id: 'xai', name: 'xAI (Grok)', hasVision: false, costPer1M: 0.25, priority: 5.5 },
  deepseek: { id: 'deepseek', name: 'DeepSeek', hasVision: true, costPer1M: 0.14, priority: 6 },
};

class ApiHealthMonitor {
  private statuses = new Map<string, ApiProviderStatus>();
  private checking = false;

  constructor() {
    // Initialize with unconfigured status
    Object.values(PROVIDER_CONFIGS).forEach(config => {
        this.statuses.set(config.id, {
            ...config,
            status: 'unconfigured',
            lastChecked: new Date(),
        });
    });
  }

  async checkProvider(providerId: string): Promise<ApiProviderStatus> {
    const config = PROVIDER_CONFIGS[providerId];
    if (!config) throw new Error(`Unknown provider: ${providerId}`);

    console.log(`[Health] Checking ${providerId}...`);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, test: true }),
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      let status: ApiProviderStatus;
      if (response.ok) {
        status = { ...config, status: 'active', hasKey: true, lastChecked: new Date(), responseTime };
      } else {
        const errorMsg = data.error || 'Unknown error';
        let statusType: 'error' | 'quota_exceeded' | 'unconfigured' = 'error';
        if (errorMsg.toLowerCase().includes('quota')) statusType = 'quota_exceeded';
        if (errorMsg.toLowerCase().includes('not configured')) statusType = 'unconfigured';
        status = { ...config, status: statusType, hasKey: statusType !== 'unconfigured', lastChecked: new Date(), errorMessage: errorMsg };
      }
      this.statuses.set(providerId, status);
      return status;
    } catch (error: any) {
      console.error(`[Health] ${providerId} check failed:`, error);
      const errorStatus: ApiProviderStatus = { ...config, status: 'error', hasKey: false, lastChecked: new Date(), errorMessage: error.message };
      this.statuses.set(providerId, errorStatus);
      return errorStatus;
    }
  }

  async checkAll(): Promise<ApiProviderStatus[]> {
    if (this.checking) return Array.from(this.statuses.values());
    this.checking = true;
    console.log('[Health] Checking all providers...');
    try {
      await Promise.all(Object.keys(PROVIDER_CONFIGS).map(id => this.checkProvider(id)));
      return this.getAllStatuses();
    } finally {
      this.checking = false;
    }
  }

  getStatus(providerId: string): ApiProviderStatus | undefined {
    return this.statuses.get(providerId);
  }

  getAllStatuses(): ApiProviderStatus[] {
    return Array.from(this.statuses.values()).sort((a,b) => PROVIDER_CONFIGS[a.id].priority - PROVIDER_CONFIGS[b.id].priority);
  }

  getActiveProviders(requireVision: boolean = false): ApiProviderStatus[] {
    return this.getAllStatuses()
      .filter(s => s.status === 'active' && (!requireVision || s.hasVision));
  }
}

export const apiHealthMonitor = new ApiHealthMonitor();