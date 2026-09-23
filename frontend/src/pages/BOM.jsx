import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  DollarSign, 
  Clock, 
  Hammer, 
  Boxes, 
  Trash2, 
  Edit3, 
  Eye, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { bomService, productService, warehouseService } from '../services/apiServices';
import toast from 'react-hot-toast';

const BOM = () => {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBomForCheck, setSelectedBomForCheck] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [checkQuantity, setCheckQuantity] = useState(5);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Work order launch modal
  const [isLaunchWoModalOpen, setIsLaunchWoModalOpen] = useState(false);
  const [launchBom, setLaunchBom] = useState(null);
  const [launchTargetQty, setLaunchTargetQty] = useState(10);
  const [launchWarehouse, setLaunchWarehouse] = useState('');
  const [launchPriority, setLaunchPriority] = useState('medium');
  const [isSubmittingWo, setIsSubmittingWo] = useState(false);

  // Create BOM form state
  const [formData, setFormData] = useState({
    name: '',
    finishedProduct: '',
    version: '1.0',
    description: '',
    laborCost: 0,
    overheadCost: 0,
    yieldPercentage: 100,
    components: [
      { product: '', quantity: 1, unitCost: 0, scrapAllowancePct: 0, notes: '' }
    ]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bomRes, prodRes, whRes] = await Promise.all([
        bomService.getAll(),
        productService.getAll(),
        warehouseService.getAll()
      ]);
      setBoms(bomRes.data?.data || []);
      setProducts(prodRes.data?.data || prodRes.data || []);
      setWarehouses(whRes.data?.data || whRes.data || []);
      if (whRes.data?.data?.length > 0) {
        setLaunchWarehouse(whRes.data.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load BOM data', error);
      toast.error('Failed to load Bill of Materials data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Component row handlers for create form
  const handleAddComponentRow = () => {
    setFormData(prev => ({
      ...prev,
      components: [
        ...prev.components,
        { product: '', quantity: 1, unitCost: 0, scrapAllowancePct: 0, notes: '' }
      ]
    }));
  };

  const handleRemoveComponentRow = (index) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  const handleComponentChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.components];
      updated[index] = { ...updated[index], [field]: value };

      // If product selected, auto-fill unitCost from product cost/price
      if (field === 'product') {
        const prod = products.find(p => p._id === value);
        if (prod) {
          updated[index].unitCost = prod.cost || prod.purchasePrice || (prod.price || prod.sellingPrice || 0) * 0.6;
        }
      }
      return { ...prev, components: updated };
    });
  };

  // Live total cost calculation for modal
  const calculateLiveTotalCost = () => {
    const materials = formData.components.reduce((sum, c) => {
      const scrapFactor = 1 + (Number(c.scrapAllowancePct) || 0) / 100;
      return sum + (Number(c.quantity) || 0) * (Number(c.unitCost) || 0) * scrapFactor;
    }, 0);
    return (materials + Number(formData.laborCost || 0) + Number(formData.overheadCost || 0)).toFixed(2);
  };

  const handleCreateBOM = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.finishedProduct) {
      toast.error('Please enter a BOM name and select a finished product');
      return;
    }
    if (formData.components.length === 0 || !formData.components[0].product) {
      toast.error('Please add at least one component to the assembly');
      return;
    }

    try {
      await bomService.create(formData);
      toast.success('Bill of Materials created successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        finishedProduct: '',
        version: '1.0',
        description: '',
        laborCost: 0,
        overheadCost: 0,
        yieldPercentage: 100,
        components: [{ product: '', quantity: 1, unitCost: 0, scrapAllowancePct: 0, notes: '' }]
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create BOM');
    }
  };

  // Availability inspection
  const handleInspectAvailability = async (bom, qty = checkQuantity) => {
    setSelectedBomForCheck(bom);
    setIsCheckingAvailability(true);
    try {
      const res = await bomService.checkAvailability(bom._id, qty);
      setAvailabilityData(res.data?.data);
    } catch (error) {
      toast.error('Failed to run stock availability check');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Launch Work Order directly
  const handleLaunchWorkOrder = async (e) => {
    e.preventDefault();
    if (!launchBom) return;
    setIsSubmittingWo(true);
    try {
      await bomService.createWorkOrder(launchBom._id, {
        targetQuantity: launchTargetQty,
        warehouse: launchWarehouse,
        priority: launchPriority
      });
      toast.success(`Work Order generated for ${launchTargetQty} units!`);
      setIsLaunchWoModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate work order');
    } finally {
      setIsSubmittingWo(false);
    }
  };

  const filteredBoms = boms.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.finishedProduct && (b.finishedProduct.name || b.finishedProduct.productName || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-900 to-indigo-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-sky-300 text-xs font-mono uppercase tracking-wider mb-1">
            <Layers size={14} />
            <span>Manufacturing & Assemblies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Bill of Materials (BOM)</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            Engineer multi-level finished goods, track live subcomponent costing, and launch automated production work orders with stock reservation.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-sky-900 font-semibold text-sm hover:bg-sky-50 transition-all shadow-sm shrink-0"
        >
          <Plus size={18} />
          <span>New BOM Specification</span>
        </button>
      </div>

      {/* 2. KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active BOM Specs</span>
            <Boxes size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-ink">{boms.length}</p>
          <span className="text-xs text-emerald-600 font-medium">Ready for production runs</span>
        </div>

        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Avg. Assembly Cost</span>
            <DollarSign size={18} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-ink font-mono">
            ₹{boms.length > 0 ? Number(boms.reduce((acc, b) => acc + (b.totalCalculatedCost || 0), 0) / boms.length).toLocaleString('en-IN') : '0'}
          </p>
          <span className="text-xs text-slate-400">Rolled up materials + labor</span>
        </div>

        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Standard Yield Rate</span>
            <Sparkles size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-emerald-600">98.5%</p>
          <span className="text-xs text-slate-400">Scrap margin allowance factored</span>
        </div>

        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Fast Execution</span>
            <Hammer size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-sky-700">1-Click WO</p>
          <span className="text-xs text-slate-400">Deducts components automatically</span>
        </div>
      </div>

      {/* 3. Search & Filter Tool */}
      <div className="flex items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-hairline">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by BOM number, finished good, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-hairline bg-surface-muted text-ink placeholder:text-slate-400 focus:outline-none focus:border-sky-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-ink font-semibold">{filteredBoms.length}</span> of {boms.length} recipes
        </div>
      </div>

      {/* 4. BOM Catalog Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-500">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm mt-3 font-medium">Loading BOM catalog...</p>
        </div>
      ) : filteredBoms.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-hairline bg-surface">
          <Layers size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-ink">No Bill of Materials Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Create your first specification to link components into finished products and calculate accurate manufacturing margins.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-700 text-white font-medium text-sm hover:bg-sky-800"
          >
            <Plus size={16} />
            <span>Create BOM Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBoms.map((bom) => {
            const finishedProd = bom.finishedProduct || {};
            const prodName = finishedProd.name || finishedProd.productName || 'Unassigned Product';
            const prodSku = finishedProd.sku || 'SKU-NONE';
            const prodPrice = finishedProd.price || finishedProd.sellingPrice || 0;
            const unitCost = bom.totalCalculatedCost || 0;
            const grossMarginPct = prodPrice > 0 ? (((prodPrice - unitCost) / prodPrice) * 100).toFixed(1) : 0;

            return (
              <div 
                key={bom._id}
                className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code & Version */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        {bom.bomNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-100">
                        v{bom.version || '1.0'}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={12} />
                      Active
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold font-display text-ink">{bom.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{bom.description || 'Production assembly specification.'}</p>

                  {/* Finished Good Info */}
                  <div className="mt-4 p-3 rounded-xl bg-surface-muted border border-hairline flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Target Finished Product</span>
                      <p className="text-sm font-semibold text-ink">{prodName}</p>
                      <p className="text-xs font-mono text-slate-500">SKU: {prodSku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Selling Price</span>
                      <p className="text-sm font-bold text-ink">₹{Number(prodPrice).toLocaleString('en-IN')}</p>
                      <span className={`text-[11px] font-semibold ${grossMarginPct > 40 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {grossMarginPct}% Margin
                      </span>
                    </div>
                  </div>

                  {/* Subcomponents Preview */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>Components ({bom.components?.length || 0})</span>
                      <span>Usage per unit</span>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {bom.components?.map((item, idx) => {
                        const compProd = item.product || {};
                        const compName = compProd.name || compProd.productName || 'Raw Material';
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-hairline last:border-0">
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{compName}</span>
                            <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{item.quantity} units (₹{Number(item.unitCost || 0).toLocaleString('en-IN')}/ea)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost Summary Breakdown */}
                  <div className="mt-5 pt-4 border-t border-hairline grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-surface-muted">
                      <span className="text-[10px] text-slate-400 block">Labor</span>
                      <span className="font-semibold text-ink font-mono">₹{Number(bom.laborCost || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-muted">
                      <span className="text-[10px] text-slate-400 block">Overhead</span>
                      <span className="font-semibold text-ink font-mono">₹{Number(bom.overheadCost || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800">
                      <span className="text-[10px] text-sky-800 dark:text-sky-300 font-medium block">Total Unit Cost</span>
                      <span className="font-bold text-sky-900 dark:text-sky-200 font-mono">₹{Number(unitCost).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Ribbon */}
                <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleInspectAvailability(bom)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-hairline text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye size={14} className="text-slate-500" />
                    <span>Check Readiness</span>
                  </button>

                  <button
                    onClick={() => {
                      setLaunchBom(bom);
                      setIsLaunchWoModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors shadow-xs"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Launch Work Order</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: Create New BOM */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-hairline shadow-2xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div>
                <h3 className="text-lg font-bold font-display text-ink">Create Bill of Materials</h3>
                <p className="text-xs text-slate-500">Configure assembly hierarchy and auto-roll costs.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateBOM} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">BOM Recipe Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ergonomic Office Chair Assembly"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Finished Product to Output *</label>
                  <select
                    required
                    value={formData.finishedProduct}
                    onChange={(e) => setFormData({ ...formData, finishedProduct: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink focus:outline-none focus:border-sky-600"
                  >
                    <option value="">Select Finished Product...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name || p.productName} ({p.sku || 'No SKU'}) - ₹{Number(p.sellingPrice || p.price || 0).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Description / Specifications</label>
                <textarea
                  rows={2}
                  placeholder="Notes, assembly tolerance guidelines, packaging instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink focus:outline-none focus:border-sky-600"
                />
              </div>

              {/* Dynamic Components Table */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Subcomponents & Raw Materials</label>
                  <button
                    type="button"
                    onClick={handleAddComponentRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800"
                  >
                    <Plus size={14} /> Add Component
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.components.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface-muted border border-hairline">
                      <div className="flex-1">
                        <select
                          required
                          value={comp.product}
                          onChange={(e) => handleComponentChange(idx, 'product', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-hairline bg-surface text-ink"
                        >
                          <option value="">Choose item...</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name || p.productName} (In Stock: {p.stock || p.currentStock || 0})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          placeholder="Qty"
                          title="Quantity per unit"
                          value={comp.quantity}
                          onChange={(e) => handleComponentChange(idx, 'quantity', e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded border border-hairline bg-surface text-ink font-mono"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Unit ₹"
                          title="Unit cost"
                          value={comp.unitCost}
                          onChange={(e) => handleComponentChange(idx, 'unitCost', e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded border border-hairline bg-surface text-ink font-mono"
                        />
                      </div>

                      <div className="w-20">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          placeholder="Scrap %"
                          title="Scrap allowance %"
                          value={comp.scrapAllowancePct}
                          onChange={(e) => handleComponentChange(idx, 'scrapAllowancePct', e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded border border-hairline bg-surface text-ink font-mono"
                        />
                      </div>

                      {formData.components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveComponentRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Overhead & Labor */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Direct Labor Cost / Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Overhead & Machinery / Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.overheadCost}
                    onChange={(e) => setFormData({ ...formData, overheadCost: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink font-mono"
                  />
                </div>
              </div>

              {/* Total Rolled-up Preview */}
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-sky-900 dark:text-sky-200">Calculated Manufacturing Unit Cost</p>
                  <p className="text-[11px] text-sky-700 dark:text-sky-300">Sum of materials + labor + operational overheads</p>
                </div>
                <span className="text-lg font-black font-mono text-sky-900 dark:text-sky-200">
                  ₹{Number(calculateLiveTotalCost()).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-hairline text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800"
                >
                  Save Bill of Materials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Check Stock Availability */}
      {selectedBomForCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-hairline shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div>
                <h3 className="text-lg font-bold font-display text-ink">Production Feasibility Audit</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedBomForCheck.bomNumber} · {selectedBomForCheck.name}</p>
              </div>
              <button onClick={() => setSelectedBomForCheck(null)} className="text-slate-400 hover:text-ink text-sm">✕</button>
            </div>

            {/* Target Qty selector */}
            <div className="my-4 flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-hairline">
              <span className="text-xs font-semibold text-slate-700">Target Batch Run:</span>
              <input
                type="number"
                min="1"
                value={checkQuantity}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1;
                  setCheckQuantity(val);
                  handleInspectAvailability(selectedBomForCheck, val);
                }}
                className="w-20 px-2 py-1 text-sm font-bold font-mono rounded border border-hairline text-ink bg-surface"
              />
              <span className="text-xs text-slate-500">finished units</span>
            </div>

            {isCheckingAvailability ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Checking inventory levels...
              </div>
            ) : availabilityData ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${availabilityData.canProduceTarget ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {availabilityData.canProduceTarget ? (
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle size={24} className="text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {availabilityData.canProduceTarget ? 'Inventory Readiness: 100% PASS' : 'Inventory Shortage Detected'}
                    </h4>
                    <p className="text-xs mt-0.5">
                      Maximum produceable with current warehouse stock: <span className="font-bold">{availabilityData.maximumProduceable} units</span>.
                    </p>
                  </div>
                </div>

                <div className="border border-hairline rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-slate-50 border-b border-hairline flex items-center justify-between text-[11px] font-semibold uppercase text-slate-500">
                    <span>Component Name</span>
                    <span>Required / Available</span>
                  </div>
                  <div className="divide-y divide-hairline max-h-48 overflow-y-auto">
                    {availabilityData.components?.map((c, idx) => (
                      <div key={idx} className="px-4 py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-ink">{c.productName}</p>
                          <p className="text-[10px] font-mono text-slate-400">SKU: {c.sku}</p>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold ${c.isSufficient ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {c.totalRequired} needed / {c.availableStock} in stock
                          </span>
                          {!c.isSufficient && (
                            <p className="text-[10px] text-rose-500 font-semibold">Short by {c.shortage} units</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between">
              <button
                onClick={() => setSelectedBomForCheck(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setLaunchBom(selectedBomForCheck);
                  setLaunchTargetQty(checkQuantity);
                  setSelectedBomForCheck(null);
                  setIsLaunchWoModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800"
              >
                <Play size={13} fill="currentColor" />
                <span>Launch This Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Launch Work Order */}
      {isLaunchWoModalOpen && launchBom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-hairline shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div>
                <h3 className="text-lg font-bold font-display text-ink">Schedule Work Order</h3>
                <p className="text-xs text-slate-500 font-mono">BOM: {launchBom.bomNumber}</p>
              </div>
              <button onClick={() => setIsLaunchWoModalOpen(false)} className="text-slate-400 hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleLaunchWorkOrder} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Production Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={launchTargetQty}
                  onChange={(e) => setLaunchTargetQty(Number(e.target.value) || 1)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse Destination</label>
                <select
                  value={launchWarehouse}
                  onChange={(e) => setLaunchWarehouse(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                >
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name || w.warehouseName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Production Priority</label>
                <select
                  value={launchPriority}
                  onChange={(e) => setLaunchPriority(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Standard / Medium</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Fast-Track</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-hairline text-xs text-slate-600">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <PackageCheck size={14} className="text-sky-600" />
                  Automated Component Consumption
                </p>
                Once this work order is marked completed on the production floor, {launchTargetQty} units of the finished good will be received and raw materials will be automatically deducted.
              </div>

              <div className="pt-3 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLaunchWoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWo}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-50"
                >
                  {isSubmittingWo ? 'Scheduling...' : 'Confirm & Launch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOM;
