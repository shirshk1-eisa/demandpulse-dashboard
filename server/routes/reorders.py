"""Reorders API routes — list, approve, bulk approve."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

router = APIRouter()


class ReorderUpdate(BaseModel):
    status: str


class BulkApprove(BaseModel):
    ids: List[str]


@router.get("")
def get_reorders():
    db = get_db()
    rows = list(db.reorders.find({}).sort("_id", 1))
    return [
        {
            "id": r["_id"], "sku": r["sku"], "skuId": r["sku_id"],
            "supplier": r["supplier"], "roq": r["roq"], "moq": r["moq"],
            "currentStock": r["current_stock"], "forecastDemand": r["forecast_demand"],
            "orderDate": r["order_date"], "deliveryDate": r["delivery_date"],
            "status": r["status"], "costEstimate": r["cost_estimate"],
        }
        for r in rows
    ]


@router.patch("/{reorder_id}")
def update_reorder(reorder_id: str, update: ReorderUpdate):
    db = get_db()
    db.reorders.update_one({"_id": reorder_id}, {"$set": {"status": update.status}})
    row = db.reorders.find_one({"_id": reorder_id})
    if row:
        return {"id": row["_id"], "status": row["status"]}
    return {"error": "Reorder not found"}


@router.patch("/bulk-approve")
def bulk_approve(body: BulkApprove):
    db = get_db()
    result = db.reorders.update_many(
        {"_id": {"$in": body.ids}},
        {"$set": {"status": "approved"}}
    )
    return {"approved": result.modified_count, "ids": body.ids}
