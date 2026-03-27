"""Model Performance API routes — metrics, category breakdown."""
from fastapi import APIRouter
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

router = APIRouter()


@router.get("/performance")
def get_model_performance():
    db = get_db()
    rows = list(db.model_metrics.find({}, {"_id": 0}).sort("mape", 1))
    return rows


@router.get("/category-performance")
def get_category_performance():
    db = get_db()
    rows = list(db.model_category_metrics.find({}, {"_id": 0}))

    # Pivot: group by category with each model as a column
    result = {}
    for r in rows:
        cat = r["category"]
        if cat not in result:
            result[cat] = {"category": cat}
        result[cat][r["model_name"]] = r["mape"]

    return list(result.values())
