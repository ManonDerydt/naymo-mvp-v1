import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string
}

const StatCard = ({ icon, title, value }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between">
        <div>{icon}</div>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default StatCard