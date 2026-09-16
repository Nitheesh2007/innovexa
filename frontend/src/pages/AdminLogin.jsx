import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const AdminLogin = () => {
  const { adminLogin } = useAuth();
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

  return (
    <div>
      <div className="flex justify-center mb-4">
        <div className="bg-amber-500 text-white p-3 rounded-full shadow-lg border-4 border-white dark:border-gray-800">
          <ShieldCheck size={32} />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Authorized access only</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Administrator Email</label>
          <input 
            {...register('email')}
            type="email" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
            placeholder="admin@stockflow.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Master Password</label>
          <input 
            {...register('password')}
            type="password" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
        </div>
        
        <div className="flex justify-end">
          <button type="button" className="text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors">Forgot master password?</button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/30 flex justify-center items-center gap-2 mt-2 hover:-translate-y-0.5"
        >
          {loading ? <><Loader2 className="animate-spin" size={20} /> Authenticating...</> : 'Authenticate as Admin'}
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          Not an administrator? <Link to="/login" className="text-primary hover:text-primary-600 font-semibold transition-colors">Return to Staff Login</Link>
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
