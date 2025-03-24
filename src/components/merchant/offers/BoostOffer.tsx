import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'

type Step = 'select' | 'payment' | 'success'

interface Offer {
  id: string
  name: string
}

const BoostOffer = () => {
  const [step, setStep] = useState<Step>('select')
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchOffers = async () => {
      const user = auth.currentUser

      if (!user) return

      try {
        // Requête pour récupérer les IDs des offres liées au commerçant
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

        // Requête pour récupérer les offres en fonction des IDs récupérés
        const offersQuery = query(collection(db, 'offer'), where('__name__', 'in', offerIds))
        const offersSnapshot = await getDocs(offersQuery)

        const fetchedOffers = offersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Offer[]

        setOffers(fetchedOffers)
      } catch (error) {
        console.error('Erreur lors de la récupération des offres :', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  const handlePayment = async () => {
    // TODO: Implement payment logic
    const user = auth.currentUser
    if (!user || !selectedOffer) return

    try {
      // Mise à jour du document de l'offre sélectionnée dans la colelction 'offer'
      const offerRef = doc(db, 'offer', selectedOffer)

      // Mettre à jour le champ isBoosted à true
      await updateDoc(offerRef, {
        isBoosted: true
      })

      // Passe à l'étape de succès
      setStep('success') 
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'offre :', error)
    }
  }

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Votre offre a été boostée !</h3>
        <p className="mt-2 text-sm text-gray-500">
          Votre offre sera mise en avant auprès de vos clients potentiels.
        </p>
        <Button
          onClick={() => setStep('select')}
          className="mt-6"
        >
          Booster une autre offre
        </Button>
      </div>
    )
  }

  if (step === 'payment') {
    const offer = offers.find(o => o.id === selectedOffer)
    return (
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Paiement</h3>
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-500">Offre sélectionnée</p>
          <p className="font-medium mt-1">{offer?.name}</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Numéro de carte
            </label>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="4242 4242 4242 4242"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date d'expiration
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="MM/YY"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                CVC
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="123"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setStep('select')}
          >
            Retour
          </Button>
          <Button onClick={handlePayment}>
            Confirmer le paiement
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Sélectionnez l'offre à booster
      </h3>
      
      <div className="space-y-4">
        {loading ? (
          <p>Chargement des offres...</p>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedOffer === offer.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-500'
              }`}
              onClick={() => setSelectedOffer(offer.id)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={selectedOffer === offer.id}
                  onChange={() => setSelectedOffer(offer.id)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="font-medium">{offer.name}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => setStep('payment')}
          disabled={!selectedOffer}
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}

export default BoostOffer