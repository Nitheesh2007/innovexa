import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Check, 
  ArrowRight, 
  Building2, 
  Package, 
  Eye, 
  Bell, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  Menu, 
  X,
  Smartphone,
  BarChart3,
  Store,
  Factory,
  Wrench,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Minus,
  Star,
  ExternalLink,
  Shield,
  HelpCircle,
  Play,
  UploadCloud,
  ScanLine,
  Barcode,
  Sliders,
  RefreshCw,
  AlertTriangle,
  Lock,
  Info,
  PlayCircle,
  ShieldAlert
} from 'lucide-react';

export const StockFlowLogo = ({ size = "default", light = false }) => (
  <div className="flex items-center gap-2.5">
    <div className={`flex items-center justify-center rounded-lg bg-sky-700 text-white shadow-xs ${size === "lg" ? "w-10 h-10" : "w-8 h-8"}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} aria-hidden="true">
        <path d="M16.5 9.4 7.5 4.21"></path>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.29 7 12 12 20.71 7"></polyline>
        <line x1="12" y1="22" x2="12" y2="12"></line>
      </svg>
    </div>
    <span className={`font-display font-bold tracking-[-0.03em] ${size === "lg" ? "text-2xl" : "text-xl"} ${light ? "text-white" : "text-slate-900 dark:text-white"}`}>
      stockflow
    </span>
  </div>
);

const LandingPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMockupTab, setActiveMockupTab] = useState('dashboard');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [openFaq, setOpenFaq] = useState(0);

  // Interactive ROI Calculator State (INR - ₹)
  const [inventoryValue, setInventoryValue] = useState(1500000);
  const [deadStockPercent, setDeadStockPercent] = useState(12);

  // Interactive "How It Works" State & Live Simulators
  const [activeWorkStep, setActiveWorkStep] = useState(1);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [scanCount, setScanCount] = useState(42);
  const [isScanning, setIsScanning] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(null);
  const [simStock, setSimStock] = useState(14);
  const [detailsStepOpen, setDetailsStepOpen] = useState(null);

  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  };

  const handleRunImportSim = () => {
    setIsImporting(true);
    setImportProgress(20);
    setTimeout(() => setImportProgress(55), 300);
    setTimeout(() => setImportProgress(85), 650);
    setTimeout(() => {
      setImportProgress(100);
      setIsImporting(false);
      setImportDone(true);
    }, 950);
  };

  const handleSimulateScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    playBeep();
    setTimeout(() => {
      setScanCount(prev => prev + 1);
      setScanFeedback({
        title: "Sony WH-1000XM5 Wireless Headphones",
        sku: "AUD-WH-5021",
        price: "₹29,990",
        loc: "Main Logistics Hub",
        qtyAdded: "+1 Unit Received",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setIsScanning(false);
    }, 450);
  };

  // Calculations:
  // Holding cost ~ 22% of inventory value annually
  // Dead stock savings ~ recovery of 45% of idle capital
  const annualHoldingCost = (inventoryValue * 0.22);
  const estimatedDeadStock = (inventoryValue * (deadStockPercent / 100));
  const recoveredWorkingCapital = (estimatedDeadStock * 0.45);
  const totalAnnualSavings = (recoveredWorkingCapital + (annualHoldingCost * 0.35));

  const faqs = [
    {
      q: "Why is StockFlow free? What's the catch?",
      a: "The Starter plan is genuinely free — no credit card required and no expiration date. It covers core inventory management, multi-warehouse sync, Bill of Materials (BOM), work orders, and contacts. Paid tiers starting at ₹749/mo unlock higher volume limits, predictive AI demand forecasting, and advanced export automation."
    },
    {
      q: "How does StockFlow operate without requiring barcode hardware?",
      a: "StockFlow utilizes high-speed instant SKU lookup, serialized asset tagging, and smart fuzzy-matching. Whether at a POS counter, on a tablet, or at a warehouse terminal, staff can find and adjust items in milliseconds with zero expensive scanner guns or hardware dependencies."
    },
    {
      q: "Can I manage manufacturing assemblies and Bills of Materials (BOM)?",
      a: "Yes! StockFlow features native multi-level BOMs. You can define component requirements, auto-rollup material & labor costs, verify inventory readiness before runs, and launch work orders that automatically deduct raw materials and receive finished goods."
    },
    {
      q: "How does multi-location and warehouse transfers work?",
      a: "You can create and manage multiple warehouses, retail storefronts, or job-site vans. Stock levels sync in real-time, and you can initiate inter-warehouse transfers with full dispatch and receiving audit verification."
    },
    {
      q: "Can I migrate my existing spreadsheets into StockFlow?",
      a: "Yes. StockFlow includes an automated Excel and CSV importer that maps your columns, validates SKU uniqueness, and loads thousands of records in under 60 seconds."
    },
    {
      q: "Is StockFlow secure and GDPR compliant?",
      a: "Yes. All data is encrypted in transit (TLS 1.3) and at rest with AES-256, backed by role-based access control (RBAC) and immutable transaction audit logs."
    }
  ];

  return (
    <div className="min-h-screen bg-surface text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* 1. Global Navigation Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <StockFlowLogo />
            </Link>
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <a href="#capabilities" className="transition-colors hover:text-slate-900 dark:hover:text-white">{t('Capabilities')}</a>
              <a href="#modules" className="transition-colors hover:text-slate-900 dark:hover:text-white">{t('Platform Modules')}</a>
              <a href="#how-it-works" className="transition-colors hover:text-slate-900 dark:hover:text-white">{t('How It Works')}</a>
              <a href="#calculator" className="transition-colors hover:text-slate-900 dark:hover:text-white">{t('ROI Calculator')}</a>
              <a href="#comparison" className="transition-colors hover:text-slate-900 dark:hover:text-white">{t('Comparison')}</a>
              <a href="#pricing" className="transition-colors hover:text-slate-900 dark:hover:text-white">{t('Pricing')}</a>
              <a href="#faq" className="transition-colors hover:text-slate-900 dark:hover:text-white">{t('FAQ')}</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-sky-800"
              >
                {t('Go to Dashboard')}
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('Sign In')}
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-sky-800"
                >
                  {t('Start For Free')}
                </Link>
              </>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-hairline bg-white dark:bg-slate-900 px-6 py-4 space-y-3">
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Capabilities</a>
            <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Platform Modules</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 dark:text-slate-300">How It Works</a>
            <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 dark:text-slate-300">ROI Calculator</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 dark:text-slate-300">FAQ</a>
            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-sky-700 text-white">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-sm font-medium rounded-lg border border-hairline">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-sky-700 text-white">Start For Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 bg-surface-muted border-b border-hairline">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-6 animate-pulse">
              <Sparkles size={13} className="text-sky-600" />
              <span>Simple inventory management for small businesses</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold leading-[1.04] sm:leading-[1.0] tracking-[-0.03em] text-slate-900 dark:text-white">
              Simple inventory management for small businesses.
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
              Track stock, manage multiple locations, automate work orders, and keep your inventory accurate — without paying enterprise prices.
            </p>

            {/* Hero Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 transition-colors"
                  >
                    <span>Enter Dashboard</span>
                    <ArrowRight size={16} />
                  </Link>
                  <a 
                    href="#how-it-works" 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-white dark:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs group"
                  >
                    <span>See how it works</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                </>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-sky-700 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 transition-colors"
                  >
                    <span>Start for free</span>
                  </Link>
                  <a 
                    href="#how-it-works" 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-white dark:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs group"
                  >
                    <span>See how it works</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                </>
              )}
            </div>

            {/* Trust Checklist */}
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Check size={16} className="text-emerald-600" strokeWidth={2.5} />
                <span>25 products free</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check size={16} className="text-emerald-600" strokeWidth={2.5} />
                <span>No credit card</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check size={16} className="text-emerald-600" strokeWidth={2.5} />
                <span>10-min setup</span>
              </li>
            </ul>
          </div>

          {/* 3. Interactive Multi-Module Live Preview Mockup */}
          <div className="mt-14 md:mt-18">
            <div className="overflow-hidden rounded-2xl border border-hairline bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_24px_48px_-12px_rgba(15,23,42,0.18)]">
              {/* Mockup Window Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline bg-slate-50 dark:bg-slate-800/80 px-4 py-3 gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400/80"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-400/80"></span>
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80"></span>
                  <span className="text-[11px] font-mono text-slate-400 ml-2">app.stockflowsystems.com</span>
                </div>

                {/* Interactive View Switcher Tabs */}
                <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-hairline overflow-x-auto text-xs">
                  {[
                    { id: 'dashboard', label: 'Dashboard Live', icon: BarChart3 },
                    { id: 'bom', label: 'Bill of Materials', icon: Layers },
                    { id: 'production', label: 'Work Orders', icon: Factory },
                    { id: 'assets', label: 'Equipment & Assets', icon: Wrench },
                    { id: 'transfers', label: 'Multi-Warehouse', icon: ArrowRightLeft }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveMockupTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${activeMockupTab === tab.id ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <Icon size={13} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mockup Interactive Body */}
              <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/40 min-h-[380px]">
                {/* 1. Dashboard View */}
                {activeMockupTab === 'dashboard' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline">
                        <p className="text-xs text-slate-500 font-medium">Total Products</p>
                        <p className="text-2xl font-bold font-display mt-1 text-slate-900 dark:text-white">1,248</p>
                        <span className="text-[11px] text-emerald-600 font-medium">↑ 12% vs last month</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline">
                        <p className="text-xs text-slate-500 font-medium">Inventory Valuation</p>
                        <p className="text-2xl font-bold font-display mt-1 text-slate-900 dark:text-white">₹68,45,000</p>
                        <span className="text-[11px] text-slate-400 font-medium">Real-time cost basis</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline">
                        <p className="text-xs text-slate-500 font-medium">Low Stock Alerts</p>
                        <p className="text-2xl font-bold font-display mt-1 text-amber-600">3 Items</p>
                        <span className="text-[11px] text-amber-600 font-medium">Reorder recommended</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline">
                        <p className="text-xs text-slate-500 font-medium">Active Warehouses</p>
                        <p className="text-2xl font-bold font-display mt-1 text-sky-700 dark:text-sky-400">2 Locations</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Synced in real-time</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-hairline bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      <div className="px-5 py-3 border-b border-hairline flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <span>Live Catalog Velocity Snapshot</span>
                        <span className="text-sky-700 dark:text-sky-400 font-mono text-[11px]">Instant Smart Lookup</span>
                      </div>
                      <div className="divide-y divide-hairline text-sm">
                        {[
                          { name: "Sony WH-1000XM5 Wireless Headphones", sku: "AUD-WH-5021", loc: "Main Logistics Hub", stock: 42, status: "In Stock", price: "₹29,990" },
                          { name: "MacBook Pro 16\" M3 Max", sku: "LAP-MB-9014", loc: "Downtown Retail Store", stock: 8, status: "In Stock", price: "₹3,49,900" },
                          { name: "Samsung Galaxy S24 Ultra", sku: "PHN-GS-4412", loc: "Main Logistics Hub", stock: 3, status: "Low Stock", price: "₹1,29,999" },
                          { name: "Apple Watch Series 9 (45mm)", sku: "WTC-AW-3019", loc: "Downtown Retail Store", stock: 120, status: "In Stock", price: "₹41,900" }
                        ].map((item, idx) => (
                          <div key={idx} className="px-5 py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <Package size={16} />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white truncate max-w-xs">{item.name}</p>
                                <p className="text-xs font-mono text-slate-400">{item.sku} · {item.loc}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                                {item.status} ({item.stock})
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">{item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BOM View */}
                {activeMockupTab === 'bom' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-sky-700 px-2 py-0.5 rounded bg-sky-50">BOM-2026-0001</span>
                        <h4 className="text-base font-bold text-ink mt-1">Titanium Mobile Flagship Assembly</h4>
                        <p className="text-xs text-slate-500">Target Finished Good: iPhone 15 Pro Max (Retail: ₹1,54,900)</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Rolled-Up Unit Cost</span>
                        <p className="text-xl font-bold font-mono text-emerald-600">₹26,500</p>
                        <span className="text-xs font-semibold text-emerald-700">82.8% Gross Margin</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-hairline">
                        <span className="text-slate-400 block">Subcomponents (3)</span>
                        <span className="font-bold text-ink">₹21,000 Material</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-hairline">
                        <span className="text-slate-400 block">Direct Assembly Labor</span>
                        <span className="font-bold text-ink">₹3,500 / unit</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-hairline">
                        <span className="text-slate-400 block">Machinery Overhead</span>
                        <span className="font-bold text-ink">₹2,000 / unit</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Ready for production: Component inventory verified for up to <strong>140 units</strong>.</span>
                      </div>
                      <span className="font-semibold text-emerald-700">1-Click Convert to Work Order →</span>
                    </div>
                  </div>
                )}

                {/* 3. Production View */}
                {activeMockupTab === 'production' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border border-hairline bg-white dark:bg-slate-900">
                        <span className="text-[11px] uppercase tracking-wide text-amber-700 font-bold">Scheduled (1)</span>
                        <div className="mt-2 p-2.5 rounded bg-surface-muted border border-hairline">
                          <p className="font-mono text-xs font-bold text-sky-700">WO-2026-0103</p>
                          <p className="text-xs font-semibold text-ink mt-0.5">50x Flagship Units</p>
                          <span className="text-[10px] text-slate-400">Line B · Planned tomorrow</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-hairline bg-white dark:bg-slate-900">
                        <span className="text-[11px] uppercase tracking-wide text-sky-700 font-bold">In Production (1)</span>
                        <div className="mt-2 p-2.5 rounded bg-surface-muted border border-hairline">
                          <p className="font-mono text-xs font-bold text-sky-700">WO-2026-0102</p>
                          <p className="text-xs font-semibold text-ink mt-0.5">10x Workstation Pro Specs</p>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-sky-600 h-full w-2/5"></div>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">4 of 10 completed</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-hairline bg-white dark:bg-slate-900">
                        <span className="text-[11px] uppercase tracking-wide text-emerald-700 font-bold">Completed & Stock Received</span>
                        <div className="mt-2 p-2.5 rounded bg-emerald-50 border border-emerald-100 text-xs text-emerald-800">
                          <p className="font-mono font-bold">WO-2026-0101</p>
                          <p className="font-semibold mt-0.5">25 units verified</p>
                          <p className="text-[10px] text-emerald-600 mt-1">✓ 100% QA Passed · Raw stock deducted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Assets View */}
                {activeMockupTab === 'assets' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-indigo-700">AST-FL-001</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                        </div>
                        <h4 className="text-sm font-bold text-ink">Toyota 8FBE15U Electric Forklift</h4>
                        <div className="text-xs text-slate-500 font-mono">Book Value: ₹16,95,000 / Orig: ₹23,50,000</div>
                        <div className="p-2 rounded bg-surface-muted text-[11px] text-slate-600">
                          Custodian: Logistics Operations · Next Service: Oct 15
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-indigo-700">AST-CNC-002</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                        </div>
                        <h4 className="text-sm font-bold text-ink">Haas Mini Mill 3-Axis CNC Machine</h4>
                        <div className="text-xs text-slate-500 font-mono">Book Value: ₹29,20,000 / Orig: ₹37,50,000</div>
                        <div className="p-2 rounded bg-surface-muted text-[11px] text-slate-600">
                          Custodian: Engineering Cell · Spindle Calibration Certified
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Transfers View */}
                {activeMockupTab === 'transfers' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-sky-700">TRF-2026-0001</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">In Transit</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-ink">
                        <span>Main Distribution Center</span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span>Downtown Retail Store</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">20 total units dispatched via Internal Fleet Van #1</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Integrations Strip */}
      <section className="border-b border-hairline bg-surface py-10">
        <div className="mx-auto max-w-6xl px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">Integrates Seamlessly With</p>
          <div className="flex flex-wrap items-center gap-8 text-base font-bold text-slate-500 dark:text-slate-400">
            <span>Shopify</span>
            <span>Square POS</span>
            <span>Excel / CSV</span>
            <span>FastAPI ML</span>
            <span>Exact Online</span>
            <span>Stripe Billing</span>
            <span>QuickBooks</span>
          </div>
        </div>
      </section>

      {/* 5. Three Pillar Value Proposition */}
      <section id="capabilities" className="py-20 md:py-28 bg-surface-muted border-b border-hairline">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">Core Foundation</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Everything you need to master your inventory
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="p-8 rounded-xl border border-hairline bg-surface shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-6">
                <Eye size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Know exactly what you have.</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Real-time stock synchronization across every facility, storefront, and job site without lag.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-hairline bg-surface shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Instant smart operations.</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Find products in milliseconds, perform rapid batch stock updates, and automate purchase orders.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-hairline bg-surface shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-6">
                <Bell size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Stop running out of stock.</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Predictive low-stock warnings, lead-time tracking, and automated reorder points keep you protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Advanced Platform Modules Section */}
      <section id="modules" className="py-20 md:py-28 bg-surface border-b border-hairline">
        <div className="mx-auto max-w-6xl px-5 md:px-8 space-y-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">Capabilities</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Beyond the basics
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
              As your business scales from simple retail to manufacturing and supply chain, StockFlow scales with you.
            </p>
          </div>

          {/* Module 1: Bill of Materials */}
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 mb-4">
                <Layers size={22} />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">Bill of Materials (BOM)</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Keep track of all subassemblies, raw materials, and unit costs.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Build multi-level BOMs for finished goods and custom kits</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Track component usage and auto-rollup labor + machine overhead</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Run assembly runs without spreadsheet chaos or formula errors</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/bom" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
                  <span>Explore Bill of Materials Builder</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-hairline bg-surface-muted shadow-xs">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
                  <span>Recipe Specification</span>
                  <span>Yield: 98%</span>
                </div>
                <h4 className="font-bold text-ink">Ergonomic Office Chair Assembly</h4>
                <div className="space-y-2 text-xs divide-y divide-hairline">
                  <div className="flex justify-between py-1"><span>Mesh Seat Base</span><span className="font-mono">1x · ₹3,500</span></div>
                  <div className="flex justify-between py-1"><span>Pneumatic Gas Cylinder</span><span className="font-mono">1x · ₹1,500</span></div>
                  <div className="flex justify-between py-1"><span>Heavy-Duty Casters (5-pk)</span><span className="font-mono">1x · ₹950</span></div>
                  <div className="flex justify-between py-1"><span>Direct Assembly Labor</span><span className="font-mono">₹2,500</span></div>
                </div>
                <div className="pt-2 border-t border-hairline flex justify-between font-bold text-sm text-sky-700">
                  <span>Total Manufactured Cost</span>
                  <span className="font-mono">₹8,450 / unit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Production & Work Orders */}
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:order-2">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 mb-4">
                <Factory size={22} />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">Production & Work Orders</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Inventory-led manufacturing from BOM reservation to finished goods receiving.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Open work orders straight from an approved bill of materials</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Record builds that deduct subcomponents and automatically receive finished stock</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Plan shop floor scheduling, trace lot batches, and track yield vs scrap</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/production" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
                  <span>Explore Production Floor Tracking</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="lg:order-1 p-6 rounded-2xl border border-hairline bg-surface-muted shadow-xs">
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-hairline flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-700">WO-2026-0042</span>
                    <p className="text-xs font-semibold text-ink">Batch of 50 Ergonomic Chairs</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700">In Production</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <p className="font-bold">Stock Transaction Ready</p>
                  <p className="text-[11px] mt-0.5">Component items will be deducted immediately upon QA sign-off.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Module 3: Asset & Equipment Tracking */}
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 mb-4">
                <Wrench size={22} />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">Asset & Equipment Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Tools, machinery, IT laptops, and vehicles tracked separately from sellable inventory.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Check tools and equipment in and out with employee custody history</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Schedule routine maintenance, oil changes, and calibration reminders</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automatic straight-line depreciation calculation to monitor true book value</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/assets" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
                  <span>Explore Asset & Equipment Tracking</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-hairline bg-surface-muted shadow-xs">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-hairline space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700">AST-FL-001</span>
                  <span className="text-xs font-semibold text-emerald-600">Active</span>
                </div>
                <h4 className="font-bold text-ink text-sm">Toyota 8FBE15U Electric Forklift</h4>
                <div className="p-2.5 rounded bg-surface-muted text-xs space-y-1">
                  <div className="flex justify-between"><span>Purchase Cost</span><span className="font-mono">₹18,50,000</span></div>
                  <div className="flex justify-between font-bold text-ink"><span>Current Book Value</span><span className="font-mono">₹13,20,000</span></div>
                  <div className="flex justify-between text-slate-400"><span>Custodian</span><span>Logistics Lead</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Complete Working "How It Works" Section with Live Simulators & Full Details */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-b border-hairline scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-4">
              <Sparkles size={13} className="text-sky-600" />
              <span>Full Interactive Workflow Demo</span>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Get running in three steps
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              From spreadsheet chaos to live inventory in under 10 minutes. Click any step below to test drive the live in-browser simulator.
            </p>

            {/* Interactive Step Switcher Tabs */}
            <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-hairline max-w-full overflow-x-auto">
              {[
                { step: 1, label: "01. Import Products", sub: "< 1 min", icon: UploadCloud },
                { step: 2, label: "02. Scan with Phone", sub: "Instant", icon: Smartphone },
                { step: 3, label: "03. Real-Time Tracking", sub: "Always-on", icon: BarChart3 }
              ].map((item) => {
                const Icon = item.icon;
                const active = activeWorkStep === item.step;
                return (
                  <button
                    key={item.step}
                    onClick={() => setActiveWorkStep(item.step)}
                    className={`flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-sky-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${active ? 'bg-sky-800/80 text-sky-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Step Interactive Grid / Active Step Deep Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Working Simulator */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-hairline p-6 sm:p-8 shadow-sm">
              
              {/* STEP 1: IMPORT SIMULATOR */}
              {activeWorkStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-hairline pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 font-mono font-bold text-xs">
                        01
                      </span>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                        Product Ingestion Simulator
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-semibold">
                      Auto-Mapping Active
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Upload an Excel or CSV file. StockFlow automatically matches column headers (SKU, Title, Category, Initial Stock, Cost & Price in ₹) and validates for duplicate entries in under 60 seconds.
                  </p>

                  {/* Dropzone simulator */}
                  <div className="rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800/60 bg-white dark:bg-slate-900/80 p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 mx-auto flex items-center justify-center shadow-xs">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        catalog_inventory_q3_inr.xlsx (50 products)
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Size: 18.4 KB · Columns: SKU, Name, Category, Stock, Cost, Price
                      </p>
                    </div>

                    {isImporting ? (
                      <div className="space-y-2 pt-2 max-w-xs mx-auto">
                        <div className="flex justify-between text-xs font-mono text-slate-500">
                          <span>Parsing & validating rows...</span>
                          <span className="font-bold text-sky-700">{importProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${importProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : importDone ? (
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 size={16} />
                          <span>Successfully loaded 50 records into database</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button
                          onClick={handleRunImportSim}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Play size={14} />
                          <span>Simulate CSV Ingestion</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sample Parsed Catalog Preview Table */}
                  <div className="rounded-xl border border-hairline bg-white dark:bg-slate-900 overflow-hidden text-xs">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-hairline flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
                      <span>Simulated Catalog Preview (Currency: Indian Rupee ₹)</span>
                      <button 
                        onClick={() => { setImportDone(false); setImportProgress(0); }}
                        className="text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <RefreshCw size={11} /> Reset
                      </button>
                    </div>
                    <div className="divide-y divide-hairline">
                      {[
                        { sku: "AUD-WH-5021", name: "Sony WH-1000XM5 Wireless Headphones", stock: 42, cost: "₹19,500", price: "₹29,990", cat: "Audio" },
                        { sku: "LAP-MB-9014", name: "MacBook Pro 16\" M3 Max", stock: 8, cost: "₹2,85,000", price: "₹3,49,900", cat: "Computing" },
                        { sku: "PHN-GS-4412", name: "Samsung Galaxy S24 Ultra", stock: 15, cost: "₹95,000", price: "₹1,29,999", cat: "Mobile" },
                        { sku: "WTC-AW-3019", name: "Apple Watch Series 9 GPS", stock: 68, cost: "₹29,000", price: "₹41,900", cat: "Wearables" }
                      ].map((item, idx) => (
                        <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{item.sku} · {item.cat}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900 dark:text-white font-mono">{item.price}</p>
                            <p className="text-[10px] text-emerald-600 font-semibold">{item.stock} in stock</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PHONE SCANNER SIMULATOR */}
              {activeWorkStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-hairline pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 font-mono font-bold text-xs">
                        02
                      </span>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                        Smartphone Barcode Camera Simulator
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-sky-700 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full font-semibold">
                      Zero Hardware Needed
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Staff simply point their phone camera at any barcode or QR code. StockFlow reads the code instantly, rings a confirmation tone, and adjusts inventory in real time across all logged-in terminals.
                  </p>

                  {/* Interactive Phone Viewfinder Mockup */}
                  <div className="relative mx-auto max-w-sm rounded-[2.2rem] border-4 border-slate-800 bg-slate-950 p-4 shadow-xl overflow-hidden">
                    {/* Phone speaker notch */}
                    <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-3"></div>

                    {/* Camera Viewfinder Screen */}
                    <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-900 to-black overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-4">
                      {/* Viewfinder Target Reticle */}
                      <div className={`relative w-48 h-28 border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${
                        isScanning ? 'border-emerald-400 bg-emerald-950/30 scale-105' : 'border-white/40'
                      }`}>
                        {/* Barcode Graphic */}
                        <div className="flex items-center gap-1 opacity-70">
                          <Barcode size={38} className="text-white" />
                          <span className="text-[10px] font-mono text-white/80">AUD-WH-5021</span>
                        </div>

                        {/* Animated Laser Scanning Line */}
                        <div className={`absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_3px_rgba(52,211,153,0.8)] ${
                          isScanning ? 'top-1/2 animate-pulse scale-x-105' : 'top-1/3 animate-bounce'
                        }`}></div>
                      </div>

                      {/* Camera Overlay Status */}
                      <div className="absolute top-2.5 inset-x-3 flex items-center justify-between text-[11px] font-mono text-white/70">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          HD Camera Active
                        </span>
                        <span>Auto-Focus On</span>
                      </div>

                      {/* Scan Counter Pill */}
                      <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono">
                        Session Scans: <span className="font-bold text-emerald-400">{scanCount} items</span>
                      </div>
                    </div>

                    {/* Trigger Scan Button */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleSimulateScan}
                        disabled={isScanning}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                          isScanning ? 'bg-emerald-600 scale-98' : 'bg-sky-700 hover:bg-sky-800'
                        }`}
                      >
                        <ScanLine size={16} />
                        <span>{isScanning ? "Scanning Barcode..." : "Tap to Scan Item with Phone Camera"}</span>
                      </button>
                    </div>

                    {/* Live Scanned Pop-up Card */}
                    {scanFeedback && (
                      <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-hairline text-xs space-y-1 shadow-md animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={13} /> {scanFeedback.qtyAdded}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{scanFeedback.time}</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{scanFeedback.title}</p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>{scanFeedback.sku} · {scanFeedback.loc}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{scanFeedback.price}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: REAL-TIME INVENTORY & ALERT TRIGGER SIMULATOR */}
              {activeWorkStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-hairline pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 font-mono font-bold text-xs">
                        03
                      </span>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                        Live Stock & Alert Simulation
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-semibold">
                      Real-Time Sync
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Drag the stock level slider below to see how StockFlow dynamically switches between healthy holding status, dead-stock detection, and instantaneous purchase reorder triggers.
                  </p>

                  {/* Stock Slider Control Card */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-hairline space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sony WH-1000XM5 Wireless Headphones</h4>
                        <p className="text-xs font-mono text-slate-400">SKU: AUD-WH-5021 · Reorder Point: 10 units</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Current Stock</span>
                        <p className={`text-2xl font-bold font-mono ${simStock <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {simStock} Units
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                        <span>Simulate Stock Depletion (Out of Stock ← Optimal)</span>
                        <span className="font-mono">{simStock} / 40</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={simStock}
                        onChange={(e) => setSimStock(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-700"
                      />
                    </div>

                    {/* Dynamic Status Trigger Card */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      simStock === 0
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-900 dark:text-rose-300'
                        : simStock <= 10
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-300'
                    }`}>
                      <div className="flex items-start gap-3">
                        {simStock <= 10 ? (
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-bold">
                            {simStock === 0
                              ? "Critical: Out of Stock Emergency!"
                              : simStock <= 10
                                ? "Automated Low Stock Reorder Dispatched"
                                : "Optimal Stock Level & Holding Cost"
                            }
                          </p>
                          <p className="text-xs mt-1 opacity-90">
                            {simStock <= 10
                              ? "Stock is below the safety threshold (10 units). Recommended Purchase Order: 30 units @ ₹18,500/unit from Redington India Ltd (Total: ₹5,55,000)."
                              : "Inventory holding cost is balanced. Real-time valuation: ₹" + (simStock * 29990).toLocaleString('en-IN') + " across 2 warehouse locations."
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Warehouse Status Bar */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-hairline bg-white dark:bg-slate-900">
                      <span className="text-slate-400">Main Logistics Hub</span>
                      <p className="font-bold text-sm mt-0.5 text-slate-900 dark:text-white font-mono">
                        {Math.ceil(simStock * 0.7)} units
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-hairline bg-white dark:bg-slate-900">
                      <span className="text-slate-400">Downtown Retail Outlet</span>
                      <p className="font-bold text-sm mt-0.5 text-slate-900 dark:text-white font-mono">
                        {Math.floor(simStock * 0.3)} units
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Step Breakdown & Reference Site Capabilities */}
            <div className="lg:col-span-5 space-y-6">
              {/* 3 Step Sequential Cards */}
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Import Your Products",
                    time: "< 1 min",
                    desc: "Bring your existing Excel or CSV catalog. Column auto-mapping detects SKUs, item names, categories, initial stock, and Indian Rupee (₹) prices instantly with zero formatting headaches.",
                    features: ["Bulk import thousands of SKUs in seconds", "Automatic category & warehouse assignment", "No locked-in proprietary formats"]
                  },
                  {
                    step: 2,
                    title: "Scan with Your Phone",
                    time: "Instant",
                    desc: "Turn any iOS or Android phone camera into an industrial-speed scanner. Read barcodes and QR codes right off cartons, boxes, or shelves with zero hardware purchases.",
                    features: ["Zero expensive laser gun costs", "Instant audio & visual confirmation", "Works on smartphones, tablets, and POS"]
                  },
                  {
                    step: 3,
                    title: "Track Stock in Real-Time",
                    time: "Always-on",
                    desc: "Multi-location inventory synched to the second. Automatically catch dead stock before it costs you, trigger low-stock purchase orders, and monitor your exact valuation in ₹.",
                    features: ["Per-warehouse stock transfer audits", "Automated low-stock supplier alerts", "Dead stock idle capital recovery"]
                  }
                ].map((item) => (
                  <div
                    key={item.step}
                    onClick={() => setActiveWorkStep(item.step)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      activeWorkStep === item.step
                        ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30 shadow-xs'
                        : 'border-hairline bg-surface hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        activeWorkStep === item.step ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        STEP 0{item.step}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-medium">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
                    
                    <ul className="mt-3 space-y-1.5 border-t border-hairline/60 pt-3">
                      {item.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check size={13} className="text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Reference Feature 1: Staff Role Permissions Matrix Card (Matching Reference Site) */}
              <div className="p-5 rounded-2xl border border-hairline bg-surface-muted shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-sky-700" />
                    <span className="font-bold text-xs uppercase tracking-wide text-ink">Staff Permissions & Safety</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">RBAC Enforced</span>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Staff can view and execute all business activities done by admin (BOM, production, stock transfers, invoices), while destructive user deletions and administrative purges remain securely restricted.
                </p>

                <div className="rounded-xl border border-hairline bg-white dark:bg-slate-900 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-hairline font-mono text-slate-400">
                    <span>Operation Permission</span>
                    <span>Staff Access</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>View Admin Catalog & Inventory</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1"><Check size={13} /> Granted</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>Scan In/Out & Adjust Quantities</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1"><Check size={13} /> Granted</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>Bill of Materials & Work Orders</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1"><Check size={13} /> Granted</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>Remove Users & System Purge</span>
                    <span className="text-rose-600 font-semibold flex items-center gap-1"><Lock size={12} /> Admin Only</span>
                  </div>
                </div>
              </div>

              {/* Reference Feature 2: Dead Stock Recovery Detector Card (Matching Reference Site) */}
              <div className="p-5 rounded-2xl border border-hairline bg-surface-muted shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-rose-600" />
                    <span className="font-bold text-xs uppercase tracking-wide text-ink">Dead Stock Detector (INR ₹)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">12 Items Stalled</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-hairline">
                    <span className="text-[10px] text-slate-400 block">Total Items</span>
                    <span className="font-bold text-slate-900 dark:text-white">12</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-hairline">
                    <span className="text-[10px] text-slate-400 block">Value Trapped</span>
                    <span className="font-bold text-rose-600 font-mono">₹4,80,000</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-hairline">
                    <span className="text-[10px] text-slate-400 block">Threshold</span>
                    <span className="font-bold text-slate-900 dark:text-white">90 Days</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-hairline text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">Ceramic Mug Set (76 units)</span>
                    <span className="font-mono text-rose-600">₹91,200</span>
                  </div>
                  <p className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                    Inactive 214 days → Recommended: Liquidation or Markdown Sale
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. Interactive ROI & Holding Cost Calculator */}
      <section id="calculator" className="py-20 md:py-28 bg-surface-muted border-b border-hairline">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">Interactive Calculator</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Calculate Your Capital Recovery
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              See how eliminating dead stock and cutting holding costs directly frees working capital.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-surface p-8 rounded-3xl border border-hairline shadow-md">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm font-semibold mb-2">
                  <span className="text-ink">Current Total Inventory Value (₹)</span>
                  <span className="font-mono text-sky-700 font-bold">₹{inventoryValue.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="50000000"
                  step="100000"
                  value={inventoryValue}
                  onChange={(e) => setInventoryValue(Number(e.target.value))}
                  className="w-full accent-sky-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>₹1,00,000 (1 Lakh)</span>
                  <span>₹5,00,00,000 (5 Crore)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm font-semibold mb-2">
                  <span className="text-ink">Estimated Slow / Dead Stock (%)</span>
                  <span className="font-mono text-amber-600 font-bold">{deadStockPercent}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  step="1"
                  value={deadStockPercent}
                  onChange={(e) => setDeadStockPercent(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>2% (Lean)</span>
                  <span>35% (High Dead Stock)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-hairline text-xs text-slate-600 space-y-1">
                <p>• Typical warehousing holding costs equal 20–25% of stock value annually.</p>
                <p>• StockFlow alerts flag items inactive for over 90 days to prevent capital write-offs.</p>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-900 to-indigo-950 text-white shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-mono text-sky-300">Projected Annual Bottom-Line Impact</span>
                <p className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">
                  ₹{Math.round(totalAnnualSavings).toLocaleString('en-IN')} / year
                </p>
                <span className="text-xs text-emerald-300 font-medium">Estimated savings & recovered cash</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-4 border-t border-white/10">
                <div className="p-3 rounded-lg bg-white/10">
                  <span className="text-sky-200 block">Idle Capital Freed</span>
                  <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                    ₹{Math.round(recoveredWorkingCapital).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <span className="text-sky-200 block">Carrying Cost Saved</span>
                  <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                    ₹{Math.round(annualHoldingCost * 0.35).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-sky-950 font-bold text-sm hover:bg-sky-50 transition-all shadow-md"
              >
                <span>{user ? "Open Your Live Dashboard" : "Unlock Your Savings — Start Free"}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Competitive Feature Comparison Matrix */}
      <section id="comparison" className="py-20 md:py-28 bg-surface border-b border-hairline">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">Comparison</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              StockFlow vs The Competition
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Full-featured inventory management — free to start, honest about what's paid.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface shadow-xs">
            <table className="w-full min-w-[700px] text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-surface-muted text-xs font-semibold uppercase text-slate-500">
                  <th className="px-5 py-4">Feature</th>
                  <th className="px-4 py-4 text-center font-bold text-sky-700 bg-sky-50/70 dark:bg-sky-950/40">StockFlow Free</th>
                  <th className="px-4 py-4 text-center font-bold text-sky-800">StockFlow ₹749+</th>
                  <th className="px-4 py-4 text-center text-slate-400">Zoho Inventory</th>
                  <th className="px-4 py-4 text-center text-slate-400">Sortly</th>
                  <th className="px-4 py-4 text-center text-slate-400">inFlow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr>
                  <td className="px-5 py-4 font-medium text-ink">Starting Price</td>
                  <td className="px-4 py-4 text-center font-bold text-emerald-600 bg-sky-50/70 dark:bg-sky-950/40">Free (₹0)</td>
                  <td className="px-4 py-4 text-center font-bold text-sky-700">₹749/mo</td>
                  <td className="px-4 py-4 text-center text-slate-500">₹4,999/mo</td>
                  <td className="px-4 py-4 text-center text-slate-500">₹3,999/mo</td>
                  <td className="px-4 py-4 text-center text-slate-500">₹7,499/mo</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-ink">Bill of Materials (BOM)</td>
                  <td className="px-4 py-4 text-center bg-sky-50/70 dark:bg-sky-950/40"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-ink">Production & Work Orders</td>
                  <td className="px-4 py-4 text-center bg-sky-50/70 dark:bg-sky-950/40"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-ink">Asset & Equipment Custody</td>
                  <td className="px-4 py-4 text-center bg-sky-50/70 dark:bg-sky-950/40"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-ink">Multi-Warehouse Transfers</td>
                  <td className="px-4 py-4 text-center bg-sky-50/70 dark:bg-sky-950/40"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-ink">Hardware Free / Zero Scanner Cost</td>
                  <td className="px-4 py-4 text-center bg-sky-50/70 dark:bg-sky-950/40"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Check size={16} className="mx-auto text-emerald-600" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                  <td className="px-4 py-4 text-center"><Minus size={16} className="mx-auto text-slate-300" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. Verified Customer Reviews & Testimonials */}
      <section className="py-20 md:py-28 bg-surface-muted border-b border-hairline">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">Customers</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              What our customers say
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Real teams that swapped spreadsheets for StockFlow.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-8 rounded-2xl border border-hairline bg-surface shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed text-slate-700 dark:text-slate-300 italic">
                  “Super Kind! Quick replies from their support and very easy fixes, changed the dashboard a bit and customized it. Also gave me 450 items extra on the free plan just for me. Highly recommend and again great service!”
                </blockquote>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-ink text-sm">Erasable Trading AU</h4>
                  <span className="text-xs text-slate-400">Retail & Supply Logistics</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                  Verified on Trustpilot
                  <ExternalLink size={12} />
                </span>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-hairline bg-surface shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed text-slate-700 dark:text-slate-300 italic">
                  “Best customer service! StockFlow's support is fast and extremely helpful. They assisted me with custom BOM and production order flows to improve my experience as a user.”
                </blockquote>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-ink text-sm">Justin M.</h4>
                  <span className="text-xs text-slate-400">Co-Owner, Consumer Goods</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                  Verified on Capterra
                  <ExternalLink size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Pricing Section with Monthly / Annual Switch */}
      <section id="pricing" className="py-20 md:py-28 bg-surface border-b border-hairline">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transparent, scalable pricing
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Free Starter plan — paid plans start at just ₹749/month.
            </p>

            {/* Monthly / Annual Switch */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-xl bg-surface-muted border border-hairline">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-800 text-sky-700 shadow-xs' : 'text-slate-500'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${billingCycle === 'annual' ? 'bg-white dark:bg-slate-800 text-sky-700 shadow-xs' : 'text-slate-500'}`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter Plan */}
            <div className="p-6 rounded-2xl border border-hairline bg-surface shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-ink">₹0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Free plan for startups and solopreneurs.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Up to 25 products</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 1 Warehouse location</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Bill of Materials (BOM)</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Basic work orders</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Unlimited contacts</li>
                </ul>
              </div>

              <Link to={user ? "/dashboard" : "/register"} className="mt-8 w-full py-2.5 text-center rounded-lg border border-hairline text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                {user ? "Open Dashboard" : "Start Free"}
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="p-6 rounded-2xl border-2 border-sky-600 bg-sky-50/20 dark:bg-sky-950/20 shadow-sm relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-sky-700 text-white uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Professional</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-ink">
                    ₹{billingCycle === 'annual' ? '599' : '749'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">For growing small businesses.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 2,000 Products</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 2 Warehouse locations</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Multi-location transfers</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 5 Team user seats</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> CSV / Excel full export</li>
                </ul>
              </div>

              <Link to={user ? "/dashboard" : "/register"} className="mt-8 w-full py-2.5 text-center rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800 shadow-xs">
                Choose Professional
              </Link>
            </div>

            {/* Business Plan */}
            <div className="p-6 rounded-2xl border border-hairline bg-surface shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Business</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-ink">
                    ₹{billingCycle === 'annual' ? '1,999' : '2,499'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">For high-throughput multi-channel sellers.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 10,000 Products</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 5 Warehouse locations</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Production floor scheduling</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 20 Team user seats</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Predictive AI forecasting</li>
                </ul>
              </div>

              <Link to={user ? "/dashboard" : "/register"} className="mt-8 w-full py-2.5 text-center rounded-lg border border-hairline text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Choose Business
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 rounded-2xl border border-hairline bg-surface shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enterprise</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-ink">
                    ₹{billingCycle === 'annual' ? '3,999' : '4,999'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Unlimited operations & priority SLA.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Unlimited products</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Unlimited warehouses</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Asset depreciation engine</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 50+ User seats with RBAC</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 24/7 Priority SLA support</li>
                </ul>
              </div>

              <Link to={user ? "/dashboard" : "/register"} className="mt-8 w-full py-2.5 text-center rounded-lg border border-hairline text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ Section */}
      <section id="faq" className="py-20 md:py-28 bg-surface-muted border-b border-hairline">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-2">FAQ</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-hairline bg-surface overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-ink"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-sky-700' : ''}`} 
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-hairline pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final CTA Banner */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 text-white text-center">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Ready to master your inventory?
          </h2>
          <p className="mt-4 text-sky-100 text-base sm:text-lg max-w-xl mx-auto">
            Get started in under 10 minutes. No credit card required, free forever starter plan.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-sky-950 font-bold text-sm hover:bg-sky-50 transition-all shadow-md"
            >
              Start For Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Sign In to Your Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* 13. Comprehensive Footer */}
      <footer className="bg-surface border-t border-hairline py-12 text-slate-500 text-xs">
        <div className="mx-auto max-w-6xl px-5 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <StockFlowLogo />
            <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
              Cloud-based intelligent inventory management for small businesses and growing commerce teams.
            </p>
            <p className="text-[11px] text-slate-400 pt-2">© {new Date().getFullYear()} StockFlow Systems. All rights reserved.</p>
          </div>

          <div>
            <h5 className="font-bold text-ink mb-3 uppercase tracking-wider text-[11px]">Product</h5>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-ink">Products Catalog</Link></li>
              <li><Link to="/inventory" className="hover:text-ink">Inventory Ledger</Link></li>
              <li><Link to="/bom" className="hover:text-ink">Bill of Materials</Link></li>
              <li><Link to="/production" className="hover:text-ink">Work Orders</Link></li>
              <li><Link to="/warehouses" className="hover:text-ink">Multi-Warehouse</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-ink mb-3 uppercase tracking-wider text-[11px]">Operations</h5>
            <ul className="space-y-2">
              <li><Link to="/pos" className="hover:text-ink">Fast POS Terminal</Link></li>
              <li><Link to="/orders" className="hover:text-ink">Sales & Purchasing</Link></li>
              <li><Link to="/invoices" className="hover:text-ink">Invoicing & Billing</Link></li>
              <li><Link to="/assets" className="hover:text-ink">Asset Tracking</Link></li>
              <li><Link to="/finance" className="hover:text-ink">Financial Margins</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-ink mb-3 uppercase tracking-wider text-[11px]">Intelligence</h5>
            <ul className="space-y-2">
              <li><Link to="/ai" className="hover:text-ink">AI Copilot</Link></li>
              <li><Link to="/intelligence" className="hover:text-ink">Demand Forecasting</Link></li>
              <li><Link to="/reports" className="hover:text-ink">Analytics Reports</Link></li>
              <li><Link to="/activity" className="hover:text-ink">Compliance Audit</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
