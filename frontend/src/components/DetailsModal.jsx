import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const DetailsModal = ({ isOpen, onClose, title, icon: Icon, tabs = [], headerContent }) => {
  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : null);

  // Update active tab if tabs change
  React.useEffect(() => {
    if (tabs.length > 0 && (!activeTab || !tabs.find(t => t.id === activeTab))) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 flex justify-between items-start shrink-0">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                {Icon && <div className="p-2 bg-primary/10 text-primary rounded-xl"><Icon size={24} /></div>}
                {title}
              </h2>
              {headerContent && <div className="mt-2">{headerContent}</div>}
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs Navigation */}
          {tabs.length > 1 && (
            <div className="flex px-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-gray-800">
            {tabs.map((tab) => (
              activeTab === tab.id && (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.content}
                </motion.div>
              )
            ))}
            {tabs.length === 0 && (
              <div className="text-center text-gray-500 py-8">No details available.</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailsModal;
