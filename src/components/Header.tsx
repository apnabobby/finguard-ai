import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Flame, 
  Activity, 
  RefreshCw, 
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { GpuTelemetryData } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gpuData: GpuTelemetryData | null;
  onToggleGpuMode: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onOpenScanModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  gpuData,
  onToggleGpuMode,
  onRefreshData,
  isRefreshing,
  onOpenScanModal,
}) => {
  const isRocm = gpuData?.mode === 'rocm';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                FinGuard <span className="text-cyan-400">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center rounded-md bg-cyan-950/60 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-800/50">
                ENTERPRISE
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-medium text-slate-400">
              GPU-Powered Financial Risk Intelligence
            </p>
          </div>
        </div>

        {/* Center Pill: Status & GPU Mode */}
        <div className="flex items-center gap-3">
          {/* AMD ROCm / CPU Toggle Pill */}
          <button
            id="header-gpu-toggle-btn"
            onClick={onToggleGpuMode}
            className={`group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
              isRocm
                ? 'bg-rose-950/40 text-rose-300 border-rose-700/50 hover:bg-rose-900/50 hover:border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                : 'bg-amber-950/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/50 hover:border-amber-600'
            }`}
            title="Click to toggle between AMD ROCm GPU Acceleration and CPU Fallback"
          >
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRocm ? 'bg-rose-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isRocm ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              <span>{isRocm ? 'AMD ROCm 6.2' : 'CPU Fallback'}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">
                {isRocm ? '(MI300X 14.6x)' : '(Xeon Mode)'}
              </span>
            </div>
          </button>

          {/* Quick Health Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs border border-slate-800 text-slate-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Health Score:</span>
            <span className="font-bold text-emerald-400">84/100</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Runway: 22.4m</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            id="header-refresh-btn"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Refresh All Risk Telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Trigger ML Scan Button */}
          <button
            id="header-run-scan-btn"
            onClick={onOpenScanModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-900/30 hover:from-cyan-500 hover:to-blue-500 transition-all active:scale-95"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Run ML Scan</span>
            <span className="sm:hidden">Scan</span>
          </button>

          {/* AI CFO Quick Launcher */}
          <button
            id="header-ai-cfo-quick-btn"
            onClick={() => setActiveTab('cfo')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
              activeTab === 'cfo'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/50'
                : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:bg-purple-900/40 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>AI CFO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
