import { Bell } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useAuth } from "@/components/firebase/useAuth"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"

interface Offer {
  id: string
  name: string
  description: string
  discount?: number
  duration?: number
  type?: string
}

const CustomerMyNaymo = () => {
  const { customer, customerData } = useAuth()
  const [points, setPoints] = useState<number | null>(null)
  const [favMerchant, setFavMerchant] = useState<{id: string; name: string; points: number} | null>(null)
  const [usedBons, setUsedBons] = useState<number>(0)
  const [myOffers, setMyOffers] = useState<Offer[]>([])

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
  
  // Récupérer les offres du client
  useEffect(() => {
    const fetchMyOffers = async () => {
      if (!customer?.uid || !customerData?.offers) return

      try {
        const offerPromises = customerData.offers.map(async (offerId: string) => {
          const offerDoc = await getDoc(doc(db, "offer", offerId))
          if (offerDoc.exists()) {
            return { id: offerDoc.id, ...offerDoc.data() } as Offer
          }
          return null
        })

        const offers = await Promise.all(offerPromises)
        const validOffers = offers.filter(offer => offer !== null) as Offer[]
        setMyOffers(validOffers)
      } catch (error) {
        console.error("Erreur lors de la récupération des offres :", error)
      }
    }

    fetchMyOffers()
  }, [customer, customerData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc] pb-28">
      {/* Titre principal */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-[#0A2004] text-center mb-2">Mon Profil</h1>
        <p className="text-[#589507] text-center">Gérez vos informations et vos offres</p>
      </div>

      {/* Contenu principal */}
      <div className="px-4 space-y-6 max-w-md mx-auto">
        
        {/* Section Points */}
        <section className="bg-white rounded-3xl shadow-xl p-6 border border-[#c9eaad]/30">
          <h2 className="text-2xl font-bold text-[#0A2004] text-center mb-6">Mes Points</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Carte Points */}
            <div className="bg-gradient-to-br from-[#7DBD07]/10 to-[#B7DB25]/10 rounded-2xl p-4 text-center border border-[#7DBD07]/20">
              <p className="text-[#589507] font-semibold text-sm mb-2">Points</p>
              <p className="text-3xl font-bold text-[#0A2004]">
                {points !== null ? points : "Chargement..."}
              </p>
            </div>

            {/* Carte Bons Restants */}
            <div className="bg-gradient-to-br from-[#FFCD29]/10 to-[#B7DB25]/10 rounded-2xl p-4 text-center border border-[#FFCD29]/20">
              <p className="text-[#589507] font-semibold text-sm mb-2">Bons</p>
              <p className="text-3xl font-bold text-[#0A2004]">
                {bonsRestants}
              </p>
            </div>

            {/* Carte Bons utilisés */}
            <div className="bg-gradient-to-br from-[#589507]/10 to-[#396F04]/10 rounded-2xl p-4 text-center border border-[#589507]/20">
              <p className="text-[#589507] font-semibold text-sm mb-2">Bons utilisés</p>
              <p className="text-3xl font-bold text-[#0A2004]">
                {usedBons}
              </p>
            </div>

            {/* Carte Commerçant préféré */}
            <div className="col-span-2 bg-gradient-to-br from-[#396F04]/10 to-[#0A2004]/10 rounded-2xl p-4 text-center border border-[#396F04]/20">
              <p className="text-[#589507] font-semibold text-sm mb-2">Commerçant préféré</p>
              {favMerchant ? (
                <>
                  <p className="text-lg font-bold text-[#0A2004]">{favMerchant.name}</p>
                  <p className="text-sm text-[#589507] mt-1">
                    {favMerchant.points} points cumulés
                  </p>
                </>
              ) : (
                <p className="text-[#589507] italic">Aucun favori</p>
              )}
            </div>
          </div>
        </section>

        {/* Section Mes Offres */}
        <section className="bg-white rounded-3xl shadow-xl p-6 border border-[#c9eaad]/30">
          <h2 className="text-2xl font-bold text-[#0A2004] text-center mb-6">Mes Offres</h2>
          
          {myOffers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#ebffbc] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#589507]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#396F04] mb-2">Aucune offre</h3>
              <p className="text-[#589507]">Explorez les offres disponibles sur l'accueil !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOffers.map((offer) => (
                <div key={offer.id} className="bg-gradient-to-r from-[#f8fdf4] to-[#ebffbc] rounded-2xl p-4 border border-[#c9eaad]/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#0A2004] mb-2">{offer.name}</h3>
                      <p className="text-sm text-[#589507] mb-3 leading-relaxed">{offer.description}</p>
                      {offer.duration && (
                        <p className="text-xs text-[#396F04] font-medium">
                          Durée : {offer.duration} mois
                        </p>
                      )}
                    </div>
                    {offer.discount && (
                      <div className="ml-4">
                        <span className="bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{offer.discount}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default CustomerMyNaymo