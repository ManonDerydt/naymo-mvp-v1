import { Bell, TrendingUp, Award, Users, ShoppingBag } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useAuth } from "@/components/firebase/useAuth"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"

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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc] pb-28">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#396F04] to-[#589507] shadow-lg z-50 flex items-center px-6 py-4">
        <div className="flex-1" />
        <img src={logo} alt="Naymo" className="h-12 mx-auto" />
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <Bell size={24} className="text-[#B7DB25] hover:text-[#FFCD29] transition-colors cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-[#FFCD29] text-[#0A2004] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">2</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-28 px-6 space-y-8 max-w-6xl mx-auto">
        
        {/* En-tête de profil */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#7DBD07] to-[#589507] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-3xl font-bold text-white">{customerData?.first_name?.charAt(0) || 'U'}</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0A2004] mb-2">Mon Profil Naymo</h1>
          <p className="text-[#589507] font-medium">Découvrez vos statistiques et récompenses</p>
        </div>

        {/* Section Points */}
        <section className="bg-white rounded-3xl shadow-xl border border-[#c9eaad]/30 p-8">
          <h2 className="text-2xl font-bold text-[#0A2004] text-center mb-8 flex items-center justify-center">
            <Award className="w-7 h-7 mr-3 text-[#7DBD07]" />
            Vos Récompenses
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte Points */}
            <div className="bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Points totaux</h3>
              <p className="text-3xl font-extrabold text-white mb-2">
                {points !== null ? points : "..."}
              </p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((points || 0) / 500 * 100, 100)}%` }}>
                </div>
              </div>
              <p className="text-xs text-white/80">Prochain niveau: {500 - (points || 0)} points</p>
            </div>

            {/* Carte Bons Restants */}
            <div className="bg-gradient-to-br from-[#FFCD29] to-[#B7DB25] rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-[#0A2004]" />
              </div>
              <h3 className="text-[#0A2004] font-bold text-lg mb-2">Bons disponibles</h3>
              <p className="text-3xl font-extrabold text-[#0A2004] mb-2">
                {bonsRestants}
              </p>
              <p className="text-xs text-[#396F04] font-medium">1 bon = 100 points</p>
            </div>

            {/* Carte Bons utilisés */}
            <div className="bg-gradient-to-br from-[#589507] to-[#396F04] rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Bons utilisés</h3>
              <p className="text-3xl font-extrabold text-white mb-2">
                {usedBons}
              </p>
              <p className="text-xs text-white/80">Total économisé</p>
            </div>

            {/* Carte Commerçant préféré */}
            <div className="bg-gradient-to-br from-[#396F04] to-[#0A2004] rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-200 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Commerçant préféré</h3>
              {favMerchant ? (
                <>
                  <p className="text-xl font-bold text-[#B7DB25] mb-1">{favMerchant.name}</p>
                  <p className="text-sm text-white/80">
                    {favMerchant.points} points cumulés
                  </p>
                </>
              ) : (
                <p className="text-white/60 italic text-sm">Aucun point attribué</p>
              )}
            </div>

            {/* Carte Niveau */}
            <div className="bg-gradient-to-br from-[#B7DB25] to-[#7DBD07] rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#0A2004]">#{Math.floor((points || 0) / 100) + 1}</span>
              </div>
              <h3 className="text-[#0A2004] font-bold text-lg mb-2">Votre niveau</h3>
              <p className="text-3xl font-extrabold text-[#0A2004] mb-2">
                Niveau {Math.floor((points || 0) / 100) + 1}
              </p>
              <div className="flex items-center justify-center">
                <span className="text-[#396F04] font-semibold text-sm">Fidèle client</span>
              </div>
            </div>

            {/* Carte Historique */}
            <div className="bg-gradient-to-br from-[#ebffbc] to-[#c9eaad] rounded-2xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="w-16 h-16 bg-[#396F04]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#396F04]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-[#0A2004] font-bold text-lg mb-2">Historique détaillé</h3>
              <p className="text-sm text-[#589507] font-medium underline">Voir tous les détails</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CustomerMyNaymo