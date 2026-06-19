import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser } from '../services/authService';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPass, setShowPass] = React.useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center hero-bg px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-black text-xl shadow-glow-primary">
              F
            </div>
            <h1 className="text-2xl font-extrabold text-dark-50">Welcome Back</h1>
            <p className="text-dark-400 text-sm mt-1">Sign in to your FindIt account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                <input
                  id="email"
                  type="email"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@college.edu"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                />
              </div>
              {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary w-full py-3 text-base mt-2"
              id="login-submit-btn"
            >
              {mutation.isPending ? <><Spinner size="sm" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 rounded-xl bg-dark-600/40 border border-dark-500/30">
            <p className="text-xs text-dark-500 text-center">
              For admin: set role to <span className="text-primary-400">"admin"</span> in MongoDB directly
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
