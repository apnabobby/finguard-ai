export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FinancialMetric {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  subtext: string;
  indicatorColor: string;
}

export interface Transaction {
  id: string;
  timestamp: string;
  entity: string;
  category: 'Wire Transfer' | 'Card Processing' | 'Payroll' | 'Vendor Payout' | 'ACH Outbound' | 'SaaS Billing';
  amount: number;
  currency: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  status: 'flagged' | 'cleared' | 'under_review' | 'auto_blocked';
  ipAddress: string;
  location: string;
  account: string;
  riskFactors: string[];
  mlModelDetails: {
    model: string;
    engine: 'AMD ROCm HIP Kernel' | 'CPU Vectorized Fallback';
    inferenceLatencyMs: number;
    anomalyScore: number;
  };
}

export interface CashFlowPoint {
  date: string;
  dayIndex: number;
  revenue: number;
  expenses: number;
  netCashFlow: number;
  predictedBalance: number;
  upperConfidence: number;
  lowerConfidence: number;
  stressBalance: number;
  eventNote?: string;
}

export interface CashFlowForecastResponse {
  horizonDays: 30 | 60 | 90;
  scenario: 'base' | 'conservative' | 'aggressive';
  startingBalance: number;
  endingBalance: number;
  netBurnMonthly: number;
  runwayMonths: number;
  riskAlerts: {
    date: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
    impactAmount: number;
  }[];
  points: CashFlowPoint[];
}

export interface CustomerRiskItem {
  id: string;
  name: string;
  tier: 'Enterprise' | 'Growth' | 'Mid-Market';
  mrr: number;
  arrPercentage: number;
  dso: number; // Days Sales Outstanding
  riskScore: number; // 0 - 100
  paymentStatus: 'Current' | 'Late 15d' | 'Late 45d' | 'Disputed';
  creditRating: 'AAA' | 'AA' | 'BBB' | 'B' | 'CCC';
  primaryRiskReason: string;
}

export interface SupplierRiskItem {
  id: string;
  name: string;
  category: 'Cloud Infrastructure' | 'Payment Gateway' | 'Security Services' | 'Hardware/Colo' | 'Office Ops';
  monthlySpend: number;
  spendPercentage: number;
  criticality: 'Essential' | 'High' | 'Moderate';
  riskScore: number;
  riskFactors: string[];
  substitutabilityTimeWeeks: number;
}

export interface BusinessRiskData {
  compositeScore: number;
  customerConcentrationRisk: {
    top3Share: number;
    weightedDSO: number;
    highRiskReceivables: number;
    customers: CustomerRiskItem[];
  };
  supplierDependencyRisk: {
    singlePointFailuresCount: number;
    monthlyExposures: number;
    suppliers: SupplierRiskItem[];
  };
  expenseVolatility: {
    fixedRatio: number;
    variableRatio: number;
    runawayAlerts: string[];
  };
}

export interface GpuTelemetryData {
  mode: 'rocm' | 'cpu';
  deviceName: string;
  rocmVersion: string;
  hipVersion: string;
  driverVersion: string;
  computeUnits: number;
  gpuUtilizationPct: number;
  vramUsedGb: number;
  vramTotalGb: number;
  vramBandwidthTbps: number;
  temperatureCoreC: number;
  temperatureMemC: number;
  powerDrawWatts: number;
  powerTdpWatts: number;
  clockSpeedGhz: number;
  activeWorkloads: {
    id: string;
    jobName: string;
    queueType: 'Inference' | 'Batch Analysis' | 'Embedding Search';
    latencyMs: number;
    throughputTps: number;
    status: 'Executing' | 'Queued' | 'Completed';
  }[];
  benchmark: {
    rocmBatchLatencyMs: number;
    cpuFallbackBatchLatencyMs: number;
    speedupFactor: number;
    throughputGainPct: number;
  };
  isSimulatedTelemetry: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  attachedDataPoint?: string;
  suggestedFollowUps?: string[];
}
