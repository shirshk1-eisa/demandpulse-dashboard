"""
FastAPI Main Server — Retail Demand Forecasting & Stock Alert System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from seed import seed_all

# Import route modules
from routes.dashboard import router as dashboard_router
from routes.forecast import router as forecast_router
from routes.inventory import router as inventory_router
from routes.alerts import router as alerts_router
from routes.reorders import router as reorders_router
from routes.whatif import router as whatif_router
from routes.models import router as models_router

# Initialize and seed database on startup
seed_all()

app = FastAPI(
    title="DemandPulse API",
    description="Retail Demand Forecasting & Stock Alert System Backend",
    version="1.0.0",
)

# CORS — allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(forecast_router, prefix="/api/forecast", tags=["Forecast"])
app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(alerts_router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(reorders_router, prefix="/api/reorders", tags=["Reorders"])
app.include_router(whatif_router, prefix="/api/whatif", tags=["What-If"])
app.include_router(models_router, prefix="/api/models", tags=["Models"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "DemandPulse API"}
