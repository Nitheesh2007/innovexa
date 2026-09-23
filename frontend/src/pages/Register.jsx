import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await registerUser(data);
      toast.success('Account created successfully! Welcome to StockFlow.');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Authentication error';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Start for Free
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          No credit card required. 25 products free forever.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Full Name
          </label>
          <input 
            {...register('name')}
            type="text" 
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/80 border border-hairline rounded-lg focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600 outline-none transition-colors text-sm text-slate-900 dark:text-white"
            placeholder="Jane Doe"
          />
          {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Work Email
          </label>
          <input 
            {...register('email')}
            type="email" 
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/80 border border-hairline rounded-lg focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600 outline-none transition-colors text-sm text-slate-900 dark:text-white"
            placeholder="jane@company.com"
          />
          {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Password (min. 6 characters)
          </label>
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
          {loading ? <><Loader2 className="animate-spin" size={16} /> Creating Account...</> : 'Create Free Account'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-700 dark:text-sky-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
