// Fix: Populated file with full implementation of the API Health Dashboard component.
import React, { useState, useEffect } from 'react';
import { apiHealthMonitor, ApiProviderStatus } from '../services/apiHealth';

export function ApiHealthDashboard() {
  const [statuses, setStatuses] = useState<ApiProviderStatus[]>([]);
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkAll = async () => {
    setChecking(true);
    const results = await apiHealthMonitor.checkAll();
    setStatuses(results);
    setChecking(false);
  };
  
  const checkOne = async (providerId: string) => {
    setChecking(true);
    await apiHealthMonitor.checkProvider(providerId);
    setStatuses(apiHealthMonitor.getAllStatuses());
    setChecking(false);
  };

  useEffect(() => {
    checkAll();
    // Fix: Refactor interval handling to use browser-compatible types and avoid potential unassigned variable errors.
    if (autoRefresh) {
      const interval = setInterval(checkAll, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusBadge = (status: ApiProviderStatus['status']) => {
    const styles = {
      active: "bg-green-500/20 text-green-400",
      quota_exceeded: "bg-yellow-500/20 text-yellow-400",
      error: "bg-red-500/20 text-red-400",
      unconfigured: "bg-gray-500/20 text-gray-400",
    };
    const text = {
        active: "✅ Active",
        quota_exceeded: "⚠️ Quota",
        error: "❌ Error",
        unconfigured: "⚙️ Unconfigured"
    }
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status]}`}>{text[status]}</span>;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2"><span className="text-2xl">🔌</span>API Provider Status</h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded bg-gray-700 border-gray-600"/>
            Auto-refresh
          </label>
          <button onClick={checkAll} disabled={checking} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors">
            {checking ? '⏳ Checking...' : '🔄 Refresh All'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {statuses.map(provider => (
          <div key={provider.id} className={`bg-gray-700/50 rounded-lg p-4 border-2 ${provider.status === 'active' ? 'border-green-500/30' : 'border-gray-600'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-lg font-semibold text-white">{provider.name}</h4>
                  {getStatusBadge(provider.status)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><div className="text-gray-400 text-xs mb-1">Vision</div><div className="text-white font-medium">{provider.hasVision ? '✅ Yes' : '❌ No'}</div></div>
                  <div><div className="text-gray-400 text-xs mb-1">Cost/1M</div><div className="text-white font-medium">${provider.costPer1M > 0 ? provider.costPer1M.toFixed(2) : 'Free'}</div></div>
                  {provider.responseTime && <div><div className="text-gray-400 text-xs mb-1">Response</div><div className="text-white font-medium">{provider.responseTime}ms</div></div>}
                  <div><div className="text-gray-400 text-xs mb-1">Last Check</div><div className="text-white font-medium text-xs">{new Date(provider.lastChecked).toLocaleTimeString()}</div></div>
                </div>
                {provider.errorMessage && <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">{provider.errorMessage}</div>}
              </div>
              <div className="ml-4">
                <button onClick={() => checkOne(provider.id)} disabled={checking} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded text-sm transition-colors">
                  {checking ? '⏳' : '🧪 Test'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300"><strong>🤖 Auto-Failover Enabled:</strong> The system automatically uses the best available provider. If one fails, it switches to the next.</p>
      </div>
    </div>
  );
}

export default ApiHealthDashboard;