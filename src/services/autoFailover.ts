// Fix: Populated file with full implementation of the Auto-Failover service.
import { apiHealthMonitor } from './apiHealth';
import { callAI, getAiSettings } from './aiService';

class AutoFailoverService {

  async callWithAutoFailover(
    prompt: string,
    options: {
      images?: string[];
      systemPrompt?: string;
      requireVision?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<{ data: any; provider: string; attempts: number }> {
    const {
      images,
      systemPrompt,
      requireVision = !!(images && images.length > 0),
      maxRetries = 3,
    } = options;

    await apiHealthMonitor.checkAll();
    let availableProviders = apiHealthMonitor.getActiveProviders(requireVision);

    if (availableProviders.length === 0) {
      throw new Error(requireVision ? 'No active vision-capable providers available.' : 'No active providers available.');
    }
    
    // Re-order providers based on user preference
    const settings = getAiSettings();
    const preferredProviderId = settings.preferredProvider;

    if (preferredProviderId) {
        const preferredIndex = availableProviders.findIndex(p => p.id === preferredProviderId);
        // If the preferred provider is found and is not already first
        if (preferredIndex > 0) {
            const [preferredProvider] = availableProviders.splice(preferredIndex, 1);
            availableProviders.unshift(preferredProvider);
            console.log(`[Failover] Prioritizing preferred provider: ${preferredProviderId}`);
        }
    }


    let lastError: Error | null = null;

    for (let attempt = 0; attempt < Math.min(availableProviders.length, maxRetries); attempt++) {
      const provider = availableProviders[attempt];
      console.log(`[Failover] Attempt ${attempt + 1}/${maxRetries} with ${provider.id}`);
      try {
        const data = await callAI({
          provider: provider.id,
          prompt,
          images,
          systemPrompt,
        });
        console.log(`[Failover] ✅ Success with ${provider.id}`);
        return { data, provider: provider.id, attempts: attempt + 1 };
      } catch (error: any) {
        console.error(`[Failover] ❌ Attempt ${attempt + 1} with ${provider.id} failed:`, error.message);
        lastError = error;
        // Mark provider as having an error for this session
        apiHealthMonitor.getStatus(provider.id)!.status = 'error';
        apiHealthMonitor.getStatus(provider.id)!.errorMessage = error.message;
      }
    }

    throw new Error(`All provider attempts failed. Last error: ${lastError?.message}`);
  }
}

export const autoFailover = new AutoFailoverService();