import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { addDoc, collection, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { useAuth } from '@/components/firebase/useAuth'

type Step = 'form' | 'summary' | 'success'

const CreateOffer = () => {
  const { merchant } = useAuth()
  const [step, setStep] = useState<Step>('form')
  const [canCreateOffer, setCanCreateOffer] = useState(true)
  const [daysToWait, setDaysToWait] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    duration: 0,
    target: '',
    description: '',
    discount: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vérifier si l'utilisateur peut créer une nouvelle offre
  const checkCanCreateOffer = async () => {
    if (!merchant?.uid) return

    try {
      // Récupérer les offres du marchand des 30 derniers jours
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const merchantOffersQuery = query(
        collection(db, 'merchant_has_offer'),
        where('merchant_id', '==', merchant.uid)
      )
      const merchantOffersSnapshot = await getDocs(merchantOffersQuery)
      const offerIds = merchantOffersSnapshot.docs.map(doc => doc.data().offer_id)

      if (offerIds.length > 0) {
        const recentOffersQuery = query(
          collection(db, 'offer'),
          where('__name__', 'in', offerIds),
          where('createdAt', '>', thirtyDaysAgo),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
        const recentOffersSnapshot = await getDocs(recentOffersQuery)

        if (!recentOffersSnapshot.empty) {
          const lastOffer = recentOffersSnapshot.docs[0]
          const lastOfferDate = lastOffer.data().createdAt?.toDate()
          
          if (lastOfferDate) {
            const daysSinceLastOffer = Math.floor((new Date().getTime() - lastOfferDate.getTime()) / (1000 * 60 * 60 * 24))
            const remainingDays = 30 - daysSinceLastOffer
            
            if (remainingDays > 0) {
              setCanCreateOffer(false)
              setDaysToWait(remainingDays)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
    }
  }

  // Vérifier au chargement du composant
  React.useEffect(() => {
    checkCanCreateOffer()
  }, [merchant])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreateOffer) return
    setStep('summary')
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("Vous devez être connecté pour créer une offre")
      }

      const offerRef = collection(db, "offer")
      const offerData: any = {
        ...formData,
        isBoosted: false,
        createdAt: serverTimestamp(),
      }

      // Supprimer le champ discount s'il est vide
      if (formData.discount !== '') {
        offerData.discount = Number(formData.discount)
      } else {
        delete offerData.discount
      }

      const offerDoc = await addDoc(offerRef, offerData)

      const merchantHasOfferRef = collection(db, "merchant_has_offer")
      await addDoc(merchantHasOfferRef, {
        merchant_id: user.uid,
        offer_id: offerDoc.id
      })

      console.log("Offre enregistrée avec succès !")
      setStep('success')
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement :", err);
      setError("Une erreur est survenue lors de la création de l'offre.")
    } finally {
      setLoading(false)
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
        <h3 className="text-lg font-medium text-gray-900">Une offre a été créée !</h3>
        <p className="mt-2 text-sm text-gray-500">
          Votre offre est maintenant visible par vos clients.
        </p>
        <Button
          onClick={() => {
            setFormData({ name: '', duration: 0, target: '', description: '', discount: '' })
            setStep('form')
          }}
          className="mt-6"
        >
          Créer une nouvelle offre
        </Button>
      </div>
    )
  }

  if (step === 'summary') {
    return (
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Récapitulatif de l'offre</h3>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nom de l'offre</p>
            <p className="mt-1">{formData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Durée (en mois)</p>
            <p className="mt-1">{formData.duration}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cible</p>
            <p className="mt-1">{formData.target}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1">{formData.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Réduction (%)</p>
            <p className="mt-1">{formData.discount ? `${formData.discount}%` : "Aucune"}</p>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setStep('form')}
          >
            Modifier
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Enregistrement..." : "Confirmer"}
          </Button>
        </div>
      </div>
    )
  }

  // Afficher le message de restriction si nécessaire
  if (!canCreateOffer) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Création d'offre temporairement indisponible</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Vous devez attendre <span className="font-bold text-orange-600">{daysToWait} jour{daysToWait > 1 ? 's' : ''}</span> avant de pouvoir créer une nouvelle offre.
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-sm text-orange-800">
            Cette limitation permet de maintenir la qualité et la pertinence des offres sur la plateforme.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Créer une nouvelle offre</h2>
        <p className="text-gray-600 mt-2">Remplissez les informations pour créer votre offre</p>
      </div>

      <Input
        label="Nom de l'offre"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ex: Réduction de printemps"
        required
      />
      
      <Input
        label="Durée (en mois)"
        type="number"
        value={formData.duration}
        onChange={(e) => {
          // On récupère la valeur
          const value = e.target.value;

          // Si la valeur est vide, on la garde vide, sinon on parse
          const parsedValue = value === "" ? NaN : Number(value);

          // On met à jour uniquement si la valeur est comprise entre 1 et 12
          if (parsedValue >= 1 && parsedValue <= 12) {
            setFormData({ ...formData, duration: parsedValue });
          }
        }}
        placeholder="Ex: 1"
        min={1}
        max={12}
        required
      />
      
      <Input
        label="Cible"
        value={formData.target}
        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
        placeholder="Ex: Nouveaux clients"
        required
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="block w-full rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent p-4"
          placeholder="Décrivez votre offre en détail..."
          required
        />
      </div>

      <Input
        label="Réduction (%)"
        type="number"
        value={formData.discount}
        onChange={(e) => {
          // On autorise vide ou un nombre positif
          const value = e.target.value;
          if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
            setFormData({ ...formData, discount: value });
          }
        }}
        placeholder="Ex: 10"
        min={0}
        max={100}
      />

      <div className="flex justify-end pt-6">
        <Button type="submit">
          Suivant
        </Button>
      </div>
    </form>
  )
}

export default CreateOffer
