import { db } from "@/components/firebase/firebaseConfig"
import { useAuth } from "@/components/firebase/useAuth"
import { arrayUnion, collection, doc, getDoc, getDocs, increment, updateDoc } from "firebase/firestore"
import { useEffect, useState } from 'react'
import { EMOJI_MAP } from "./emojiMapping"

interface Offer {
  id: string
  name: string
  description: string
  type?: string
  discount?: number
  duration?: number
  isBoosted?: boolean
  createdAt?: any
}

const getEmojiForCategory = (category?: string) => {
  if (!category) return "✨"
  return EMOJI_MAP[category.toLowerCase()] || "✨"
}

const CustomerDashboard = () => {
  const { customer, customerData } = useAuth()

  const [offers, setOffers] = useState<Offer[]>([])
  const [showAllOffers, setShowAllOffers] = useState(false)
  const [filter, setFilter] = useState('')
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'offer'))
        const offersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Offer)
        }))
        setOffers(offersList)
      } catch (error) {
        console.error("Erreur lors de la récupération des offres :", error)
      }
    }
    fetchOffers()
  }, [])

  const filteredOffers = offers
    .filter(offer =>
      offer.name.toLowerCase().includes(filter.toLowerCase()) ||
      offer.description.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0))

  const topBoostedOffers = filteredOffers.filter(offer => offer.isBoosted)
  const topMomentOffer = topBoostedOffers.slice(0, 1)
  const otherOffers = filteredOffers.filter(offer => !topMomentOffer.some(mo => mo.id === offer.id))

  const points = customerData?.points || 0
  const level = Math.floor(points / 100) || 0
  const coupons = Math.floor(points / 100) || 0
  const progress = points % 100
  const nextLevelPoints = (level + 1) * 100
  const progressPercentage = (progress / 100) * 100

  const toggleOffers = () => setShowAllOffers(!showAllOffers)

  const openOfferModal = async (offer?: Offer) => {
    if (!offer) return
    setSelectedOffer(offer)
    setIsModalOpen(true)

    try {
      const offerRef = doc(db, "offer", offer.id)
      await updateDoc(offerRef, { views: increment(1) })
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues de l'offre :", error)
    }
  }

  const closeOfferModal = () => {
    setIsModalOpen(false)
    setSelectedOffer(null)
  }

  const addOfferToCustomer = async (offerId: string) => {
    if (!customer) return
    const customerRef = doc(db, "customer", customer.uid)

    try {
      const customerSnap = await getDoc(customerRef)
      const currentOffers = customerSnap.data()?.offers || []

      if (currentOffers.includes(offerId)) {
        alert("Vous avez déjà cette offre !")
        return
      }

      await updateDoc(customerRef, { offers: arrayUnion(offerId) })
      alert("Offre ajoutée avec succès !")
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'offre :", error)
    }
  }

  const hasAddedOffer = (offerId: string) => {
    return customerData?.offers?.includes(offerId)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header avec titre */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#0A2004] text-center">Accueil</h1>
      </div>

      <div className="px-4 space-y-6 max-w-md mx-auto">
        
        {/* ID Client en haut */}
        {customerData?.code && (
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] px-8 py-4 rounded-3xl shadow-xl">
              <p className="text-sm font-medium text-white/90 mb-1">Votre ID Client</p>
              <p className="text-3xl font-bold text-white tracking-wider">{customerData.code}</p>
            </div>
          </div>
        )}
        
        {/* Section Profil avec jauge */}
        <div className="bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-3xl p-6 text-white shadow-xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-bold">
              Bonjour {customerData?.first_name} {customerData?.last_name || "Invité"} !
            </h2>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{points}</div>
              <div className="text-sm opacity-90">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{level}</div>
              <div className="text-sm opacity-90">Niveau</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{coupons}</div>
              <div className="text-sm opacity-90">Bons</div>
            </div>
          </div>

          {/* Jauge de progression */}
          <div className="bg-white/20 rounded-full h-3 mb-2">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-center text-sm opacity-90">
            {progress} / 100 points pour le niveau {level + 1}
          </div>
        </div>

        {/* Section Mes Bons */}
        {coupons > 0 && (
          <div className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] rounded-2xl p-4 text-[#0A2004]">
            <div className="text-center">
              <div className="text-lg font-bold mb-1">Mes Bons Disponibles</div>
              <div className="text-3xl font-bold mb-2">{coupons}</div>
              <div className="text-sm">
                Économisez {coupons * 10}% sur vos prochains achats !
              </div>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Rechercher une offre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7DBD07] focus:border-transparent text-[#0A2004] placeholder-gray-500"
          />
        </div>

        {/* Offre du moment */}
        {topMomentOffer.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#0A2004] mb-3 text-center">⭐ Offre du moment</h2>
            <div
              className="bg-gradient-to-br from-[#FFCD29]/20 to-[#B7DB25]/20 rounded-3xl p-6 border-2 border-[#FFCD29]/30 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => openOfferModal(topMomentOffer[0])}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-[#FFCD29] text-[#0A2004] text-xs px-2 py-1 rounded-full font-bold">
                  PREMIUM
                </span>
              </div>
              <h3 className="font-bold text-[#0A2004] mb-3 text-lg">{topMomentOffer[0].name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{topMomentOffer[0].description}</p>
              {topMomentOffer[0].discount && (
                <div className="mt-4 text-center">
                  <span className="inline-block bg-[#7DBD07] text-white text-sm px-4 py-2 rounded-full font-bold">
                    -{topMomentOffer[0].discount}% de réduction
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Offres en cours */}
        <div>
          <h2 className="text-lg font-bold text-[#0A2004] mb-4 text-center">Offres disponibles</h2>
          <div className="space-y-3">
            {(showAllOffers ? otherOffers : otherOffers.slice(0, 3)).map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-102"
                onClick={() => openOfferModal(offer)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#0A2004] text-lg">{offer.name}</h3>
                  {offer.discount && (
                    <span className="bg-[#7DBD07] text-white text-xs px-3 py-1 rounded-full font-bold">
                      -{offer.discount}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{offer.description}</p>
              </div>
            ))}
          </div>
          
          {otherOffers.length > 3 && (
            <div className="text-center mt-4">
              <button
                onClick={toggleOffers}
                className="px-6 py-2 bg-[#7DBD07] text-white rounded-full font-bold hover:bg-[#6ba006] transition-colors"
              >
                {showAllOffers ? "Voir moins" : `Voir ${otherOffers.length - 3} offres de plus`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal détail offre */}
      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeOfferModal}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center pt-4">
              <h3 className="text-xl font-bold text-[#0A2004] mb-2">{selectedOffer.name}</h3>
              <p className="text-gray-600 mb-4">{selectedOffer.description}</p>
              
              {selectedOffer.discount && (
                <div className="bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white rounded-2xl p-4 mb-4">
                  <div className="text-2xl font-bold">-{selectedOffer.discount}%</div>
                  <div className="text-sm">de réduction</div>
                </div>
              )}
              
              {selectedOffer.duration && (
                <div className="bg-gray-100 rounded-xl p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Durée :</span> {selectedOffer.duration} mois
                  </p>
                </div>
              )}
              
              <button
                onClick={() => addOfferToCustomer(selectedOffer.id)}
                disabled={hasAddedOffer(selectedOffer.id)}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  hasAddedOffer(selectedOffer.id)
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white hover:from-[#6ba006] hover:to-[#7DBD07] active:scale-95 shadow-lg"
                }`}
              >
                {hasAddedOffer(selectedOffer.id) ? "Déjà dans mes offres" : "Ajouter à mes offres"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard