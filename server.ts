import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_TRANSACTIONS, 
  generateCashFlowData, 
  INITIAL_BUSINESS_RISK, 
  INITIAL_GPU_TELEMETRY 
} from './src/mockData';
import { Transaction, GpuTelemetryData } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state
let transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
let currentGpuState: GpuTelemetryData = { ...INITIAL_GPU_TELEMETRY };
let currentScenario: 'base' | 'conservative' | 'aggressive' = 'base';

// Gemini client initialization helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Overview API
app.get('/api/overview', (req, res) => {
  const flaggedCount = transactions.filter(t => t.status === 'flagged' || t.status === 'auto_blocked').length;
  const underReviewCount = transactions.filter(t => t.status === 'under_review').length;
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);

  const forecast = generateCashFlowData(30, currentScenario);

  res.json({
    healthScore: 84, // 0 - 100
    healthRating: 'Optimal Resilience',
    currentCashBalance: forecast.startingBalance,
    projected30DayBalance: forecast.endingBalance,
    monthlyNetBurn: forecast.netBurnMonthly,
    runwayMonths: forecast.runwayMonths,
    activeAnomaliesCount: flaggedCount,
    underReviewCount,
    totalMonitoredVolume: totalVolume,
    gpuMode: currentGpuState.mode,
    gpuDevice: currentGpuState.deviceName,
    gpuSpeedup: currentGpuState.benchmark.speedupFactor,
    compositeBusinessRisk: INITIAL_BUSINESS_RISK.compositeScore,
  });
});

// 2. Fraud Detection API
app.get('/api/fraud/transactions', (req, res) => {
  const { status, search, minRisk } = req.query;
  let filtered = [...transactions];

  if (status && status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }

  if (minRisk) {
    const riskVal = Number(minRisk);
    if (!isNaN(riskVal)) {
      filtered = filtered.filter(t => t.riskScore >= riskVal);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(t => 
      t.entity.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q)
    );
  }

  res.json({
    transactions: filtered,
    totalCount: transactions.length,
    flaggedCount: transactions.filter(t => t.status === 'flagged' || t.status === 'auto_blocked').length,
    underReviewCount: transactions.filter(t => t.status === 'under_review').length,
    clearedCount: transactions.filter(t => t.status === 'cleared').length,
  });
});

// Scan / Add synthetic transaction
app.post('/api/fraud/scan', (req, res) => {
  const { entity, category, amount, currency, customFactors } = req.body;
  const isGpu = currentGpuState.mode === 'rocm';

  const latencyMs = isGpu 
    ? Number((1.2 + Math.random() * 0.8).toFixed(1)) 
    : Number((22.0 + Math.random() * 8.5).toFixed(1));

  // Compute realistic risk score
  let riskScore = 15;
  const factors: string[] = customFactors || [];

  const numAmount = Number(amount) || 125000;
  if (numAmount > 200000) {
    riskScore += 35;
    factors.push(`Unusually large volume single outbound transfer ($${numAmount.toLocaleString()})`);
  }
  if (category === 'Wire Transfer' || category === 'ACH Outbound') {
    riskScore += 20;
    factors.push('Elevated channel risk: irrevocable settlement gateway');
  }

  riskScore = Math.min(98, Math.max(8, riskScore + Math.floor(Math.random() * 25)));

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let status: 'flagged' | 'cleared' | 'under_review' | 'auto_blocked' = 'cleared';

  if (riskScore >= 85) {
    riskLevel = 'critical';
    status = 'flagged';
  } else if (riskScore >= 65) {
    riskLevel = 'high';
    status = 'under_review';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
    status = 'under_review';
  }

  const newTx: Transaction = {
    id: `TX-${Math.floor(10000 + Math.random() * 89999)}`,
    timestamp: new Date().toISOString(),
    entity: entity || 'Apex Synthetic Wire Test',
    category: category || 'Wire Transfer',
    amount: numAmount,
    currency: currency || 'USD',
    riskScore,
    riskLevel,
    status,
    ipAddress: '194.26.29.11 (Autonomous System AS48220)',
    location: 'Frankfurt, Germany',
    account: 'SWIFT: CHASUS33 / Acc ****' + Math.floor(1000 + Math.random() * 9000),
    riskFactors: factors.length > 0 ? factors : ['Inference signature matched standard transaction baseline'],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: isGpu ? 'AMD ROCm HIP Kernel' : 'CPU Vectorized Fallback',
      inferenceLatencyMs: latencyMs,
      anomalyScore: Number((riskScore / 100).toFixed(3)),
    }
  };

  transactions.unshift(newTx);

  res.json({
    success: true,
    scannedTransaction: newTx,
    inferenceLatencyMs: latencyMs,
    hardwareEngine: isGpu ? 'AMD ROCm HIP Kernel' : 'CPU Vectorized Fallback',
  });
});

// Update transaction action
app.post('/api/fraud/action', (req, res) => {
  const { id, newStatus } = req.body;
  const target = transactions.find(t => t.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  target.status = newStatus;
  res.json({ success: true, transaction: target });
});

// 3. Cash Flow Forecasting API
app.get('/api/cashflow/forecast', (req, res) => {
  const days = req.query.days ? (Number(req.query.days) as 30 | 60 | 90) : 30;
  const scenario = (req.query.scenario as 'base' | 'conservative' | 'aggressive') || currentScenario;
  currentScenario = scenario;

  const validDays = [30, 60, 90].includes(days) ? days : 30;
  const forecast = generateCashFlowData(validDays, scenario);

  res.json(forecast);
});

// 4. Business Risk Intelligence API
app.get('/api/business-risk', (req, res) => {
  res.json(INITIAL_BUSINESS_RISK);
});

// 5. AMD GPU + ROCm Telemetry API
app.get('/api/gpu/telemetry', (req, res) => {
  // Add realistic small fluctuations to telemetry when in ROCm mode
  if (currentGpuState.mode === 'rocm') {
    const jitterUtil = Math.min(94, Math.max(54, 76 + Math.floor(Math.sin(Date.now() / 3000) * 12)));
    const jitterPower = Math.min(680, Math.max(380, 460 + Math.floor(Math.cos(Date.now() / 4000) * 45)));
    const jitterTemp = Math.min(65, Math.max(52, 56 + Math.floor(Math.sin(Date.now() / 6000) * 4)));
    const jitterVram = Number((62.5 + Math.sin(Date.now() / 5000) * 4.2).toFixed(1));

    currentGpuState = {
      ...currentGpuState,
      gpuUtilizationPct: jitterUtil,
      powerDrawWatts: jitterPower,
      temperatureCoreC: jitterTemp,
      vramUsedGb: jitterVram,
      activeWorkloads: currentGpuState.activeWorkloads.map(w => ({
        ...w,
        latencyMs: Number((w.latencyMs * (0.95 + Math.random() * 0.1)).toFixed(1)),
        throughputTps: Math.round(w.throughputTps * (0.98 + Math.random() * 0.04)),
      }))
    };
  } else {
    // CPU Fallback telemetry
    currentGpuState = {
      ...currentGpuState,
      deviceName: 'Dual Intel Xeon Platinum 8480+ (Host CPU Fallback)',
      gpuUtilizationPct: 12,
      powerDrawWatts: 350,
      temperatureCoreC: 48,
      vramUsedGb: 16.0,
      vramTotalGb: 64.0,
      vramBandwidthTbps: 0.38,
      activeWorkloads: currentGpuState.activeWorkloads.map(w => ({
        ...w,
        latencyMs: Number((w.latencyMs * 13.5).toFixed(1)),
        throughputTps: Math.round(w.throughputTps / 12),
      }))
    };
  }

  res.json(currentGpuState);
});

// Toggle GPU / CPU Mode
app.post('/api/gpu/toggle-mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'rocm' || mode === 'cpu') {
    currentGpuState.mode = mode;
    if (mode === 'rocm') {
      currentGpuState.deviceName = 'AMD Instinct™ MI300X OAM (192GB HBM3)';
    } else {
      currentGpuState.deviceName = 'Dual Intel Xeon Platinum 8480+ (Host CPU Fallback)';
    }
  } else {
    currentGpuState.mode = currentGpuState.mode === 'rocm' ? 'cpu' : 'rocm';
  }
  res.json({ success: true, mode: currentGpuState.mode, telemetry: currentGpuState });
});

// Helper to generate AI CFO response with multi-model fallback for demand spikes (503)
async function generateAiCfoResponse(ai: GoogleGenAI, promptText: string, systemInstruction: string): Promise<string | null> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (e: any) {
      // If model is experiencing temporary demand spike (503/429/UNAVAILABLE), attempt fallback model
      const isDemandSpike = e?.code === 503 || e?.status === 'UNAVAILABLE' || e?.status === 503 || e?.code === 429;
      if (isDemandSpike) {
        continue;
      }
      break;
    }
  }
  return null;
}

// 6. AI CFO Conversational API
app.post('/api/cfo/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message string required' });
  }

  // Compile real live financial context from the application
  const cashForecast = generateCashFlowData(30, currentScenario);
  const flaggedTxs = transactions.filter(t => t.status === 'flagged' || t.status === 'auto_blocked');
  const underReviewTxs = transactions.filter(t => t.status === 'under_review');
  const highRiskCusts = INITIAL_BUSINESS_RISK.customerConcentrationRisk.customers.filter(c => c.riskScore >= 50);
  const topSuppliers = INITIAL_BUSINESS_RISK.supplierDependencyRisk.suppliers;

  const financialContext = `
APPLICATION LIVE FINANCIAL CONTEXT:
- Platform: FinGuard AI (GPU-Powered Financial Risk Intelligence)
- Acceleration Engine: ${currentGpuState.mode.toUpperCase()} (${currentGpuState.deviceName})
- ROCm Benchmark: ${currentGpuState.benchmark.speedupFactor}x speedup vs CPU fallback (${currentGpuState.benchmark.rocmBatchLatencyMs}ms vs ${currentGpuState.benchmark.cpuFallbackBatchLatencyMs}ms)
- Financial Health Score: 84/100 (Resilient)
- Current Cash Balance: $${(cashForecast.startingBalance / 1000000).toFixed(2)}M USD
- 30-Day Projected Ending Balance: $${(cashForecast.endingBalance / 1000000).toFixed(2)}M USD
- Monthly Net Burn Rate: $${cashForecast.netBurnMonthly.toLocaleString()} USD
- Cash Runway: ${cashForecast.runwayMonths} months
- Key Cash Flow Alerts:
  * ${cashForecast.riskAlerts.map(a => `${a.date}: ${a.message} (Impact: $${a.impactAmount.toLocaleString()})`).join('\n  * ')}
- Fraud Risk Snapshot:
  * Flagged/Blocked Transactions: ${flaggedTxs.length} ($${flaggedTxs.reduce((a, b) => a + b.amount, 0).toLocaleString()})
  * Under Review: ${underReviewTxs.length} ($${underReviewTxs.reduce((a, b) => a + b.amount, 0).toLocaleString()})
  * Most Suspicious: ${flaggedTxs.map(t => `${t.id} - ${t.entity} ($${t.amount.toLocaleString()}, Risk: ${t.riskScore}/100, Reasons: ${t.riskFactors.join('; ')})`).join('\n  * ')}
- Business Risk Snapshot:
  * Customer Concentration: Top 3 customers account for ${INITIAL_BUSINESS_RISK.customerConcentrationRisk.top3Share}% of ARR.
  * Highest Risk Customers: ${highRiskCusts.map(c => `${c.name} (${c.arrPercentage}% ARR, DSO: ${c.dso} days, Status: ${c.paymentStatus}, Reason: ${c.primaryRiskReason})`).join('\n  * ')}
  * Key Supplier Single Point of Failure: ${topSuppliers[0].name} (${topSuppliers[0].spendPercentage}% of spend, substitutability: ${topSuppliers[0].substitutabilityTimeWeeks} weeks).
`;

  const systemInstruction = `You are the executive AI Chief Financial Officer (CFO) and Chief Risk Officer of FinGuard AI, an enterprise financial risk platform.
Your persona is analytical, decisive, authoritative, and direct.
You provide strategic, numbers-driven financial intelligence grounded strictly in the provided live application data.

Guidelines:
1. Always cite specific figures, customer names, transaction IDs, dollar amounts, and days from the live context.
2. If asked "Why is cash flow decreasing?", explain the payroll cycles, tax amortization on Day 42, top customer late payments (Apex Global 45d late on $210k MRR), and cloud GPU surge.
3. If asked "Which transactions are suspicious?", list the exact flagged transaction IDs (e.g. TX-98421, TX-98381) with their anomaly reasons, risk scores, and recommended immediate CFO action.
4. If asked "Which customers are high risk?", highlight customer concentration risks (Apex Global 34.5% ARR with late payments, Vanguard Aerospace contract dispute with $90k withholding).
5. If asked about GPU/hardware or ROCm, explain how AMD ROCm acceleration slashes ML inference latency from 26.4ms down to 1.8ms (14.6x speedup), allowing real-time fraud blocking before wire settlement.
6. Provide concrete CFO recommendations with actionable mitigation steps.
7. Format with clear Markdown headings, bullet points, and bold financial metrics for rapid executive consumption.`;

  const ai = getGeminiClient();

  if (ai) {
    const promptText = `User Question: ${message}\n\n${financialContext}`;
    const generatedText = await generateAiCfoResponse(ai, promptText, systemInstruction);

    if (generatedText) {
      return res.json({
        reply: generatedText,
        source: 'gemini-ai',
        groundingContext: {
          runwayMonths: cashForecast.runwayMonths,
          activeAnomalies: flaggedTxs.length,
          flaggedVolume: flaggedTxs.reduce((a, b) => a + b.amount, 0),
        }
      });
    }
  }

  // Fallback financial engine response if Gemini API key is missing or errored
  let fallbackReply = '';
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('cash flow') || lowerMsg.includes('decreasing') || lowerMsg.includes('burn')) {
    fallbackReply = `### Executive Cash Flow Diagnostics

Our projected cash flow shows net pressure driven by three primary variables over the next 30–60 days:

1. **Bi-Weekly Payroll & Vendor Overlap**:
   - Next payroll cycle draws **$210,000**, coinciding with quarterly cloud infrastructure settlements (**$135,000**), creating a short-term cumulative liquidity draw of **$295,000**.
2. **Customer Collection Delays (AR Lag)**:
   - **Apex Global Logistics** (34.5% of our ARR) is currently **45 days past due** on their $210,000 invoice, expanding our weighted DSO to **47.8 days**.
   - **Vanguard Aerospace** has withheld **$90,000** due to an ongoing SLA contract dispute.
3. **Day 42 Tax Amortization**:
   - A scheduled **$180,000** semi-annual state franchise tax obligation will cause our runway buffer to contract temporarily to **18.4 months**.

**Recommended CFO Action**:
- Trigger automated milestone notices to Apex Global's AP department with a 2% prompt-pay discount incentive.
- Reschedule non-critical CAPEX server expansions until Q4 receivables clear.`;
  } else if (lowerMsg.includes('transaction') || lowerMsg.includes('suspicious') || lowerMsg.includes('fraud')) {
    fallbackReply = `### Suspicious & Anomalous Transactions Audit

Our AMD ROCm-accelerated DeepGraph Autoencoder has flagged **${flaggedTxs.length} critical anomalies** totaling **$${flaggedTxs.reduce((a, b) => a + b.amount, 0).toLocaleString()}**:

1. **TX-98421 ($342,500.00 USD - Wire Transfer)**
   - **Entity**: Apex Global Logistics Pte (Zurich, Switzerland)
   - **Risk Score**: 88/100 (Critical)
   - **ML Flags**: Outbound velocity spike within 4 minutes of newly registered beneficiary account; IP geolocation mismatch (Zurich VPN exit vs HK registered profile); +620% deviation above 90-day moving average.
   - **Status**: Flagged. Recommended Action: **Hold wire settlement pending dual-officer verbal confirmation**.

2. **TX-98381 ($86,450.00 USD - ACH Outbound)**
   - **Entity**: CloudMatrix Hosting LLC
   - **Risk Score**: 92/100 (Critical)
   - **ML Flags**: Initiated through an active Tor exit node; spoofed corporate identity attempting multi-factor threshold bypass.
   - **Status**: **Auto-Blocked** by AMD ROCm real-time policy engine (1.7ms latency).

3. **TX-98402 ($189,000.00 USD - Vendor Payout)**
   - **Entity**: NovaTech Component Foundry
   - **Risk Score**: 74/100 (High - Under Review)
   - **ML Flags**: Routing number changed within the last 48 hours; invoice due in 30 days requested for immediate same-day settlement.`;
  } else if (lowerMsg.includes('customer') || lowerMsg.includes('high risk') || lowerMsg.includes('client')) {
    fallbackReply = `### Customer Concentration & Credit Risk Intelligence

Our portfolio exhibits severe concentration risk, with **64.2% of total ARR concentrated in our top 3 clients**:

1. **Apex Global Logistics (Risk Score: 78/100 - Critical)**
   - **ARR Share**: 34.5% ($210,000 MRR)
   - **DSO**: 58 days (Status: Late 45d)
   - **Credit Rating**: BBB
   - **Risk Exposure**: Should Apex experience insolvency, our monthly runway drops from 22.4 months to 11.2 months instantly.

2. **Vanguard Aerospace Inc (Risk Score: 82/100 - Critical)**
   - **ARR Share**: 7.2% ($45,000 MRR)
   - **DSO**: 65 days (Status: Disputed)
   - **Risk Exposure**: Formal SLA dispute regarding latency tiers; $90,000 in withheld payments currently tied in arbitration.

3. **OmniStream Media Corp (Risk Score: 45/100 - Moderate)**
   - **ARR Share**: 18.2% ($115,000 MRR)
   - **DSO**: 42 days (Status: Late 15d)
   - **Risk Exposure**: Delayed approval signatures due to internal executive restructuring.`;
  } else if (lowerMsg.includes('gpu') || lowerMsg.includes('rocm') || lowerMsg.includes('amd')) {
    fallbackReply = `### AMD ROCm™ Hardware Acceleration Performance

Our financial risk intelligence pipeline leverages an **AMD Instinct™ MI300X OAM** accelerator via the **ROCm 6.2** software stack:

- **Inference Latency**: **1.8 ms** per batch of 5,000 transactions on ROCm vs **26.4 ms** on dual-socket Xeon CPU fallback (**14.6x speedup**).
- **Throughput**: **18,450 transactions/second**, enabling inline wire screening prior to SWIFT and ACH clearing cutoffs.
- **VRAM Utilization**: **64.8 GB / 192 GB HBM3** memory pool allocated to in-memory graph neural networks and fraud embedding lookup tables.
- **Failover Security**: Deterministic CPU fallback guarantees zero downtime in case of driver or hardware reboots.`;
  } else {
    fallbackReply = `### Financial Risk & Health Overview

Based on our real-time FinGuard metrics:
- **Resilience Score**: **84/100** (Optimal solvency with $4.85M liquid treasury).
- **Runway**: **${cashForecast.runwayMonths} months** at current monthly net burn of **$${cashForecast.netBurnMonthly.toLocaleString()}**.
- **Fraud Vector**: **${flaggedTxs.length} transactions** currently quarantined by ROCm ML kernels.
- **Concentration Vulnerability**: 64.2% of ARR resides in top 3 clients; Apex Global's 45-day overdue status requires active intervention.

How would you like to proceed? I can generate an updated cash flow sensitivity stress test, draft a liquidity contingency plan, or execute an in-depth fraud scan.`;
  }

  res.json({
    reply: fallbackReply,
    source: 'deterministic-financial-engine',
    groundingContext: {
      runwayMonths: cashForecast.runwayMonths,
      activeAnomalies: flaggedTxs.length,
      flaggedVolume: flaggedTxs.reduce((a, b) => a + b.amount, 0),
    }
  });
});

// Vite middleware or production static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinGuard AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
