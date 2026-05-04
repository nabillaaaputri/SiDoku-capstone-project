import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
