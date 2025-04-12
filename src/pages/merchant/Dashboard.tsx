import { Activity, Gift, Star, Users } from 'lucide-react'
import StatCard from '@/components/merchant/dashboard/StatCard'
import CodeGenerator from '@/components/merchant/dashboard/CodeGenerator'
import DailyTip from '@/components/merchant/dashboard/DailyTip'

const Dashboard = () => {
  const stats = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "Clients fidèles",
      value: "0",
      trend: "+0%"
    },
    {
      icon: <Activity className="w-6 h-6 text-green-500" />,
      title: "Chiffre d'affaires",
      value: "0 €",
      trend: "+0%"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Note moyenne",
      value: "0.0/5",
      trend: "+0"
    },
    {
      icon: <Gift className="w-6 h-6 text-purple-500" />,
      title: "Points distribués",
      value: "0,000",
      trend: "+24%"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Dernière mise à jour: aujourd'hui</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CodeGenerator />
        </div>
        <div>
          <DailyTip />
        </div>
      </div>
    </div>
  )
}

export default Dashboard