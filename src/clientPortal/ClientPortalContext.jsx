import React, { createContext, useContext, useMemo, useState } from 'react';

const ClientPortalContext = createContext(null);

export function ClientPortalProvider({ children, value }) {
  const [selectedSiteId, setSelectedSiteId] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ctx = useMemo(() => ({ ...value, selectedSiteId, setSelectedSiteId, sidebarOpen, setSidebarOpen }), [value, selectedSiteId, sidebarOpen]);
  return <ClientPortalContext.Provider value={ctx}>{children}</ClientPortalContext.Provider>;
}

export function useClientPortal() {
  const ctx = useContext(ClientPortalContext);
  if (!ctx) throw new Error('useClientPortal must be used inside ClientPortalProvider');
  return ctx;
}
