import api from './api';

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`)
};

export const inventoryService = {
  stockIn: (data) => api.post('/inventory/stock-in', data),
  stockOut: (data) => api.post('/inventory/stock-out', data),
  adjustment: (data) => api.post('/inventory/adjustment', data),
  transfer: (data) => api.post('/inventory/transfer', data),
  getHistory: () => api.get('/inventory/history'),
  getLowStock: () => api.get('/inventory/low-stock')
};

export const categoryService = {
  getAll: () => api.get('/categories')
};

export const supplierService = {
  getAll: () => api.get('/suppliers')
};

export const warehouseService = {
  getAll: () => api.get('/warehouses')
};

export const ocrService = {
  extractProduct: (formData) => api.post('/ocr/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const dashboardService = {
  getStats: () => api.get('/dashboard')
};

export const intelligenceService = {
  getAnalysis: () => api.get('/intelligence')
};
