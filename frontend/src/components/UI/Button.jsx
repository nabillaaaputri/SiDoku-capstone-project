import React from 'react'

export const Button = ({ 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-400',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 disabled:bg-neutral-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:bg-neutral-50',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <span className="animate-spin mr-2">⟳</span>}
      {children}
    </button>
  )
}

export default Button
