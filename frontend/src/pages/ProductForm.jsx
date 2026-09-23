import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { productService, categoryService, supplierService, warehouseService } from '../services/apiServices';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Sparkles, Wand2, Plus, X, Barcode as BarcodeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMatchingProductImage } from '../utils/productImageMatcher';

const COMMON_PRODUCTS = [
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone 13", 
  "Samsung Galaxy S24 Ultra", "Samsung Galaxy S24", "Samsung Galaxy S23", "Samsung Galaxy A54", 
  "Google Pixel 8 Pro", "Google Pixel 8", "Google Pixel 7a", "OnePlus 12", "OnePlus 11", 
  "MacBook Pro 16-inch", "MacBook Pro 14-inch", "MacBook Air M3", "MacBook Air M2", 
  "Dell XPS 15", "Dell XPS 13", "Lenovo ThinkPad X1 Carbon", "ASUS ROG Zephyrus G14", 
  "HP Spectre x360", "Microsoft Surface Pro 9", "iPad Pro 12.9-inch", "iPad Air", "iPad Mini", 
  "Samsung Galaxy Tab S9", "Sony PlayStation 5", "Xbox Series X", "Nintendo Switch OLED", 
  "Steam Deck", "AirPods Pro (2nd Generation)", "AirPods (3rd Generation)", "AirPods Max", 
  "Sony WH-1000XM5", "Bose QuietComfort Ultra", "Sennheiser Momentum 4", "Jabra Elite 8 Active", 
  "Samsung Galaxy Buds 2 Pro", "Apple Watch Series 9", "Apple Watch Ultra 2", "Apple Watch SE", 
  "Samsung Galaxy Watch 6", "Garmin Fenix 7", "Fitbit Charge 6", "Sony A7 IV", "Canon EOS R6 Mark II", 
  "Nikon Z8", "Fujifilm X-T5", "DJI Mini 4 Pro", "DJI Mavic 3 Classic", "GoPro HERO12 Black", 
  "NVIDIA GeForce RTX 4090", "NVIDIA GeForce RTX 4080", "NVIDIA GeForce RTX 4070", 
  "AMD Radeon RX 7900 XTX", "AMD Radeon RX 7800 XT", "Intel Core i9-14900K", "Intel Core i7-14700K", 
  "AMD Ryzen 9 7950X", "AMD Ryzen 7 7800X3D", "Samsung 990 Pro 2TB SSD", "WD Black SN850X 2TB", 
  "Corsair Vengeance 32GB DDR5", "LG C3 65-inch OLED TV", "Samsung S90C 65-inch OLED", 
  "Sony A80L 65-inch OLED", "Sonos Arc Soundbar", "Samsung HW-Q990C", "Logitech MX Master 3S", 
  "Logitech G Pro X Superlight", "Razer DeathAdder V3 Pro", "Keychron Q1 Pro", "Wooting 60HE", 
  "Secretlab Titan Evo", "Herman Miller Aeron", "Philips Hue White and Color Starter Kit", 
  "Nanoleaf Shapes", "Amazon Echo Dot (5th Gen)", "Google Nest Hub Max", "Ring Video Doorbell Pro 2", 
  "Arlo Pro 4", "Dyson V15 Detect", "iRobot Roomba j7+", "Roborock S8 Pro Ultra", "Ninja Creami", 
  "Breville Barista Express", "Vitamix 5200", "KitchenAid Artisan Stand Mixer", "Instant Pot Duo 7-in-1", 
  "Anova Precision Cooker", "Ooni Koda 16 Pizza Oven", "Traeger Pro 575", "Weber Spirit II E-310", 
  "Yeti Tundra 45 Cooler", "Hydro Flask 32 oz", "Stanley Quencher H2.0", "Theragun Pro", 
  "Hypervolt 2", "Bala Bangles", "Bowflex SelectTech 552", "Peloton Bike+", "NordicTrack Commercial 1750", 
  "Oculus Meta Quest 3", "Valve Index VR Kit", "Sony Bravia XR A95L", "LG G3 OLED", "TCL QM8", 
  "Hisense U8K", "Vizio Elevate Soundbar", "Bose Smart Soundbar 600", "Sennheiser Ambeo Soundbar Mini", 
  "Logitech Brio 4K", "Elgato Facecam Pro", "Razer Kiyo Pro Ultra", "Shure SM7B", "Audio-Technica AT2020", 
  "Blue Yeti X", "Elgato Stream Deck MK.2", "Corsair K100 RGB", "SteelSeries Apex Pro TKL", 
  "Asus ROG Azoth", "Logitech G915 TKL"
];

const productSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative'),
  currentStock: z.coerce.number().min(0, 'Current stock cannot be negative').default(0),
  minimumStock: z.coerce.number().min(0, 'Minimum stock cannot be negative').default(5),
  maximumStock: z.coerce.number().min(0).optional().or(z.literal('')),
  manufacturingDate: z.string().optional().or(z.literal('')),
  expiryDate: z.string().optional().or(z.literal('')),
  supplier: z.string().optional(),
  warehouse: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  productImage: z.string().optional().or(z.literal(''))
});

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quick New Category Modal State
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      currentStock: 0,
      minimumStock: 5,
      taxRate: 0,
      purchasePrice: 0,
      sellingPrice: 0
    }
  });

  const watchedName = watch('productName');
  const watchedImage = watch('productImage');
  const watchedPurchase = watch('purchasePrice');
  const watchedSelling = watch('sellingPrice');

  // Profit Margin calculations
  const pPrice = Number(watchedPurchase) || 0;
  const sPrice = Number(watchedSelling) || 0;
  const profitUnit = sPrice - pPrice;
  const marginPercent = sPrice > 0 ? ((profitUnit / sPrice) * 100).toFixed(1) : 0;

  useEffect(() => {
    if (watchedName && (!watchedImage || watchedImage === '')) {
      const autoImg = getMatchingProductImage(watchedName);
      setValue('productImage', autoImg, { shouldValidate: true });
    }
  }, [watchedName, watchedImage, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, supRes, warRes, prodListRes] = await Promise.all([
          categoryService.getAll().catch(() => ({ data: { data: [] } })),
          supplierService.getAll().catch(() => ({ data: { data: [] } })),
          warehouseService.getAll().catch(() => ({ data: { data: [] } })),
          productService.getAll().catch(() => ({ data: { data: [] } }))
        ]);
        setCategories(catRes.data.data || []);
        setSuppliers(supRes.data.data || []);
        setWarehouses(warRes.data.data || []);
        setExistingProducts(prodListRes.data.data || []);

        if (isEdit) {
          const prodRes = await productService.getById(id);
          const p = prodRes.data.data;
          reset({
            ...p,
            category: p.category?._id || '',
            supplier: p.supplier?._id || '',
            warehouse: p.warehouse?._id || '',
            manufacturingDate: p.manufacturingDate ? p.manufacturingDate.split('T')[0] : '',
            expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '',
            taxRate: p.taxRate ?? 0
          });
        } else {
          const barcodeParam = new URLSearchParams(location.search).get('barcode');
          if (barcodeParam) {
            setValue('barcode', barcodeParam);
          }
        }
      } catch (error) {
        toast.error('Failed to load form initial data');
      }
    };
    fetchData();
  }, [id, isEdit, location.search, reset, setValue]);

  const generateSku = () => {
    const prefix = watchedName 
      ? watchedName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD') 
      : 'SKU';
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newSku = `${prefix}-${rand}-${Date.now().toString().slice(-4)}`;
    setValue('sku', newSku, { shouldValidate: true });
    toast.success(`Generated SKU: ${newSku}`);
  };

  const generateBarcode = () => {
    // Standard 13-digit EAN-like code
    const rand = Math.floor(100000000000 + Math.random() * 900000000000);
    const code = `890${rand.toString().slice(-10)}`;
    setValue('barcode', code, { shouldValidate: true });
    toast.success(`Generated Barcode: ${code}`);
  };

  const handleQuickCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name is required');
      return;
    }
    setCreatingCat(true);
    try {
      const res = await categoryService.create({
        name: newCatName.trim(),
        description: newCatDesc.trim()
      });
      const created = res.data.data;
      setCategories(prev => [...prev, created]);
      setValue('category', created._id, { shouldValidate: true });
      toast.success(`Category "${created.name}" created!`);
      setShowNewCategoryModal(false);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCat(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (!data.productImage || data.productImage.trim() === '') {
        data.productImage = getMatchingProductImage(data.productName);
      }
      if (isEdit) {
        await productService.update(id, data);
        toast.success('Product updated successfully');
      } else {
        await productService.create(data);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/products" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Catalog Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-gray-500">
              {isEdit ? 'Update product details and stock configuration' : 'Register a new item into the inventory catalog'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
        
        {/* Basic Identification */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            General Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Product Name *
              </label>
              <input 
                {...register('productName')} 
                list="existing-product-names" 
                autoComplete="off" 
                placeholder="e.g. iPhone 15 Pro, Dell XPS 15"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm transition-all" 
              />
              <datalist id="existing-product-names">
                {existingProducts.map(p => <option key={p._id} value={p.productName} />)}
                {COMMON_PRODUCTS.map((p, idx) => <option key={`common-${idx}`} value={p} />)}
              </datalist>
              {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Category *</label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={13} /> Add New
                </button>
              </div>
              <select 
                {...register('category')} 
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">SKU (Stock Keeping Unit)</label>
                <button 
                  type="button" 
                  onClick={generateSku}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <Wand2 size={12} /> Auto-Generate
                </button>
              </div>
              <input 
                {...register('sku')} 
                placeholder="Leave blank to auto-generate"
                className="w-full px-3.5 py-2.5 font-mono text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Barcode / EAN</label>
                <button 
                  type="button" 
                  onClick={generateBarcode}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <BarcodeIcon size={12} /> Generate
                </button>
              </div>
              <input 
                {...register('barcode')} 
                placeholder="Scan or enter barcode"
                className="w-full px-3.5 py-2.5 font-mono text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Pricing & Profit Margin Analysis */}
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              Pricing & Profit Margin
            </h3>
            {sPrice > 0 && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                profitUnit >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                Margin: {marginPercent}% (₹{profitUnit.toFixed(2)}/unit profit)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Purchase Price (Cost) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input 
                  type="number" 
                  step="0.01" 
                  {...register('purchasePrice')} 
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm font-semibold" 
                />
              </div>
              {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Selling Price (Retail) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input 
                  type="number" 
                  step="0.01" 
                  {...register('sellingPrice')} 
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm font-semibold" 
                />
              </div>
              {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Tax Rate (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1" 
                  {...register('taxRate')} 
                  placeholder="e.g. 18"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" 
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock & Storage */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            Inventory & Warehousing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                {isEdit ? 'Current Stock' : 'Initial Opening Stock'} *
              </label>
              <input 
                type="number" 
                min="0"
                {...register('currentStock')} 
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm font-bold" 
              />
              {errors.currentStock && <p className="text-red-500 text-xs mt-1">{errors.currentStock.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Min Stock Alert Level
              </label>
              <input 
                type="number" 
                min="0"
                {...register('minimumStock')} 
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Max Stock Level
              </label>
              <input 
                type="number" 
                min="0"
                {...register('maximumStock')} 
                placeholder="Optional capacity cap"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Assigned Warehouse
              </label>
              <select 
                {...register('warehouse')} 
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer"
              >
                <option value="">No Warehouse Assigned</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} {w.address ? `(${w.address})` : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Supplier / Vendor
              </label>
              <select 
                {...register('supplier')} 
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Dates & Expiry */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            Batch & Dates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Manufacturing Date
              </label>
              <input 
                type="date" 
                {...register('manufacturingDate')} 
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Expiry Date
              </label>
              <input 
                type="date" 
                {...register('expiryDate')} 
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Image & Presentation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
              Product Image Preview & Matching
            </label>
            <button
              type="button"
              onClick={() => setValue('productImage', getMatchingProductImage(watchedName), { shouldValidate: true })}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles size={13} />
              Re-match Photo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
            <div className="w-20 h-20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-white dark:bg-gray-800 flex items-center justify-center shadow-inner">
              <img 
                src={watchedImage || getMatchingProductImage(watchedName)} 
                alt="Matched preview" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = getMatchingProductImage(watchedName); }}
              />
            </div>
            <div className="flex-1 w-full">
              <input 
                type="text" 
                {...register('productImage')} 
                placeholder="https://... or photo URL" 
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
              />
              <p className="text-xs text-gray-400 mt-1">
                Verified realistic product photo automatically resolved for {watchedName ? `"${watchedName}"` : 'your product'}.
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
            Product Description
          </label>
          <textarea 
            {...register('description')} 
            rows={3} 
            placeholder="Key specifications, dimensions, features, or notes..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
          ></textarea>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link 
            to="/products" 
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-indigo-700 transition-all shadow-md shadow-primary-500/25 flex items-center gap-2"
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}</span>
          </button>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Create New Category</h3>
              <button onClick={() => setShowNewCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleQuickCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Category Name *
                </label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. Laptops, Audio, Accessories"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Description
                </label>
                <input 
                  type="text" 
                  placeholder="Optional notes"
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creatingCat || !newCatName.trim()}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50"
                >
                  {creatingCat ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
