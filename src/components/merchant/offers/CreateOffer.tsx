import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

// Liste des types
const OFFER_TYPES = [
  { label: "Restauration", value: "food" },
  { label: "Café / Boissons", value: "coffee" },
  { label: "Boulangerie", value: "bakery" },
  { label: "Fruits & légumes", value: "grocery" },
  { label: "Produits locaux", value: "local" },
  { label: "Mode & vêtements", value: "fashion" },
  { label: "Chaussures", value: "shoes" },
  { label: "Accessoires", value: "accessories" },
  { label: "Beauté & soins", value: "beauty" },
  { label: "Parfumerie", value: "perfume" },
  { label: "Coiffure", value: "hair" },
  { label: "Santé & pharmacie", value: "health" },
  { label: "Sport & fitness", value: "sport" },
  { label: "Loisirs & jeux", value: "leisure" },
  { label: "High-tech", value: "tech" },
  { label: "Maison & déco", value: "home" },
  { label: "Librairie / culture", value: "books" },
  { label: "Fleurs", value: "flowers" },
  { label: "Services", value: "services" },
  { label: "Animaux", value: "pets" },
  { label: "Événements spéciaux", value: "event" },
  { label: "Offres exclusives", value: "exclusive" }
]

type Step = 'form' | 'summary' | 'success'

const CreateOffer = () => {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState({
    name: '',
    duration: 0,
    target: '',
    description: '',
    discount: '',
    type: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    const selectedType = OFFER_TYPES.find(t => t.value === formData.type);
    return (
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Récapitulatif de l'offre</h3>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nom de l'offre</p>
            <p className="mt-1">{formData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Type d'offre</p>
            <p className="mt-1">{selectedType?.label || "Non défini"}</p>
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

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 lg:space-y-6">
      <div className="space-y-2">
        <label className="block text-sm lg:text-base font-medium text-gray-700">
          Type d'offre
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
          className="block w-full rounded-xl border border-[#7ebd07]/30 shadow-sm focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent p-3 lg:p-4 text-sm lg:text-base"
        >
          <option value="">-- Sélectionner un type --</option>
          {OFFER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
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
        <label className="block text-sm lg:text-base font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent p-3 lg:p-4 text-sm lg:text-base"
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

      <div className="flex justify-end pt-4">
        <Button type="submit" className="w-full sm:w-auto px-6 lg:px-8 py-3 text-sm lg:text-base">
          Suivant
        </Button>
      </div>
    </form>
  )
}

export default CreateOffer
