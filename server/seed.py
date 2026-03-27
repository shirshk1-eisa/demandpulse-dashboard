"""
Data seeder — populates MongoDB with realistic demo data.
Uses seeded-random for deterministic results.
"""
import math
import random
from datetime import datetime, timedelta
from database import get_db

random.seed(42)

# ===== Constants =====
SKU_NAMES = [
    "Organic Almond Milk 1L", "Greek Yogurt 500g", "Sourdough Bread Loaf",
    "Premium Orange Juice 2L", "Free-Range Eggs (12pk)", "Avocado (3pk)",
    "Baby Spinach 200g", "Chicken Breast 500g", "Salmon Fillet 250g",
    "Oat Granola 750g", "Cheddar Cheese 400g", "Cherry Tomatoes 250g",
    "Whole Milk 2L", "Butter Unsalted 250g", "Banana Bunch (5pk)",
]

STORE_NAMES = [
    "Downtown Central", "Mall of India", "Green Park Express",
    "Cyber Hub Store", "Saket Select", "Noida Mega",
    "Gurgaon Prime", "Connaught Place",
]

SUPPLIERS = [
    "FreshFarm Co.", "Organic Valley Ltd.", "Premium Foods Inc.",
    "Daily Harvest", "NatureBest Supplies", "Golden Grain Trading",
]

CATEGORIES = ["Dairy", "Bakery", "Beverages", "Produce", "Protein", "Snacks"]
MODELS = ["Prophet", "LightGBM", "XGBoost", "Croston", "LSTM", "Ensemble"]

ALERT_TYPES = [
    {"type": "Stockout Risk", "priority": "critical", "icon": "🔴"},
    {"type": "Low Stock Warning", "priority": "medium", "icon": "🟡"},
    {"type": "Overstock Alert", "priority": "high", "icon": "🟠"},
    {"type": "Shelf-Life Risk", "priority": "critical", "icon": "🔴"},
    {"type": "Demand Spike Detected", "priority": "info", "icon": "🔵"},
]

CATEGORY_FILLS = {
    "Dairy": "#c4b5fd", "Beverages": "#7dd3fc", "Produce": "#6ee7b7",
    "Protein": "#fca5a5", "Bakery": "#f9a8d4", "Snacks": "#fcd34d",
}


def seed_all():
    """Seed all MongoDB collections."""
    db = get_db()

    # Check if already seeded
    if db.products.count_documents({}) > 0:
        print("Database already seeded. Skipping.")
        return

    print("Seeding MongoDB...")

    # ===== Products =====
    products = []
    for i, name in enumerate(SKU_NAMES):
        products.append({
            "_id": f"SKU-{1000+i}",
            "name": name,
            "category": CATEGORIES[i % len(CATEGORIES)],
            "supplier": SUPPLIERS[i % len(SUPPLIERS)],
            "shelf_life_days": random.randint(3, 90),
        })
    db.products.insert_many(products)

    # ===== Stores =====
    stores = []
    for i, name in enumerate(STORE_NAMES):
        stores.append({
            "_id": f"STORE-{100+i}",
            "name": name,
            "region": random.choice(["North", "South", "West", "Central"]),
            "format": random.choice(["Express", "Mega", "Standard"]),
        })
    db.stores.insert_many(stores)

    # ===== KPIs =====
    db.kpis.insert_many([
        {"_id": "revenue", "label": "Weekly Revenue", "value": "₹24.8L", "trend": "+12.3%", "trend_direction": "up", "color": "lavender"},
        {"_id": "stockout", "label": "Stockout Risk SKUs", "value": "23", "trend": "-18.5%", "trend_direction": "up", "color": "peach"},
        {"_id": "overstock", "label": "Overstock Value", "value": "₹4.2L", "trend": "-22.1%", "trend_direction": "up", "color": "mint"},
        {"_id": "accuracy", "label": "Forecast Accuracy", "value": "87.4%", "trend": "+3.2%", "trend_direction": "up", "color": "sky"},
    ])

    # ===== Sales Trend =====
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    val = 180.0
    sales_trend = []
    for idx, m in enumerate(months):
        val += (random.random() - 0.4) * 30
        sales_trend.append({
            "order": idx,
            "month": m,
            "sales": max(100, round(val)),
            "forecast": max(100, round(val + (random.random() - 0.5) * 20)),
        })
    db.sales_trend.insert_many(sales_trend)

    # ===== Categories Revenue =====
    cat_values = [("Dairy", 28), ("Beverages", 22), ("Produce", 18),
                  ("Protein", 15), ("Bakery", 10), ("Snacks", 7)]
    db.categories_revenue.insert_many([
        {"name": name, "value": value, "fill": CATEGORY_FILLS[name]}
        for name, value in cat_values
    ])

    # ===== Forecasts =====
    now = datetime.now()
    forecasts = []
    for pi in range(len(SKU_NAMES)):
        product_id = f"SKU-{1000+pi}"
        base_val = 150 + random.random() * 100
        weeks = 24

        for i in range(weeks, -1, -1):
            dt = now - timedelta(weeks=i)
            seasonal = math.sin((i / 52) * math.pi * 2) * 30
            trend = i * 0.5
            noise = (random.random() - 0.5) * 40

            actual_val = max(10, round(base_val + seasonal + noise - trend)) if i >= 4 else None
            forecast_val = max(10, round(base_val + seasonal - trend + (random.random() - 0.5) * 15))
            u95 = forecast_val + round(25 + random.random() * 20)
            u80 = forecast_val + round(12 + random.random() * 10)
            l80 = max(0, forecast_val - round(12 + random.random() * 10))
            l95 = max(0, forecast_val - round(25 + random.random() * 20))

            forecasts.append({
                "product_id": product_id,
                "week": f"Week {weeks - i + 1}",
                "date": dt.strftime("%b %d"),
                "actual": actual_val,
                "forecast": forecast_val,
                "upper95": u95, "upper80": u80,
                "lower80": l80, "lower95": l95,
                "order": weeks - i,
            })
    db.forecasts.insert_many(forecasts)

    # ===== Inventory =====
    inventory = []
    for si in range(len(STORE_NAMES)):
        for pi in range(10):
            days_of_cover = round(random.random() * 30)
            inventory.append({
                "product_id": f"SKU-{1000+pi}",
                "store_id": f"STORE-{100+si}",
                "current_stock": round(50 + random.random() * 200),
                "weekly_demand": round(20 + random.random() * 60),
                "days_of_cover": days_of_cover,
                "status": ("critical" if days_of_cover < 5 else "warning" if days_of_cover < 10
                           else "good" if days_of_cover < 20 else "overstock"),
            })
    db.inventory.insert_many(inventory)

    # ===== Alerts =====
    alerts = []
    for i in range(20):
        t = random.choice(ALERT_TYPES)
        sku = random.choice(SKU_NAMES)
        store = random.choice(STORE_NAMES)
        hours_ago = round(random.random() * 72)

        if t["type"] == "Stockout Risk":
            msg = f"{sku} at {store} will stockout in {round(1 + random.random() * 3)} days"
        elif t["type"] == "Demand Spike Detected":
            msg = f"{sku} demand up {round(40 + random.random() * 80)}% at {store}"
        elif t["type"] == "Overstock Alert":
            msg = f"{sku} at {store}: stock is {round(3 + random.random() * 5)}× forecast demand"
        elif t["type"] == "Shelf-Life Risk":
            msg = f"{sku} at {store}: {round(50 + random.random() * 150)} units expire in {round(1 + random.random() * 4)} days"
        else:
            msg = f"{sku} at {store}: only {round(2 + random.random() * 5)} days of cover remaining"

        alerts.append({
            "_id": f"ALT-{2000+i}",
            "type": t["type"], "priority": t["priority"], "icon": t["icon"],
            "sku": sku, "store": store, "message": msg,
            "time": "Just now" if hours_ago < 1 else (f"{hours_ago}h ago" if hours_ago < 24 else f"{round(hours_ago / 24)}d ago"),
            "status": "active" if random.random() > 0.3 else "resolved",
        })
    db.alerts.insert_many(alerts)

    # ===== Reorders =====
    reorders = []
    for i in range(12):
        sku = random.choice(SKU_NAMES)
        supplier = random.choice(SUPPLIERS)
        roq = round(50 + random.random() * 300)
        lead_days = round(2 + random.random() * 7)
        order_date = now + timedelta(days=round(random.random() * 3))
        delivery_date = order_date + timedelta(days=lead_days)
        reorders.append({
            "_id": f"RO-{3000+i}",
            "sku": sku, "sku_id": f"SKU-{1000+random.randint(0,14)}",
            "supplier": supplier, "roq": roq, "moq": round(roq * 0.3),
            "current_stock": round(20 + random.random() * 100),
            "forecast_demand": round(100 + random.random() * 200),
            "order_date": order_date.strftime("%b %d"),
            "delivery_date": delivery_date.strftime("%b %d"),
            "status": "pending" if random.random() > 0.5 else ("approved" if random.random() > 0.5 else "urgent"),
            "cost_estimate": f"₹{round(roq * (10 + random.random() * 50))}",
        })
    db.reorders.insert_many(reorders)

    # ===== Model Metrics =====
    db.model_metrics.insert_many([
        {
            "name": model,
            "mape": round(5 + random.random() * 20, 1),
            "rmse": round(8 + random.random() * 25, 1),
            "bias": round((random.random() - 0.5) * 10, 1),
            "r2": round(0.7 + random.random() * 0.28, 3),
        }
        for model in MODELS
    ])

    # ===== Model Category Metrics =====
    db.model_category_metrics.insert_many([
        {"category": cat, "model_name": model, "mape": round(5 + random.random() * 18, 1)}
        for cat in CATEGORIES for model in MODELS
    ])

    print("MongoDB seeded successfully!")


if __name__ == "__main__":
    seed_all()
