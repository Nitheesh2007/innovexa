import api from './api';

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  bulkDelete: (ids) => api.post('/products/bulk-delete', { ids }),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  adjustStock: (id, data) => api.post(`/products/${id}/adjust-stock`, data),
  getTransactions: (id) => api.get(`/products/${id}/transactions`),
  getMarketComparison: (id) => api.get(`/products/${id}/market-compare`),
  syncMarketPrice: (id, platform) => api.post(`/products/${id}/sync-market-price`, { platform }),
  syncAllMarketPrices: () => api.post('/products/market/sync-all'),
  getAllMarketComparisons: () => api.get('/products/market/compare')
};

export const inventoryService = {
  stockIn: (data) => api.post('/inventory/stock-in', data),
  stockOut: (data) => api.post('/inventory/stock-out', data),
  adjustment: (data) => api.post('/inventory/adjustment', data),
  transfer: (data) => api.post('/inventory/transfer', data),
  getHistory: () => api.get('/inventory/history'),
  deleteHistory: (id) => api.delete(`/inventory/history/${id}`),
  getLowStock: () => api.get('/inventory/low-stock')
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data)
};

export const supplierService = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data)
};

export const warehouseService = {
  getAll: () => api.get('/warehouses'),
  create: (data) => api.post('/warehouses', data)
};

export const ocrService = {
  extractProduct: (formData) => api.post('/ocr/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};

export const activityService = {
  getLogs: (range = 'today') => api.get(`/activity?range=${range}`)
};

export const intelligenceService = {
  getAnalysis: () => api.get('/intelligence')
};

export const reportService = {
  getReport: (endpoint, params = {}) => api.get(`/reports/${endpoint}`, { params })
};

export const bomService = {
  getAll: () => api.get('/bom'),
  getById: (id) => api.get(`/bom/${id}`),
  create: (data) => api.post('/bom', data),
  update: (id, data) => api.put(`/bom/${id}`, data),
  delete: (id) => api.delete(`/bom/${id}`),
  checkAvailability: (id, quantity = 1) => api.get(`/bom/${id}/availability?quantity=${quantity}`),
  createWorkOrder: (id, data) => api.post(`/bom/${id}/create-work-order`, data)
};

export const workOrderService = {
  getAll: () => api.get('/work-orders'),
  getById: (id) => api.get(`/work-orders/${id}`),
  create: (data) => api.post('/work-orders', data),
  updateStatus: (id, data) => api.patch(`/work-orders/${id}/status`, data),
  delete: (id) => api.delete(`/work-orders/${id}`)
};

export const assetService = {
  getAll: () => api.get('/assets'),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  updateCustody: (id, data) => api.post(`/assets/${id}/custody`, data),
  recordMaintenance: (id, data) => api.post(`/assets/${id}/maintenance`, data)
};

export const stockTransferService = {
  getAll: () => api.get('/stock-transfers'),
  create: (data) => api.post('/stock-transfers', data),
  dispatch: (id) => api.post(`/stock-transfers/${id}/dispatch`),
  receive: (id) => api.post(`/stock-transfers/${id}/receive`)
};
