import React from 'react';
import { FiLoader } from 'react-icons/fi';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FiLoader className={`${sizes[size]} text-primary-400 animate-spin`} />
    </div>
  );
};

export default Spinner;
