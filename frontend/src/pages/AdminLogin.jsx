import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      toast.dismiss();
      setLoading(true);
      const cleanEmail = data.email.trim();
      const cleanPassword = data.password.trim();
      await adminLogin(cleanEmail, cleanPassword);
      toast.success('Welcome back, Administrator.', { id: 'admin-login-success' });
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Authentication error';
      toast.error(errorMessage, { id: 'admin-login-error' });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
      className="flex flex-col h-full w-full relative"
    >
      <div className="absolute top-0 right-0 z-10">
        <button 
          onClick={toggleTheme}
          type="button"
          className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm transition-all hover:scale-110 shrink-0"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <motion.div variants={itemVariants} className="flex justify-center mb-6">
        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-xl shadow-amber-500/40 border border-white/20 dark:border-gray-800">
          <ShieldCheck size={36} />
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Portal</h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Authorized access only</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div variants={itemVariants} className="group relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-amber-600 dark:group-focus-within:text-amber-500">Administrator Email</label>
          <input 
            {...register('email')}
            type="email" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white"
            placeholder="admin@stockflow.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium absolute -bottom-5 left-0">{errors.email.message}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="group relative pt-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-amber-600 dark:group-focus-within:text-amber-500">Master Password</label>
          <input 
            {...register('password')}
            type="password" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium absolute -bottom-5 left-0">{errors.password.message}</p>}
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex justify-end pt-1">
          <button type="button" className="text-sm font-bold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Forgot master password?</button>
        </motion.div>

        <motion.button 
          variants={itemVariants}
          type="submit" 
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_8px_20px_-6px_rgba(245,158,11,0.5)] flex justify-center items-center gap-2 mt-4"
        >
          {loading ? <><Loader2 className="animate-spin" size={20} /> Authenticating...</> : 'Authenticate as Admin'}
        </motion.button>

        <motion.p variants={itemVariants} className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 font-medium">
          Not an administrator? <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold transition-colors ml-1">Return to Staff Login</Link>
        </motion.p>
      </form>
    </motion.div>
  );
};

export default AdminLogin;
