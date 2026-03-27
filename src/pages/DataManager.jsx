import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { fetchSkus, fetchStores, updateStock, uploadSales } from '../data/api';
import Loader from '../components/Loader';
import { FiDatabase, FiUploadCloud, FiRefreshCcw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function DataManager() {
  const { data: skus, loading: skuLoading } = useApi(fetchSkus);
  const { data: stores, loading: storeLoading } = useApi(fetchStores);

  const [stockForm, setStockForm] = useState({ sku: '', store: '', amount: '' });
  const [salesForm, setSalesForm] = useState({ sku: '', amount: '', date: new Date().toLocaleString('en-us', {month:'short'}) });
  
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });
    try {
      await updateStock(stockForm.sku, stockForm.store, stockForm.amount);
      setStatus({ loading: false, success: 'Stock updated successfully!', error: null });
    } catch (err) {
      setStatus({ loading: false, success: null, error: 'Failed to update stock.' });
    }
  };

  const handleSalesUpload = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });
    try {
      await uploadSales(salesForm.sku, salesForm.amount, salesForm.date);
      setStatus({ loading: false, success: 'Sales data uploaded successfully!', error: null });
    } catch (err) {
      setStatus({ loading: false, success: null, error: 'Failed to upload sales.' });
    }
  };

  if (skuLoading || storeLoading) return <div className="page-content"><Loader text="Initializing data manager..." /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🗄️ Data Management</h2>
        <p>Update inventory levels and upload latest sales data</p>
      </div>

      {status.success && (
        <div className="alert success" style={{ marginBottom: 20 }}>
          <FiCheckCircle /> {status.success}
        </div>
      )}
      {status.error && (
        <div className="alert critical" style={{ marginBottom: 20 }}>
          <FiAlertCircle /> {status.error}
        </div>
      )}

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title"><FiRefreshCcw className="title-icon" /> Update Current Stock</div>
          </div>
          <form className="form-stacked" onSubmit={handleStockUpdate}>
            <div className="form-group">
              <label>Select SKU</label>
              <select className="select-styled" value={stockForm.sku} onChange={e => setStockForm({...stockForm, sku: e.target.value})} required>
                <option value="">Select Product...</option>
                {skus?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Store</label>
              <select className="select-styled" value={stockForm.store} onChange={e => setStockForm({...stockForm, store: e.target.value})} required>
                <option value="">Select Store...</option>
                {stores?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>New Stock Level (Units)</label>
              <input type="number" className="input-styled" value={stockForm.amount} onChange={e => setStockForm({...stockForm, amount: e.target.value})} placeholder="e.g. 250" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status.loading}>
              {status.loading ? 'Updating...' : 'Update Inventory'}
            </button>
          </form>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title"><FiUploadCloud className="title-icon" /> Upload Daily Sales</div>
          </div>
          <form className="form-stacked" onSubmit={handleSalesUpload}>
             <div className="form-group">
              <label>Select SKU</label>
              <select className="select-styled" value={salesForm.sku} onChange={e => setSalesForm({...salesForm, sku: e.target.value})} required>
                <option value="">Select Product...</option>
                {skus?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Sales Amount (₹)</label>
              <input type="number" className="input-styled" value={salesForm.amount} onChange={e => setSalesForm({...salesForm, amount: e.target.value})} placeholder="e.g. 45000" required />
            </div>
            <div className="form-group">
              <label>Target Month/Date Label</label>
              <input type="text" className="input-styled" value={salesForm.date} onChange={e => setSalesForm({...salesForm, date: e.target.value})} placeholder="e.g. Mar" required />
            </div>
            <div style={{ marginTop: 12, padding: 16, border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg-input)', cursor: 'pointer' }}>
              <FiUploadCloud size={24} style={{ color: 'var(--text-muted)' }} />
              <div style={{ fontSize: 13, marginTop: 8, color: 'var(--text-muted)' }}>Or drag and drop CSV files here</div>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: 20 }} disabled={status.loading}>
              Import Sales Records
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
