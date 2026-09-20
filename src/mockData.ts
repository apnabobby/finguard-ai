import { 
  Transaction, 
  CashFlowForecastResponse, 
  BusinessRiskData, 
  GpuTelemetryData, 
  CashFlowPoint 
} from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-98421',
    timestamp: '2026-09-20T10:14:22Z',
    entity: 'Apex Global Logistics Pte',
    category: 'Wire Transfer',
    amount: 342500.00,
    currency: 'USD',
    riskScore: 88,
    riskLevel: 'critical',
    status: 'flagged',
    ipAddress: '198.51.100.44 (VPN Exit node: Zurich)',
    location: 'Zurich, Switzerland',
    account: 'SWIFT: DEUTDEDBFXX / Acc ****4821',
    riskFactors: [
      'Velocity Spike: $340k+ outbound within 4 mins of beneficiary creation',
      'Geographic Anomaly: Account IP mismatch (Origin HK vs Session Zurich)',
      'High Value deviation: +620% above 90-day moving average for vendor'
    ],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.6,
      anomalyScore: 0.942
    }
  },
  {
    id: 'TX-98418',
    timestamp: '2026-09-20T09:48:05Z',
    entity: 'Stripe Corporate Billing',
    category: 'SaaS Billing',
    amount: 14250.00,
    currency: 'USD',
    riskScore: 12,
    riskLevel: 'low',
    status: 'cleared',
    ipAddress: '104.18.22.45',
    location: 'San Francisco, CA, USA',
    account: 'Stripe Merchant Acc ****9912',
    riskFactors: ['Known recurring SaaS fee', 'Verified TLS signature'],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.4,
      anomalyScore: 0.082
    }
  },
  {
    id: 'TX-98402',
    timestamp: '2026-09-20T08:30:19Z',
    entity: 'NovaTech Component Foundry',
    category: 'Vendor Payout',
    amount: 189000.00,
    currency: 'USD',
    riskScore: 74,
    riskLevel: 'high',
    status: 'under_review',
    ipAddress: '185.220.101.8',
    location: 'Frankfurt, Germany',
    account: 'IBAN: DE89370400440532013000',
    riskFactors: [
      'Payment term compression: Invoice due in 30 days requested for same-day execution',
      'Bank routing modification within last 48 hours',
      'Vendor risk score elevated due to supplier solvency downgrade'
    ],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.8,
      anomalyScore: 0.764
    }
  },
  {
    id: 'TX-98395',
    timestamp: '2026-09-20T07:15:40Z',
    entity: 'Automatic Payroll Batch #38',
    category: 'Payroll',
    amount: 418200.00,
    currency: 'USD',
    riskScore: 8,
    riskLevel: 'low',
    status: 'cleared',
    ipAddress: 'Internal VPC (10.0.4.12)',
    location: 'New York, NY, USA',
    account: 'JPMorgan Chase Treasury ****0194',
    riskFactors: ['Bi-weekly payroll cadence matched schedule', 'Dual authorization confirmed'],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.5,
      anomalyScore: 0.041
    }
  },
  {
    id: 'TX-98381',
    timestamp: '2026-09-19T22:11:03Z',
    entity: 'CloudMatrix Hosting LLC',
    category: 'ACH Outbound',
    amount: 86450.00,
    currency: 'USD',
    riskScore: 92,
    riskLevel: 'critical',
    status: 'auto_blocked',
    ipAddress: '91.240.118.155 (Tor Relay)',
    location: 'Bucharest, Romania',
    account: 'ACH Routing: 021000021 / Acc ****7721',
    riskFactors: [
      'Critical: Transaction initiated through anonymized Tor exit node',
      'Attempted bypass of multi-factor approval threshold',
      'Entity name spoofing detected (CloudMatrix vs verified CloudMatrix Corp)'
    ],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.7,
      anomalyScore: 0.985
    }
  },
  {
    id: 'TX-98366',
    timestamp: '2026-09-19T18:42:11Z',
    entity: 'Kinetics AI Research Grants',
    category: 'Wire Transfer',
    amount: 75000.00,
    currency: 'USD',
    riskScore: 35,
    riskLevel: 'medium',
    status: 'cleared',
    ipAddress: '128.112.136.1',
    location: 'Princeton, NJ, USA',
    account: 'Wells Fargo Commercial ****5531',
    riskFactors: ['Unusual non-commercial entity type', 'Verified university escrow account'],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.9,
      anomalyScore: 0.321
    }
  },
  {
    id: 'TX-98350',
    timestamp: '2026-09-19T14:20:00Z',
    entity: 'Datadog Systems Inc.',
    category: 'Card Processing',
    amount: 9800.00,
    currency: 'USD',
    riskScore: 6,
    riskLevel: 'low',
    status: 'cleared',
    ipAddress: '52.14.88.20',
    location: 'New York, NY, USA',
    account: 'Corporate Visa ****8814',
    riskFactors: ['Regular cloud monitoring billing', 'Tokenized recurring transaction'],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.3,
      anomalyScore: 0.05
    }
  },
  {
    id: 'TX-98322',
    timestamp: '2026-09-19T11:05:44Z',
    entity: 'Solomon Capital Advisory',
    category: 'Vendor Payout',
    amount: 125000.00,
    currency: 'USD',
    riskScore: 68,
    riskLevel: 'high',
    status: 'under_review',
    ipAddress: '194.67.210.12',
    location: 'London, UK',
    account: 'Barclays UK ****1199',
    riskFactors: [
      'Retainer fee exceeds standard advisory contract by $45,000',
      'Invoice timestamp submitted on weekend'
    ],
    mlModelDetails: {
      model: 'FinGuard DeepGraph Autoencoder v3.2',
      engine: 'AMD ROCm HIP Kernel',
      inferenceLatencyMs: 1.6,
      anomalyScore: 0.69
    }
  }
];

export function generateCashFlowData(days: 30 | 60 | 90, scenario: 'base' | 'conservative' | 'aggressive'): CashFlowForecastResponse {
  const points: CashFlowPoint[] = [];
  const baseStarting = 4850000; // $4.85M
  let runningBase = baseStarting;
  let runningStress = baseStarting;

  const now = new Date();

  // Multipliers based on scenario
  const revMult = scenario === 'aggressive' ? 1.15 : scenario === 'conservative' ? 0.85 : 1.0;
  const expMult = scenario === 'conservative' ? 1.12 : scenario === 'aggressive' ? 0.95 : 1.0;

  for (let i = 1; i <= days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // Weekly patterns
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isPayrollDay = i % 14 === 0;
    const isTaxDay = i === 42 || i === 72;
    const isSaaSSubscriptionDay = i % 30 === 1;

    let dayRevenue = isWeekend ? 8000 : 42000 + (Math.sin(i / 5) * 18000) + ((i % 7 === 3) ? 75000 : 0);
    dayRevenue = Math.round(dayRevenue * revMult);

    let dayExpense = isWeekend ? 4000 : 28000 + (Math.cos(i / 4) * 9000);
    if (isPayrollDay) dayExpense += 210000;
    if (isTaxDay) dayExpense += 180000;
    if (isSaaSSubscriptionDay) dayExpense += 45000;
    dayExpense = Math.round(dayExpense * expMult);

    const net = dayRevenue - dayExpense;
    runningBase += net;

    // Stress scenario has late customer receipts & 15% cost inflation
    const stressNet = (dayRevenue * 0.78) - (dayExpense * 1.15);
    runningStress += stressNet;

    // Confidence intervals expand with time horizon
    const uncertaintyFactor = Math.sqrt(i) * 18000;
    const upper = Math.round(runningBase + uncertaintyFactor);
    const lower = Math.round(runningBase - uncertaintyFactor);

    let eventNote: string | undefined = undefined;
    if (isPayrollDay) eventNote = `Payroll Cycle (-$${(210000 * expMult / 1000).toFixed(0)}k)`;
    if (isTaxDay) eventNote = `Tax Amortization (-$180k)`;
    if (i === 15) eventNote = `Enterprise Contract Q3 Inflow (+$120k)`;

    points.push({
      date: dateStr,
      dayIndex: i,
      revenue: dayRevenue,
      expenses: dayExpense,
      netCashFlow: net,
      predictedBalance: Math.round(runningBase),
      upperConfidence: upper,
      lowerConfidence: lower,
      stressBalance: Math.round(runningStress),
      eventNote
    });
  }

  const endBal = points[points.length - 1].predictedBalance;
  const netBurn = Math.round(((baseStarting - endBal) / (days / 30)));
  const runwayMonths = netBurn <= 0 ? 36 : Number((baseStarting / netBurn).toFixed(1));

  return {
    horizonDays: days,
    scenario,
    startingBalance: baseStarting,
    endingBalance: endBal,
    netBurnMonthly: netBurn > 0 ? netBurn : 42800,
    runwayMonths: runwayMonths > 0 ? runwayMonths : 22.4,
    riskAlerts: [
      {
        date: points[Math.min(13, points.length - 1)].date,
        type: 'warning',
        message: 'Upcoming bi-weekly payroll overlap with vendor cloud invoice ($295k cumulative draw).',
        impactAmount: 295000
      },
      {
        date: points[Math.min(41, points.length - 1)].date,
        type: 'critical',
        message: 'Projected liquidity dip in Day 42 from semi-annual state franchise tax obligation.',
        impactAmount: 180000
      },
      {
        date: points[Math.min(27, points.length - 1)].date,
        type: 'info',
        message: 'Expected Enterprise Tier ARR renewal cycle from Apex Global ($340,000 inflow).',
        impactAmount: 340000
      }
    ],
    points
  };
}

export const INITIAL_BUSINESS_RISK: BusinessRiskData = {
  compositeScore: 68, // 0 - 100
  customerConcentrationRisk: {
    top3Share: 64.2, // 64.2% of total revenue is from top 3 customers
    weightedDSO: 47.8, // Days Sales Outstanding
    highRiskReceivables: 680000,
    customers: [
      {
        id: 'CUST-01',
        name: 'Apex Global Logistics',
        tier: 'Enterprise',
        mrr: 210000,
        arrPercentage: 34.5,
        dso: 58,
        riskScore: 78,
        paymentStatus: 'Late 45d',
        creditRating: 'BBB',
        primaryRiskReason: 'Extreme revenue concentration (34.5% ARR); payment delay extended by 22 days.'
      },
      {
        id: 'CUST-02',
        name: 'OmniStream Media Corp',
        tier: 'Enterprise',
        mrr: 115000,
        arrPercentage: 18.2,
        dso: 42,
        riskScore: 45,
        paymentStatus: 'Late 15d',
        creditRating: 'AA',
        primaryRiskReason: 'Moderate concentration; recent leadership restructure delaying AP sign-offs.'
      },
      {
        id: 'CUST-03',
        name: 'BioSynthetica Health',
        tier: 'Enterprise',
        mrr: 72000,
        arrPercentage: 11.5,
        dso: 28,
        riskScore: 19,
        paymentStatus: 'Current',
        creditRating: 'AAA',
        primaryRiskReason: 'Solid balance sheet, institutional healthcare funding.'
      },
      {
        id: 'CUST-04',
        name: 'Vanguard Aerospace Inc',
        tier: 'Growth',
        mrr: 45000,
        arrPercentage: 7.2,
        dso: 65,
        riskScore: 82,
        paymentStatus: 'Disputed',
        creditRating: 'B',
        primaryRiskReason: 'Contract dispute regarding custom SLA metrics; $90k withholding.'
      },
      {
        id: 'CUST-05',
        name: 'FinPulse Systems',
        tier: 'Mid-Market',
        mrr: 38000,
        arrPercentage: 6.1,
        dso: 31,
        riskScore: 24,
        paymentStatus: 'Current',
        creditRating: 'AA',
        primaryRiskReason: 'Low risk; on automated ACH recurring schedule.'
      }
    ]
  },
  supplierDependencyRisk: {
    singlePointFailuresCount: 2,
    monthlyExposures: 240000,
    suppliers: [
      {
        id: 'SUPP-01',
        name: 'Nebula Cloud & AMD GPU Compute',
        category: 'Cloud Infrastructure',
        monthlySpend: 135000,
        spendPercentage: 42.1,
        criticality: 'Essential',
        riskScore: 62,
        riskFactors: ['Sole source for AMD Instinct MI300X ROCm clusters', 'Price increase notice +8% in Q4'],
        substitutabilityTimeWeeks: 6
      },
      {
        id: 'SUPP-02',
        name: 'AlphaPay Clearings',
        category: 'Payment Gateway',
        monthlySpend: 54000,
        spendPercentage: 16.8,
        criticality: 'Essential',
        riskScore: 71,
        riskFactors: ['Elevated chargeback buffer withholdings', 'Single point of failure for EU SEPA transactions'],
        substitutabilityTimeWeeks: 4
      },
      {
        id: 'SUPP-03',
        name: 'VaultGuard HSM Security',
        category: 'Security Services',
        monthlySpend: 28000,
        spendPercentage: 8.7,
        criticality: 'High',
        riskScore: 25,
        riskFactors: ['Redundant HSM keys distributed across two geographic zones'],
        substitutabilityTimeWeeks: 2
      },
      {
        id: 'SUPP-04',
        name: 'CoreFoundry Server Colocation',
        category: 'Hardware/Colo',
        monthlySpend: 23000,
        spendPercentage: 7.2,
        criticality: 'Moderate',
        riskScore: 32,
        riskFactors: ['Standard 3-year cage lease agreement with 99.995% uptime SLA'],
        substitutabilityTimeWeeks: 8
      }
    ]
  },
  expenseVolatility: {
    fixedRatio: 64, // 64% fixed
    variableRatio: 36, // 36% variable
    runawayAlerts: [
      'Unplanned 28% surge in GPU cluster compute hours over projected monthly budget',
      'Contractor consulting costs accelerated by $32k due to SOC2 compliance audit',
      'FX currency drag: USD/EUR fluctuation impacting European revenue yields by -3.2%'
    ]
  }
};

export const INITIAL_GPU_TELEMETRY: GpuTelemetryData = {
  mode: 'rocm',
  deviceName: 'AMD Instinct™ MI300X OAM (192GB HBM3)',
  rocmVersion: 'ROCm 6.2.2-rel-44',
  hipVersion: 'HIP 6.2.31422',
  driverVersion: 'amdgpu-dkms 6.8.0-31-generic',
  computeUnits: 304,
  gpuUtilizationPct: 76,
  vramUsedGb: 64.8,
  vramTotalGb: 192.0,
  vramBandwidthTbps: 3.84,
  temperatureCoreC: 56,
  temperatureMemC: 62,
  powerDrawWatts: 468,
  powerTdpWatts: 750,
  clockSpeedGhz: 2.10,
  activeWorkloads: [
    {
      id: 'WL-01',
      jobName: 'IsolationForest_DeepBatch_Kernel_v4',
      queueType: 'Inference',
      latencyMs: 1.6,
      throughputTps: 18450,
      status: 'Executing'
    },
    {
      id: 'WL-02',
      jobName: 'Temporal_Fusion_Transformer_CashFlow_90D',
      queueType: 'Batch Analysis',
      latencyMs: 3.2,
      throughputTps: 9200,
      status: 'Executing'
    },
    {
      id: 'WL-03',
      jobName: 'Graph_AntiMoneyLaundering_Embeddings',
      queueType: 'Embedding Search',
      latencyMs: 2.4,
      throughputTps: 12100,
      status: 'Queued'
    }
  ],
  benchmark: {
    rocmBatchLatencyMs: 1.8,
    cpuFallbackBatchLatencyMs: 26.4,
    speedupFactor: 14.6,
    throughputGainPct: 1360
  },
  isSimulatedTelemetry: true
};
