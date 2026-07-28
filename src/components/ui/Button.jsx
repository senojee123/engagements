import React from 'react';
import Spinner from './Spinner';

const variantStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus-visible:outline-2 focus-visible:outline-indigo-600',
  secondary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs focus-visible:outline-2 focus-visible:outline-cyan-600',
  outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs focus-visible:outline-2 focus-visible:outline-indigo-600',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:outline-2 focus-visible:outline-rose-600',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
  link: 'text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline p-0 bg-transparent shadow-none',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base font-medium rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const disabled = isDisabled || isLoading;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading && <Spinner size={size === 'sm' ? 'sm' : 'md'} color={variant === 'outline' || variant === 'ghost' ? 'indigo' : 'white'} />}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
