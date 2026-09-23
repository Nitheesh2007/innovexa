import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      setSuccess(true);
      toast.success('Password successfully reset!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full w-full relative justify-center max-w-md mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mb-6">
          <Lock size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Set new password</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Your new password must be different to previously used passwords.</p>
      </motion.div>

      {success ? (
        <motion.div variants={itemVariants} className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
          <CheckCircle size={48} className="text-green-500" />
          <div>
            <h3 className="font-bold text-lg">Password Reset</h3>
            <p className="text-sm mt-1">Your password has been reset successfully. Redirecting to login...</p>
          </div>
          <Link to="/login" className="mt-4 px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold transition-colors w-full">
            Go to log in
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={itemVariants} className="group relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white"
              placeholder="••••••••"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="group relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white"
              placeholder="••••••••"
              required
            />
          </motion.div>
          
          <motion.button 
            variants={itemVariants}
            type="submit" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> Resetting...</> : 'Reset password'}
          </motion.button>
        </form>
      )}

      <motion.div variants={itemVariants} className="mt-8 flex justify-center">
        <Link to="/login" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to log in
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;
