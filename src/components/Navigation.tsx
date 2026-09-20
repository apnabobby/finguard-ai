import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  TrendingUp, 
  Briefcase, 
  Cpu, 
  MessageSquareText 
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  flaggedCount: number;
  gpuMode: 'rocm' | 'cpu';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  flaggedCount,
  gpuMode,
}) => {
  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'fraud',
      name: 'Fraud Detection',
      icon: ShieldAlert,
      badge: flaggedCount > 0 ? `${flaggedCount} Alerts` : null,
      badgeColor: 'bg-rose-950/80 text-rose-300 border border-rose-700/60',
    },
    {
      id: 'cashflow',
      name: 'Cash Flow Forecasting',
      icon: TrendingUp,
      badge: '30-90D',
      badgeColor: 'bg-blue-950/80 text-blue-300 border border-blue-700/60',
    },
    {
      id: 'business-risk',
      name: 'Business Risk',
      icon: Briefcase,
      badge: '68/100',
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-700/60',
    },
    {
      id: 'gpu',
      name: 'AMD GPU + ROCm',
      icon: Cpu,
      badge: gpuMode === 'rocm' ? '14.6x' : 'CPU',
      badgeColor: gpuMode === 'rocm' 
        ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60' 
        : 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'cfo',
      name: 'AI CFO Assistant',
      icon: MessageSquareText,
      badge: 'Gemini',
      badgeColor: 'bg-purple-950/80 text-purple-300 border border-purple-700/60',
    },
  ];

  return (
    <nav className="w-full border-b border-slate-800/80 bg-[#090d16]/70 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl space-x-1 overflow-x-auto py-2.5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
              }`} />
              <span>{tab.name}</span>
              {tab.badge && (
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
