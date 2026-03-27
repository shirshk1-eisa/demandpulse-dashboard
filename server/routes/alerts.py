"""Alerts API routes — list, filter, update status."""
from fastapi import APIRouter, Query
from pydantic import BaseModel
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

router = APIRouter()

PRIORITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "info": 3}


class AlertUpdate(BaseModel):
    status: str


@router.get("")
def get_alerts(
    priority: str = Query(default=None),
    status: str = Query(default=None),
):
    db = get_db()
    query = {}
    if priority:
        query["priority"] = priority
    if status:
        query["status"] = status

    rows = list(db.alerts.find(query))

    result = []
    for r in rows:
        result.append({
            "id": r["_id"],
            "type": r["type"], "priority": r["priority"], "icon": r["icon"],
            "sku": r["sku"], "store": r["store"], "message": r["message"],
            "time": r["time"], "status": r["status"],
        })

    # Sort by priority
    result.sort(key=lambda x: PRIORITY_ORDER.get(x["priority"], 9))
    return result


@router.patch("/{alert_id}")
def update_alert(alert_id: str, update: AlertUpdate):
    db = get_db()
    db.alerts.update_one({"_id": alert_id}, {"$set": {"status": update.status}})
    row = db.alerts.find_one({"_id": alert_id})
    if row:
        return {"id": row["_id"], "type": row["type"], "priority": row["priority"],
                "status": row["status"], "message": row["message"]}
    return {"error": "Alert not found"}
