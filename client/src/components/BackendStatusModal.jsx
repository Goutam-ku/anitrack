import React, { useState, useEffect } from 'react';
import { getApiBase, setApiBase, getBackendStatus, checkHealth, apiEvents } from '../services/apiClient';

export default function BackendStatusModal({ isOpen, onClose }) {
  const [url, setUrl] = useState(getApiBase());
  const [status, setStatus] = useState(getBackendStatus());
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const handleStatus = (e) => setStatus(e.detail.status);
    apiEvents.addEventListener('status-change', handleStatus);
    return () => apiEvents.removeEventListener('status-change', handleStatus);
  }, []);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setMsg('');
    setApiBase(url);
    const ok = await checkHealth();
    setTesting(false);
    if (ok) {
      setMsg('Connected to backend API successfully!');
    } else {
      setMsg('Backend unreachable or cold starting. Resilient Local Mode is active (all features work offline).');
    }
  };

  const handleSave = () => {
    setApiBase(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Backend & API Status</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-lg border border-white/5">
          <div className={`status-dot ${status === 'online' ? 'online' : 'local'}`} />
          <div>
            <div className="text-sm font-semibold">
              {status === 'online' ? 'Backend Connected' : 'Resilient Local Fallback Active'}
            </div>
            <div className="text-xs text-slate-400">
              {status === 'online' ? 'Express API responding normally' : 'Zero-delay local storage active (offline-first)'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">Backend API Endpoint URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://anitrack-1.onrender.com/api"
            className="w-full bg-slate-800 border border-white/10 rounded px-3 h-10 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        {msg && (
          <div className={`text-xs p-2 rounded ${status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {msg}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="px-3 py-1.5 rounded border border-white/20 text-xs font-semibold hover:bg-white/5"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
