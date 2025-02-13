import { ReactNode } from 'react'

interface DashboardCardProps {
  icon: ReactNode
  title: string
  value: string
  trend: string
}

const DashboardCard = ({ icon, title, value, trend }: DashboardCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
        <span className="text-sm font-medium text-green-600">{trend}</span>
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-600">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

export default DashboardCard