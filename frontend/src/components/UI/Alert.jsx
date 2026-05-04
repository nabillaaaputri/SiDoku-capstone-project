import React from 'react'

export const Alert = ({ type = 'info', title, message, onClose }) => {
  const bgColors = {
    success: 'bg-accent-50 border-l-4 border-accent-500',
    warning: 'bg-amber-50 border-l-4 border-amber-500',
    error: 'bg-red-50 border-l-4 border-red-500',
    info: 'bg-primary-50 border-l-4 border-primary-500',
  }

  const textColors = {
    success: 'text-accent-800',
    warning: 'text-amber-800',
    error: 'text-red-800',
    info: 'text-primary-800',
  }

  return (
    <div className={`p-4 rounded ${bgColors[type]}`}>
      <div className="flex items-start justify-between">
        <div>
          {title && <h4 className={`font-semibold ${textColors[type]}`}>{title}</h4>}
          {message && <p className={`text-sm mt-1 ${textColors[type]}`}>{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert
