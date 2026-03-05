// ─── App Root ───
import React, { useState } from 'react';
import { FinanceProvider } from '@/store/FinanceContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DashboardView from '@/components/views/DashboardView';
import AgentPanel from '@/components/agent/AgentPanel';
import SmartImport from '@/components/editors/SmartImport';

export default function App() {
  return (
    <FinanceProvider>
      <AppShell />
    </FinanceProvider>
  );
}

function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [smartImportOpen, setSmartImportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSmartImport={() => setSmartImportOpen(true)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-56'
        }`}
      >
        <TopBar />
        <DashboardView />
      </main>

      <AgentPanel />
      <SmartImport
        isOpen={smartImportOpen}
        onClose={() => setSmartImportOpen(false)}
      />
    </div>
  );
}
