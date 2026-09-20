import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  Info, 
  DollarSign, 
  Layers, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { CashFlowForecastResponse } from '../types';

interface CashFlowViewProps {
  cashFlow: CashFlowForecastResponse | null;
  currentHorizon: 30 | 60 | 90;
  onChangeHorizon: (days: 30 | 60 | 90) => void;
  currentScenario: 'base' | 'conservative' | 'aggressive';
  onChangeScenario: (scenario: 'base' | 'conservative' | 'aggressive') => void;
  isLoading: boolean;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  cashFlow,
  currentHorizon,
  onChangeHorizon,
  currentScenario,
  onChangeScenario,
  isLoading,
}) => {
  const [chartMode, setChartMode] = useState<'balance' | 'inflow_outflow'>('balance');

  const points = cashFlow?.points || [];

  const chartData = points.map((pt) => ({
    date: pt.date,
    day: `D${pt.dayIndex}`,
    dayIndex: pt.dayIndex,
    balance: Math.round(pt.predictedBalance / 1000),
    upper: Math.round(pt.upperConfidence / 1000),
    lower: Math.round(pt.lowerConfidence / 1000),
    stress: Math.round(pt.stressBalance / 1000),
    revenue: Math.round(pt.revenue / 1000),
    expenses: Math.round(pt.expenses / 1000),
    net: Math.round(pt.netCashFlow / 1000),
    eventNote: pt.eventNote,
  }));

  const startBal = cashFlow?.startingBalance || 4850000;
  const endBal = cashFlow?.endingBalance || 4760000;
  const netDelta = endBal - startBal;
  const netBurn = cashFlow?.netBurnMonthly || 42800;
  const runway = cashFlow?.runwayMonths || 22.4;

  return (
    <div className="space-y-6">
      {/* Header with Horizon & Scenario Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            Cash Flow Forecasting & Liquidity Stress Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Temporal Fusion Transformer (TFT) model predicting daily cash inflows, cyclical payroll, AP outflows, and runway boundaries.
          </p>
        </div>

        {/* Controls: Horizon & Scenario */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Horizon Selector */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            {([30, 60, 90] as const).map((days) => (
              <button
                key={days}
                onClick={() => onChangeHorizon(days)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  currentHorizon === days
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            {(['base', 'conservative', 'aggressive'] as const).map((scen) => (
              <button
                key={scen}
                onClick={() => onChangeScenario(scen)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  currentScenario === scen
                    ? scen === 'conservative'
                      ? 'bg-amber-600 text-white'
                      : scen === 'aggressive'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {scen === 'conservative' ? 'Stressed Case' : scen === 'aggressive' ? 'Growth Case' : 'Base Case'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-[11px] text-slate-400 font-medium">Starting Treasury</span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            ${(startBal / 1000000).toFixed(2)}M
          </p>
          <span className="text-[10px] text-slate-500">Day 0 Cash in Bank</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-[11px] text-slate-400 font-medium">{currentHorizon}-Day Projected Balance</span>
          <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
            ${(endBal / 1000000).toFixed(2)}M
          </p>
          <div className="flex items-center gap-1 text-[10px] mt-0.5">
            {netDelta >= 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3" /> +${(netDelta / 1000).toFixed(0)}k
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center">
                <ArrowDownRight className="h-3 w-3" /> -${Math.abs(netDelta / 1000).toFixed(0)}k
              </span>
            )}
            <span className="text-slate-500">net change</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-[11px] text-slate-400 font-medium">Monthly Net Burn Rate</span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            ${netBurn.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Normalized OPEX + payroll</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-[11px] text-slate-400 font-medium">Forecast Runway</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {runway} Months
          </p>
          <span className="text-[10px] text-emerald-400/80 font-semibold">Resilient Solvency Tier</span>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              {currentHorizon}-Day Forecast & Confidence Band Trajectory
            </h2>
            <p className="text-[11px] text-slate-400">
              Shaded interval represents 90% confidence limits (P10 to P90) based on AR variance and payment delays.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setChartMode('balance')}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                chartMode === 'balance' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Balance Curve
            </button>
            <button
              onClick={() => setChartMode('inflow_outflow')}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                chartMode === 'inflow_outflow' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inflows vs Outflows
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'balance' ? (
              <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(v) => `$${v}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '8px',
                    fontSize: '12px' 
                  }}
                  formatter={(val: any, name: any) => {
                    const label = name === 'balance' ? 'Predicted Balance' : name === 'upper' ? 'Upper Bound (P90)' : name === 'lower' ? 'Lower Bound (P10)' : 'Stressed Scenario';
                    return [`$${Number(val).toLocaleString()}k`, label];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return `${label} (${item?.date || ''})${item?.eventNote ? ` — ⚠️ ${item.eventNote}` : ''}`;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => {
                    if (value === 'balance') return 'Baseline Predicted Balance';
                    if (value === 'upper') return 'Upper Confidence Band (P90)';
                    if (value === 'lower') return 'Lower Confidence Band (P10)';
                    if (value === 'stress') return 'Stressed Shock Model';
                    return value;
                  }}
                />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceFill)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#090d16" />
                <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                  formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}k`, name === 'revenue' ? 'Revenue (Inflow)' : 'Expenses (Outflow)']}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="revenue" fill="#10b981" radius={[3, 3, 0, 0]} name="Inflows (Revenue)" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Outflows (OPEX + Payroll)" />
                <Line type="monotone" dataKey="net" stroke="#38bdf8" strokeWidth={2} name="Net Cash Flow" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Forecast Milestones & Event Markers */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs font-bold text-white block mb-2">Key Financial Milestones in {currentHorizon}-Day Horizon</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-start gap-2 p-2 rounded bg-slate-950/60 border border-slate-800">
              <Calendar className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Bi-Weekly Payroll Runs (D14, D28, D42)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Recurring $210,000 draw per cycle; fully cushioned by current receivables.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded bg-slate-950/60 border border-slate-800">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Semi-Annual Franchise Tax (D42)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Scheduled $180,000 statutory tax liability; requires $250k liquid reserve buffer.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded bg-slate-950/60 border border-slate-800">
              <DollarSign className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Enterprise ARR Renewals</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Expected $340,000 ARR contract renewal cycle from Tier-1 clients in Month 2.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Risk Alerts */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          Proactive Liquidity Risk Warnings & Recommended Interventions
        </h2>

        <div className="space-y-3">
          {(cashFlow?.riskAlerts || []).map((alert, idx) => (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${
                alert.type === 'critical'
                  ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                  : alert.type === 'warning'
                  ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
                  : 'bg-blue-950/20 border-blue-900/50 text-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-1.5 ${
                  alert.type === 'critical' ? 'bg-rose-900/40 text-rose-400' : alert.type === 'warning' ? 'bg-amber-900/40 text-amber-400' : 'bg-blue-900/40 text-blue-400'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{alert.message}</span>
                    <span className="text-[10px] font-mono opacity-75">{alert.date}</span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    Estimated cash impact: <strong className="font-mono">${alert.impactAmount.toLocaleString()} USD</strong>
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] rounded bg-slate-900/80 px-2.5 py-1 border border-slate-700 font-semibold text-slate-300">
                  {alert.type === 'critical' ? 'Action Required' : alert.type === 'warning' ? 'Monitoring' : 'Positive Inflow'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
