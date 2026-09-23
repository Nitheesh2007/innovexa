import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, Plus, Mail, Phone, MapPin, Search, Edit, Trash2, Building, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import DetailsModal from '../components/DetailsModal';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', companyName: '', email: '', phone: '', address: '', rating: 5, status: 'Active' });
  const [currentId, setCurrentId] = useState(null);
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
  const [supplierLedger, setSupplierLedger] = useState({ data: [], currentBalance: 0 });
  const [loadingLedger, setLoadingLedger] = useState(false);

  useEffect(() => {
    if (selectedSupplierDetails) {
      setLoadingLedger(true);
      api.get(`/finance/supplier-ledger/${selectedSupplierDetails._id}`)
        .then(res => setSupplierLedger(res.data))
        .catch(err => toast.error('Failed to load ledger'))
        .finally(() => setLoadingLedger(false));
    }
  }, [selectedSupplierDetails]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setIsEditing(true);
      setCurrentId(supplier._id);
      setFormData({
        name: supplier.name,
        companyName: supplier.companyName,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        rating: supplier.rating || 5,
        status: supplier.status || 'Active'
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ name: '', companyName: '', email: '', phone: '', address: '', rating: 5, status: 'Active' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/suppliers/${currentId}`, formData);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Supplier added successfully');
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        toast.success('Supplier deleted');
        fetchSuppliers();
      } catch (error) {
        toast.error('Failed to delete supplier');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 flex items-center gap-2">
            <Truck className="text-primary" size={32} /> Supplier Directory
          </h1>
          <p className="text-gray-500 mt-1">Manage your vendors and distributors.</p>
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search suppliers..."
              className="w-full pl-10 pr-4 py-2.5 glass dark:bg-gray-800/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus size={18} /> <span className="font-medium">Add Supplier</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Building size={64} className="mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No suppliers found</h3>
          <p className="text-gray-500 mt-2">Add your first supplier to start tracking vendors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map(supplier => (
            <motion.div 
              key={supplier._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedSupplierDetails(supplier)}
              className="glass dark:bg-gray-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/20 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                    {supplier.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-[150px]">{supplier.companyName}</h3>
                    <p className="text-sm text-gray-500">{supplier.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={14} className={star <= (supplier.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenModal(supplier); }} className="p-2 text-gray-500 hover:text-primary transition-colors"><Edit size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(supplier._id); }} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={16} className="text-gray-400" /> {supplier.email || 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={16} className="text-gray-400" /> {supplier.phone || 'N/A'}
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" /> 
                  <span className="line-clamp-2">{supplier.address || 'No address provided'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  supplier.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {supplier.status}
                </span>
                <span className="text-sm font-bold text-red-500 font-mono">
                  Owes: ₹{Number(supplier.outstandingAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedSupplierDetails && (
        <DetailsModal
          isOpen={!!selectedSupplierDetails}
          onClose={() => setSelectedSupplierDetails(null)}
          title="Supplier Details"
          icon={Building}
          tabs={[
            {
              id: 'details',
              label: 'Supplier Profile',
              content: (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-3xl font-extrabold text-primary shadow-inner">
                      {selectedSupplierDetails.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSupplierDetails.companyName}</h3>
                      <p className="text-gray-500">{selectedSupplierDetails.name} (Contact)</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={14} className={star <= (selectedSupplierDetails.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold text-gray-500 text-xs uppercase">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" /> {selectedSupplierDetails.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-500 text-xs uppercase">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" /> {selectedSupplierDetails.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-bold text-gray-500 text-xs uppercase">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" /> {selectedSupplierDetails.address || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2 mt-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        selectedSupplierDetails.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {selectedSupplierDetails.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'ledger',
              label: 'Ledger & History',
              content: (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Current Balance</h4>
                      <p className="text-sm text-gray-500">Total outstanding amount owed</p>
                    </div>
                    <div className="text-2xl font-black text-red-500 font-mono">
                      ₹{Number(supplierLedger.currentBalance || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  {loadingLedger ? (
                    <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase border-b dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Reference</th>
                            <th className="px-4 py-3 font-semibold">Description</th>
                            <th className="px-4 py-3 font-semibold text-right">Debit</th>
                            <th className="px-4 py-3 font-semibold text-right">Credit</th>
                            <th className="px-4 py-3 font-semibold text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-mono text-xs">
                          {supplierLedger.data.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500 font-sans">No transactions found</td></tr>
                          ) : (
                            supplierLedger.data.map((entry, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 font-sans">{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                                <td className="px-4 py-3 font-medium font-sans">{entry.reference}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-sans">{entry.description}</td>
                                <td className="px-4 py-3 text-right text-red-600">{entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}</td>
                                <td className="px-4 py-3 text-right text-emerald-600">{entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}</td>
                                <td className="px-4 py-3 text-right font-bold">₹{entry.balance?.toLocaleString('en-IN')}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      )}

      {/* Supplier Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 transition-colors">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea rows="2" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Rating (1-5)</label>
                    <input type="number" min="1" max="5" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-600 font-bold shadow-lg shadow-primary-500/30 transition-all">
                    {isEditing ? 'Save Changes' : 'Add Supplier'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Suppliers;
