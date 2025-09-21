import { Bell } from "lucide-react"
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
        // Requête pour récupérer les documents de pointsHistory pour le client
        const q = query(
          collection(db, "pointsHistory"),
          where("customerId", "==", customer.uid)
        );
        const snap = await getDocs(q);

        // Cumuler les pointsAdded par merchantId
        const pointsByMerchant: Record<string, number> = {};

        snap.forEach((doc) => {
          const data = doc.data();
          const merchantId = data.merchantId;
          const pointsAdded = data.pointsAdded || 0;

          pointsByMerchant[merchantId] = (pointsByMerchant[merchantId] || 0) + pointsAdded;
        });

        // Si aucun point n'a été trouvé, définir favMerchant à null
        const entries = Object.entries(pointsByMerchant);
        if (entries.length === 0) {
          setFavMerchant(null);
          return;
        }

        // Trouver le commerçant avec le plus de points
        const [topMerchantId, topPoints] = entries.reduce((acc, curr) =>
          curr[1] > acc[1] ? curr : acc
        );

        // Récupérer le nom du commerçant
        const merchantDoc = await getDoc(doc(db, "merchant", topMerchantId));
        const merchantName = merchantDoc.exists()
          ? merchantDoc.data().owner_name || "Commerçant inconnu"
          : "Commerçant inconnu";

        // Mettre à jour l'état favMerchant
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
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-[#032313] border-b shadow-sm z-50 flex items-center px-4 py-3">
        <div className="flex-1" />
        <img src={logo} alt="Naymo" className="h-10 mx-auto" />
        <div className="flex-1 flex justify-end">
          {/* <div className="relative">
            <Bell size={24} className="text-green-500 fill-current" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
          </div> */}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-24 px-6 space-y-10 max-w-5xl mx-auto">
        
        {/* Section Points - Nouveau style */}
        <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Vos points</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Carte Points */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-purple-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-purple-500 w-3 h-3 rounded-full"></div>
                <p className="text-purple-700 font-semibold text-lg">Nombre de points</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">
                {points !== null ? points : "Chargement..."}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                  style={{ width: '75%' }}>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Prochain niveau: 200 points</p>
            </div>

            {/* Carte Bons Restants */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-blue-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
                <p className="text-blue-700 font-semibold text-lg">Bons restants</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">
                {bonsRestants}
              </p>
              <p className="text-xs text-gray-500 mt-2">1 bon = 100 points</p>
            </div>

            {/* Carte Bons utilisés */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-blue-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
                <p className="text-blue-700 font-semibold text-lg">Bons utilisés</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">
                {usedBons > 0 ? usedBons : "Aucun bon utilisé"}
              </p>
            </div>

            {/* Carte Commerçant préféré */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-green-600 w-3 h-3 rounded-full" />
                <p className="text-green-700 font-semibold text-lg">Votre commerçant préféré</p>
              </div>

              {favMerchant ? (
                <>
                  <p className="text-2xl font-bold text-gray-900">{favMerchant.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {favMerchant.points} points cumulés
                  </p>
                </>
              ) : (
                <p className="text-gray-500 italic">Aucun point attribué pour l’instant</p>
              )}
            </div>

            {/* Carte Vues */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                <p className="text-green-700 font-semibold text-lg">Nombre de vues</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">567</p>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 font-semibold">+12%</span>
                <span className="text-gray-500 text-sm ml-2">vs mois dernier</span>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-yellow-500 w-3 h-3 rounded-full"></div>
                <p className="text-yellow-700 font-semibold text-lg">Historique de points</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-yellow-600 font-medium mt-2 underline">Voir détails</p>
            </div>

            {/* Achats */}
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-pink-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-pink-500 w-3 h-3 rounded-full"></div>
                <p className="text-pink-700 font-semibold text-lg">Nombre d'achats</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">12</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                  Top 20%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ... le reste de votre code ... */}
      </div>
    </div>
  )
}

export default CustomerMyNaymo