"""Inventory API routes — heatmap data, store list."""
from fastapi import APIRouter
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

router = APIRouter()


@router.get("/heatmap")
def get_heatmap():
    db = get_db()
    inv_rows = list(db.inventory.find({}, {"_id": 0}).sort([("store_id", 1), ("product_id", 1)]))

    # Lookup product names and store names
    products = {p["_id"]: p["name"] for p in db.products.find({}, {"_id": 1, "name": 1})}
    stores = {s["_id"]: s["name"] for s in db.stores.find({}, {"_id": 1, "name": 1})}

    return [
        {
            "store": stores.get(r["store_id"], r["store_id"]),
            "sku": products.get(r["product_id"], r["product_id"]),
            "skuId": r["product_id"],
            "daysOfCover": r["days_of_cover"],
            "currentStock": r["current_stock"],
            "weeklyDemand": r["weekly_demand"],
            "status": r["status"],
        }
        for r in inv_rows
    ]


@router.get("/stores")
def get_stores():
    db = get_db()
    rows = list(db.stores.find({}).sort("_id", 1))
    return [{"id": r["_id"], "name": r["name"], "region": r.get("region", ""), "format": r.get("format", "")} for r in rows]
