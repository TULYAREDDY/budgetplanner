import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-danger focus:border-danger focus:ring-danger/50' : 'border-gray-300 focus:border-primary focus:ring-primary/50';
  
  return (
    <div className={`mb-4 ${widthClass}`}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`block px-4 py-2.5 bg-white border ${errorClass} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};

export default Input;