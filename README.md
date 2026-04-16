# SmartStock AI

Professional inventory intelligence platform for demand forecasting, risk detection, and reorder optimization.

![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-16A34A)

SmartStock AI enables operations teams to move from spreadsheet guesswork to data-driven stock decisions.

## Table of Contents

- [Why SmartStock AI](#why-smartstock-ai)
- [Core Capabilities](#core-capabilities)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [NPM Scripts](#npm-scripts)
- [Data Contract](#data-contract)
- [Forecast Engine](#forecast-engine)
- [Exports](#exports)
- [Quality](#quality)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Why SmartStock AI

SmartStock AI is designed for fast, practical inventory decisions:

- Convert CSV/XLSX product history into immediate forecast insights
- Forecast 15/30/60-day demand per SKU
- Detect stockout risk by coverage windows
- Generate reorder quantities with plain-language rationale
- Export executive-ready PDF and operational CSV

## Core Capabilities

- Drag-and-drop data upload with instant preview
- Automated trend analysis using 12 weeks of sales history
- Risk classification: High / Medium / Low
- KPI cards and interactive charts for quick signal detection
- Detailed recommendation table for per-product action
- One-click reporting for stakeholders

## Technology Stack

- Frontend: React 18, TypeScript
- Build: Vite 5
- UI: Tailwind CSS, shadcn/ui, Radix UI
- Charts: Recharts
- Motion: Framer Motion
- File Parsing: xlsx (SheetJS)
- Reporting: jsPDF + jspdf-autotable
- Testing: Vitest + Testing Library
- Linting: ESLint

## Architecture

```text
src/
  components/
    DataUpload.tsx        # CSV/XLSX ingest + preview
    DashboardCards.tsx    # KPI summaries
    Charts.tsx            # Forecast and trend visuals
    ForecastTable.tsx     # Risk and reorder actions
    ReportGenerator.tsx   # PDF/CSV export
  lib/
    forecasting.ts        # Forecast/risk/reorder engine
    types.ts              # Domain interfaces
    sampleData.ts         # Demo dataset
  pages/
    Index.tsx             # Main dashboard workflow
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

App URL is shown in the terminal (usually `http://localhost:5173`).

### Build and Preview Production

```bash
npm run build
npm run preview
```

## NPM Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run build:dev` - Build using development mode
- `npm run preview` - Preview production bundle
- `npm run typecheck` - Run TypeScript type checks
- `npm run lint` - Run ESLint checks
- `npm run test` - Run tests once
- `npm run test:watch` - Watch mode for tests

## Data Contract

Upload formats: `.csv`, `.xlsx`, `.xls`

Required columns (exact keys):

| Column | Type | Description |
| --- | --- | --- |
| `Product_Name` | string | Human-readable product name |
| `SKU` | string | Unique product identifier |
| `Current_Stock` | number | Current available units |
| `Past_Sales_Week1` ... `Past_Sales_Week12` | number | Weekly sales history (12 points) |

Notes:
- Missing required keys will cause parse or analysis failures.
- Numeric columns should contain valid numbers only.

## Forecast Engine

Per product workflow:

1. Read 12-week sales series
2. Compute average weekly sales
3. Fit linear regression to estimate trend
4. Predict demand for 15/30/60-day windows
5. Compute weeks of stock coverage: `Current_Stock / avgWeeklySales`
6. Assign risk level:
   - High: coverage < 1.5 weeks
   - Medium: coverage < 4 weeks
   - Low: coverage >= 4 weeks
7. Derive reorder quantity using target coverage logic

This approach keeps recommendations deterministic, explainable, and operationally practical.

## Exports

Generated artifacts:

- `SmartStock_Intelligence_Report.pdf`
- `SmartStock_Forecast_Export.csv`

PDF includes:
- Priority risk items
- Full forecast summary table
- Color-coded risk visualization for leadership review

## Quality

Run quality checks before merge/release:

```bash
npm run lint
npm run test
```

## Deployment

SmartStock AI is a static frontend app and can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- Any static host serving `dist/`

Standard flow:

```bash
npm install
npm run build
```

Publish the `dist/` directory.

## Troubleshooting

- Upload parsing fails:
  - Verify required header names exactly match the data contract.
  - Ensure sales and stock fields are numeric.
- No forecast output:
  - Confirm at least one valid row exists.
- Build problems:
  - Delete `node_modules` and reinstall dependencies.

## Roadmap

- Multi-warehouse stock balancing
- Seasonal decomposition models
- Service-level and safety-stock tuning
- API integration for ERP/eCommerce systems
- Scheduled report delivery

## Contributing

Suggested contribution workflow:

1. Create a feature branch
2. Make focused, testable changes
3. Run lint + tests
4. Submit PR with a clear technical summary

## License

This repository currently does not include a formal license file.
Add a `LICENSE` file to define legal usage terms.
# ai-inventory-forecasting-system
