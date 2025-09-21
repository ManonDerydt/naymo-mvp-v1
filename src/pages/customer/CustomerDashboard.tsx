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
  createdAt?: any // Firestore Timestamp
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

  // Filtrer et trier les offres
  const filteredOffers = offers
    .filter(offer =>
      offer.name.toLowerCase().includes(filter.toLowerCase()) ||
      offer.description.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0))

  const topBoostedOffers = filteredOffers.filter(offer => offer.isBoosted)
  const topMomentOffer = topBoostedOffers.slice(0, 1)
  const otherOffers = filteredOffers.filter(offer => !topMomentOffer.some(mo => mo.id === offer.id))

  // Variables fictives pour l'exemple
  const address = customerData?.city || "Torvegade 49, 1400 Copenhagen, Denmark"
  const points = customerData?.points || 0
  const level = Math.floor(points / 100) || 0
  const challengesLeft = customerData?.challengesLeft || 0
  const coupons = Math.floor(points / 100) || 0
  const discount = coupons * 10 || 0
  const progress = points % 100

  const toggleOffers = () => setShowAllOffers(!showAllOffers)
  const [showCoupons, setShowCoupons] = useState(false)
  const toggleCoupons = () => setShowCoupons(!showCoupons)

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        {/* ... ton code profil inchangé ... */}
      </div>

      {/* SECTION OFFRE DU MOMENT */}
      {topMomentOffer.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold text-[#0A2004] text-center mb-4">🌟 Offre du moment</h2>
          <div
            className="max-w-md mx-auto bg-gradient-to-br from-[#FFCD29]/20 to-[#B7DB25]/20 rounded-3xl shadow-xl border-2 border-[#FFCD29]/30 p-6 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={() => openOfferModal(topMomentOffer[0])}
          >
            {/* ... ton rendu de l’offre du moment ... */}
          </div>
        </div>
      )}

      {/* SECTION OFFRES EN COURS */}
      {/* ... ton code existant, inchangé ... */}

      {/* SECTION OFFRES BOOSTÉES */}
      {/* ... ton code existant, inchangé ... */}

      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* ... ton modal existant, inchangé ... */}
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard
