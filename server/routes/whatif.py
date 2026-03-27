"""What-If Simulator API routes — promo simulation, safety stock calc."""
from fastapi import APIRouter
from pydantic import BaseModel
import math
import random as _random

router = APIRouter()

SKU_NAMES = [
    "Organic Almond Milk 1L", "Greek Yogurt 500g", "Sourdough Bread Loaf",
    "Premium Orange Juice 2L", "Free-Range Eggs (12pk)", "Avocado (3pk)",
    "Baby Spinach 200g", "Chicken Breast 500g", "Salmon Fillet 250g",
    "Oat Granola 750g", "Cheddar Cheese 400g", "Cherry Tomatoes 250g",
    "Whole Milk 2L", "Butter Unsalted 250g", "Banana Bunch (5pk)",
]


class SimulateRequest(BaseModel):
    discount: int = 15
    duration: int = 2
    sku_index: int = 0


class SafetyStockRequest(BaseModel):
    risk_level: int = 5


@router.post("/simulate")
def simulate_whatif(req: SimulateRequest):
    """Simulate promotional impact with cannibalization and halo effects."""
    rng = _random.Random(req.sku_index * 100 + req.discount + req.duration)

    base_data = []
    for w in range(1, 13):
        base = 100 + math.sin(w / 3) * 20 + rng.random() * 10
        if 3 <= w <= 3 + req.duration:
            multiplier = 1 + (req.discount / 100) * (1.5 + rng.random() * 0.5)
        elif 3 + req.duration < w <= 5 + req.duration:
            multiplier = 1 - (req.discount / 200) * 0.3
        else:
            multiplier = 1

        base_data.append({
            "week": f"Week {w}",
            "baseline": round(base),
            "withPromo": round(base * multiplier),
            "isPromo": 3 <= w <= 3 + req.duration,
        })

    cannibalization = [
        {"product": SKU_NAMES[(req.sku_index + 1) % 15], "effect": -round(5 + rng.random() * 15), "type": "cannibalize"},
        {"product": SKU_NAMES[(req.sku_index + 2) % 15], "effect": -round(2 + rng.random() * 8), "type": "cannibalize"},
        {"product": SKU_NAMES[(req.sku_index + 3) % 15], "effect": round(3 + rng.random() * 12), "type": "halo"},
        {"product": SKU_NAMES[(req.sku_index + 5) % 15], "effect": round(1 + rng.random() * 6), "type": "halo"},
    ]

    return {"baseData": base_data, "cannibalization": cannibalization}


@router.post("/safety-stock")
def safety_stock(req: SafetyStockRequest):
    """Calculate safety stock metrics for given risk level."""
    holding_cost = round(req.risk_level * 0.8 + 0.5, 1)
    stockout_risk = round(max(0.5, 10 - req.risk_level * 0.9), 1)
    safety_days = round(3 + req.risk_level * 1.5)
    inventory_value = round(req.risk_level * 2.3 + 5, 1)

    return {
        "holdingCost": f"₹{holding_cost}L",
        "stockoutRisk": f"{stockout_risk}%",
        "safetyDays": safety_days,
        "inventoryValue": f"₹{inventory_value}L",
    }
