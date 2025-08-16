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
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'

// Nouveau graphique pour anciens/nouveaux clients
const NewVsReturningCustomers = ({ merchant }: { merchant: any }) => {
  const [chartData, setChartData] = useState<{ name: string; nouveaux: number; anciens: number }[]>([])

  useEffect(() => {
    if (!merchant?.uid) return

    const q = query(
      collection(db, "pointsHistory"),
      where("merchantId", "==", merchant.uid)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const customerFirstVisit = new Map<string, Date>()
      const weeklyData = new Map<string, { nouveaux: number; anciens: number }>()

      // Initialiser les 4 dernières semaines
      for (let i = 3; i >= 0; i--) {
        const weekStart = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
        const weekKey = format(weekStart, 'dd/MM')
        weeklyData.set(weekKey, { nouveaux: 0, anciens: 0 })
      }

      snap.docs.forEach((doc) => {
        const data = doc.data()
        const customerId = data.customerId
        const timestamp = data.createdAt?.toDate?.()

        if (customerId && timestamp instanceof Date) {
          // Enregistrer la première visite du client
          if (!customerFirstVisit.has(customerId) || timestamp < customerFirstVisit.get(customerId)!) {
            customerFirstVisit.set(customerId, timestamp)
          }
        }
      })

      // Analyser chaque transaction pour déterminer si c'est un nouveau ou ancien client
      snap.docs.forEach((doc) => {
        const data = doc.data()
        const customerId = data.customerId
        const timestamp = data.createdAt?.toDate?.()

        if (customerId && timestamp instanceof Date) {
          const weekStart = startOfWeek(timestamp, { weekStartsOn: 1 })
          const weekKey = format(weekStart, 'dd/MM')
          const firstVisit = customerFirstVisit.get(customerId)

          if (weeklyData.has(weekKey) && firstVisit) {
            const weekData = weeklyData.get(weekKey)!
            const isNewCustomer = Math.abs(timestamp.getTime() - firstVisit.getTime()) < 24 * 60 * 60 * 1000 // Moins de 24h

            if (isNewCustomer) {
              weekData.nouveaux++
            } else {
              weekData.anciens++
            }
          }
        }
      })

      const chartArray = Array.from(weeklyData.entries()).map(([name, data]) => ({
        name,
        nouveaux: data.nouveaux,
        anciens: data.anciens
      }))

      setChartData(chartArray)
    })

    return () => unsubscribe()
  }, [merchant])

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Users className="w-5 h-5 text-green-600 mr-2" />
        Nouveaux vs Anciens clients
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
          <XAxis dataKey="name" stroke="#374151" />
          <YAxis stroke="#374151" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #22c55e',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="nouveaux" fill="#22c55e" name="Nouveaux clients" radius={[4, 4, 0, 0]} />
          <Bar dataKey="anciens" fill="#7ebd07" name="Anciens clients" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

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
  const [barChartData, setBarChartData] = useState<{ name: string; semaineActuelle: number; semainePrecedente: number }[]>([])
  
  
  // Statistiques générales (à partir de pointsHistory)
  useEffect(() => {
    if (!merchant?.uid) return;

    const q = query(
      collection(db, "pointsHistory"),
      where("merchantId", "==", merchant.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      let totalPoints = 0;
      let revenue = 0;
      const clientsSet = new Set();

      snap.docs.forEach((doc) => {
        const data = doc.data();

        totalPoints += data.netPoints || 0;
        revenue += data.totalRevenue || 0;

        if (data.customerId) {
          clientsSet.add(data.customerId);
        }
      });

      setClientsFideles(clientsSet.size); // nombre de clients uniques
      setTotalRevenue(revenue);           // chiffre d’affaires cumulé
      // Ajoute une ligne si tu veux afficher le total de points :
      // setTotalPoints(totalPoints);
    });

    return () => unsubscribe();
  }, [merchant]);


  // Rating moyen (à partir de customerHistory)
  useEffect(() => {
    if (!merchant?.uid) return;

    const q = query(
      collection(db, "fidelisation"),
      where("merchantId", "==", merchant.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const ratings: number[] = [];

      snap.forEach((doc) => {
        const data = doc.data();
        const rating = data.rating;

        if (typeof rating === 'number' && rating > 0) {
          ratings.push(rating);
        }
      });

      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, curr) => acc + curr, 0);
        const avg = sum / ratings.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }
    });

    return () => unsubscribe();
  }, [merchant]);


  // Graphique (pointsHistory)
  useEffect(() => {
    if (!merchant?.uid) return

    const q = query(
      collection(db, "pointsHistory"),
      where("merchantId", "==", merchant.uid)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      let totalPointsSum = 0;

      // Initialiser les données pour les jours de la semaine actuelle et de la semaine précédente
      const currentWeekPoints: Record<string, number> = {};
      const previousWeekPoints: Record<string, number> = {};
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      days.forEach(day => {
        currentWeekPoints[day] = 0;
        previousWeekPoints[day] = 0;
      });

      const today = new Date();
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
      const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

      const startOfPreviousWeek = subWeeks(startOfCurrentWeek, 1);
      const endOfPreviousWeek = subWeeks(endOfCurrentWeek, 1);

      snap.docs.forEach((doc) => {
        const data = doc.data();
        const pointsAdded = data.pointsAdded || 0;

        // Somme totale de pointsAdded
        totalPointsSum += pointsAdded;

        const timestamp = data.createdAt?.toDate?.() || null;

        if (timestamp instanceof Date) {
          const dayMap: { [key: string]: string } = {
            Mon: 'Lun',
            Tue: 'Mar',
            Wed: 'Mer',
            Thu: 'Jeu',
            Fri: 'Ven',
            Sat: 'Sam',
            Sun: 'Dim'
          };
          const dayEn = format(timestamp, 'EEE');
          const jour = dayMap[dayEn] || dayEn;

          if (timestamp >= startOfCurrentWeek && timestamp <= endOfCurrentWeek) {
            currentWeekPoints[jour] += pointsAdded;
          } else if (timestamp >= startOfPreviousWeek && timestamp <= endOfPreviousWeek) {
            previousWeekPoints[jour] += pointsAdded;
          }
        }
      });

      setTotalPoints(totalPointsSum);

      const charData = days.map(day => ({
        name: day,
        semaineActuelle: currentWeekPoints[day],
        semainePrecedente: previousWeekPoints[day],
      }));

      setBarChartData(charData)
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
      value: `${averageRating.toFixed(1)}/5`,
      trend: "+0"
    },
    {
      icon: <Gift className="w-6 h-6 text-purple-500" />,
      title: "Points distribués",
      value: totalPoints ? totalPoints.toLocaleString() : "0",
      trend: "+0%"
    }
  ]

  return (
    <div className="space-y-8 font-['Inter',_'system-ui',_sans-serif]">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">Dernière mise à jour: aujourd'hui</span>
        </div>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed">
        Sur votre tableau de bord Naymo, vous visualisez en un clin d’œil vos chiffres clés et gérez facilement votre activité au quotidien.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CodeGenerator />

          <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 text-green-600 mr-2" />
              Comparaison des points attribués
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e7" />
                <XAxis dataKey="name" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f0fdf4', 
                    border: '1px solid #22c55e',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="semaineActuelle" fill="#7ebd07" name="Semaine actuelle" radius={[4, 4, 0, 0]} />
                <Bar dataKey="semainePrecedente" fill="#ffcd2a" name="Semaine précédente" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <NewVsReturningCustomers merchant={merchant} />
        </div>

        <div className="max-h-[600px] overflow-y-auto rounded-xl shadow-lg bg-white p-6 border border-green-100">
          <DailyTip />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
