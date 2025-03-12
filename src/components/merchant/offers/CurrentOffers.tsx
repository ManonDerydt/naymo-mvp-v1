import { useEffect, useState } from 'react'
import { Eye, ShoppingBag, TrendingUp } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/components/firebase/firebaseConfig'

type Offer = {
  id: string
  name: string
  description: string
  views: number
  revenue: string
  purchases: number
}

const CurrentOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffers = async () => {
      const user = auth.currentUser

      if (!user) return

      try {
        const merchantOfferQuery = query(
          collection(db, 'merchant_has_offer'),
          where('merchant_id', '==', user.uid)
        )
        const merchantOfferSnapshot = await getDocs(merchantOfferQuery)

        const offerIds = merchantOfferSnapshot.docs
          .map(doc => doc.data().offer_id)
          .filter(Boolean)

        if (offerIds.length === 0) {
          setOffers([])
          return
        }

        const offersQuery = query(collection(db, 'offer'), where('__name__', 'in', offerIds))
        const offersSnapshot = await getDocs(offersQuery)

        const fetchedOffers = offersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Offer[]

        setOffers(fetchedOffers)
      } catch (error) {
        console.error("Erreur lors de la récupération des offres :", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-500">Chargement des offres...</p>
  }

  if (offers.length === 0) {
    return <p className="text-center text-gray-500">Aucune offre disponible.</p>
  }

  return (
    <div className="space-y-6">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{offer.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vues</p>
                <p className="text-lg font-semibold">{offer.views || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">CA généré</p>
                <p className="text-lg font-semibold">{offer.revenue || "0 €"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Achats</p>
                <p className="text-lg font-semibold">{offer.purchases || 0}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CurrentOffers
