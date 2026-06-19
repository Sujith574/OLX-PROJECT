import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default:  'bg-dark-600/50 text-dark-300 border-dark-500/30',
    lost:     'bg-error/15 text-error border-error/20',
    found:    'bg-success/15 text-success border-success/20',
    active:   'bg-info/15 text-info border-info/20',
    claimed:  'bg-warning/15 text-warning border-warning/20',
    resolved: 'bg-success/15 text-success border-success/20',
    pending:  'bg-warning/15 text-warning border-warning/20',
    approved: 'bg-success/15 text-success border-success/20',
    rejected: 'bg-error/15 text-error border-error/20',
    admin:    'bg-primary-500/15 text-primary-400 border-primary-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
