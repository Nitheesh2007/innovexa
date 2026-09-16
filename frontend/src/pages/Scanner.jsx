import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { productService, ocrService } from '../services/apiServices';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Camera, UploadCloud, Loader2, History, Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Scanner = () => {
  const [activeTab, setActiveTab] = useState('barcode'); // 'barcode', 'ocr', 'manual'
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [recentScans, setRecentScans] = useState([
    { id: 1, barcode: '8901030303030', time: '10 mins ago', status: 'Found' },
    { id: 2, barcode: '1234567890123', time: '1 hour ago', status: 'New' }
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'barcode') {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      });

      scanner.render(async (text) => {
        scanner.pause();
        try {
          const res = await productService.getByBarcode(text);
          toast.success(`Found product: ${res.data.data.productName}`);
          setRecentScans(prev => [{id: Date.now(), barcode: text, time: 'Just now', status: 'Found'}, ...prev]);
          navigate(`/products/edit/${res.data.data._id}`);
        } catch (error) {
          toast.error('Product not found in database. You can add it now.');
          setRecentScans(prev => [{id: Date.now(), barcode: text, time: 'Just now', status: 'New'}, ...prev]);
          navigate(`/products/new?barcode=${text}`);
        }
        scanner.clear();
      }, (error) => {
        // console.warn(error);
      });

      return () => {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
    }
  }, [activeTab, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setOcrLoading(true);
      const res = await ocrService.extractProduct(formData);
      setOcrResult(res.data.data);
      toast.success('Extraction complete');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OCR Failed');
    } finally {
      setOcrLoading(false);
    }
  };

  const proceedWithOcrData = () => {
    if (!ocrResult) return;
    const params = new URLSearchParams();
    if (ocrResult.productName) params.append('name', ocrResult.productName);
    if (ocrResult.price) params.append('price', ocrResult.price);
    if (ocrResult.sku) params.append('sku', ocrResult.sku);
    navigate(`/products/new?${params.toString()}`);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualBarcode) return;
    try {
      const res = await productService.getByBarcode(manualBarcode);
      toast.success(`Found product: ${res.data.data.productName}`);
      navigate(`/products/edit/${res.data.data._id}`);
    } catch (error) {
      navigate(`/products/new?barcode=${manualBarcode}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Smart Scanners</h1>
          <p className="text-gray-500 mt-1">Digitize your inventory rapidly.</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <History size={18} />
          {showHistory ? 'Close History' : 'Recent Scans'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button 
          onClick={() => setActiveTab('barcode')}
          className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'barcode' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'}`}
        >
          <Camera size={18}/> Live Camera
        </button>
        <button 
          onClick={() => setActiveTab('ocr')}
          className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ocr' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'}`}
        >
          <UploadCloud size={18}/> OCR Label Entry
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'manual' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'}`}
        >
          <Keyboard size={18}/> Manual Override
        </button>
      </div>

      <div className="flex gap-6">
        <motion.div layout className={`flex-1 glass dark:bg-gray-800/80 rounded-2xl shadow-xl shadow-blue-900/5 border border-white/20 dark:border-white/5 p-8 relative overflow-hidden`}>
          
          <AnimatePresence mode="wait">
            {activeTab === 'barcode' && (
              <motion.div 
                key="barcode"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center relative z-10"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  <Camera size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Scan Barcode / QR Code</h3>
                <p className="text-gray-500 mb-8 text-center max-w-md text-sm">Align the barcode within the camera frame. The system will automatically detect and process it.</p>
                
                <div className="relative w-full max-w-md mx-auto group">
                  {/* Decorative corner brackets */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl z-20 pointer-events-none"></div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl z-20 pointer-events-none"></div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl z-20 pointer-events-none"></div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl z-20 pointer-events-none"></div>
                  
                  {/* The Scanner */}
                  <div id="reader" className="w-full overflow-hidden rounded-2xl bg-black border border-gray-800 shadow-2xl relative z-10"></div>
                  
                  {/* Animated Laser Line */}
                  <div className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] z-20 pointer-events-none animate-[scan_2s_ease-in-out_infinite_alternate] opacity-50"></div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ocr' && (
              <motion.div 
                key="ocr"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Invoice & Label OCR</h3>
                  <p className="text-gray-500 text-center max-w-md text-sm mb-8">Upload an image of a product label or supplier invoice to automatically extract textual details using Vision AI.</p>
                </div>
                
                <div className="flex justify-center">
                  <label className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all w-full max-w-md group hover:border-primary">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={ocrLoading} />
                    <div className="flex flex-col items-center gap-4">
                      {ocrLoading ? (
                        <div className="relative">
                          <Loader2 size={48} className="animate-spin text-primary" />
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                        </div>
                      ) : (
                        <UploadCloud size={48} className="text-gray-400 group-hover:text-primary transition-colors group-hover:scale-110 transform duration-300" />
                      )}
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{ocrLoading ? 'Vision AI is processing...' : 'Click to Upload Image'}</span>
                    </div>
                  </label>
                </div>

                {ocrResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-6 max-w-md mx-auto shadow-inner">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-500" /> Extracted Information
                    </h3>
                    <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                      <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-white/40 dark:border-white/5">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block mb-1">Product Name</span>
                        <span className="font-medium">{ocrResult.productName || 'Not identified'}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-white/40 dark:border-white/5">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block mb-1">Price</span>
                        <span className="font-medium">{ocrResult.price || 'Not identified'}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-white/40 dark:border-white/5">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block mb-1">SKU</span>
                        <span className="font-medium font-mono">{ocrResult.sku || 'Not identified'}</span>
                      </div>
                      
                      <div className="pt-4">
                        <button 
                          onClick={proceedWithOcrData}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 font-bold"
                        >
                          Proceed to Inventory Form
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'manual' && (
              <motion.div 
                key="manual"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center relative z-10"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                  <Keyboard size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Manual Override</h3>
                <p className="text-gray-500 text-center max-w-md text-sm mb-8">Enter the barcode manually if the scanner is unable to read it or if the label is severely damaged.</p>
                
                <form onSubmit={handleManualSubmit} className="w-full max-w-md">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Barcode / SKU Number</label>
                    <input 
                      type="text" 
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-mono"
                      placeholder="e.g. 8901030303030"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold py-3 rounded-xl transition-all shadow-md">
                    Process Manual Entry
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* History Drawer */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="glass dark:bg-gray-800/80 rounded-2xl shadow-lg overflow-hidden border border-white/20 dark:border-white/5 flex flex-col shrink-0"
            >
              <div className="p-4 border-b border-white/20 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-bold flex items-center gap-2"><History size={16}/> Scan History</h3>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {recentScans.map(scan => (
                  <div key={scan.id} className="bg-white/60 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-sm font-bold group-hover:text-primary transition-colors">{scan.barcode}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${scan.status === 'Found' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {scan.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{scan.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default Scanner;
