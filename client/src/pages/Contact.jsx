import React from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiUser, FiMessageCircle, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // In production, this would call an email API
    console.log('Contact form:', data);
    toast.success('Message sent! We\'ll get back to you soon.');
    reset();
  };

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
          <h1 className="text-4xl font-extrabold gradient-text mb-3">Get in Touch</h1>
          <p className="text-dark-300 text-lg">Have questions? We're here to help.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              { icon: FiMail, title: 'Email', value: 'support@findit.campus', color: 'text-primary-400' },
              { icon: FiMapPin, title: 'Campus', value: 'Available at all partner campuses', color: 'text-accent-400' },
              { icon: FiMessageCircle, title: 'Response Time', value: 'Within 24 hours on business days', color: 'text-success' },
            ].map(({ icon: Icon, title, value, color }) => (
              <div key={title} className="glass-card p-5 flex items-center gap-4">
                <div className={`${color} bg-dark-600/50 p-3 rounded-xl`}><Icon size={20} /></div>
                <div>
                  <p className="text-dark-300 text-xs uppercase tracking-wider font-medium">{title}</p>
                  <p className="text-dark-100 text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-dark-50 mb-5">Send a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="contact-form">
              <div>
                <label className="label">Your Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                  <input type="text" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} placeholder="John Doe"
                    {...register('name', { required: 'Name is required' })} />
                </div>
                {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                  <input type="email" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })} />
                </div>
                {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Message</label>
                <textarea rows={4} className={`input resize-none ${errors.message ? 'input-error' : ''}`} placeholder="How can we help you?"
                  {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'At least 10 characters' } })} />
                {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
              </div>
              <button type="submit" className="btn btn-primary w-full" id="contact-submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
