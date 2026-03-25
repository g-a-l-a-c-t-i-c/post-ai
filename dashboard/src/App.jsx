import React, { useState } from 'react';
import QueryConsole from './panels/QueryConsole.jsx';
import Migrations from './panels/Migrations.jsx';
import AuditTrail from './panels/AuditTrail.jsx';
import Health from './panels/Health.jsx';

const API_BASE = 'https://post-ai.g-a-l-a-c-t-i-c.com';

const tabs = [
  { id: 'query', label: 'Query Console' },
  { id: 'migrations', label: 'Migrations' },
  { id: 'audit', label: 'Audit Trail' },
  { id: 'health', label: 'Health' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('query');
  const [apiKey, setApiKey] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };

  const api = {
    base: API_BASE,
    headers,
    async post(path, body) {
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      return res.json();
    },
    async get(path) {
      const res = await fetch(`${API_BASE}${path}`, { headers });
      return res.json();
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-surface/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center font-bold text-xs">P</div>
          <span className="text-lg font-bold">Post AI</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">API Key:</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Bearer token..."
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm w-56 focus:border-primary focus:outline-none"
          />
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-gray-800 px-6 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Panel */}
      <main className="flex-1 p-6">
        {activeTab === 'query' && <QueryConsole api={api} />}
        {activeTab === 'migrations' && <Migrations api={api} />}
        {activeTab === 'audit' && <AuditTrail api={api} />}
        {activeTab === 'health' && <Health api={api} />}
      </main>
    </div>
  );
}
