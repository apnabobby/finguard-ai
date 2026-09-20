import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  Cpu, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  ExternalLink,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { Transaction, CashFlowForecastResponse, GpuTelemetryData, BusinessRiskData } from '../types';

interface OverviewViewProps {
  overviewData: any;
  transactions: Transaction[];
  cashFlow: CashFlowForecastResponse | null;
  gpuData: GpuTelemetryData | null;
  businessRisk: BusinessRiskData | null;
  setActiveTab: (tab: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  overviewData,
  transactions,
  cashFlow,
  gpuData,
  businessRisk,
  setActiveTab,
  onSelectTransaction,
}) => {
  const flaggedTransactions = transactions.filter(t => t.status === 'flagged' || t.status === 'auto_blocked');
  const recentTransactions = transactions.slice(0, 5);

  const chartData = (cashFlow?.points || []).slice(0, 30).map((pt, idx) => ({
    day: `D${pt.dayIndex}`,
    balance: Math.round(pt.predictedBalance / 1000), // in $k
    revenue: Math.round(pt.revenue / 1000),
    expenses: Math.round(pt.expenses / 1000),
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-time status */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-[#0d1424]/80 to-slate-900/90 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Financial Risk & Resilience Command Center
                </h1>
                <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-800/60">
                  LIVE ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                GPU-accelerated ML inference monitoring 100% of outbound wires, recurring cash trajectories, and counterparty risks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('cfo')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-950/40 hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Ask AI CFO
            </button>
            <button
              onClick={() => setActiveTab('fraud')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              View Fraud Queue ({flaggedTransactions.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health Score */}
        <div 
          onClick={() => setActiveTab('business-risk')}
          className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4.5 hover:border-emerald-500/50 hover:bg-slate-850 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="group-hover:text-emerald-300 transition-colors">Financial Health Index</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-white">
              {overviewData?.healthScore || 84}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
            <span className="ml-auto inline-flex items-center text-xs font-semibold text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +2.4 pts
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-2">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" style={{ width: '84%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Rating: <strong className="text-emerald-300">{overviewData?.healthRating || 'Optimal Resilience'}</strong></span>
            <span className="text-emerald-400 text-[10px] group-hover:underline flex items-center">Open Risk <ArrowUpRight className="h-2.5 w-2.5 ml-0.5" /></span>
          </div>
        </div>

        {/* Card 2: Liquid Treasury & Runway */}
        <div 
          onClick={() => setActiveTab('cashflow')}
          className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4.5 hover:border-cyan-500/50 hover:bg-slate-850 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="group-hover:text-cyan-300 transition-colors">Liquid Treasury Balance</span>
            <Wallet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-white font-mono">
              ${((overviewData?.currentCashBalance || 4850000) / 1000000).toFixed(2)}M
            </span>
            <span className="ml-auto inline-flex items-center text-xs font-semibold text-cyan-400">
              {overviewData?.runwayMonths || 22.4} mo runway
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
            <span>Net Burn: <strong className="text-slate-200 font-mono">${(overviewData?.monthlyNetBurn || 42800).toLocaleString()}/mo</strong></span>
            <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
              Forecast <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Fraud & Anomalies */}
        <div 
          onClick={() => setActiveTab('fraud')}
          className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4.5 hover:border-rose-500/50 hover:bg-slate-850 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="group-hover:text-rose-300 transition-colors">Active Fraud Vector</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-rose-300">
              {overviewData?.activeAnomaliesCount || flaggedTransactions.length}
            </span>
            <span className="text-xs font-medium text-slate-400">High-risk flagged</span>
            <span className="ml-auto rounded-md bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/60">
              QUARANTINED
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
            <span>Volume: <strong className="text-rose-300 font-mono">${flaggedTransactions.reduce((a, b) => a + b.amount, 0).toLocaleString()}</strong></span>
            <span className="text-rose-400 group-hover:underline flex items-center gap-0.5">
              Review <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 4: GPU Acceleration */}
        <div 
          onClick={() => setActiveTab('gpu')}
          className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4.5 hover:border-rose-500/50 hover:bg-slate-850 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="group-hover:text-rose-300 transition-colors">AMD ROCm™ Engine</span>
            <Cpu className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-white font-mono">
              {gpuData?.mode === 'rocm' ? '1.8 ms' : '26.4 ms'}
            </span>
            <span className="text-xs font-semibold text-slate-400">batch latency</span>
            <span className="ml-auto inline-flex items-center text-xs font-bold text-rose-400">
              {gpuData?.mode === 'rocm' ? '14.6x speedup' : '1.0x baseline'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
            <span className="truncate max-w-[170px] text-slate-300">
              {gpuData?.mode === 'rocm' ? 'Instinct MI300X (192GB)' : 'Dual Xeon Fallback'}
            </span>
            <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
              Telemetry <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Middle Split: 30-Day Cash Flow Preview & Live Fraud Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: 30-Day Cash Flow Chart */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                30-Day Cash Flow Forecast Curve
              </h2>
              <p className="text-[11px] text-slate-400">
                Machine learning trajectory projecting daily liquidity, payroll dips, and confidence limits.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('cashflow')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Expand 60/90D <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          {/* Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1e293b' }}
                  tickFormatter={(val) => `$${val}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}k`, 'Predicted Cash']}
                  labelFormatter={(label) => `Forecast ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#06b6d4" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#balanceGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block" />
                Predicted Balance
              </span>
              <span className="text-slate-500">Day 14 Payroll Impact: -$210k</span>
            </div>
            <span className="font-mono text-cyan-300 font-semibold">
              End Balance: ${((cashFlow?.endingBalance || 4760000) / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Right 5 cols: Live Fraud Alerts Queue */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                High-Risk Anomalies Feed
              </h2>
              <span className="rounded-full bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800/60">
                {flaggedTransactions.length} Pending Actions
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Real-time transactions quarantined by Isolation Forest & Deep Autoencoder models.
            </p>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {flaggedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="cursor-pointer rounded-lg border border-slate-800 bg-slate-900/80 p-3 hover:border-rose-600/50 hover:bg-slate-800/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white">{tx.id}</span>
                        <span className="rounded bg-rose-950 px-1.5 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-800/50 uppercase">
                          {tx.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-300 truncate mt-0.5">{tx.entity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-white block">
                        ${tx.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-400">
                        Risk: {tx.riskScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-1">
                    ⚠️ {tx.riskFactors[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">ML Engine: ROCm HIP Kernel (1.6ms)</span>
            <button
              onClick={() => setActiveTab('fraud')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              Open Fraud Center <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Counterparty Risk & AI CFO Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Counterparty Snapshot */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Counterparty & Concentration Exposure
            </h2>
            <button
              onClick={() => setActiveTab('business-risk')}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-0.5"
            >
              Deep Analysis <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Top 3 Customer Concentration</span>
                <span className="text-[11px] text-slate-400">Apex Global, OmniStream, BioSynthetica</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400 font-mono">64.2% ARR</span>
                <span className="text-[10px] text-slate-400 block">DSO: 47.8 Days</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Single Point of Failure (Suppliers)</span>
                <span className="text-[11px] text-slate-400">Nebula Cloud & AMD GPU Cluster Compute</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-400 font-mono">42.1% Spend</span>
                <span className="text-[10px] text-slate-400 block">6-week replacement lag</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Disputed Receivables</span>
                <span className="text-[11px] text-slate-400">Vanguard Aerospace SLA SLA dispute</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400 font-mono">$90,000</span>
                <span className="text-[10px] text-slate-400 block">DSO: 65 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI CFO Proactive Intelligence Box */}
        <div className="rounded-xl border border-purple-900/40 bg-gradient-to-br from-purple-950/20 via-slate-900/50 to-indigo-950/20 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">AI CFO Proactive Insights</h2>
              </div>
              <span className="rounded-full bg-purple-900/60 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-700/60">
                GEMINI 2.5 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              "Liquidity cushion remains resilient at <strong>22.4 months</strong>. However, Apex Global's 45-day overdue receivable ($210k) intersects with Day 42 franchise tax payments ($180k). Immediate recommended action: execute wire hold on <strong>TX-98421</strong> ($342.5k) and initiate prompt-pay incentive with Apex."
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Context: Live application state synced</span>
            <button
              onClick={() => setActiveTab('cfo')}
              className="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1.5"
            >
              Open AI CFO Console <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
