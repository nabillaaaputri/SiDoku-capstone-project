import React from 'react'

export default function Card({ children, className = '' }) {
  return <div className={`rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}>{children}</div>
}