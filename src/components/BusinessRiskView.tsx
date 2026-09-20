import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  Truck, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  PieChart as PieIcon,
  ShieldAlert,
  Percent,
  TrendingDown,
  X,
  FileText,
  DollarSign
} from 'lucide-react';
import { BusinessRiskData, CustomerRiskItem, SupplierRiskItem } from '../types';

interface BusinessRiskViewProps {
  businessRisk: BusinessRiskData | null;
}

export const BusinessRiskView: React.FC<BusinessRiskViewProps> = ({ businessRisk }) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers' | 'expenses'>('customers');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRiskItem | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRiskItem | null>(null);

  if (!businessRisk) {
    return <div className="p-8 text-center text-slate-500">Loading risk intelligence...</div>;
  }

  const { compositeScore, customerConcentrationRisk, supplierDependencyRisk, expenseVolatility } = businessRisk;

  const getRiskScoreBadge = (score: number) => {
    if (score >= 70) {
      return <span className="rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/60 font-mono">{score}/100 Critical</span>;
    }
    if (score >= 40) {
      return <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800/60 font-mono">{score}/100 Moderate</span>;
    }
    return <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/60 font-mono">{score}/100 Low</span>;
  };

  const getStatusBadge = (status: CustomerRiskItem['paymentStatus']) => {
    if (status === 'Current') {
      return <span className="rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-semibold">Current</span>;
    }
    if (status === 'Disputed') {
      return <span className="rounded bg-rose-950/60 text-rose-400 border border-rose-800/50 px-2 py-0.5 text-[10px] font-semibold">Disputed</span>;
    }
    return <span className="rounded bg-amber-950/60 text-amber-400 border border-amber-800/50 px-2 py-0.5 text-[10px] font-semibold">{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header & Composite Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-amber-400" />
            Enterprise Business Risk Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Holistic counterparty exposure audit across customer concentration, supplier single-points-of-failure, and OPEX volatility.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Composite Risk Score</span>
            <span className="text-xs text-amber-400 font-semibold">Moderate Exposure</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-base">
            {compositeScore}
          </div>
        </div>
      </div>

      {/* Top 3 Core Vulnerabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Concentration */}
        <div 
          onClick={() => setActiveTab('customers')}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeTab === 'customers' 
              ? 'border-cyan-500/60 bg-slate-900/90 shadow-md shadow-cyan-950/30' 
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-cyan-400" /> Customer Exposure
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">{customerConcentrationRisk.top3Share}% ARR</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            {customerConcentrationRisk.weightedDSO} Days DSO
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Top 3 customers account for over 64% of total revenue. Apex Global is 45 days overdue.
          </p>
        </div>

        {/* Supplier Dependency */}
        <div 
          onClick={() => setActiveTab('suppliers')}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeTab === 'suppliers' 
              ? 'border-cyan-500/60 bg-slate-900/90 shadow-md shadow-cyan-950/30' 
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-rose-400" /> Supplier Dependency
            </span>
            <span className="text-xs font-mono font-bold text-rose-400">{supplierDependencyRisk.singlePointFailuresCount} SPOF</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            ${(supplierDependencyRisk.monthlyExposures / 1000).toFixed(0)}k/mo
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Critical sole-source supplier for AMD GPU compute clusters has 6-week replacement lead time.
          </p>
        </div>

        {/* Expense Volatility */}
        <div 
          onClick={() => setActiveTab('expenses')}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeTab === 'expenses' 
              ? 'border-cyan-500/60 bg-slate-900/90 shadow-md shadow-cyan-950/30' 
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-purple-400" /> Expense Volatility
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">{expenseVolatility.variableRatio}% Variable</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            {expenseVolatility.runawayAlerts.length} Active Alerts
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            GPU cluster burst hours +28% over budget; foreign exchange translation drag on EU contracts.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'customers' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          Customer Concentration & Receivables ({customerConcentrationRisk.customers.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'suppliers' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          Supplier Criticality & Vendors ({supplierDependencyRisk.suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'expenses' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          Cost Volatility & Runaway Alerts ({expenseVolatility.runawayAlerts.length})
        </button>
      </div>

      {/* View 1: Customers Table */}
      {activeTab === 'customers' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Top Customer Accounts & Credit Scoring</h2>
              <p className="text-[11px] text-slate-400">Analysis of revenue concentration, Days Sales Outstanding (DSO), and payment health.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              High Risk Receivables: <strong className="text-rose-400 font-bold">${(customerConcentrationRisk.highRiskReceivables).toLocaleString()}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Customer / Tier</th>
                  <th className="py-3 px-4 font-semibold">Monthly MRR</th>
                  <th className="py-3 px-4 font-semibold">ARR Share</th>
                  <th className="py-3 px-4 font-semibold">DSO (Days)</th>
                  <th className="py-3 px-4 font-semibold">Payment Status</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 font-semibold">Primary Risk Factor</th>
                  <th className="py-3 px-4 font-semibold text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerConcentrationRisk.customers.map((cust) => (
                  <tr 
                    key={cust.id} 
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block hover:text-cyan-400 transition-colors">{cust.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{cust.tier} Tier ({cust.id})</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      ${cust.mrr.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-200">
                        <span>{cust.arrPercentage}%</span>
                        {cust.arrPercentage > 20 && (
                          <span className="rounded bg-rose-950 px-1 text-[9px] font-bold text-rose-400 border border-rose-800">
                            High
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={cust.dso > 50 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {cust.dso} d
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(cust.paymentStatus)}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      {cust.creditRating}
                    </td>

                    <td className="py-3 px-4">
                      {getRiskScoreBadge(cust.riskScore)}
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-xs text-[11px]">
                      {cust.primaryRiskReason}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Suppliers Table */}
      {activeTab === 'suppliers' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Vendor Dependency & Business Continuity Risk</h2>
            <p className="text-[11px] text-slate-400">Critical operational suppliers, single-point-of-failure bottlenecks, and switching lead times.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Vendor / Service Category</th>
                  <th className="py-3 px-4 font-semibold">Monthly Spend</th>
                  <th className="py-3 px-4 font-semibold">OPEX Share</th>
                  <th className="py-3 px-4 font-semibold">Criticality</th>
                  <th className="py-3 px-4 font-semibold">Switching Lag</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 font-semibold">Main Risk Factors</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {supplierDependencyRisk.suppliers.map((supp) => (
                  <tr 
                    key={supp.id} 
                    onClick={() => setSelectedSupplier(supp)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block hover:text-rose-400 transition-colors">{supp.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{supp.category}</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      ${supp.monthlySpend.toLocaleString()}/mo
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {supp.spendPercentage}%
                    </td>

                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        supp.criticality === 'Essential' 
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' 
                          : supp.criticality === 'High' 
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {supp.criticality}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {supp.substitutabilityTimeWeeks} weeks
                    </td>

                    <td className="py-3 px-4">
                      {getRiskScoreBadge(supp.riskScore)}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-sm">
                      {supp.riskFactors.join('; ')}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedSupplier(supp)}
                        className="rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                      >
                        Failover Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Expense Volatility */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-xs font-bold text-white mb-2">Cost Structure Elasticity</h3>
              <div className="flex items-center gap-4 text-xs mt-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Fixed Cost Baseline</span>
                    <span className="font-mono font-bold text-white">{expenseVolatility.fixedRatio}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${expenseVolatility.fixedRatio}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Headcount, Colocation, Core Software</span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Variable / Elastic Costs</span>
                    <span className="font-mono font-bold text-white">{expenseVolatility.variableRatio}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${expenseVolatility.variableRatio}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">ROCm GPU compute burst, contractor audit</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-xs font-bold text-white mb-2">Runway Sensitivity Matrix</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A 10% unexpected expansion in variable GPU compute + contract audit costs reduces runway by <strong>1.8 months</strong>. Maintaining a minimum $250k liquidity buffer mitigates statutory tax shocks.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Active Financial Runaway & Margin Compression Alerts
            </h3>
            <div className="space-y-2.5">
              {expenseVolatility.runawayAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{alert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Risk Dossier Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Account Dossier & Credit Intelligence</span>
                <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">Account ID: {selectedCustomer.id} | Tier: {selectedCustomer.tier}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Metric grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Monthly MRR</span>
                  <span className="text-sm font-mono font-bold text-white">${selectedCustomer.mrr.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Company ARR Share</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{selectedCustomer.arrPercentage}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Days Sales Outstanding</span>
                  <span className={`text-sm font-mono font-bold ${selectedCustomer.dso > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedCustomer.dso} Days
                  </span>
                </div>
              </div>

              {/* Status & Rating */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Payment Status</span>
                  <div className="mt-1">{getStatusBadge(selectedCustomer.paymentStatus)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Internal Credit Rating</span>
                  <span className="text-sm font-bold font-mono text-slate-200">{selectedCustomer.creditRating}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Risk Score</span>
                  <div className="mt-1">{getRiskScoreBadge(selectedCustomer.riskScore)}</div>
                </div>
              </div>

              {/* Primary Risk Driver */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 text-rose-200">
                <span className="text-[11px] font-bold text-rose-400 block mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Risk Factor Assessment
                </span>
                <p className="leading-relaxed">{selectedCustomer.primaryRiskReason}</p>
              </div>

              {/* Recommended CFO Action */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/50 text-cyan-200">
                <span className="text-[11px] font-bold text-cyan-400 block mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Recommended CFO Mitigation Action
                </span>
                <p className="leading-relaxed">
                  Offer standard <strong>2/10 Net 30 prompt-pay incentives</strong> to pull forward cash collections and reduce DSO by 15 days. For disputed amounts, execute executive billing mediation.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                }}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 shadow-md"
              >
                Generate Collection Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Continuity Plan Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Vendor Dependency & Business Continuity</span>
                <h3 className="text-lg font-bold text-white">{selectedSupplier.name}</h3>
                <p className="text-xs text-slate-400">Category: {selectedSupplier.category} | Criticality: {selectedSupplier.criticality}</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Monthly Spend</span>
                  <span className="text-sm font-mono font-bold text-white">${selectedSupplier.monthlySpend.toLocaleString()}/mo</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total OPEX Share</span>
                  <span className="text-sm font-mono font-bold text-rose-400">{selectedSupplier.spendPercentage}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Switching Lead Time</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{selectedSupplier.substitutabilityTimeWeeks} Weeks</span>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 text-rose-200">
                <span className="text-[11px] font-bold text-rose-400 block mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Single Point of Failure Vectors
                </span>
                <ul className="space-y-1 list-disc list-inside text-[11px]">
                  {selectedSupplier.riskFactors.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>

              {/* Failover Playbook */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                <span className="text-[11px] font-bold text-white block mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" /> Active Continuity Standby
                </span>
                <p className="leading-relaxed">
                  Secondary warm-standby agreements active with dual cloud providers. In the event of an outage or contract breach, workloads auto-reroute to alternative multi-region infrastructure within 48 hours.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedSupplier(null);
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md"
              >
                Execute SLA Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
