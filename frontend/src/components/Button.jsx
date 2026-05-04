import React from 'react'
import { Link } from 'react-router-dom'

export default function Button({ children, variant = 'solid', href, to, type = 'button', className = '', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'

  const variants = {
    solid: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
    outline: 'border border-neutral-300 bg-white text-neutral-700 hover:border-primary-300 hover:bg-neutral-50 active:bg-neutral-100',
    subtle: 'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
    text: 'bg-transparent px-0 py-0 text-primary-600 hover:underline',
  }

  const classes = `${baseClasses} ${variants[variant] || variants.solid} ${className}`

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}