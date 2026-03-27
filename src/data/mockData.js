// ===== MOCK DATA FOR RETAIL DEMAND FORECASTING DASHBOARD =====

// Seed-based pseudo-random for deterministic data
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

// ===== HELPERS =====
const SKU_NAMES = [
  'Organic Almond Milk 1L', 'Greek Yogurt 500g', 'Sourdough Bread Loaf',
  'Premium Orange Juice 2L', 'Free-Range Eggs (12pk)', 'Avocado (3pk)',
  'Baby Spinach 200g', 'Chicken Breast 500g', 'Salmon Fillet 250g',
  'Oat Granola 750g', 'Cheddar Cheese 400g', 'Cherry Tomatoes 250g',
  'Whole Milk 2L', 'Butter Unsalted 250g', 'Banana Bunch (5pk)',
];

const STORE_NAMES = [
  'Downtown Central', 'Mall of India', 'Green Park Express', 
  'Cyber Hub Store', 'Saket Select', 'Noida Mega', 
  'Gurgaon Prime', 'Connaught Place',
];

const SUPPLIERS = [
  'FreshFarm Co.', 'Organic Valley Ltd.', 'Premium Foods Inc.',
  'Daily Harvest', 'NatureBest Supplies', 'Golden Grain Trading',
];

const CATEGORIES = ['Dairy', 'Bakery', 'Beverages', 'Produce', 'Protein', 'Snacks'];

const MODELS = ['Prophet', 'LightGBM', 'XGBoost', 'Croston', 'LSTM', 'Ensemble'];

// ===== GENERATE TIME SERIES =====
function generateTimeSeries(weeks = 24) {
  const data = [];
  const now = new Date();
  let baseVal = 150 + rand() * 100;

  for (let i = weeks; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekLabel = `W${date.getWeek ? date.getWeek() : Math.ceil((date.getDate()) / 7)} ${date.toLocaleDateString('en-US', { month: 'short' })}`;

    const seasonal = Math.sin((i / 52) * Math.PI * 2) * 30;
    const trend = i * 0.5;
    const noise = (rand() - 0.5) * 40;

    const actual = Math.max(10, Math.round(baseVal + seasonal + noise - trend));
    const forecast = Math.max(10, Math.round(baseVal + seasonal - trend + (rand() - 0.5) * 15));
    const upper95 = forecast + Math.round(25 + rand() * 20);
    const upper80 = forecast + Math.round(12 + rand() * 10);
    const lower80 = Math.max(0, forecast - Math.round(12 + rand() * 10));
    const lower95 = Math.max(0, forecast - Math.round(25 + rand() * 20));

    data.push({
      week: `Week ${weeks - i + 1}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: i >= 4 ? actual : null,
      forecast,
      upper95,
      upper80,
      lower80,
      lower95,
    });
  }
  return data;
}

// ===== KPI DATA =====
export const kpiData = [
  {
    id: 'revenue',
    label: 'Weekly Revenue',
    value: '₹24.8L',
    trend: '+12.3%',
    trendDirection: 'up',
    color: 'lavender',
  },
  {
    id: 'stockout',
    label: 'Stockout Risk SKUs',
    value: '23',
    trend: '-18.5%',
    trendDirection: 'up',
    color: 'peach',
  },
  {
    id: 'overstock',
    label: 'Overstock Value',
    value: '₹4.2L',
    trend: '-22.1%',
    trendDirection: 'up',
    color: 'mint',
  },
  {
    id: 'accuracy',
    label: 'Forecast Accuracy',
    value: '87.4%',
    trend: '+3.2%',
    trendDirection: 'up',
    color: 'sky',
  },
];

// ===== SALES TREND =====
export const salesTrendData = (() => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let val = 180;
  for (const m of months) {
    val += (rand() - 0.4) * 30;
    data.push({
      month: m,
      sales: Math.round(Math.max(100, val)),
      forecast: Math.round(Math.max(100, val + (rand() - 0.5) * 20)),
    });
  }
  return data;
})();

// ===== CATEGORY BREAKDOWN =====
export const categoryData = [
  { name: 'Dairy', value: 28, fill: '#c4b5fd' },
  { name: 'Beverages', value: 22, fill: '#7dd3fc' },
  { name: 'Produce', value: 18, fill: '#6ee7b7' },
  { name: 'Protein', value: 15, fill: '#fca5a5' },
  { name: 'Bakery', value: 10, fill: '#f9a8d4' },
  { name: 'Snacks', value: 7, fill: '#fcd34d' },
];

// ===== FORECAST DATA =====
export const forecastTimeSeriesData = generateTimeSeries(24);

export const skuList = SKU_NAMES.map((name, i) => ({
  id: `SKU-${1000 + i}`,
  name,
  category: CATEGORIES[i % CATEGORIES.length],
}));

export const forecastMetrics = {
  mape: '12.4%',
  rmse: '18.7',
  bias: '-2.1%',
  accuracy: '87.6%',
};

// ===== INVENTORY HEATMAP =====
export const inventoryHeatmapData = (() => {
  const data = [];
  for (let s = 0; s < STORE_NAMES.length; s++) {
    for (let p = 0; p < 10; p++) {
      const daysOfCover = Math.round(rand() * 30);
      data.push({
        store: STORE_NAMES[s],
        sku: SKU_NAMES[p],
        skuId: `SKU-${1000 + p}`,
        daysOfCover,
        currentStock: Math.round(50 + rand() * 200),
        weeklyDemand: Math.round(20 + rand() * 60),
        status: daysOfCover < 5 ? 'critical' : daysOfCover < 10 ? 'warning' : daysOfCover < 20 ? 'good' : 'overstock',
      });
    }
  }
  return data;
})();

// ===== ALERTS =====
export const alertsData = (() => {
  const types = [
    { type: 'Stockout Risk', priority: 'critical', icon: '🔴' },
    { type: 'Low Stock Warning', priority: 'medium', icon: '🟡' },
    { type: 'Overstock Alert', priority: 'high', icon: '🟠' },
    { type: 'Shelf-Life Risk', priority: 'critical', icon: '🔴' },
    { type: 'Demand Spike Detected', priority: 'info', icon: '🔵' },
  ];

  const alerts = [];
  for (let i = 0; i < 20; i++) {
    const t = types[Math.floor(rand() * types.length)];
    const sku = SKU_NAMES[Math.floor(rand() * SKU_NAMES.length)];
    const store = STORE_NAMES[Math.floor(rand() * STORE_NAMES.length)];
    const hoursAgo = Math.round(rand() * 72);
    alerts.push({
      id: `ALT-${2000 + i}`,
      ...t,
      sku,
      store,
      message: t.type === 'Stockout Risk' ? `${sku} at ${store} will stockout in ${Math.round(1 + rand() * 3)} days`
        : t.type === 'Demand Spike Detected' ? `${sku} demand up ${Math.round(40 + rand() * 80)}% at ${store}`
        : t.type === 'Overstock Alert' ? `${sku} at ${store}: stock is ${Math.round(3 + rand() * 5)}× forecast demand`
        : t.type === 'Shelf-Life Risk' ? `${sku} at ${store}: ${Math.round(50 + rand() * 150)} units expire in ${Math.round(1 + rand() * 4)} days`
        : `${sku} at ${store}: only ${Math.round(2 + rand() * 5)} days of cover remaining`,
      time: hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.round(hoursAgo / 24)}d ago`,
      status: rand() > 0.3 ? 'active' : 'resolved',
    });
  }
  return alerts;
})();

// ===== REORDER SUGGESTIONS =====
export const reorderData = (() => {
  const orders = [];
  for (let i = 0; i < 12; i++) {
    const sku = SKU_NAMES[Math.floor(rand() * SKU_NAMES.length)];
    const supplier = SUPPLIERS[Math.floor(rand() * SUPPLIERS.length)];
    const roq = Math.round(50 + rand() * 300);
    const leadDays = Math.round(2 + rand() * 7);
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() + Math.round(rand() * 3));
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + leadDays);

    orders.push({
      id: `RO-${3000 + i}`,
      sku,
      skuId: `SKU-${1000 + Math.floor(rand() * 15)}`,
      supplier,
      roq,
      moq: Math.round(roq * 0.3),
      currentStock: Math.round(20 + rand() * 100),
      forecastDemand: Math.round(100 + rand() * 200),
      orderDate: orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      deliveryDate: deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: rand() > 0.5 ? 'pending' : rand() > 0.5 ? 'approved' : 'urgent',
      costEstimate: `₹${(roq * (10 + rand() * 50)).toFixed(0)}`,
    });
  }
  return orders;
})();

// ===== MODEL PERFORMANCE =====
export const modelPerformanceData = MODELS.map((name) => ({
  name,
  mape: +(5 + rand() * 20).toFixed(1),
  rmse: +(8 + rand() * 25).toFixed(1),
  bias: +((rand() - 0.5) * 10).toFixed(1),
  r2: +(0.7 + rand() * 0.28).toFixed(3),
}));

export const modelCategoryPerformance = CATEGORIES.map((cat) => ({
  category: cat,
  ...Object.fromEntries(MODELS.map((m) => [m, +(5 + rand() * 18).toFixed(1)])),
}));

// ===== WHAT-IF SIMULATOR =====
export function simulateWhatIf(discount, duration, skuIndex = 0) {
  const baseData = [];
  const impactData = [];
  const r = seededRandom(skuIndex * 100 + discount + duration);

  for (let w = 1; w <= 12; w++) {
    const base = 100 + Math.sin(w / 3) * 20 + r() * 10;
    const promoMultiplier = w >= 3 && w <= 3 + duration
      ? 1 + (discount / 100) * (1.5 + r() * 0.5)
      : w > 3 + duration && w <= 5 + duration
        ? 1 - (discount / 200) * 0.3
        : 1;

    baseData.push({
      week: `Week ${w}`,
      baseline: Math.round(base),
      withPromo: Math.round(base * promoMultiplier),
      isPromo: w >= 3 && w <= 3 + duration,
    });
  }

  const cannibalization = [
    { product: SKU_NAMES[(skuIndex + 1) % 15], effect: -Math.round(5 + r() * 15), type: 'cannibalize' },
    { product: SKU_NAMES[(skuIndex + 2) % 15], effect: -Math.round(2 + r() * 8), type: 'cannibalize' },
    { product: SKU_NAMES[(skuIndex + 3) % 15], effect: +Math.round(3 + r() * 12), type: 'halo' },
    { product: SKU_NAMES[(skuIndex + 5) % 15], effect: +Math.round(1 + r() * 6), type: 'halo' },
  ];

  return { baseData, cannibalization };
}

// ===== SAFETY STOCK SIMULATOR =====
export function simulateSafetyStock(riskLevel) {
  const r = seededRandom(riskLevel * 7);
  const holdingCost = (riskLevel * 0.8 + 0.5).toFixed(1);
  const stockoutRisk = Math.max(0.5, (10 - riskLevel * 0.9)).toFixed(1);
  const safetyDays = Math.round(3 + riskLevel * 1.5);
  const inventoryValue = (riskLevel * 2.3 + 5).toFixed(1);

  return {
    holdingCost: `₹${holdingCost}L`,
    stockoutRisk: `${stockoutRisk}%`,
    safetyDays,
    inventoryValue: `₹${inventoryValue}L`,
  };
}

export { SKU_NAMES, STORE_NAMES, CATEGORIES, MODELS, SUPPLIERS };
