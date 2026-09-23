import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  ArrowRightLeft, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  Boxes, 
  Send, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { warehouseService, stockTransferService, productService } from '../services/apiServices';
import toast from 'react-hot-toast';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transfers'); // 'transfers' | 'matrix'
  const [searchQuery, setSearchQuery] = useState('');

  // Transfer creation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destWarehouse, setDestWarehouse] = useState('');
  const [carrier, setCarrier] = useState('Internal Fleet Van #1');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferItems, setTransferItems] = useState([{ product: '', quantity: 1 }]);

  // Add Warehouse Modal
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhAddress, setNewWhAddress] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whRes, trfRes, prodRes] = await Promise.all([
        warehouseService.getAll(),
        stockTransferService.getAll(),
        productService.getAll()
      ]);
      const whList = whRes.data?.data || whRes.data || [];
      setWarehouses(whList);
      setTransfers(trfRes.data?.data || []);
      setProducts(prodRes.data?.data || prodRes.data || []);
      if (whList.length >= 2) {
        setSourceWarehouse(whList[0]._id);
        setDestWarehouse(whList[1]._id);
      }
    } catch (error) {
      console.error('Failed to load multi-warehouse data', error);
      toast.error('Failed to load multi-location inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!sourceWarehouse || !destWarehouse) {
      toast.error('Please select both origin and destination warehouses');
      return;
    }
    if (sourceWarehouse === destWarehouse) {
      toast.error('Origin and destination warehouses must be different');
      return;
    }
    if (transferItems.length === 0 || !transferItems[0].product) {
      toast.error('Please add at least one item to transfer');
      return;
    }

    try {
      await stockTransferService.create({
        sourceWarehouse,
        destinationWarehouse: destWarehouse,
        items: transferItems,
        carrier,
        notes: transferNotes
      });
      toast.success('Stock transfer order created');
      setIsCreateModalOpen(false);
      setTransferItems([{ product: '', quantity: 1 }]);
      setTransferNotes('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create transfer');
    }
  };

  const handleDispatch = async (transferId) => {
    try {
      await stockTransferService.dispatch(transferId);
      toast.success('Transfer dispatched! In-transit ledger updated.');
      fetchData();
    } catch (error) {
      toast.error('Failed to dispatch transfer');
    }
  };

  const handleReceive = async (transferId) => {
    try {
      await stockTransferService.receive(transferId);
      toast.success('Transfer received! Destination inventory credited.');
      fetchData();
    } catch (error) {
      toast.error('Failed to complete receiving');
    }
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    if (!newWhName) return;
    try {
      await warehouseService.create({ name: newWhName, address: newWhAddress });
      toast.success('Warehouse facility added!');
      setIsAddWhModalOpen(false);
      setNewWhName('');
      setNewWhAddress('');
      fetchData();
    } catch (error) {
      toast.error('Failed to add warehouse');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-950 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Building2 size={14} />
            <span>Multi-Location Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Warehouses & Stock Transfers</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Real-time stock synchronization across distribution centers, regional depots, and retail outlets with automated transit tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddWhModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-400/40 text-sky-200 font-semibold text-xs hover:bg-white/10 transition-all"
          >
            <Plus size={16} />
            <span>Add Facility</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-700 text-white font-semibold text-sm hover:bg-sky-800 transition-all shadow-sm shrink-0"
          >
            <ArrowRightLeft size={17} />
            <span>Initiate Transfer</span>
          </button>
        </div>
      </div>

      {/* 2. Facility Network Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {warehouses.map((wh, idx) => {
          // Calculate items stored in this warehouse
          const whProducts = products.filter(p => p.warehouse === wh._id || p.warehouse?._id === wh._id);
          const totalUnits = whProducts.reduce((sum, p) => sum + (p.stock || p.currentStock || 0), 0);
          const totalValuation = whProducts.reduce((sum, p) => sum + ((p.stock || p.currentStock || 0) * (p.cost || p.purchasePrice || p.price * 0.6 || 0)), 0);

          return (
            <div 
              key={wh._id}
              className="p-5 rounded-2xl border border-hairline bg-surface shadow-xs space-y-4 hover:border-sky-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Synced
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold font-display text-ink">{wh.name || wh.warehouseName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span>{wh.address || 'Logistics Hub'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-hairline text-xs">
                <div className="p-2.5 rounded-lg bg-surface-muted">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Total Items</span>
                  <span className="text-sm font-bold font-mono text-ink mt-0.5 block">{totalUnits.toLocaleString()} units</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-muted">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Asset Valuation</span>
                  <span className="text-sm font-bold font-mono text-sky-700 mt-0.5 block">₹{totalValuation.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'transfers' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Inter-Warehouse Transfers ({transfers.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'matrix' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Multi-Location Stock Matrix
          </button>
        </div>

        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-ink">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* 4. Tab 1: Transfers Table */}
      {activeTab === 'transfers' && (
        <div className="rounded-2xl border border-hairline bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-hairline">
                <tr>
                  <th className="px-5 py-3.5">Transfer #</th>
                  <th className="px-5 py-3.5">Source Facility</th>
                  <th className="px-5 py-3.5">Destination</th>
                  <th className="px-5 py-3.5">Cargo / Items</th>
                  <th className="px-5 py-3.5">Carrier</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No stock transfers recorded yet.
                    </td>
                  </tr>
                ) : (
                  transfers.map((trf) => (
                    <tr key={trf._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-sky-700">
                        {trf.transferNumber}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-ink">
                        {trf.sourceWarehouse?.name || 'Origin'}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-ink">
                        {trf.destinationWarehouse?.name || 'Destination'}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="font-semibold text-ink">
                          {trf.items?.reduce((s, i) => s + (i.quantity || 0), 0)} total units
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {trf.items?.length} distinct line items
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {trf.carrier || 'Internal Fleet'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${trf.status === 'received' ? 'bg-emerald-100 text-emerald-800' : trf.status === 'in_transit' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                          {trf.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {trf.status === 'draft' && (
                          <button
                            onClick={() => handleDispatch(trf._id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800"
                          >
                            <Truck size={13} />
                            <span>Dispatch</span>
                          </button>
                        )}
                        {trf.status === 'in_transit' && (
                          <button
                            onClick={() => handleReceive(trf._id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCircle2 size={13} />
                            <span>Receive Items</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Multi-Location Matrix */}
      {activeTab === 'matrix' && (
        <div className="rounded-2xl border border-hairline bg-surface overflow-hidden shadow-xs">
          <div className="p-4 border-b border-hairline flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter matrix by product SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-hairline bg-surface-muted text-ink"
              />
            </div>
            <span className="text-xs text-slate-400">Comparing across {warehouses.length} locations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-hairline">
                <tr>
                  <th className="px-5 py-3.5">Product SKU / Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  {warehouses.map(w => (
                    <th key={w._id} className="px-5 py-3.5 text-center font-mono">
                      {w.name}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right font-mono">Network Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {products
                  .filter(p => (p.name || p.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(p => {
                    const totalStock = p.stock || p.currentStock || 0;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-ink">
                          {p.name || p.productName}
                          <span className="block text-xs font-mono text-slate-400">{p.sku}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {p.category?.name || p.category || 'General'}
                        </td>
                        {warehouses.map(w => {
                          const isAssigned = p.warehouse === w._id || p.warehouse?._id === w._id;
                          const locStock = isAssigned ? totalStock : 0;
                          return (
                            <td key={w._id} className="px-5 py-3.5 text-center font-mono text-xs">
                              <span className={`px-2 py-0.5 rounded ${locStock > 0 ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-300'}`}>
                                {locStock}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-ink">
                          {totalStock} units
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL: Initiate Transfer */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-hairline shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div>
                <h3 className="text-lg font-bold font-display text-ink">New Stock Transfer</h3>
                <p className="text-xs text-slate-500">Move inventory between network locations.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateTransfer} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Facility *</label>
                  <select
                    value={sourceWarehouse}
                    onChange={(e) => setSourceWarehouse(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                  >
                    {warehouses.map(w => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Facility *</label>
                  <select
                    value={destWarehouse}
                    onChange={(e) => setDestWarehouse(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                  >
                    {warehouses.map(w => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Carrier / Logistics Fleet</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                />
              </div>

              {/* Items row */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product & Quantity</label>
                {transferItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <select
                      required
                      value={item.product}
                      onChange={(e) => {
                        const updated = [...transferItems];
                        updated[idx].product = e.target.value;
                        setTransferItems(updated);
                      }}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-hairline bg-surface text-ink"
                    >
                      <option value="">Select product to move...</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name || p.productName} (Avail: {p.stock || p.currentStock || 0})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...transferItems];
                        updated[idx].quantity = Number(e.target.value) || 1;
                        setTransferItems(updated);
                      }}
                      className="w-20 text-xs px-2 py-2 rounded-lg border border-hairline bg-surface text-ink font-mono font-bold"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dispatch Notes / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Replenish retail floor for weekend sales rush."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                />
              </div>

              <div className="pt-3 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800"
                >
                  Save Transfer Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Add Facility */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-hairline shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <h3 className="text-lg font-bold font-display text-ink">Register New Facility</h3>
              <button onClick={() => setIsAddWhModalOpen(false)} className="text-slate-400 hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleAddWarehouse} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Coast Distribution Hub"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. 742 Industrial Pkwy, Bldg 4"
                  value={newWhAddress}
                  onChange={(e) => setNewWhAddress(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                />
              </div>

              <div className="pt-3 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
