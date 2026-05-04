import React from 'react'
import DashboardLayout from '../components/Common/DashboardLayout'
import Card from '../components/UI/Card'

const InsightsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">Business Insights</h1>
        <Card>
          <p className="text-neutral-600">Fitur insights akan segera tersedia</p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default InsightsPage
