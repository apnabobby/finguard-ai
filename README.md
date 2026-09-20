# FinGuard AI — GPU-Powered Financial Risk Intelligence

**FinGuard AI** is a high-performance enterprise financial risk intelligence and automated decision platform designed for modern CFOs, treasurers, and risk managers. Accelerated by AMD ROCm™ hardware architectures and Google Gemini, FinGuard AI delivers sub-millisecond fraud interception, multi-scenario liquidity forecasting, vendor/customer concentration stress testing, and real-time AI CFO strategic advisory.

---

## Key Modules & Capabilities

### 1. Real-Time Fraud & Anomaly Detection
- **Sub-Millisecond Inference**: Real-time evaluation of transactions against velocity, geo-entropy, and behavioral models.
- **Forensic Audit Dossiers**: Deep inspection into anomaly markers, Z-scores, IP geolocations, device fingerprints, and model confidence ratings.
- **Quarantine & Remediation**: Instant quarantine actions, status overrides (Cleared, Quarantined, Escalated, Rejected), and manual transaction payload injection.

### 2. 30/60/90-Day Cash Flow Forecasting
- **Dynamic Scenario Modeling**: Simulate future liquidity across **Base**, **Conservative**, and **Aggressive** scenarios over 30, 60, and 90-day forward horizons.
- **Visual Inflow & Outflow Analytics**: Interactive balance curves, daily burn/inflow breakdowns, confidence bands, and runway estimation.
- **Treasury Liquidity Mitigation**: Direct interactive mitigation playbooks for projected deficits, including prompt-pay AR discount acceleration, OPEX pacing, and credit line draw simulations.

### 3. Business Risk & Concentration Intelligence
- **Customer Concentration & DSO**: Monitor revenue dependency across top customer accounts, Days Sales Outstanding (DSO), credit ratings, and prompt-pay incentives.
- **Vendor Dependency & Failover Analysis**: Track high-criticality suppliers, switching lead times, and single-point-of-failure vectors with automated continuity standby playbooks.
- **Expense Volatility Tracking**: Detect anomalous budget overrun vectors across cloud compute, marketing spend, payroll, and SaaS tools.

### 4. AMD ROCm™ GPU Acceleration & Telemetry
- **Hardware Profile**: Engineered for AMD Instinct™ MI300X OAM accelerators (192GB HBM3 memory bandwidth).
- **HIP Kernel Queue Telemetry**: Live stream and queue telemetry tracking kernel dispatches, workgroup configurations, memory occupancy, and stream priority.
- **Real-Time Benchmarking**: Interactive latency and throughput comparisons between ROCm HIP kernels (~1.8 ms) and multi-core CPU fallbacks (~26.4 ms).

### 5. Autonomous AI CFO Strategic Advisor
- **Gemini-Powered Financial Reasoning**: Strategic advisory powered by Google Gemini, grounded in real-time treasury balances, burn rates, and risk exposures.
- **Scenario Stress Testing**: Run instant simulations (e.g., 30% revenue drops, delayed enterprise renewals, supplier price hikes) to evaluate impact on runway and capital allocation.
- **Automated Advisory Queries**: Quick prompts for liquidity buffers, venture debt evaluation, vendor renegotiation, and risk mitigation.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Recharts, Lucide React
- **Backend**: Express.js, TypeScript (`tsx` in dev, `esbuild` for production CommonJS bundle)
- **AI / LLM Integration**: Google GenAI SDK (`@google/genai`) using Gemini models
- **Compute Architecture**: AMD ROCm™ HIP compute architecture model and kernel telemetry engine

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm, bun, or yarn

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your credentials:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### Development
Start the full-stack development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Production Build
Build client and server bundles:
```bash
npm run build
npm start
```

---

## API Reference Overview

| Route | Method | Description |
|---|---|---|
| `/api/overview` | `GET` | Aggregated executive KPIs, health rating, and system status |
| `/api/fraud/transactions` | `GET` | List all monitored transactions with risk scores and anomalies |
| `/api/fraud/scan` | `POST` | Execute instant ROCm/CPU anomaly scan on a custom transaction |
| `/api/fraud/transaction/:id/status` | `PATCH` | Update disposition status (`cleared`, `quarantined`, `escalated`, `rejected`) |
| `/api/cashflow/forecast` | `GET` | Retrieve forward liquidity projections (`?days=30\|60\|90&scenario=base\|conservative\|aggressive`) |
| `/api/business-risk` | `GET` | Customer concentration, vendor dependency, and expense volatility matrix |
| `/api/gpu/telemetry` | `GET` | AMD Instinct MI300X telemetry, memory bandwidth, temperature, and HIP queue |
| `/api/gpu/benchmark` | `POST` | Trigger live ROCm vs CPU inference benchmark run |
| `/api/cfo/chat` | `POST` | Consult the Gemini-powered AI CFO with custom financial prompts |
| `/api/cfo/stress-test` | `POST` | Execute strategic macro or micro scenario stress tests |

---

## License
Proprietary & Confidential. Built with Google AI Studio.
