import React, { useState, useEffect } from 'react';

export default function Health({ api }) {
  const [health, setHealth] = useState(null);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const data = await api.get('/health');
      const ms = Math.round(performance.now() - start);
      setLatency(ms);
      setHealth(data);
      setError(null);
    } catch (err) {
      setLatency(null);
      setHealth(null);
      setError(err.message);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = health?.status === 'ok' ? 'green' : error ? 'red' : 'yellow';

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Health</h2>
        <button
          onClick={checkHealth}
          className="px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-4 h-4 rounded-full bg-${statusColor}-500 ${health?.status === 'ok' ? 'animate-pulse' : ''}`}></div>
          <span className="text-2xl font-bold">
            {health?.status === 'ok' ? 'Connected' : error ? 'Unreachable' : 'Checking...'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Latency</div>
            <div className="text-2xl font-mono font-bold">
              {latency !== null ? `${latency}ms` : '--'}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
            <div className={`text-2xl font-bold text-${statusColor}-400`}>
              {health?.status?.toUpperCase() || (error ? 'ERROR' : '...')}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      {health && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            {health.database && (
              <div className="flex justify-between">
                <span className="text-gray-400">Database</span>
                <span className="font-mono">{health.database}</span>
              </div>
            )}
            {health.version && (
              <div className="flex justify-between">
                <span className="text-gray-400">PostgreSQL Version</span>
                <span className="font-mono">{health.version}</span>
              </div>
            )}
            {health.hyperdrive !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Hyperdrive</span>
                <span className={`font-mono ${health.hyperdrive ? 'text-green-400' : 'text-gray-500'}`}>
                  {health.hyperdrive ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
            {health.uptime && (
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="font-mono">{health.uptime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
