"""Forecast API routes — SKU list, time series, metrics."""
from fastapi import APIRouter, Query
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

router = APIRouter()


@router.get("/skus")
def get_skus():
    db = get_db()
    rows = list(db.products.find({}, {"_id": 1, "name": 1, "category": 1}).sort("_id", 1))
    return [{"id": r["_id"], "name": r["name"], "category": r["category"]} for r in rows]


@router.get("/timeseries")
def get_timeseries(sku_id: str = Query(default="SKU-1000")):
    db = get_db()
    rows = list(db.forecasts.find(
        {"product_id": sku_id},
        {"_id": 0, "product_id": 0, "order": 0}
    ).sort("order", 1))
    return rows


@router.get("/metrics")
def get_forecast_metrics():
    """Aggregate forecast metrics across all products."""
    db = get_db()
    rows = list(db.forecasts.find(
        {"actual": {"$ne": None}},
        {"actual": 1, "forecast": 1, "_id": 0}
    ))

    if not rows:
        return {"mape": "0%", "rmse": "0", "bias": "0%", "accuracy": "0%"}

    abs_errors = []
    errors = []
    sq_errors = []
    for r in rows:
        actual, forecast = r["actual"], r["forecast"]
        if actual and actual > 0:
            errors.append((forecast - actual) / actual)
            abs_errors.append(abs(forecast - actual) / actual)
            sq_errors.append((forecast - actual) ** 2)

    mape = sum(abs_errors) / len(abs_errors) * 100 if abs_errors else 0
    rmse = (sum(sq_errors) / len(sq_errors)) ** 0.5 if sq_errors else 0
    bias = sum(errors) / len(errors) * 100 if errors else 0

    return {
        "mape": f"{mape:.1f}%",
        "rmse": f"{rmse:.1f}",
        "bias": f"{bias:+.1f}%",
        "accuracy": f"{100 - mape:.1f}%",
    }
