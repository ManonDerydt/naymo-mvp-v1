import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string
  trend: string
}

const StatCard = ({ icon, title, value, trend }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#ebffbc] to-[#d4f5a3]">{icon}</div>
        <span className="text-sm font-semibold text-[#589507] bg-[#ebffbc] px-2 py-1 rounded-full">{trend}</span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default StatCard