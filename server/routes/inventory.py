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


class StockUpdate(BaseModel):
    sku_id: str
    store_id: str
    new_stock: int


@router.post("/update-stock")
def update_stock(update: StockUpdate):
    db = get_db()
    result = db.inventory.update_one(
        {"product_id": update.sku_id, "store_id": update.store_id},
        {"$set": {"current_stock": update.new_stock}}
    )
    if result.matched_count == 0:
        return {"error": "SKU/Store mapping not found"}
    return {"success": True, "new_stock": update.new_stock}


class SalesUpload(BaseModel):
    sku_id: str
    sales: float
    date: str


@router.post("/upload-sales")
def upload_sales(data: SalesUpload):
    db = get_db()
    # In a real app, this would update historical tables. 
    # For the dashboard demo, we'll update the 'kpis' and 'sales_trend' collections.
    
    # Update latest sales trend entry or add new
    db.sales_trend.update_one(
        {"month": data.date}, 
        {"$inc": {"sales": data.sales}},
        upsert=True
    )
    
    # Update Weekly Revenue KPI (rough approximation for demo)
    db.kpis.update_one(
        {"_id": "revenue"},
        {"$set": {"value": f"₹{data.sales/100000:.1f}L"}} # simplified
    )
    
    return {"success": True, "uploaded": data.sales}
