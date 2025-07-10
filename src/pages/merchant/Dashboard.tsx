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
import { useAuth } from '@/components/firebase/useAuth'
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/components/firebase/firebaseConfig'

/** Formate un montant : entier → « 48 », décimal → « 43,20 » */
const formatCurrency = (amount: number) =>
  Number.isInteger(amount)
    ? amount.toLocaleString("fr-FR", { minimumFractionDigits: 0 })
    : amount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const Dashboard = () => {
  const { merchant } = useAuth()

  const [clientsFideles, setClientsFideles] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    if (!merchant?.uid) return

    const q = query(
      collection(db, "fidelisation"),
      where("merchantId", "==", merchant.uid)
    )

    // Récupération des données en temps réel
    const unsubscribe = onSnapshot(q, (snap) => {
      let points = 0;
      let revenue = 0;
      let ratingTotal = 0;
      let ratingCount = 0;

      const docs = snap.docs

      snap.docs.forEach((doc) => {
        const data = doc.data();
        points += data.points || 0;
        revenue += data.totalRevenue || 0;
        
        if (typeof data.rating === "number") {
          ratingTotal += data.rating;
          ratingCount += 1;
        }
      });

      setClientsFideles(docs.length)
      setTotalPoints(points)
      setTotalRevenue(revenue)
      setAverageRating(ratingCount > 0 ? ratingTotal / ratingCount : 0)
    })

    return () => unsubscribe()
  }, [merchant])


  const stats = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "Clients fidèles",
      value: clientsFideles.toString() || "0",
      trend: "+0%"
    },
    {
      icon: <Activity className="w-6 h-6 text-green-500" />,
      title: "Chiffre d'affaires",
      value: `${formatCurrency(totalRevenue)} €`,
      trend: "+0%"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Note moyenne",
      value: `${averageRating}/5`,
      trend: "+0"
    },
    {
      icon: <Gift className="w-6 h-6 text-purple-500" />,
      title: "Points distribués",
      value: totalPoints.toLocaleString() || "0,000",
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
