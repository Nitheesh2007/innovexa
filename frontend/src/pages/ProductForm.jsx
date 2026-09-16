import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService, supplierService, warehouseService } from '../services/apiServices';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  productName: z.string().min(2, 'Name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  minimumStock: z.coerce.number().min(0),
  supplier: z.string().optional(),
  warehouse: z.string().optional(),
});

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, supRes, warRes, prodListRes] = await Promise.all([
          categoryService.getAll(),
          supplierService.getAll(),
          warehouseService.getAll(),
          productService.getAll()
        ]);
        setCategories(catRes.data.data);
        setSuppliers(supRes.data.data);
        setWarehouses(warRes.data.data);
        setExistingProducts(prodListRes.data.data);

        if (isEdit) {
          const prodRes = await productService.getById(id);
          const p = prodRes.data.data;
          reset({
            ...p,
            category: p.category?._id,
            supplier: p.supplier?._id,
            warehouse: p.warehouse?._id
          });
        }
      } catch (error) {
        toast.error('Failed to load form data');
      }
    };
    fetchData();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/products" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input {...register('productName')} list="existing-product-names" autoComplete="off" className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" />
            <datalist id="existing-product-names">
              {existingProducts.map(p => <option key={p._id} value={p.productName} />)}
              {COMMON_PRODUCTS.map((p, idx) => <option key={`common-${idx}`} value={p} />)}
            </datalist>
            {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU (Auto-generated if empty)</label>
            <input {...register('sku')} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select {...register('category')} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Barcode</label>
            <input {...register('barcode')} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price *</label>
            <input type="number" step="0.01" {...register('purchasePrice')} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price *</label>
            <input type="number" step="0.01" {...register('sellingPrice')} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Stock Alert Level</label>
            <input type="number" {...register('minimumStock')} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <select {...register('supplier')} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none">
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea {...register('description')} rows={4} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"></textarea>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <Link to="/products" className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Save size={18} />
            <span>Save Product</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
