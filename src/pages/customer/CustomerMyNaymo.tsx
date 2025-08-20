import { Bell, TrendingUp, Award, Gift, MapPin, Star, User, Calendar, Phone } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-[#ebffbc]/10 via-white to-[#ebffbc]/20 pb-28">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-[#7ebd07]/20 shadow-xl z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {customerData?.first_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Mon profil Naymo
              </p>
              <p className="text-xs text-gray-500">Niveau {Math.floor((points || 0) / 100)}</p>
            </div>
          </div>
          <img src={logo} alt="Naymo" className="h-8" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-24 pb-10 px-4 space-y-6">
        
        {/* Profil utilisateur */}
        <section className="bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customerData?.first_name} {customerData?.last_name}</h2>
                <p className="text-white/80">Membre depuis {new Date().getFullYear()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Date de naissance</span>
                </div>
                <p className="text-lg font-bold">
                  {customerData?.birth_date 
                    ? new Date(customerData.birth_date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Non renseignée"}
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Téléphone</span>
                </div>
                <p className="text-lg font-bold">{customerData?.phone_number || "Non renseigné"}</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Ville</span>
                </div>
                <p className="text-lg font-bold">{customerData?.city || "Non renseignée"}</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Niveau</span>
                </div>
                <p className="text-lg font-bold">Niveau {Math.floor((points || 0) / 100)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-[#7ebd07]/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#7ebd07]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Points totaux</p>
                <p className="text-2xl font-bold text-gray-900">{points || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bons disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{bonsRestants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bons utilisés</p>
                <p className="text-2xl font-bold text-gray-900">{usedBons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Commerçant préféré</p>
                <p className="text-sm font-bold text-gray-900">
                  {favMerchant ? favMerchant.name : "Aucun"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commerçant préféré détaillé */}
        {favMerchant && (
          <section className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
            <h3 className="text-lg font-bold text-[#396F04] mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Votre commerçant préféré
            </h3>
            <div className="bg-gradient-to-r from-[#ebffbc]/30 to-white rounded-xl p-4 border border-[#7ebd07]/20">
              <h4 className="font-bold text-gray-900 text-lg">{favMerchant.name}</h4>
              <p className="text-[#589507] font-medium">{favMerchant.points} points cumulés</p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default CustomerMyNaymo