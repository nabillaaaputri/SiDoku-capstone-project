import React from 'react'

export const Badge = ({ 
  variant = 'default',
  children,
  className = ''
}) => {
  const variants = {
    default: 'bg-neutral-200 text-neutral-800',
    success: 'bg-accent-100 text-accent-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-primary-100 text-primary-800',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
