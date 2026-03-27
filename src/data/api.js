/**
 * API Client — DemandPulse Backend
 * All frontend data fetching goes through these functions.
 */

const API_BASE = '/api';

async function fetchApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ===== Dashboard =====
export const fetchKpis = () => fetchApi('/dashboard/kpis');
export const fetchSalesTrend = () => fetchApi('/dashboard/sales-trend');
export const fetchCategories = () => fetchApi('/dashboard/categories');

// ===== Forecast =====
export const fetchSkus = () => fetchApi('/forecast/skus');
export const fetchTimeseries = (skuId) => fetchApi(`/forecast/timeseries?sku_id=${skuId}`);
export const fetchForecastMetrics = () => fetchApi('/forecast/metrics');

// ===== Inventory =====
export const fetchHeatmap = () => fetchApi('/inventory/heatmap');
export const fetchStores = () => fetchApi('/inventory/stores');

// ===== Alerts =====
export const fetchAlerts = (priority, status) => {
  const params = new URLSearchParams();
  if (priority && priority !== 'all') params.set('priority', priority);
  if (status && status !== 'all') params.set('status', status);
  const qs = params.toString();
  return fetchApi(`/alerts${qs ? '?' + qs : ''}`);
};
export const updateAlertStatus = (id, status) =>
  fetchApi(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

// ===== Reorders =====
export const fetchReorders = () => fetchApi('/reorders');
export const updateReorderStatus = (id, status) =>
  fetchApi(`/reorders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const bulkApproveReorders = (ids) =>
  fetchApi('/reorders/bulk-approve', { method: 'PATCH', body: JSON.stringify({ ids }) });

// ===== What-If =====
export const simulateWhatIfApi = (discount, duration, skuIndex) =>
  fetchApi('/whatif/simulate', {
    method: 'POST',
    body: JSON.stringify({ discount, duration, sku_index: skuIndex }),
  });
export const simulateSafetyStockApi = (riskLevel) =>
  fetchApi('/whatif/safety-stock', {
    method: 'POST',
    body: JSON.stringify({ risk_level: riskLevel }),
  });

// ===== Models =====
export const fetchModelPerformance = () => fetchApi('/models/performance');
export const fetchCategoryPerformance = () => fetchApi('/models/category-performance');
