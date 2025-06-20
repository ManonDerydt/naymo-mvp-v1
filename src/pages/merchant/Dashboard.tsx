import { Activity, Gift, Star, Users } from 'lucide-react'
import StatCard from '@/components/merchant/dashboard/StatCard'
import CodeGenerator from '@/components/merchant/dashboard/CodeGenerator'
import DailyTip from '@/components/merchant/dashboard/DailyTip'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'

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
      trend: "+0%"
    }
  ]

  const barChartData = [
    { name: 'Lun', semaineActuelle: 120, semainePrecedente: 90 },
    { name: 'Mar', semaineActuelle: 180, semainePrecedente: 160 },
    { name: 'Mer', semaineActuelle: 90, semainePrecedente: 100 },
    { name: 'Jeu', semaineActuelle: 140, semainePrecedente: 130 },
    { name: 'Ven', semaineActuelle: 100, semainePrecedente: 80 },
    { name: 'Sam', semaineActuelle: 200, semainePrecedente: 180 },
    { name: 'Dim', semaineActuelle: 80, semainePrecedente: 70 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Dernière mise à jour: aujourd'hui</span>
        </div>
      </div>

      <p className="text-md text-gray-500">
        Sur votre tableau de bord Naymo, vous visualisez en un clin d’œil vos chiffres clés et gérez facilement votre activité au quotidien.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CodeGenerator />

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Comparaison des points attribués</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="semaineActuelle" fill="#7ebd07" name="Semaine actuelle" radius={[4, 4, 0, 0]} />
                <Bar dataKey="semainePrecedente" fill="#ffcd2a" name="Semaine précédente" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto rounded-lg shadow bg-white p-4">
          <DailyTip />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
