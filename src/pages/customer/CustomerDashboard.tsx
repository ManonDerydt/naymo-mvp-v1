import { db } from "@/components/firebase/firebaseConfig"
import { useAuth } from "@/components/firebase/useAuth"
import { arrayUnion, collection, doc, getDoc, getDocs, increment, updateDoc } from "firebase/firestore"
import { useEffect, useState } from 'react'
import { EMOJI_MAP } from "./emojiMapping"
import { TrendingUp, Users, Star, Gift } from 'lucide-react'

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
    return customerData?.offers?.includes(offerId) || false
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      {/* ID Client en haut */}
      {customerData?.code && (
        <div className="text-center pb-6">
          <div className="inline-block bg-white px-4 sm:px-8 py-3 sm:py-4 rounded-3xl shadow-lg border border-gray-200 mx-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Votre ID Client</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-wider">{customerData.code}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Carte principale des points - Style moderne */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{points} points</h1>
              <p className="text-gray-500">Mes points fidélité</p>
            </div>
          </div>
          
          {/* Badge temps réel */}
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            • Temps réel
          </div>

          {/* Barre de progression vers le prochain niveau */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progression vers le niveau {level + 1}</span>
              <span>{progress}/100 points</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Statistiques en grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Clients fidèles */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{level}</div>
                <div className="text-gray-500 text-sm">Niveau actuel</div>
              </div>
            </div>
            <div className="text-blue-600 text-sm font-medium">
              {Math.floor(points / 50)} récompenses débloquées
            </div>
          </div>

          {/* Note globale */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{coupons}</div>
                <div className="text-gray-500 text-sm">Bons disponibles</div>
              </div>
            </div>
            <div className="text-yellow-600 text-sm font-medium">
              Économisez {coupons * 10}% sur vos achats
            </div>
          </div>
        </div>

        {/* Section Offres disponibles */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <Gift className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Offres disponibles</h2>
          </div>

          {/* Barre de recherche moderne */}
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Rechercher une offre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Offre du moment */}
          {topMomentOffer.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-600">Offre mise en avant</span>
              </div>
              <div
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => openOfferModal(topMomentOffer[0])}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{topMomentOffer[0].name}</h3>
                  {topMomentOffer[0].discount && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      -{topMomentOffer[0].discount}%
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{topMomentOffer[0].description}</p>
              </div>
            </div>
          )}

          {/* Autres offres */}
          <div className="space-y-3">
            {(showAllOffers ? otherOffers : otherOffers.slice(0, 3)).map((offer) => (
              <div
                key={offer.id}
                className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200 border border-gray-100"
                onClick={() => openOfferModal(offer)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                  {offer.discount && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      -{offer.discount}%
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{offer.description}</p>
              </div>
            ))}
          </div>
          
          {otherOffers.length > 3 && (
            <div className="text-center mt-4">
              <button
                onClick={toggleOffers}
                className="text-green-600 font-medium text-sm hover:text-green-700 transition-colors"
              >
                {showAllOffers ? "Voir moins" : `Voir ${otherOffers.length - 3} offres de plus`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal détail offre - Style moderne */}
      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeOfferModal}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedOffer.name}</h3>
              <p className="text-gray-600 leading-relaxed">{selectedOffer.description}</p>
            </div>
              
            {selectedOffer.discount && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">-{selectedOffer.discount}%</div>
                  <div className="text-green-600 text-sm">de réduction</div>
                </div>
              </div>
            )}
              
            {selectedOffer.duration && (
              <div className="mb-6">
                <p className="text-gray-600">
                  <span className="font-medium">Durée :</span> {selectedOffer.duration} mois
                </p>
              </div>
            )}
              
            <button
              onClick={() => addOfferToCustomer(selectedOffer.id)}
              disabled={hasAddedOffer(selectedOffer.id)}
              className={`w-full py-3 rounded-2xl font-medium transition-all ${
                hasAddedOffer(selectedOffer.id)
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
              }`}
            >
              {hasAddedOffer(selectedOffer.id) ? "Offre déjà ajoutée" : "Ajouter cette offre"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard