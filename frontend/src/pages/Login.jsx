import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast.success('Welcome back to StockFlow!', { id: 'login-success' });
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Authentication error';
      toast.error(errorMessage, { id: 'login-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Sign In
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Access your real-time inventory and dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Email address
          </label>
          <input 
            {...register('email')}
            type="email" 
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/80 border border-hairline rounded-lg focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600 outline-none transition-colors text-sm text-slate-900 dark:text-white"
            placeholder="name@company.com"
          />
          {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline">
              Forgot?
            </Link>
          </div>
          <input 
            {...register('password')}
            type="password" 
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/80 border border-hairline rounded-lg focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600 outline-none transition-colors text-sm text-slate-900 dark:text-white"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-xs flex justify-center items-center gap-2 text-sm mt-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={16} /> Signing in...</> : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-5">
          New to StockFlow?{' '}
          <Link to="/register" className="text-sky-700 dark:text-sky-400 font-semibold hover:underline">
            Start Free
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
