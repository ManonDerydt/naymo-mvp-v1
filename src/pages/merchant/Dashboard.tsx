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

/** Formate un montant : entier → « 48 », décimal → « 43,20 » */
const formatCurrency = (amount: number) =>
  Number.isInteger(amount)
    ? amount.toLocaleString("fr-FR", { minimumFractionDigits: 0 })
    : amount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const Dashboard = () => {
  const { merchant } = useAuth()
  const [showTutorialModal, setShowTutorialModal] = useState(false)

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
      setTotalRevenue(revenue);           // chiffre d'affaires cumulé
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
    }
  ]

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
          Sur votre tableau de bord Naymo, vous visualisez en un clin d'œil vos chiffres clés et gérez facilement votre activité au quotidien.
        </p>
      </div>
      <div className="space-y-4 lg:space-y-6">
        {/* Stats compactes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Layout principal optimisé */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Générateur de code - réduit de moitié */}
          <div>
            <CodeGenerator />
          </div>
          
          {/* Bouton Tutoriel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="flex flex-col lg:flex-row items-center justify-center mb-4">
                <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-[#c9eaad]/20 to-[#7ebd07]/20 mb-2 lg:mb-0 lg:mr-3">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#7ebd07]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-center lg:text-left">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">Tutoriel Vidéo</h2>
                  <p className="text-xs lg:text-sm text-gray-500">Apprenez à utiliser Naymo efficacement</p>
                </div>
              </div>
            <button
              onClick={() => setShowTutorialModal(true)}
              className="bg-gradient-to-r from-[#7fbd07] to-[#6ba006] text-white px-4 lg:px-8 py-3 lg:py-4 rounded-2xl font-bold text-sm lg:text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 lg:space-x-3 w-full justify-center"
            >
              <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Regarder la vidéo</span>
            </button>
            </div>
          </div>
        </div>

        {/* Graphiques en dessous */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-2">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Comparaison des points attribués</h2>
                <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
                  <div className="w-3 h-3 bg-[#7ebd07] rounded-full"></div>
                  <span>Cette semaine</span>
                  <div className="w-3 h-3 bg-[#ffcd2a] rounded-full ml-4"></div>
                  <span>Semaine précédente</span>
                </div>
              </div>
              <div className="h-80 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
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

          <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-2">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Points distribués par jour</h2>
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#c9eaad]/20 to-[#7ebd07]/20">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#7ebd07]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="h-80 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="semaineActuelle" fill="#7fbd07" name="Points distribués" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </div>
          </div>
        </div>
      </div>

      {/* Modale Tutoriel */}
      {showTutorialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[95vh] lg:max-h-[90vh] overflow-hidden relative">
            <button
              onClick={() => setShowTutorialModal(false)}
              className="absolute top-2 lg:top-4 right-2 lg:right-4 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 transition-all shadow-lg text-sm lg:text-base"
            >
              ✕
            </button>
            
            <div className="p-4 lg:p-6">
              <h2 className="text-xl lg:text-2xl font-bold text-[#0A2004] mb-4 lg:mb-6 text-center">Tutoriel Naymo</h2>
              
              <div className="aspect-video bg-gray-100 rounded-xl lg:rounded-2xl overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/zoFnEF-A7kQ"
                  title="Tutoriel Naymo"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
              
              <div className="mt-4 lg:mt-6 text-center">
                <h3 className="text-base lg:text-lg font-bold text-[#0A2004] mb-2">
                  Comment utiliser Naymo efficacement
                </h3>
                <p className="text-sm lg:text-base text-[#589507] leading-relaxed">
                  Découvrez toutes les fonctionnalités de votre tableau de bord et optimisez votre relation client avec Naymo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard