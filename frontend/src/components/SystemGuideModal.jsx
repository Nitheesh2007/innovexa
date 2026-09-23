import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, LayoutDashboard, Package, Truck, ShoppingCart, Box, Bot, Brain, FileText, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SystemGuideModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!isOpen) return null;

  const modules = [
    {
      icon: LayoutDashboard,
      name: "Dashboard Overview",
      adminDesc: "View high-level financial analytics, revenue trends, category distributions, and real-time ledger activity.",
      staffDesc: "View current stock levels, recent ledger activity, and monitor low-stock alerts to keep the warehouse running smoothly."
    },
    {
      icon: Package,
      name: "Product Catalog",
      adminDesc: "Manage all product SKUs, adjust global pricing and purchase costs, and assign products to specific warehouses.",
      staffDesc: "Browse the product catalog, check live stock availability, and view product details."
    },
    {
      icon: Truck,
      name: "Suppliers & Vendors",
      adminDesc: "Manage vendor contacts, maintain supplier reliability, and track supplier-linked inventory.",
      staffDesc: "Access vendor contact details and find supplier information for incoming shipments."
    },
    {
      icon: ShoppingCart,
      name: "Sales & Orders",
      adminDesc: "Complete oversight of all outgoing sales, customer accounts, order statuses, and revenue flow.",
      staffDesc: "Process customer orders, update order statuses in the pipeline, and print receipts."
    },
    {
      icon: Box,
      name: "Inventory Ledger",
      adminDesc: "A strict, immutable chronological record of every single stock movement (In, Out, Adjustments) for financial auditing.",
      staffDesc: "View the history of stock movements to trace where inventory went or when it arrived."
    },
    {
      icon: Bot,
      name: "StockFlow AI Assistant",
      adminDesc: "Ask the AI to analyze revenue, predict stockouts, or summarize inventory value using natural language.",
      staffDesc: "Ask the AI for help finding products or checking stock levels quickly."
    },
    {
      icon: Brain,
      name: "ML Intelligence",
      adminDesc: "Advanced Python-powered machine learning models for demand forecasting and smart categorization.",
      staffDesc: "View AI-generated insights on which products might run out of stock soon."
    },
    {
      icon: FileText,
      name: "Reports",
      adminDesc: "Generate exportable PDF and CSV reports for accounting and tax purposes.",
      staffDesc: "Generate basic inventory snapshot reports."
    },
    {
      icon: Users,
      name: "Staff Users",
      adminDesc: "Full control to add new employees, assign roles (Admin/Staff), and revoke access.",
      staffDesc: "Restricted. You can view your own profile, but cannot manage other staff members."
    }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Info className="text-primary" /> System Modules Guide
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Viewing capabilities as: <span className="font-bold text-primary uppercase tracking-wider">{user?.role}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
            {modules.map((mod, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary h-fit">
                  <mod.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{mod.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {isAdmin ? mod.adminDesc : mod.staffDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SystemGuideModal;
