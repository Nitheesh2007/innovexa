import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Plus, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Boxes, 
  CheckSquare, 
  ArrowRight, 
  UserCheck, 
  Gauge, 
  Sparkles,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { workOrderService, bomService, warehouseService } from '../services/apiServices';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'scheduled', label: 'Scheduled', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'in_progress', label: 'In Production', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'quality_check', label: 'Quality Control', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

const Production = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Complete Order Modal
  const [completingOrder, setCompletingOrder] = useState(null);
  const [completionActualQty, setCompletionActualQty] = useState(0);
  const [completionScrapQty, setCompletionScrapQty] = useState(0);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  // New Work Order Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createBomId, setCreateBomId] = useState('');
  const [createTargetQty, setCreateTargetQty] = useState(10);
  const [createWarehouse, setCreateWarehouse] = useState('');
  const [createPriority, setCreatePriority] = useState('medium');
  const [createTechnician, setCreateTechnician] = useState('Production Line 1');
  const [createNotes, setCreateNotes] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [woRes, bomRes, whRes] = await Promise.all([
        workOrderService.getAll(),
        bomService.getAll(),
        warehouseService.getAll()
      ]);
      setWorkOrders(woRes.data?.data || []);
      setBoms(bomRes.data?.data || []);
      const whList = whRes.data?.data || whRes.data || [];
      setWarehouses(whList);
      if (whList.length > 0 && !createWarehouse) {
        setCreateWarehouse(whList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching production orders', error);
      toast.error('Failed to load production orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAdvanceStatus = async (order, targetStatus) => {
    if (targetStatus === 'completed') {
      setCompletingOrder(order);
      setCompletionActualQty(order.targetQuantity);
      setCompletionScrapQty(0);
      setCompletionNotes('Completed with QA sign-off.');
      return;
    }

    try {
      await workOrderService.updateStatus(order._id, { status: targetStatus });
      toast.success(`Order moved to ${targetStatus.replace('_', ' ').toUpperCase()}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    if (!completingOrder) return;
    setIsSubmittingCompletion(true);
    try {
      await workOrderService.updateStatus(completingOrder._id, {
        status: 'completed',
        actualProduced: Number(completionActualQty),
        scrapQuantity: Number(completionScrapQty),
        notes: completionNotes
      });
      toast.success(`Completed! Stock received and components consumed.`);
      setCompletingOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete work order');
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!createBomId) {
      toast.error('Please select a Bill of Materials recipe');
      return;
    }

    const bom = boms.find(b => b._id === createBomId);
    try {
      await workOrderService.create({
        bom: createBomId,
        finishedProduct: bom.finishedProduct._id,
        targetQuantity: Number(createTargetQty),
        warehouse: createWarehouse,
        priority: createPriority,
        assignedTechnician: createTechnician,
        notes: createNotes
      });
      toast.success('Production Work Order scheduled successfully');
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule work order');
    }
  };

  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.finishedProduct && (wo.finishedProduct.name || wo.finishedProduct.productName || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (wo.assignedTechnician && wo.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate yield statistics
  const completedOrders = workOrders.filter(w => w.status === 'completed');
  const totalProduced = completedOrders.reduce((sum, w) => sum + (w.actualProduced || 0), 0);
  const totalScrap = completedOrders.reduce((sum, w) => sum + (w.scrapQuantity || 0), 0);
  const overallYieldRate = (totalProduced + totalScrap) > 0 ? ((totalProduced / (totalProduced + totalScrap)) * 100).toFixed(1) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-sky-950 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Factory size={14} />
            <span>Shop Floor Automation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Production & Work Orders</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Live manufacturing lifecycle management from BOM reservation to finished goods receiving, yield analytics, and inventory deduction.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-700 text-white font-semibold text-sm hover:bg-sky-800 transition-all shadow-sm shrink-0"
          >
            <Plus size={18} />
            <span>Schedule Work Order</span>
          </button>
        </div>
      </div>

      {/* 2. Operations KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active Floor Jobs</span>
            <Factory size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-ink">
            {workOrders.filter(w => ['scheduled', 'in_progress', 'quality_check'].includes(w.status)).length}
          </p>
          <span className="text-xs text-sky-600 font-medium">In-flight production</span>
        </div>

        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Units Built</span>
            <CheckSquare size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-ink">{totalProduced}</p>
          <span className="text-xs text-slate-400">Received into inventory</span>
        </div>

        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Shop Floor Yield</span>
            <Gauge size={18} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-emerald-600">{overallYieldRate}%</p>
          <span className="text-xs text-slate-400">{totalScrap} scrap units logged</span>
        </div>

        <div className="p-5 rounded-xl border border-hairline bg-surface shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Lead Time Delivery</span>
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-ink">97.8%</p>
          <span className="text-xs text-emerald-600 font-medium">On-schedule milestone</span>
        </div>
      </div>

      {/* 3. Toolbar & Views Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-hairline">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search work order #, finished good, or line..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-hairline bg-surface-muted text-ink placeholder:text-slate-400 focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-muted border border-hairline">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-800 text-sky-700 shadow-xs' : 'text-slate-500'}`}
            >
              Stage Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-sky-700 shadow-xs' : 'text-slate-500'}`}
            >
              Table View
            </button>
          </div>

          <button 
            onClick={fetchOrders}
            className="p-2 rounded-lg border border-hairline text-slate-500 hover:text-ink hover:bg-slate-50"
            title="Refresh floor feed"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 4. Kanban Stages or Table */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm mt-3 font-medium">Synchronizing floor work orders...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STAGES.map((stage) => {
            const stageOrders = filteredOrders.filter(w => w.status === stage.id);
            return (
              <div key={stage.id} className="flex flex-col rounded-2xl border border-hairline bg-surface-muted/50 p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{stageOrders.length}</span>
                </div>

                {/* Orders Cards Stack */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {stageOrders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-hairline rounded-xl">
                      No jobs in this phase
                    </div>
                  ) : (
                    stageOrders.map((order) => {
                      const prod = order.finishedProduct || {};
                      const prodName = prod.name || prod.productName || 'Finished Item';
                      const isComplete = order.status === 'completed';

                      return (
                        <div 
                          key={order._id}
                          className="p-4 rounded-xl border border-hairline bg-surface shadow-xs hover:border-sky-300 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">{order.orderNumber}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${order.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : order.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                              {order.priority}
                            </span>
                          </div>

                          <div>
                            <p className="font-semibold text-sm text-ink truncate" title={prodName}>{prodName}</p>
                            <p className="text-xs text-slate-400 font-mono">BOM: {order.bom?.bomNumber || 'Standard'}</p>
                          </div>

                          <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-surface-muted">
                            <span className="text-slate-500">Target Output</span>
                            <span className="font-mono font-bold text-ink">{order.targetQuantity} units</span>
                          </div>

                          {isComplete ? (
                            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 pt-1">
                              <CheckCircle2 size={14} />
                              <span>{order.actualProduced} produced ({order.scrapQuantity || 0} scrap)</span>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-hairline flex items-center justify-between gap-2">
                              {order.status === 'scheduled' && (
                                <button
                                  onClick={() => handleAdvanceStatus(order, 'in_progress')}
                                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800"
                                >
                                  <Play size={12} fill="currentColor" />
                                  <span>Start Build</span>
                                </button>
                              )}

                              {order.status === 'in_progress' && (
                                <div className="flex items-center gap-2 w-full">
                                  <button
                                    onClick={() => handleAdvanceStatus(order, 'quality_check')}
                                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-hairline text-slate-700 hover:bg-slate-50"
                                  >
                                    To QA
                                  </button>
                                  <button
                                    onClick={() => handleAdvanceStatus(order, 'completed')}
                                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    Finish
                                  </button>
                                </div>
                              )}

                              {order.status === 'quality_check' && (
                                <button
                                  onClick={() => handleAdvanceStatus(order, 'completed')}
                                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <CheckSquare size={13} />
                                  <span>Pass QA & Receive</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-hairline bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-hairline">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Finished Product</th>
                  <th className="px-5 py-3.5">Target Qty</th>
                  <th className="px-5 py-3.5">Actual Yield</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Line / Tech</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredOrders.map((wo) => {
                  const prod = wo.finishedProduct || {};
                  return (
                    <tr key={wo._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-sky-700">{wo.orderNumber}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">
                        {prod.name || prod.productName}
                        <span className="block text-xs font-mono text-slate-400">BOM: {wo.bom?.bomNumber}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">{wo.targetQuantity} units</td>
                      <td className="px-5 py-3.5 font-mono text-xs">
                        {wo.status === 'completed' ? (
                          <span className="text-emerald-600 font-bold">{wo.actualProduced} produced</span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${wo.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : wo.status === 'in_progress' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                          {wo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{wo.assignedTechnician}</td>
                      <td className="px-5 py-3.5 text-right">
                        {wo.status !== 'completed' && (
                          <button
                            onClick={() => handleAdvanceStatus(wo, 'completed')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            <span>Sign Off</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: Complete Work Order & Consume Components */}
      {completingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-hairline shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div>
                <h3 className="text-lg font-bold font-display text-ink">Sign Off & Receive Stock</h3>
                <p className="text-xs text-slate-500 font-mono">{completingOrder.orderNumber}</p>
              </div>
              <button onClick={() => setCompletingOrder(null)} className="text-slate-400 hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Passed Inspection Units *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={completionActualQty}
                    onChange={(e) => setCompletionActualQty(e.target.value)}
                    className="w-full text-sm font-mono font-bold px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Defective / Scrap Units</label>
                  <input
                    type="number"
                    min="0"
                    value={completionScrapQty}
                    onChange={(e) => setCompletionScrapQty(e.target.value)}
                    className="w-full text-sm font-mono font-bold px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">QA Inspection Notes</label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={15} />
                  Stock Transaction Safe Execution
                </p>
                Confirming will immediately add {completionActualQty} finished items to warehouse inventory and deduct the proportional component quantities specified in the BOM recipe.
              </div>

              <div className="pt-3 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCompletion}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmittingCompletion ? 'Processing Ledger...' : 'Confirm Stock Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Schedule Work Order */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-hairline shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div>
                <h3 className="text-lg font-bold font-display text-ink">Schedule Production Order</h3>
                <p className="text-xs text-slate-500">Initiate new assembly run from approved BOM.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">BOM Specification Recipe *</label>
                <select
                  required
                  value={createBomId}
                  onChange={(e) => setCreateBomId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                >
                  <option value="">Select BOM...</option>
                  {boms.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.bomNumber} · {b.name} (₹{Number(b.totalCalculatedCost || 0).toLocaleString('en-IN')}/unit)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={createTargetQty}
                    onChange={(e) => setCreateTargetQty(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Standard</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse</label>
                <select
                  value={createWarehouse}
                  onChange={(e) => setCreateWarehouse(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-surface-muted text-ink"
                >
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name || w.warehouseName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Line / Lead</label>
                <input
                  type="text"
                  value={createTechnician}
                  onChange={(e) => setCreateTechnician(e.target.value)}
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
                  Schedule Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Production;
