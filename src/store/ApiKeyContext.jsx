// ─── API Key Context ───
// Enter once, available to Agent + Smart Import + any AI feature.
// Stored in sessionStorage (cleared on tab close, not persisted).

import React, { createContext, useContext, useState, useEffect } from 'react';

const ApiKeyContext = createContext(null);

const STORAGE_KEY = 'fcc_api_key_session';

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
  });

  useEffect(() => {
    try {
      if (apiKey) sessionStorage.setItem(STORAGE_KEY, apiKey);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [apiKey]);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, hasKey: !!apiKey.trim() }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error('useApiKey must be used within ApiKeyProvider');
  return ctx;
}
