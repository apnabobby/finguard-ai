/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { FraudDetectionView } from './components/FraudDetectionView';
import { CashFlowView } from './components/CashFlowView';
import { BusinessRiskView } from './components/BusinessRiskView';
import { GpuTelemetryView } from './components/GpuTelemetryView';
import { AiCfoView } from './components/AiCfoView';
import { 
  Transaction, 
  CashFlowForecastResponse, 
  GpuTelemetryData, 
  BusinessRiskData 
} from './types';
import { Zap, X, ShieldAlert, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowForecastResponse | null>(null);
  const [currentHorizon, setCurrentHorizon] = useState<30 | 60 | 90>(30);
  const [currentScenario, setCurrentScenario] = useState<'base' | 'conservative' | 'aggressive'>('base');
  const [businessRisk, setBusinessRisk] = useState<BusinessRiskData | null>(null);
  const [gpuData, setGpuData] = useState<GpuTelemetryData | null>(null);
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);

  // Modal custom scan input state
  const [scanEntity, setScanEntity] = useState('Meridian Offshore Clearing LLC');
  const [scanAmount, setScanAmount] = useState('320000');
  const [scanCategory, setScanCategory] = useState<Transaction['category']>('Wire Transfer');
  const [scanAnomalyNote, setScanAnomalyNote] = useState('Beneficiary opened in Cayman Islands 48h prior to transfer execution');

  // Load all data
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ovRes, txRes, cfRes, brRes, gpuRes] = await Promise.all([
        fetch('/api/overview').then(r => r.json()),
        fetch('/api/fraud/transactions').then(r => r.json()),
        fetch(`/api/cashflow/forecast?days=${currentHorizon}&scenario=${currentScenario}`).then(r => r.json()),
        fetch('/api/business-risk').then(r => r.json()),
        fetch('/api/gpu/telemetry').then(r => r.json()),
      ]);

      setOverviewData(ovRes);
      setTransactions(txRes.transactions || []);
      setCashFlow(cfRes);
      setBusinessRisk(brRes);
      setGpuData(gpuRes);
    } catch (err) {
      console.error('Failed to load FinGuard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentHorizon, currentScenario]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Periodic GPU telemetry update
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/gpu/telemetry');
        if (res.ok) {
          const data = await res.json();
          setGpuData(data);
        }
      } catch (err) {
        // quiet error
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update horizon
  const handleHorizonChange = async (days: 30 | 60 | 90) => {
    setCurrentHorizon(days);
    try {
      const res = await fetch(`/api/cashflow/forecast?days=${days}&scenario=${currentScenario}`);
      const data = await res.json();
      setCashFlow(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Update scenario
  const handleScenarioChange = async (scen: 'base' | 'conservative' | 'aggressive') => {
    setCurrentScenario(scen);
    try {
      const res = await fetch(`/api/cashflow/forecast?days=${currentHorizon}&scenario=${scen}`);
      const data = await res.json();
      setCashFlow(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle GPU / CPU Mode
  const handleToggleGpuMode = async () => {
    try {
      const res = await fetch('/api/gpu/toggle-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        setGpuData(data.telemetry);
        // Refresh overview
        const ovRes = await fetch('/api/overview').then(r => r.json());
        setOverviewData(ovRes);
      }
    } catch (err) {
      console.error('Failed to toggle GPU mode:', err);
    }
  };

  // Update transaction status
  const handleUpdateTxStatus = async (id: string, newStatus: Transaction['status']) => {
    try {
      const res = await fetch('/api/fraud/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newStatus })
      });
      if (res.ok) {
        const { transaction } = await res.json();
        setTransactions(prev => prev.map(t => t.id === id ? transaction : t));
        if (selectedTx?.id === id) {
          setSelectedTx(transaction);
        }
        // Refresh overview
        const ovRes = await fetch('/api/overview').then(r => r.json());
        setOverviewData(ovRes);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Trigger Scan
  const handleTriggerScan = async (customTx?: any) => {
    setIsScanning(true);
    try {
      const payload = customTx || {
        entity: scanEntity,
        amount: Number(scanAmount),
        category: scanCategory,
        customFactors: [scanAnomalyNote]
      };

      const res = await fetch('/api/fraud/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions(prev => [data.scannedTransaction, ...prev]);
        setSelectedTx(data.scannedTransaction);
        
        // Refresh overview
        const ovRes = await fetch('/api/overview').then(r => r.json());
        setOverviewData(ovRes);
        return data;
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
      setShowScanModal(false);
    }
  };

  const flaggedCount = transactions.filter(t => t.status === 'flagged' || t.status === 'auto_blocked').length;

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gpuData={gpuData}
        onToggleGpuMode={handleToggleGpuMode}
        onRefreshData={loadAllData}
        isRefreshing={isRefreshing}
        onOpenScanModal={() => setShowScanModal(true)}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        flaggedCount={flaggedCount}
        gpuMode={gpuData?.mode || 'rocm'}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            overviewData={overviewData}
            transactions={transactions}
            cashFlow={cashFlow}
            gpuData={gpuData}
            businessRisk={businessRisk}
            setActiveTab={setActiveTab}
            onSelectTransaction={(tx) => {
              setSelectedTx(tx);
              setActiveTab('fraud');
            }}
          />
        )}

        {activeTab === 'fraud' && (
          <FraudDetectionView
            transactions={transactions}
            gpuData={gpuData}
            onUpdateStatus={handleUpdateTxStatus}
            onTriggerScan={handleTriggerScan}
            selectedTx={selectedTx}
            setSelectedTx={setSelectedTx}
            isScanning={isScanning}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashFlowView
            cashFlow={cashFlow}
            currentHorizon={currentHorizon}
            onChangeHorizon={handleHorizonChange}
            currentScenario={currentScenario}
            onChangeScenario={handleScenarioChange}
            isLoading={isRefreshing}
          />
        )}

        {activeTab === 'business-risk' && (
          <BusinessRiskView
            businessRisk={businessRisk}
          />
        )}

        {activeTab === 'gpu' && (
          <GpuTelemetryView
            gpuData={gpuData}
            onToggleGpuMode={handleToggleGpuMode}
            onTriggerScan={handleTriggerScan}
          />
        )}

        {activeTab === 'cfo' && (
          <AiCfoView
            cashFlow={cashFlow}
            gpuData={gpuData}
            flaggedCount={flaggedCount}
          />
        )}
      </main>

      {/* Quick Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-400" />
                Trigger Real-Time ML Wire Scan
              </h3>
              <button
                onClick={() => setShowScanModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Executes DeepGraph ML inference on the {gpuData?.mode === 'rocm' ? 'AMD ROCm HIP' : 'CPU'} engine to evaluate anomaly risk scores.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTriggerScan();
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="text-slate-300 font-medium block mb-1">Entity / Beneficiary Name</label>
                <input
                  type="text"
                  required
                  value={scanEntity}
                  onChange={(e) => setScanEntity(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  value={scanAmount}
                  onChange={(e) => setScanAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Channel / Category</label>
                <select
                  value={scanCategory}
                  onChange={(e) => setScanCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Wire Transfer">Wire Transfer (SWIFT / Fedwire)</option>
                  <option value="ACH Outbound">ACH Outbound</option>
                  <option value="Vendor Payout">Vendor Payout</option>
                  <option value="Card Processing">Corporate Card Settlement</option>
                  <option value="SaaS Billing">Recurring SaaS Processing</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Risk Hypothesis / Factor</label>
                <input
                  type="text"
                  value={scanAnomalyNote}
                  onChange={(e) => setScanAnomalyNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Hardware: <strong className="text-cyan-400 font-mono">{gpuData?.mode === 'rocm' ? 'AMD ROCm (1.6ms)' : 'Host CPU (24ms)'}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScanModal(false)}
                    className="rounded-lg border border-slate-700 px-3.5 py-1.5 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="rounded-lg bg-cyan-600 px-4 py-1.5 font-semibold text-white hover:bg-cyan-500 shadow-md disabled:opacity-50"
                  >
                    {isScanning ? 'Executing...' : 'Run Scan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 bg-[#090d16] py-4 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FinGuard AI</span>
            <span>•</span>
            <span>GPU-Powered Financial Risk Intelligence</span>
            <span className="rounded bg-rose-950/60 text-rose-300 text-[10px] font-mono px-1.5 py-0.2 border border-rose-800/50">
              ROCm 6.2 HIP
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Enterprise SLA: 99.999%</span>
            <span>•</span>
            <span>Telemetry: {gpuData?.mode === 'rocm' ? 'AMD Instinct MI300X' : 'Dual Xeon Fallback'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
