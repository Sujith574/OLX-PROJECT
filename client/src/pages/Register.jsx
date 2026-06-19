import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { registerUser } from '../services/authService';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPass, setShowPass] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (data.avatar?.[0]) fd.set('avatar', data.avatar[0]);
      return registerUser(fd);
    },
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      toast.success('Account created! Welcome to FindIt 🎉');
      navigate('/dashboard');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center hero-bg px-4 py-20 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-black text-xl shadow-glow-primary">
              F
            </div>
            <h1 className="text-2xl font-extrabold text-dark-50">Join FindIt</h1>
            <p className="text-dark-400 text-sm mt-1">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            <div>
              <label htmlFor="name" className="label">Full Name <span className="text-error">*</span></label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                <input id="name" type="text" className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
              </div>
              {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="label">Email Address <span className="text-error">*</span></label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                <input id="reg-email" type="email" className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@college.edu"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="label">Password <span className="text-error">*</span></label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                <input id="reg-password" type={showPass ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 6 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="label">Phone (for WhatsApp contact)</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                <input id="phone" type="tel" className="input pl-10"
                  placeholder="+91 98765 43210"
                  {...register('phone')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">College</label>
                <input type="text" className="input" placeholder="IIT Delhi" {...register('college')} />
              </div>
              <div>
                <label className="label">Department</label>
                <input type="text" className="input" placeholder="CSE" {...register('department')} />
              </div>
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full py-3 text-base mt-2" id="register-submit-btn">
              {mutation.isPending ? <><Spinner size="sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
