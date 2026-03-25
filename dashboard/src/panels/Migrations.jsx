import React, { useState, useEffect } from 'react';

export default function Migrations({ api }) {
  const [status, setStatus] = useState(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const data = await api.get('/migrations/status');
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const applyMigrations = async () => {
    setApplying(true);
    setMessage(null);
    try {
      const data = await api.post('/migrations/apply', {});
      setMessage(data.message || `Applied ${data.applied || 0} migration(s)`);
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Migrations</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchStatus}
            className="px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={applyMigrations}
            disabled={applying || !status?.pending?.length}
            className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {applying ? 'Applying...' : 'Apply Pending'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4 text-green-300 text-sm">
          {message}
        </div>
      )}

      {status && (
        <>
          {/* Applied */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Applied ({status.applied?.length || 0})
          </h3>
          <div className="space-y-2 mb-8">
            {(status.applied || []).map((m, i) => (
              <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-mono text-sm">{m.name || m}</span>
                </div>
                {m.applied_at && <span className="text-xs text-gray-500">{m.applied_at}</span>}
              </div>
            ))}
            {(!status.applied || status.applied.length === 0) && (
              <p className="text-gray-500 text-sm">No migrations applied yet.</p>
            )}
          </div>

          {/* Pending */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pending ({status.pending?.length || 0})
          </h3>
          <div className="space-y-2">
            {(status.pending || []).map((m, i) => (
              <div key={i} className="bg-gray-900 border border-yellow-800/30 rounded-lg px-4 py-3 flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="font-mono text-sm">{m.name || m}</span>
              </div>
            ))}
            {(!status.pending || status.pending.length === 0) && (
              <p className="text-gray-500 text-sm">All migrations applied.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
