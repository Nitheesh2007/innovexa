import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users as UsersIcon, Plus, UserPlus, Shield, ShieldCheck, Mail, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      toast.success('User created successfully');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User removed');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UsersIcon className="text-primary" /> Staff Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage administrators and staff accounts</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlus size={18} /> Invite Staff
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user, index) => (
          <div 
            key={user._id} 
            className="group relative glass dark:bg-gray-800/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 dark:border-white/5 pb-12"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Lanyard Graphic */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-gray-300 dark:bg-gray-600 rounded-b-md shadow-inner z-10">
              <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-900 mx-auto mt-1"></div>
            </div>

            {/* Top Color Banner */}
            <div className={`h-24 ${user.role === 'admin' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
              <div className="absolute top-3 right-3">
                {/* Mock Online Status */}
                <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-[10px] text-white font-bold uppercase tracking-wide">Online</span>
                </div>
              </div>
            </div>
            
            {/* ID Badge Content */}
            <div className="px-6 pb-6 pt-0 text-center relative z-20">
              {/* Profile Picture / Initials */}
              <div className="w-20 h-20 mx-auto -mt-10 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-lg transform group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-3xl font-extrabold text-gray-700 dark:text-gray-300 shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 mb-4 flex items-center justify-center gap-1 truncate"><Mail size={12}/> {user.email}</p>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  user.role === 'admin' 
                    ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900/40 dark:to-orange-900/40 dark:text-amber-400 border border-amber-300/50 dark:border-amber-700/50' 
                    : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-400 border border-blue-300/50 dark:border-blue-700/50'
                }`}>
                  {user.role === 'admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                  {user.role}
                </span>
              </div>

              {/* Holographic effect line */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mix-blend-overlay"></div>
            </div>

            {/* Actions Footer */}
            {currentUser?.role === 'admin' && currentUser._id !== user._id && (
              <div className="absolute bottom-0 left-0 w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform bg-black/5 dark:bg-white/5 backdrop-blur-md border-t border-white/20 dark:border-white/5 flex justify-center">
                <button 
                  onClick={() => deleteUser(user._id)} 
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-md transition-colors"
                  title="Revoke Access"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <UsersIcon size={48} className="mx-auto mb-4 opacity-50 text-primary-400" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No staff members found</h3>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add New Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input 
                  type="email" required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temporary Password</label>
                <input 
                  type="password" required minLength="6"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">Staff (User)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
