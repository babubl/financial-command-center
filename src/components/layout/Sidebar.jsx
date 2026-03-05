// ─── Sidebar Navigation ───
import React from 'react';
import { useFinance, useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { getHealthColor } from '@/config/theme';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  CreditCard,
  TrendingUp,
  Target,
  PieChart,
  Bot,
  Download,
  Upload,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'networth', label: 'Net Worth', icon: Wallet },
  { id: 'tax', label: 'Tax Planning', icon: Receipt },
  { id: 'debt', label: 'Debt & Loans', icon: CreditCard },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'budget', label: 'Budget', icon: PieChart },
];

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const data = useFinance();
  const dispatch = useFinanceDispatch();
  const { healthScore } = useFinanceStore();
  const activeModule = data._ui?.activeModule || 'dashboard';

  const handleNav = (id) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_MODULE, payload: id });
  };

  const handleExport = () => {
    import('@/services/storage').then(({ exportData }) => {
      const { _ui, ...dataToExport } = data;
      exportData(dataToExport);
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset all data to sample? Your changes will be lost.')) {
      dispatch({ type: ACTIONS.RESET_TO_SAMPLE });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const { importData } = await import('@/services/storage');
      const imported = await importData(file);
      if (imported) {
        dispatch({ type: ACTIONS.IMPORT_DATA, payload: imported });
      } else {
        alert('Invalid file format.');
      }
    };
    input.click();
  };

  const scoreColor = getHealthColor(healthScore.overall);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-navy-800/80 backdrop-blur-md border-r border-navy-500/50 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="px-3 py-4 border-b border-navy-500/50 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${scoreColor}40, ${scoreColor}15)`, border: `1px solid ${scoreColor}40` }}
        >
          <span className="text-sm font-bold font-mono" style={{ color: scoreColor }}>
            {healthScore.overall}
          </span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold text-slate-100 tracking-wide leading-tight">
              COMMAND
            </h1>
            <h1 className="text-[10px] font-medium text-dim tracking-widest">
              CENTER
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-cyan/10 text-cyan border border-cyan/20'
                  : 'text-muted hover:text-slate-100 hover:bg-navy-600/50 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 ${isActive ? 'text-cyan' : 'text-dim group-hover:text-muted'}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* AI Agent Button */}
      <div className="px-2 py-2">
        <button
          onClick={() => dispatch({ type: ACTIONS.TOGGLE_AGENT })}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            data._ui?.agentOpen
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              : 'bg-navy-600/50 text-muted hover:text-slate-100 hover:bg-navy-600 border border-navy-500/50'
          }`}
          title={collapsed ? 'AI Agent' : undefined}
        >
          <Bot size={18} className="flex-shrink-0" />
          {!collapsed && <span>AI Agent</span>}
          {!collapsed && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
              AI
            </span>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="px-2 py-3 border-t border-navy-500/50 space-y-1">
        <button onClick={handleExport} className="btn-ghost w-full flex items-center gap-2 text-xs" title="Export">
          <Download size={14} />
          {!collapsed && <span>Export Backup</span>}
        </button>
        <button onClick={handleImport} className="btn-ghost w-full flex items-center gap-2 text-xs" title="Import">
          <Upload size={14} />
          {!collapsed && <span>Import Data</span>}
        </button>
        <button onClick={handleReset} className="btn-ghost w-full flex items-center gap-2 text-xs text-amber-400/70 hover:text-amber-400" title="Reset">
          <RotateCcw size={14} />
          {!collapsed && <span>Reset to Sample</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-navy-700 border border-navy-500 flex items-center justify-center text-dim hover:text-slate-100 hover:border-cyan/30 transition-all z-50"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
