import React from 'react'

export const Input = ({
  label,
  type = 'text',
  placeholder = '',
  error = null,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {required && <span className="text-accent-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-neutral-100 ${error ? 'border-accent-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-accent-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default Input
