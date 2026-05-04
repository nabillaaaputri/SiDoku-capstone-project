import React from 'react'
import Card from './Card'

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.10),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-8 text-neutral-900 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center">
        <Card className="w-full rounded-[28px] border-neutral-200 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] sm:p-8 lg:p-10">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
              SiDoku
            </div>
          </div>

          {children}
        </Card>
      </div>
    </div>
  )
}