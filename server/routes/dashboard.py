"""Dashboard API routes — KPIs, sales trend, category breakdown."""
from fastapi import APIRouter
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

router = APIRouter()


@router.get("/kpis")
def get_kpis():
    db = get_db()
    rows = list(db.kpis.find({}, {"_id": 1, "label": 1, "value": 1, "trend": 1, "trend_direction": 1, "color": 1}))
    return [
        {
            "id": r["_id"], "label": r["label"], "value": r["value"],
            "trend": r["trend"], "trendDirection": r["trend_direction"],
            "color": r["color"],
        }
        for r in rows
    ]


@router.get("/sales-trend")
def get_sales_trend():
    db = get_db()
    rows = list(db.sales_trend.find({}, {"_id": 0, "order": 0}).sort("order", 1))
    return rows


@router.get("/categories")
def get_categories():
    db = get_db()
    rows = list(db.categories_revenue.find({}, {"_id": 0}).sort("value", -1))
    return rows
