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
  
  // Données fictives pour le graphique
  const fakeBarChartData = [
    { name: "Lun", semaineActuelle: 120, semainePrecedente: 90, ilYA2Semaines: 75 },
    { name: "Mar", semaineActuelle: 80,  semainePrecedente: 110, ilYA2Semaines: 95 },
    { name: "Mer", semaineActuelle: 150, semainePrecedente: 130, ilYA2Semaines: 100 },
    { name: "Jeu", semaineActuelle: 200, semainePrecedente: 170, ilYA2Semaines: 120 },
    { name: "Ven", semaineActuelle: 180, semainePrecedente: 140, ilYA2Semaines: 150 },
    { name: "Sam", semaineActuelle: 220, semainePrecedente: 160, ilYA2Semaines: 130 },
    { name: "Dim", semaineActuelle: 90,  semainePrecedente: 100, ilYA2Semaines: 110 },
  ]

  // Données fictives pour les stats
  const fakeStats = {
    clientsFideles: 48,
    totalRevenue: 12500,
    averageRating: 4.3,
    totalPoints: 8930,
  }

  
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

      // Initialiser les données pour 3 semaines
      const currentWeekPoints: Record<string, number> = {};
      const previousWeekPoints: Record<string, number> = {};
      const twoWeeksAgoPoints: Record<string, number> = {};
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

      days.forEach(day => {
        currentWeekPoints[day] = 0;
        previousWeekPoints[day] = 0;
        twoWeeksAgoPoints[day] = 0;
      });

      const today = new Date();
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
      const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

      const startOfPreviousWeek = subWeeks(startOfCurrentWeek, 1);
      const endOfPreviousWeek = subWeeks(endOfCurrentWeek, 1);

      const startOfTwoWeeksAgo = subWeeks(startOfCurrentWeek, 2);
      const endOfTwoWeeksAgo = subWeeks(endOfCurrentWeek, 2);

      snap.docs.forEach((doc) => {
        const data = doc.data();
        const pointsAdded = data.pointsAdded || 0;

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
          } else if (timestamp >= startOfTwoWeeksAgo && timestamp <= endOfTwoWeeksAgo) {
            twoWeeksAgoPoints[jour] += pointsAdded;
          }
        }
      });

      setTotalPoints(totalPointsSum);

      const charData = days.map(day => ({
        name: day,
        semaineActuelle: currentWeekPoints[day],
        semainePrecedente: previousWeekPoints[day],
        ilYA2Semaines: twoWeeksAgoPoints[day],
      }));

      setBarChartData(charData)
    })

    return () => unsubscribe()
  }, [merchant])



  const stats = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "Clients fidèles",
      value: (clientsFideles || fakeStats.clientsFideles).toString(),
      trend: "+0%"
    },
    {
      icon: <Activity className="w-6 h-6 text-green-500" />,
      title: "Chiffre d'affaires",
      value: `${formatCurrency(totalRevenue || fakeStats.totalRevenue)} €`,
      trend: "+0%"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Note moyenne",
      value: `${(averageRating || fakeStats.averageRating).toFixed(1)}/5`,
      trend: "+0"
    },
    {
      icon: <Gift className="w-6 h-6 text-purple-500" />,
      title: "Points distribués",
      value: (totalPoints || fakeStats.totalPoints).toLocaleString(),
      trend: "+0%"
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
              <BarChart
                data={
                  barChartData.some(d => d.semaineActuelle > 0 || d.semainePrecedente > 0 || d.ilYA2Semaines > 0)
                    ? barChartData
                    : fakeBarChartData
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="semaineActuelle" fill="#7ebd07" name="Semaine actuelle" radius={[4, 4, 0, 0]} />
                <Bar dataKey="semainePrecedente" fill="#ffcd2a" name="Semaine précédente" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ilYA2Semaines" fill="#8884d8" name="Il y a 2 semaines" radius={[4, 4, 0, 0]} />
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
