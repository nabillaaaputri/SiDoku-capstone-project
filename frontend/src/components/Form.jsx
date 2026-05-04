import React from 'react'

export default function Form({ title, children, footer, onSubmit }) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
      </div>

      {children}

      {footer ? <div>{footer}</div> : null}
    </form>
  )
}