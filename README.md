# DemandPulse — Retail Demand Forecasting Dashboard

AI-powered retail demand forecasting and stock alert system with interactive analytics dashboard.

![DemandPulse Dashboard](https://img.shields.io/badge/DemandPulse-Dashboard-7c3aed?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)

## Features

- **Executive Overview** — KPI cards, sales trends, revenue breakdown
- **SKU Forecast** — Per-product demand forecast with 80%/95% confidence bands
- **Inventory Heatmap** — Store × SKU grid colored by days-of-cover
- **Alert Center** — Filterable alerts with resolve actions
- **Reorder Workbench** — Approve/bulk-approve reorder suggestions, CSV export
- **What-If Simulator** — Promo impact with cannibalization/halo effects
- **Model Scorecard** — MAPE/RMSE/R² comparison across 6 ML models

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Recharts |
| Backend | FastAPI (Python) |
| Database | MongoDB Atlas |
| Styling | Vanilla CSS (pastel + dark mode) |

## Quick Start

```bash
# Frontend
npm install
npm run dev

# Backend
pip install -r requirements.txt
cd server && python -m uvicorn main:app --port 8000 --reload
```

Set your MongoDB URI in `server/.env`:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGO_DB_NAME=demandpulse
```

## Deploy

Deployed via **Vercel** with Python serverless functions for the API layer.
