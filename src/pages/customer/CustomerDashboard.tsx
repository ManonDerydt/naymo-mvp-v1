import { db } from "@/components/firebase/firebaseConfig"
import { useAuth } from "@/components/firebase/useAuth"
import { arrayUnion, collection, doc, getDoc, getDocs, increment, updateDoc } from "firebase/firestore"
import { useEffect, useState } from 'react'
import { Star, Gift, MapPin } from "lucide-react"
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
  const [showCoupons, setShowCoupons] = useState(false)
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

  const address = customerData?.city || "Torvegade 49, 1400 Copenhagen, Denmark"
  const points = customerData?.points || 0
  const level = Math.floor(points / 100) || 0
  const challengesLeft = customerData?.challengesLeft || 0
  const coupons = Math.floor(points / 100) || 0
  const discount = coupons * 10 || 0
  const progress = points % 100

  const toggleOffers = () => setShowAllOffers(!showAllOffers)
  const toggleCoupons = () => setShowCoupons(!showCoupons)

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Titre principal */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#0A2004] text-center">Accueil</h1>
      </div>

      {/* SECTION PROFIL */}
      <div className="flex justify-center px-4 mb-6">
        <div className="w-full max-w-md bg-gradient-to-br from-[#FFCD29]/20 to-[#B7DB25]/20 rounded-3xl shadow-xl border border-[#FFCD29]/30 p-6">
          <div className="flex items-center gap-4">
            <img
              src={customerData?.profilePicture || "https://ui-avatars.com/api/?name=User"}
              alt="Profil"
              className="w-16 h-16 rounded-full border-2 border-[#0A2004]/10"
            />
            <div>
              <h2 className="text-xl font-bold text-[#0A2004]">
                {customerData?.firstName || "Invité"}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin size={14} />
                {address}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-center">
            <div>
              <p className="text-lg font-bold text-[#0A2004]">{points}</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#0A2004]">{level}</p>
              <p className="text-sm text-gray-600">Niveau</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#0A2004]">{challengesLeft}</p>
              <p className="text-sm text-gray-600">Défis restants</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION OFFRE DU MOMENT */}
      {topMomentOffer.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold text-[#0A2004] text-center mb-4">🌟 Offre du moment</h2>
          <div
            className="max-w-md mx-auto bg-gradient-to-br from-[#FFCD29]/20 to-[#B7DB25]/20 rounded-3xl shadow-xl border-2 border-[#FFCD29]/30 p-6 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={() => openOfferModal(topMomentOffer[0])}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{getEmojiForCategory(topMomentOffer[0].type)}</span>
              <span className="bg-[#FFCD29] text-[#0A2004] text-xs px-2 py-1 rounded-full font-semibold">
                BOOSTED
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#0A2004] mb-1">{topMomentOffer[0].name}</h3>
            <p className="text-sm text-gray-600 mb-2">{topMomentOffer[0].description}</p>
          </div>
        </div>
      )}

      {/* SECTION OFFRES EN COURS */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-[#0A2004] text-center mb-4">🔥 Offres en cours</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {(showAllOffers ? otherOffers : otherOffers.slice(0, 2)).map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => openOfferModal(offer)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{getEmojiForCategory(offer.type)}</span>
              </div>
              <h3 className="text-lg font-bold text-[#0A2004] mb-1">{offer.name}</h3>
              <p className="text-sm text-gray-600">{offer.description}</p>
            </div>
          ))}
        </div>
        {otherOffers.length > 2 && (
          <div className="text-center mt-4">
            <button
              onClick={toggleOffers}
              className="px-4 py-2 bg-[#FFCD29] text-[#0A2004] rounded-full font-semibold shadow hover:scale-105 transition-transform"
            >
              {showAllOffers ? "Voir moins" : "Voir plus"}
            </button>
          </div>
        )}
      </div>

      {/* SECTION OFFRES BOOSTÉES */}
      {topBoostedOffers.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold text-[#0A2004] text-center mb-4">🚀 Offres boostées</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {topBoostedOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-gradient-to-br from-[#FFCD29]/20 to-[#B7DB25]/20 rounded-2xl shadow-lg border-2 border-[#FFCD29]/30 p-4 cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => openOfferModal(offer)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{getEmojiForCategory(offer.type)}</span>
                  <span className="bg-[#FFCD29] text-[#0A2004] text-xs px-2 py-1 rounded-full font-semibold">
                    BOOSTED
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0A2004] mb-1">{offer.name}</h3>
                <p className="text-sm text-gray-600">{offer.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DÉTAIL OFFRE */}
      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeOfferModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✖
            </button>
            <div className="text-center">
              <span className="text-4xl">{getEmojiForCategory(selectedOffer.type)}</span>
              <h3 className="text-2xl font-bold text-[#0A2004] mt-2">{selectedOffer.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{selectedOffer.description}</p>
              {selectedOffer.discount && (
                <p className="text-lg font-semibold text-green-600 mt-3">
                  -{selectedOffer.discount}%
                </p>
              )}
              <button
                onClick={() => addOfferToCustomer(selectedOffer.id)}
                disabled={hasAddedOffer(selectedOffer.id)}
                className={`mt-4 px-6 py-2 rounded-full font-semibold shadow ${
                  hasAddedOffer(selectedOffer.id)
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#FFCD29] text-[#0A2004] hover:scale-105 transition-transform"
                }`}
              >
                {hasAddedOffer(selectedOffer.id) ? "Déjà ajoutée" : "Ajouter à mes offres"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard
