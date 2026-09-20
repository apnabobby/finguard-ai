import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Filter, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  FileText
} from 'lucide-react';
import { Transaction, GpuTelemetryData } from '../types';

interface FraudDetectionViewProps {
  transactions: Transaction[];
  gpuData: GpuTelemetryData | null;
  onUpdateStatus: (id: string, newStatus: Transaction['status']) => void;
  onTriggerScan: (customTx?: any) => Promise<any>;
  selectedTx: Transaction | null;
  setSelectedTx: (tx: Transaction | null) => void;
  isScanning: boolean;
}

export const FraudDetectionView: React.FC<FraudDetectionViewProps> = ({
  transactions,
  gpuData,
  onUpdateStatus,
  onTriggerScan,
  selectedTx,
  setSelectedTx,
  isScanning,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'flagged' | 'under_review' | 'cleared' | 'auto_blocked'>('all');
  const [minRiskScore, setMinRiskScore] = useState<number>(0);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Simulation form state
  const [simEntity, setSimEntity] = useState('Veloce Capital Global LP');
  const [simAmount, setSimAmount] = useState('285000');
  const [simCategory, setSimCategory] = useState<Transaction['category']>('Wire Transfer');
  const [simReason, setSimReason] = useState('Cross-border wire to non-domiciled jurisdiction outside business hours');

  const filtered = transactions.filter(t => {
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (t.riskScore < minRiskScore) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.entity.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const flaggedCount = transactions.filter(t => t.status === 'flagged' || t.status === 'auto_blocked').length;
  const underReviewCount = transactions.filter(t => t.status === 'under_review').length;
  const clearedCount = transactions.filter(t => t.status === 'cleared').length;
  const totalVolume = transactions.reduce((a, b) => a + b.amount, 0);

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onTriggerScan({
      entity: simEntity,
      amount: Number(simAmount),
      category: simCategory,
      customFactors: [simReason]
    });
    setShowSimulateModal(false);
  };

  const getRiskBadge = (score: number) => {
    if (score >= 85) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/80 px-2.5 py-0.5 text-xs font-bold text-rose-300 border border-rose-700/60">
          <AlertTriangle className="h-3 w-3 text-rose-400" /> Critical ({score})
        </span>
      );
    }
    if (score >= 65) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-700/60">
          <AlertTriangle className="h-3 w-3 text-amber-400" /> High ({score})
        </span>
      );
    }
    if (score >= 35) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-950/80 px-2.5 py-0.5 text-xs font-bold text-yellow-300 border border-yellow-700/60">
          Medium ({score})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-700/60">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Low ({score})
      </span>
    );
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'flagged':
        return <span className="rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 px-2 py-0.5 text-[10px] font-bold uppercase">Flagged</span>;
      case 'auto_blocked':
        return <span className="rounded bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 text-[10px] font-bold uppercase">Auto-Blocked</span>;
      case 'under_review':
        return <span className="rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2 py-0.5 text-[10px] font-bold uppercase">Under Review</span>;
      case 'cleared':
        return <span className="rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold uppercase">Cleared</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            AI Fraud & Anomaly Detection System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time graph neural network inference analyzing velocity, counterparty legitimacy, and behavioral anomalies on {gpuData?.mode === 'rocm' ? 'AMD ROCm HIP' : 'CPU'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onTriggerScan()}
            disabled={isScanning}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isScanning ? 'Running ML Batch...' : 'Batch ML Rescan'}</span>
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-950/40 hover:from-rose-500 hover:to-amber-500 transition-all active:scale-95"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Simulate Transaction</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <span className="text-[11px] text-slate-400 font-medium">Total Monitored Volume</span>
          <p className="text-lg font-bold font-mono text-white mt-0.5">${totalVolume.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">{transactions.length} Total Records</span>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3.5">
          <span className="text-[11px] text-rose-300 font-medium">Flagged & Blocked</span>
          <p className="text-lg font-bold font-mono text-rose-400 mt-0.5">{flaggedCount}</p>
          <span className="text-[10px] text-rose-400/80">Immediate Risk</span>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3.5">
          <span className="text-[11px] text-amber-300 font-medium">Under Review</span>
          <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">{underReviewCount}</p>
          <span className="text-[10px] text-amber-400/80">Analyst Sign-off Required</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <span className="text-[11px] text-slate-400 font-medium">Inference SLA</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg font-bold font-mono text-cyan-400">
              {gpuData?.mode === 'rocm' ? '1.6 ms' : '24.2 ms'}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {gpuData?.mode === 'rocm' ? '(ROCm)' : '(CPU)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            {gpuData?.mode === 'rocm' ? '18,450 tx/sec throughput' : '1,520 tx/sec throughput'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by entity, ID (TX-98421), location, SWIFT account, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status pills */}
            {(['all', 'flagged', 'under_review', 'cleared', 'auto_blocked'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}

            {/* Min Risk Slider */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
              <span>Min Risk:</span>
              <input 
                type="range" 
                min="0" 
                max="90" 
                step="10" 
                value={minRiskScore} 
                onChange={(e) => setMinRiskScore(Number(e.target.value))} 
                className="w-20 accent-cyan-500 cursor-pointer"
              />
              <span className="font-mono text-cyan-400 font-bold">{minRiskScore}+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table & Details Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table - 8 or 12 cols */}
        <div className={`${selectedTx ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Transaction ID / Entity</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className={`cursor-pointer transition-colors hover:bg-slate-800/50 ${
                      selectedTx?.id === tx.id ? 'bg-slate-800/80 border-l-2 border-cyan-500' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{tx.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium truncate max-w-[200px] mt-0.5">{tx.entity}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[220px]">{tx.location}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                        {tx.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4">
                      {getRiskBadge(tx.riskScore)}
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(tx.status)}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          title="Open ML Forensic Audit Dossier"
                          className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2 py-1 text-[11px] font-semibold transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Audit</span>
                        </button>
                        {tx.status !== 'cleared' && (
                          <button
                            onClick={() => onUpdateStatus(tx.id, 'cleared')}
                            title="Clear Transaction (Verified Legitimate)"
                            className="rounded p-1 text-slate-400 hover:bg-emerald-950 hover:text-emerald-400 transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {tx.status !== 'under_review' && (
                          <button
                            onClick={() => onUpdateStatus(tx.id, 'under_review')}
                            title="Quarantine & Request Officer Review"
                            className="rounded p-1 text-slate-400 hover:bg-amber-950 hover:text-amber-400 transition-colors"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        {tx.status !== 'auto_blocked' && (
                          <button
                            onClick={() => onUpdateStatus(tx.id, 'auto_blocked')}
                            title="Block Transaction Immediately"
                            className="rounded p-1 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No transactions matching the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Transaction Forensic Audit Drawer (5 cols) */}
        {selectedTx && (
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Forensic ML Audit</span>
                <h3 className="text-lg font-bold text-white font-mono">{selectedTx.id}</h3>
                <p className="text-xs text-slate-300 font-medium">{selectedTx.entity}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Risk Gauge */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">ML Composite Anomaly Score:</span>
                <span className="font-mono font-bold text-base text-rose-400">
                  {selectedTx.riskScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    selectedTx.riskScore >= 75 ? 'bg-rose-500' : selectedTx.riskScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedTx.riskScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Model: {selectedTx.mlModelDetails.model}</span>
                <span className="font-mono text-cyan-400 font-semibold">{selectedTx.mlModelDetails.inferenceLatencyMs} ms</span>
              </div>
            </div>

            {/* Detected Risk Factors */}
            <div>
              <span className="text-xs font-bold text-white block mb-2">Detected Anomaly Vectors</span>
              <div className="space-y-1.5">
                {selectedTx.riskFactors.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded bg-rose-950/30 border border-rose-900/40 text-rose-200">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-slate-950/50 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Amount / Currency</span>
                <span className="font-mono font-bold text-white text-sm">
                  ${selectedTx.amount.toLocaleString()} {selectedTx.currency}
                </span>
              </div>
              <div className="rounded bg-slate-950/50 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Settlement Channel</span>
                <span className="font-semibold text-slate-200">{selectedTx.category}</span>
              </div>
              <div className="rounded bg-slate-950/50 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Origin Location</span>
                <span className="text-slate-300 truncate block">{selectedTx.location}</span>
              </div>
              <div className="rounded bg-slate-950/50 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">IP / Network Node</span>
                <span className="font-mono text-slate-300 truncate block">{selectedTx.ipAddress}</span>
              </div>
            </div>

            {/* Account Information */}
            <div className="rounded bg-slate-950/50 p-2.5 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 block">Settlement Account</span>
              <span className="font-mono text-slate-300 break-all">{selectedTx.account}</span>
            </div>

            {/* Execution Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onUpdateStatus(selectedTx.id, 'cleared')}
                className="flex-1 rounded-lg bg-emerald-600/90 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors text-center"
              >
                Clear Transaction
              </button>
              <button
                onClick={() => onUpdateStatus(selectedTx.id, 'under_review')}
                className="flex-1 rounded-lg bg-amber-600/90 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors text-center"
              >
                Hold for Review
              </button>
              <button
                onClick={() => onUpdateStatus(selectedTx.id, 'auto_blocked')}
                className="flex-1 rounded-lg bg-rose-600/90 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors text-center"
              >
                Block & Blacklist
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-rose-400" />
                Simulate Inbound/Outbound Transaction
              </h3>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Submit a synthetic transaction to test the real-time AI/ML fraud scoring engine on AMD ROCm.
            </p>

            <form onSubmit={handleSimulateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Entity / Counterparty</label>
                <input
                  type="text"
                  required
                  value={simEntity}
                  onChange={(e) => setSimEntity(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Transaction Category</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="ACH Outbound">ACH Outbound</option>
                  <option value="Vendor Payout">Vendor Payout</option>
                  <option value="Card Processing">Card Processing</option>
                  <option value="SaaS Billing">SaaS Billing</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Simulated Anomaly Context</label>
                <input
                  type="text"
                  value={simReason}
                  onChange={(e) => setSimReason(e.target.value)}
                  placeholder="e.g. Unusual offshore wire outside standard schedule"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-500"
                >
                  Execute Inference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
