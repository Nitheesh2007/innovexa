import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
  const { login, googleLogin, githubLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // Handle GitHub OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      handleGithubCallback(code);
    }
  }, []);

  const handleGithubCallback = async (code) => {
    try {
      toast.dismiss();
      setSocialLoading('GitHub');
      await githubLogin(code);
      toast.success(`Successfully logged in with GitHub!`, { id: 'social-success' });
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Failed to login with GitHub`, { id: 'social-error' });
    } finally {
      setSocialLoading(null);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        toast.dismiss();
        setSocialLoading('Google');
        await googleLogin(tokenResponse.access_token);
        toast.success(`Successfully logged in with Google!`, { id: 'social-success' });
        navigate('/dashboard');
      } catch (error) {
        toast.error(`Failed to login with Google`, { id: 'social-error' });
      } finally {
        setSocialLoading(null);
      }
    },
    onError: () => {
      toast.error('Google Sign-In was cancelled or failed.');
    }
  });

  const onSubmit = async (data) => {
    try {
      toast.dismiss();
      setLoading(true);
      const cleanEmail = data.email.trim();
      const cleanPassword = data.password.trim();
      await login(cleanEmail, cleanPassword);
      toast.success('Welcome back!', { id: 'login-success' });
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Authentication error';
      toast.error(errorMessage, { id: 'login-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubClick = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId || clientId.includes('placeholder') || clientId.includes('your_')) {
      return toast.error('GitHub Client ID is not configured.');
    }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
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
      className="flex flex-col h-full w-full"
    >
      <motion.div variants={itemVariants} className="mb-6 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome back</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Please enter your details to sign in.</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div variants={itemVariants} className="group relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Email address</label>
          <input 
            {...register('email')}
            type="email" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
            placeholder="admin@stockflow.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium absolute -bottom-5 left-0">{errors.email.message}</p>}
        </motion.div>
        
        <motion.div variants={itemVariants} className="group relative pt-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Password</label>
          <input 
            {...register('password')}
            type="password" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium absolute -bottom-5 left-0">{errors.password.message}</p>}
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex items-center justify-between pt-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer transition-colors" />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Remember for 30 days</span>
          </label>
          <button type="button" className="text-sm font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Forgot password?</button>
        </motion.div>

        <motion.button 
          variants={itemVariants}
          type="submit" 
          disabled={loading || socialLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] flex justify-center items-center gap-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={20} /> Signing in...</> : 'Sign in to account'}
        </motion.button>

        <motion.div variants={itemVariants} className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-medium rounded-full border border-gray-200 dark:border-gray-700 shadow-sm z-10">Or continue with</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <button 
            type="button" 
            onClick={() => loginWithGoogle()}
            disabled={loading || socialLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {socialLoading === 'Google' ? <Loader2 className="animate-spin" size={18} /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
            )}
            Google
          </button>
          <button 
            type="button" 
            onClick={handleGitHubClick}
            disabled={loading || socialLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {socialLoading === 'GitHub' ? <Loader2 className="animate-spin" size={18} /> : (
              <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
            )}
            GitHub
          </button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
          Don't have an account? <Link to="/register" className="text-primary-500 hover:text-primary-600 font-bold transition-colors">Register here</Link>
        </motion.p>
        <motion.div variants={itemVariants} className="flex justify-center mt-6">
          <Link to="/admin-login" className="px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm">
            <ShieldCheck size={16} /> Go to Admin Portal
          </Link>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Login;
