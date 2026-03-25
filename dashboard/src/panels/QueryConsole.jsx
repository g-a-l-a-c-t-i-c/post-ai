import React, { useState } from 'react';

export default function QueryConsole({ api }) {
  const [sql, setSql] = useState('SELECT NOW();');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post('/query', { sql, params: [] });
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <h2 className="text-xl font-bold mb-4">Query Console</h2>

      {/* SQL Input */}
      <div className="mb-4">
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          rows={6}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm focus:border-primary focus:outline-none resize-y"
          placeholder="Enter SQL query..."
        />
      </div>

      <button
        onClick={execute}
        disabled={loading || !sql.trim()}
        className="px-6 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors mb-6"
      >
        {loading ? 'Executing...' : 'Execute'}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4 text-red-300 text-sm font-mono">
          {error}
        </div>
      )}

      {/* Results Table */}
      {result && result.rows && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-700 text-xs text-gray-400">
            {result.rows.length} row{result.rows.length !== 1 ? 's' : ''} returned
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {result.rows.length > 0 &&
                    Object.keys(result.rows[0]).map((col) => (
                      <th key={col} className="text-left px-4 py-2 text-gray-400 font-medium">
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-2 font-mono text-xs">
                        {val === null ? <span className="text-gray-600">NULL</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
