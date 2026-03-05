// ─── App Root ───
import React, { useState, useEffect } from 'react';
import { FinanceProvider } from '@/store/FinanceContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DashboardView from '@/components/views/DashboardView';
import AgentPanel from '@/components/agent/AgentPanel';
import SmartImport from '@/components/editors/SmartImport';
import OnboardingWizard from '@/components/views/OnboardingWizard';

const ONBOARDING_KEY = 'fcc_onboarding_complete';

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
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(ONBOARDING_KEY);
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

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
