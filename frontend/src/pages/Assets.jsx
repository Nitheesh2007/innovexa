import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Laptop, 
  Truck, 
  HardHat, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  IndianRupee,
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Clock,
  Sparkles,
  Building2,
  Trash2,
  Edit,
  Eye,
  QrCode,
  RefreshCw,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetService } from '../services/apiServices';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  machinery: HardHat,
  it_hardware: Laptop,
  tooling: Wrench,
  vehicle: Truck,
  facility_fixture: Building2
};

const SAMPLE_DEMO_ASSETS = [
  {
    name: 'Caterpillar 5,000lb Electric Forklift',
    category: 'machinery',
    modelNumber: 'CAT-EC25N',
    serialNumber: 'SN-CAT-88491',
    manufacturer: 'Caterpillar Inc.',
    purchaseCost: 850000,
    salvageValue: 120000,
    usefulLifeMonths: 60,
    custodian: 'Logistics Warehouse Team',
    custodianEmail: 'logistics@stockflow.com',
    location: 'Bay 4 - Central Hub',
    maintenanceIntervalDays: 90,
    status: 'active'
  },
  {
    name: 'Dell PowerEdge R750 Rack Server',
    category: 'it_hardware',
    modelNumber: 'PE-R750-2U',
    serialNumber: 'SN-DELL-94302',
    manufacturer: 'Dell Technologies',
    purchaseCost: 420000,
    salvageValue: 50000,
    usefulLifeMonths: 48,
    custodian: 'IT Systems Admin',
    custodianEmail: 'it.admin@stockflow.com',
    location: 'Server Room Alpha',
    maintenanceIntervalDays: 180,
    status: 'active'
  },
  {
    name: 'Haas VF-2SS CNC Vertical Mill',
    category: 'tooling',
    modelNumber: 'VF-2SS-40T',
    serialNumber: 'SN-HAAS-10294',
    manufacturer: 'Haas Automation',
    purchaseCost: 2800000,
    salvageValue: 400000,
    usefulLifeMonths: 84,
    custodian: 'Machining Lead',
    custodianEmail: 'production@stockflow.com',
    location: 'Manufacturing Floor Line 1',
    maintenanceIntervalDays: 60,
    status: 'in_maintenance'
  },
  {
    name: 'Toyota Hilux Logistics Dispatch Van',
    category: 'vehicle',
    modelNumber: 'Hilux Double Cab 4x4',
    serialNumber: 'VIN-TY-8840294',
    manufacturer: 'Toyota Motors',
    purchaseCost: 2100000,
    salvageValue: 350000,
    usefulLifeMonths: 72,
    custodian: 'Fleet Driver Rajesh',
    custodianEmail: 'rajesh.driver@stockflow.com',
    location: 'Fleet Parking Deck B',
    maintenanceIntervalDays: 90,
    status: 'checked_out'
  },
  {
    name: 'Industrial HVAC Climate Controller',
    category: 'facility_fixture',
    modelNumber: 'Daikin VRV-IV',
    serialNumber: 'SN-DAIK-55102',
    manufacturer: 'Daikin Industries',
    purchaseCost: 650000,
    salvageValue: 80000,
    usefulLifeMonths: 120,
    custodian: 'Facility Management',
    custodianEmail: 'facilities@stockflow.com',
    location: 'Rooftop Utility Block',
    maintenanceIntervalDays: 120,
    status: 'active'
  }
];

export const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState(null);
  const [selectedAssetForCustody, setSelectedAssetForCustody] = useState(null);
  const [custodyAction, setCustodyAction] = useState('check_out'); // 'check_out' | 'check_in'
  const [custodianName, setCustodianName] = useState('');
  const [custodianEmail, setCustodianEmail] = useState('');
  const [custodyLocation, setCustodyLocation] = useState('');

  // Maintenance Modal
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState(null);
  const [maintNotes, setMaintNotes] = useState('');
  const [maintNextDate, setMaintNextDate] = useState('');

  // New / Edit Asset Form
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'machinery',
    modelNumber: '',
    serialNumber: '',
    manufacturer: '',
    purchaseCost: 10000,
    salvageValue: 1000,
    usefulLifeMonths: 36,
    custodian: 'Operations Hub',
    location: 'Main Facility',
    maintenanceIntervalDays: 90
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await assetService.getAll();
      setAssets(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load assets', error);
      toast.error('Failed to fetch equipment catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSeedDemoAssets = async () => {
    try {
      setLoading(true);
      for (const assetData of SAMPLE_DEMO_ASSETS) {
        await assetService.create(assetData);
      }
      toast.success('Seeded sample capital assets successfully!');
      fetchAssets();
    } catch (error) {
      console.error('Failed to seed assets', error);
      toast.error('Failed to seed sample assets');
      setLoading(false);
    }
  };

  const handleCreateOrUpdateAsset = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.purchaseCost) {
      toast.error('Please provide asset name and purchase cost');
      return;
    }

    try {
      if (editingAssetId) {
        await assetService.update(editingAssetId, formData);
        toast.success('Asset specifications updated successfully!');
      } else {
        await assetService.create(formData);
        toast.success('Capital asset registered successfully!');
      }
      setIsCreateModalOpen(false);
      setEditingAssetId(null);
      setFormData({
        name: '',
        category: 'machinery',
        modelNumber: '',
        serialNumber: '',
        manufacturer: '',
        purchaseCost: 10000,
        salvageValue: 1000,
        usefulLifeMonths: 36,
        custodian: 'Operations Hub',
        location: 'Main Facility',
        maintenanceIntervalDays: 90
      });
      fetchAssets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save asset details');
    }
  };

  const handleEditClick = (asset) => {
    setEditingAssetId(asset._id);
    setFormData({
      name: asset.name || '',
      category: asset.category || 'machinery',
      modelNumber: asset.modelNumber || '',
      serialNumber: asset.serialNumber || '',
      manufacturer: asset.manufacturer || '',
      purchaseCost: asset.purchaseCost || 0,
      salvageValue: asset.salvageValue || 0,
      usefulLifeMonths: asset.usefulLifeMonths || 36,
      custodian: asset.custodian || 'Operations Hub',
      location: asset.location || 'Main Facility',
      maintenanceIntervalDays: asset.maintenanceIntervalDays || 90
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteAsset = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete asset "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await assetService.delete(id);
      toast.success('Asset removed from registry');
      fetchAssets();
      if (selectedAssetForDetails?._id === id) {
        setSelectedAssetForDetails(null);
      }
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const handleUpdateCustody = async (e) => {
    e.preventDefault();
    if (!selectedAssetForCustody) return;

    try {
      await assetService.updateCustody(selectedAssetForCustody._id, {
        action: custodyAction,
        custodian: custodianName,
        custodianEmail,
        location: custodyLocation
      });
      toast.success(custodyAction === 'check_out' ? 'Asset checked out to custodian' : 'Asset checked in to storage');
      setSelectedAssetForCustody(null);
      fetchAssets();
    } catch (error) {
      toast.error('Failed to update custody');
    }
  };

  const handleRecordMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedAssetForMaintenance) return;

    try {
      await assetService.recordMaintenance(selectedAssetForMaintenance._id, {
        notes: maintNotes,
        nextMaintenanceDate: maintNextDate || undefined
      });
      toast.success('Service log recorded and maintenance certified');
      setSelectedAssetForMaintenance(null);
      fetchAssets();
    } catch (error) {
      toast.error('Failed to log maintenance certificate');
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.custodian && a.custodian.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.location && a.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalBookValue = assets.reduce((sum, a) => sum + (a.currentBookValue || a.purchaseCost || 0), 0);
  const totalPurchaseCost = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Banner with Modern Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-lg border border-indigo-900/40 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-medium mb-2 border border-indigo-500/30">
            <Wrench size={13} className="text-indigo-400" />
            <span>CAPITAL EQUIPMENT & FIXED ASSETS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
            Asset Tracking & Depreciation Ledger
          </h1>
          <p className="text-indigo-200/90 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Manage high-value non-merchandise assets: industrial machinery, IT hardware, fleet vehicles, and tooling with digital custody transfers, automated straight-line depreciation, and preventative service cycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          {assets.length === 0 && (
            <button
              onClick={handleSeedDemoAssets}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-indigo-200 border border-indigo-500/30 font-medium text-xs transition-all shadow-sm"
              title="Populate demo machinery and hardware"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Seed Demo Data</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingAssetId(null);
              setFormData({
                name: '',
                category: 'machinery',
                modelNumber: '',
                serialNumber: '',
                manufacturer: '',
                purchaseCost: 10000,
                salvageValue: 1000,
                usefulLifeMonths: 36,
                custodian: 'Operations Hub',
                location: 'Main Facility',
                maintenanceIntervalDays: 90
              });
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md hover:shadow-indigo-500/25 shrink-0"
          >
            <Plus size={16} />
            <span>Register Asset</span>
          </button>
        </div>
      </motion.div>

      {/* 2. KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Assets</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="text-2xl font-black font-display mt-2 text-slate-900 dark:text-white font-mono">{assets.length} Units</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{assets.filter(a => a.status === 'active').length} in active service</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Current Book Value</span>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <IndianRupee size={18} />
            </div>
          </div>
          <p className="text-2xl font-black font-display mt-2 text-slate-900 dark:text-white font-mono">
            ₹{totalBookValue.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono block mt-1">
            Historical Cost: ₹{totalPurchaseCost.toLocaleString('en-IN')}
          </span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Staff Custody</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ArrowRightLeft size={18} />
            </div>
          </div>
          <p className="text-2xl font-black font-display mt-2 text-amber-600 dark:text-amber-400 font-mono">
            {assets.filter(a => a.status === 'checked_out').length} Items
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">
            Checked out to personnel
          </span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Service Readiness</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Calendar size={18} />
            </div>
          </div>
          <p className="text-2xl font-black font-display mt-2 text-emerald-600 dark:text-emerald-400 font-mono">
            {assets.filter(a => a.status !== 'in_maintenance').length} / {assets.length || 1}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">
            {assets.filter(a => a.status === 'in_maintenance').length} in scheduled maintenance
          </span>
        </motion.div>
      </div>

      {/* 3. Filter & Category Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset tag, name, serial #, location, or custodian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="machinery">Machinery & Plants</option>
            <option value="it_hardware">IT & Laptops</option>
            <option value="tooling">Tooling & Gauges</option>
            <option value="vehicle">Fleet Vehicles</option>
            <option value="facility_fixture">Facility Fixtures</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="checked_out">Checked Out</option>
            <option value="in_maintenance">In Maintenance</option>
            <option value="retired">Retired</option>
          </select>

          <button
            onClick={fetchAssets}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh assets"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 4. Asset Cards Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm mt-3 font-semibold text-slate-600 dark:text-slate-400">Loading equipment registry...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3.5">
            <Wrench size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assets Matching Filter</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Track machinery, company laptops, tooling, and vehicles separate from inventory items with custody transfers and depreciation.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={handleSeedDemoAssets}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Load 5 Demo Assets</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus size={14} />
              <span>Register New Asset</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const Icon = CATEGORY_ICONS[asset.category] || Wrench;
            const bookVal = asset.currentBookValue !== undefined ? asset.currentBookValue : asset.purchaseCost;
            const depAmount = Math.max(0, (asset.purchaseCost || 0) - bookVal);
            const depPct = ((depAmount / (asset.purchaseCost || 1)) * 100).toFixed(0);

            return (
              <motion.div 
                key={asset._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Tag & Category Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/50">
                        <Icon size={18} />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 tracking-wider">
                          {asset.assetTag}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize font-medium">
                          {asset.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize border ${
                      asset.status === 'active' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                        : asset.status === 'checked_out' 
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
                          : asset.status === 'in_maintenance'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {asset.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {asset.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {asset.manufacturer && <span>Mfr: {asset.manufacturer}</span>}
                    {asset.serialNumber && <span>SN: {asset.serialNumber}</span>}
                  </div>

                  {/* Valuation & Depreciation Progress Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Book Value</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{Number(bookVal).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, 100 - depPct))}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Orig: ₹{Number(asset.purchaseCost).toLocaleString('en-IN')}</span>
                      <span>{depPct}% Depreciated</span>
                    </div>
                  </div>

                  {/* Custody & Location */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Custodian</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {asset.custodian || 'Operations Pool'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Location</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {asset.location || 'Central Facility'}
                      </span>
                    </div>
                  </div>

                  {/* Maintenance Log summary */}
                  <div className="mt-2.5 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Cycle: {asset.maintenanceIntervalDays || 90}d</span>
                    </div>
                    {asset.nextMaintenanceDate && (
                      <span className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                        Due: {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedAssetForDetails(asset)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View Asset Full Specs & QR"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleEditClick(asset)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Asset Details"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset._id, asset.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedAssetForCustody(asset);
                        setCustodyAction(asset.status === 'checked_out' ? 'check_in' : 'check_out');
                        setCustodianName(asset.custodian || '');
                        setCustodyLocation(asset.location || '');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ArrowRightLeft size={12} />
                      <span>{asset.status === 'checked_out' ? 'Return' : 'Custody'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAssetForMaintenance(asset);
                        setMaintNotes(asset.maintenanceNotes || '');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
                    >
                      <Wrench size={12} />
                      <span>Service</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: Register / Edit Capital Asset */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  {editingAssetId ? 'Edit Capital Asset' : 'Register Capital Asset'}
                </h3>
                <p className="text-xs text-slate-500">Record equipment, vehicles, IT laptops, and tooling into corporate registry.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateAsset} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asset Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Caterpillar 5,000lb Forklift"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asset Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="machinery">Machinery & Heavy Plant</option>
                    <option value="it_hardware">IT Equipment & Laptops</option>
                    <option value="tooling">Tooling, Dies & Gauges</option>
                    <option value="vehicle">Fleet Logistics Vehicle</option>
                    <option value="facility_fixture">Facility Fixture & HVAC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota, Dell, Haas"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Serial Number / VIN</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-99824-A"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    required
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Useful Life (Mos)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usefulLifeMonths}
                    onChange={(e) => setFormData({ ...formData, usefulLifeMonths: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salvage Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salvageValue}
                    onChange={(e) => setFormData({ ...formData, salvageValue: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Facility Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 4 - Central Hub"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Maintenance Cycle (Days)</label>
                  <input
                    type="number"
                    min="7"
                    value={formData.maintenanceIntervalDays}
                    onChange={(e) => setFormData({ ...formData, maintenanceIntervalDays: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                >
                  {editingAssetId ? 'Update Asset' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Detailed Specs & Depreciation Inspector */}
      {selectedAssetForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedAssetForDetails.name}
                  </h3>
                  <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    TAG: {selectedAssetForDetails.assetTag}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAssetForDetails(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Manufacturer / Model</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedAssetForDetails.manufacturer || 'N/A'} {selectedAssetForDetails.modelNumber ? `(${selectedAssetForDetails.modelNumber})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Serial Number / VIN</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {selectedAssetForDetails.serialNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Location</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedAssetForDetails.location || 'Central Facility'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Custodian</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedAssetForDetails.custodian || 'Operations Pool'}
                  </span>
                </div>
              </div>

              {/* Financial Ledger Snapshot */}
              <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Straight-Line Valuation</span>
                  <span className="font-mono text-sm text-indigo-700 dark:text-indigo-400">
                    ₹{Number(selectedAssetForDetails.currentBookValue || selectedAssetForDetails.purchaseCost).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <div>
                    <span>Purchase Cost:</span>
                    <p className="font-bold text-slate-900 dark:text-white">₹{Number(selectedAssetForDetails.purchaseCost).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span>Salvage Target:</span>
                    <p className="font-bold text-slate-900 dark:text-white">₹{Number(selectedAssetForDetails.salvageValue || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span>Useful Life:</span>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedAssetForDetails.usefulLifeMonths || 36} Months</p>
                  </div>
                </div>
              </div>

              {/* Maintenance Notes */}
              {selectedAssetForDetails.maintenanceNotes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Last Maintenance Service Certificate</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{selectedAssetForDetails.maintenanceNotes}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedAssetForDetails(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Custody Check Out / In */}
      {selectedAssetForCustody && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Custody Management</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedAssetForCustody.assetTag} · {selectedAssetForCustody.name}</p>
              </div>
              <button onClick={() => setSelectedAssetForCustody(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleUpdateCustody} className="mt-4 space-y-4">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCustodyAction('check_out')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    custodyAction === 'check_out' 
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  Assign to Custodian
                </button>
                <button
                  type="button"
                  onClick={() => setCustodyAction('check_in')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    custodyAction === 'check_in' 
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  Return to Facility
                </button>
              </div>

              {custodyAction === 'check_out' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custodian Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Miller (Technician Lead)"
                      value={custodianName}
                      onChange={(e) => setCustodianName(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custodian Corporate Email</label>
                    <input
                      type="email"
                      placeholder="john.m@stockflow.com"
                      value={custodianEmail}
                      onChange={(e) => setCustodianEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Operating Location / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Assembly Line 3 / Project Site Alpha"
                  value={custodyLocation}
                  onChange={(e) => setCustodyLocation(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForCustody(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                >
                  Confirm Custody
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: Record Maintenance */}
      {selectedAssetForMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Log Preventative Service</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedAssetForMaintenance.assetTag} · {selectedAssetForMaintenance.name}</p>
              </div>
              <button onClick={() => setSelectedAssetForMaintenance(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleRecordMaintenance} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Certificate & Work Completed *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Hydraulic fluid flush, laser spindle alignment, safety sensor calibration complete."
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Next Scheduled Inspection Date
                </label>
                <input
                  type="date"
                  value={maintNextDate}
                  onChange={(e) => setMaintNextDate(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForMaintenance(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                >
                  Certify Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
