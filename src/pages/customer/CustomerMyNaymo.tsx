import { Bell } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useAuth } from "@/components/firebase/useAuth"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"
import { TrendingUp, Users, Star, Award } from 'lucide-react'

const CustomerMyNaymo = () => {
  const { customer, customerData } = useAuth()
  const [points, setPoints] = useState<number | null>(null)
  const [favMerchant, setFavMerchant] = useState<{id: string; name: string; points: number} | null>(null)
  const [usedBons, setUsedBons] = useState<number>(0)

  const bonsRestants = points !== null ? Math.floor(points / 100) : 0

  useEffect(() => {
    const fetchPoints = async () => {
      if (customer?.uid) {
        const docRef = doc(db, "customer", customer.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPoints(data.points || 0)
        } else {
          console.warn("Aucun document trouvé pour l'utilisateur")
          setPoints(0)
        }
      }
    }

    fetchPoints()
  }, [customer])

  useEffect(() => {
    const fetchFavMerchant = async () => {
      if (!customer?.uid) return;

      try {
        const q = query(
          collection(db, "pointsHistory"),
          where("customerId", "==", customer.uid)
        );
        const snap = await getDocs(q);

        const pointsByMerchant: Record<string, number> = {};

        snap.forEach((doc) => {
          const data = doc.data();
          const merchantId = data.merchantId;
          const pointsAdded = data.pointsAdded || 0;

          pointsByMerchant[merchantId] = (pointsByMerchant[merchantId] || 0) + pointsAdded;
        });

        const entries = Object.entries(pointsByMerchant);
        if (entries.length === 0) {
          setFavMerchant(null);
          return;
        }

        const [topMerchantId, topPoints] = entries.reduce((acc, curr) =>
          curr[1] > acc[1] ? curr : acc
        );

        const merchantDoc = await getDoc(doc(db, "merchant", topMerchantId));
        const merchantName = merchantDoc.exists()
          ? merchantDoc.data().company_name || "Commerçant inconnu"
          : "Commerçant inconnu";

        setFavMerchant({ id: topMerchantId, name: merchantName, points: topPoints });
      } catch (error) {
        console.error("Erreur lors de la récupération du commerçant préféré :", error);
        setFavMerchant(null);
      }
    };

    fetchFavMerchant();
  }, [customer]);

  useEffect(() => {
    const fetchUsedBons = async () => {
      if (!customer?.uid) return

      try {
        const q = query(collection(db, "pointsHistory"), where("customerId", "==", customer.uid))
        const snap = await getDocs(q)

        let totalUsedBons = 0

        snap.forEach(doc => {
          const data = doc.data()
          const bons = data.usedBons || 0
          totalUsedBons += bons
        })

        setUsedBons(totalUsedBons)
      } catch (error) {
        console.error("Erreur lors de la récupération des usedBons :", error)
      }
    }

    fetchUsedBons()
  }, [customer])
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ID Client en haut */}
      {customerData?.code && (
        <div className="text-center py-6">
          <div className="inline-block bg-gradient-to-br from-white to-gray-50 px-6 sm:px-10 py-4 sm:py-6 rounded-3xl shadow-xl border border-gray-100 mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7DBD07] to-[#B7DB25]"></div>
            <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#396F04] uppercase tracking-wide">Votre ID Client</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#0A2004] tracking-widest font-mono bg-gradient-to-r from-[#0A2004] to-[#396F04] bg-clip-text text-transparent">
              {customerData.code}
            </p>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#B7DB25]/20 to-[#7DBD07]/20 rounded-full"></div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Carte principale des points */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {points !== null ? points : "..."} points
              </h1>
              <p className="text-gray-500">Mes points fidélité</p>
            </div>
          </div>
          
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            • Temps réel
          </div>
        </div>

        {/* Statistiques en grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bons disponibles */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{bonsRestants}</div>
                <div className="text-gray-500 text-sm">Bons disponibles</div>
              </div>
            </div>
            <div className="text-blue-600 text-sm font-medium">
              {bonsRestants} réductions utilisables
            </div>
          </div>

          {/* Bons utilisés */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{usedBons}</div>
                <div className="text-gray-500 text-sm">Bons utilisés</div>
              </div>
            </div>
            <div className="text-yellow-600 text-sm font-medium">
              Économies réalisées
            </div>
          </div>
        </div>

        {/* Commerçant préféré */}
        {favMerchant && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Mon commerçant préféré</h2>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-lg font-bold text-gray-900 mb-1">{favMerchant.name}</div>
              <div className="text-gray-500 text-sm">{favMerchant.points} points cumulés</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerMyNaymo