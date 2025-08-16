import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { addDoc, collection, serverTimestamp, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore'
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
          where('createdAt', '>', Timestamp.fromDate(thirtyDaysAgo)),
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
  useState(() => {
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
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-[#ebffbc] to-[#d4f5a3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
          <svg className="w-12 h-12 text-[#589507]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#396F04] mb-4">Offre créée avec succès ! 🎉</h3>
        <p className="mt-2 text-lg text-gray-700 max-w-md mx-auto">
          Votre offre est maintenant visible par vos clients.
        </p>
        <Button
          onClick={() => {
            setFormData({ name: '', duration: 0, target: '', description: '', discount: '' })
            setStep('form')
          }}
          className="mt-8 bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Créer une nouvelle offre
        </Button>
      </div>
    )
  }

  if (step === 'summary') {
    return (
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-[#396F04] mb-8">Récapitulatif de l'offre</h3>
        <div className="bg-gradient-to-br from-[#ebffbc]/50 to-white rounded-2xl p-8 space-y-6 border border-[#7ebd07]/30 shadow-xl">
          <div>
            <p className="text-sm font-bold text-[#589507] uppercase tracking-wider">Nom de l'offre</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{formData.name}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#589507] uppercase tracking-wider">Durée (en mois)</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{formData.duration}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#589507] uppercase tracking-wider">Cible</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{formData.target}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#589507] uppercase tracking-wider">Description</p>
            <p className="mt-2 text-lg text-gray-800 leading-relaxed">{formData.description}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#589507] uppercase tracking-wider">Réduction (%)</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{formData.discount ? `${formData.discount}%` : "Aucune"}</p>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="mt-8 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setStep('form')}
            className="px-6 py-3 border-[#7ebd07] text-[#589507] hover:bg-[#ebffbc]"
          >
            Modifier
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {loading ? "Enregistrement..." : "Confirmer"}
          </Button>
        </div>
      </div>
    )
  }

  // Afficher le message de restriction si nécessaire
  if (!canCreateOffer) {
    return (
      <div className="text-center py-20">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
          <svg className="w-16 h-16 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-orange-700 mb-4">Création d'offre temporairement indisponible</h3>
        <p className="text-gray-700 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
          Vous devez attendre <span className="font-bold text-orange-600 text-2xl">{daysToWait} jour{daysToWait > 1 ? 's' : ''}</span> avant de pouvoir créer une nouvelle offre.
        </p>
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 max-w-lg mx-auto shadow-lg">
          <p className="text-orange-800 font-medium">
            Cette limitation permet de maintenir la qualité et la pertinence des offres sur la plateforme.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#ebffbc] to-[#d4f5a3] rounded-full flex items-center justify-center shadow-2xl">
          <svg className="w-10 h-10 text-[#589507]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#589507] to-[#396F04] bg-clip-text text-transparent">Créer une nouvelle offre</h2>
        <p className="text-gray-700 mt-3 text-lg">Remplissez les informations pour créer votre offre</p>
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
          className="block w-full rounded-xl border border-[#7ebd07]/30 shadow-sm focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent p-4"
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
        <Button 
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Suivant
        </Button>
      </div>
    </form>
  )
}

export default CreateOffer
