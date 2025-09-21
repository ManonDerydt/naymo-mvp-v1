import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string
  trend: string
}

const StatCard = ({ icon, title, value, trend }: StatCardProps) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#c9eaad]/20 to-[#7ebd07]/20">{icon}</div>
        <span className="text-xs font-semibold text-[#7ebd07] bg-[#c9eaad]/20 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <h3 className="mt-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default StatCard