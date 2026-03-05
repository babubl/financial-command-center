# Financial Command Center

A unified AI-powered financial dashboard that brings your complete financial picture into one screen. Built for Indian households and professionals.

## What It Does

One dashboard. Six modules. One AI agent that sees everything.

- **Net Worth & Allocation** — Total assets, liabilities, allocation donut chart, unrealized gains
- **Tax Planning** — Old vs New regime comparison, Section 80C/80D utilization, tax savings
- **Debt & Loans** — Outstanding loans, EMIs, debt-to-income ratio, prepayment impact
- **Investments & SIPs** — Portfolio returns by category, active SIPs, concentration alerts
- **Goal Tracker** — Retirement, education, emergency fund progress with projections
- **Monthly Budget** — Income vs expenses, savings rate, 50/30/20 split analysis

## The AI Agent

A Claude-powered financial advisor that has your complete data context. Ask things like:
- "Can I retire at 50?"
- "What if I prepay ₹5L on my home loan?"
- "Give me a 90-day action plan"

The agent cross-references all modules and gives specific, quantified advice.

## Connected Ecosystem

Each card links to deeper tools in the suite:
- **TaxGyan / TaxSakhi / TaxJugaad** for tax deep-dives
- **StockGyan** for detailed stock & MF analysis
- **DebtFree** for advanced debt payoff strategies
- **WealthLens / FinShield** for wealth planning and resilience
- **LoanSense AI** for loan restructuring

## Tech Stack

- React 18 + Vite
- TailwindCSS (custom dark theme)
- Recharts for data visualization
- Framer Motion for animations
- Claude API (Sonnet) for AI agent
- localStorage for privacy-first persistence

## Setup

```bash
npm install
npm run dev
```

For the AI Agent, enter your Anthropic API key in the agent panel (stored in memory only, never persisted).

## Build & Deploy

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, GitHub Pages, or any static host.

## Architecture

```
src/
├── config/          # Theme tokens, ecosystem links
├── constants/       # Financial rules, sample data
├── store/           # React Context + hooks
├── services/        # Calculations, AI agent, storage
├── components/
│   ├── layout/      # Sidebar, TopBar, Grid
│   ├── cards/       # 6 dashboard modules
│   ├── agent/       # AI chat panel
│   ├── shared/      # Reusable UI components
│   └── editors/     # Data input modals
└── utils/           # Formatters, validators
```

## Privacy

- All data stored in localStorage — never leaves your browser
- AI agent sends data to Claude API only when you ask a question
- API key stored in memory only — cleared on page refresh
- Export/import your data as JSON backup anytime

## Author

Built by [Babu Balasubramanian](https://babu-portfolio.lovable.app/)

GitHub: [@babubl](https://github.com/babubl)
