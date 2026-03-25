import React, { useState } from 'react';

export default function AuditTrail({ api }) {
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entries, setEntries] = useState(null);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAudit = async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError(null);
    setVerification(null);
    try {
      const data = await api.get(`/audit/${entityType}/${entityId}`);
      setEntries(data.entries || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/audit/verify/${entityType}/${entityId}`);
      setVerification(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <h2 className="text-xl font-bold mb-4">Audit Trail</h2>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="Entity type (e.g. account)"
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm flex-1 focus:border-primary focus:outline-none"
        />
        <input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Entity ID"
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm flex-1 focus:border-primary focus:outline-none"
        />
        <button
          onClick={fetchAudit}
          disabled={loading || !entityType || !entityId}
          className="px-5 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
        <button
          onClick={verifyChain}
          disabled={loading || !entityType || !entityId}
          className="px-5 py-2 border border-gray-700 hover:border-accent text-gray-300 hover:text-accent rounded-lg text-sm transition-colors"
        >
          Verify Chain
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Verification Result */}
      {verification && (
        <div className={`border rounded-lg p-4 mb-6 text-sm ${
          verification.valid
            ? 'bg-green-900/20 border-green-800 text-green-300'
            : 'bg-red-900/20 border-red-800 text-red-300'
        }`}>
          {verification.valid
            ? `Chain integrity verified. ${verification.count || 0} entries, all hashes valid.`
            : `Chain integrity BROKEN at entry ${verification.broken_at || 'unknown'}. ${verification.message || ''}`}
        </div>
      )}

      {/* Audit Entries */}
      {entries && Array.isArray(entries) && (
        <div className="space-y-3">
          {entries.length === 0 && <p className="text-gray-500 text-sm">No audit entries found.</p>}
          {entries.map((entry, i) => (
            <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    entry.action === 'INSERT' ? 'bg-green-900/30 text-green-400' :
                    entry.action === 'UPDATE' ? 'bg-blue-900/30 text-blue-400' :
                    entry.action === 'DELETE' ? 'bg-red-900/30 text-red-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {entry.action}
                  </span>
                  <span className="text-xs text-gray-500">{entry.timestamp}</span>
                </div>
                <span className="font-mono text-xs text-gray-600" title={entry.hash}>
                  #{entry.hash?.slice(0, 12)}...
                </span>
              </div>
              {entry.changes && (
                <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
                  {JSON.stringify(entry.changes, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
