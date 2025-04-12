import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Store } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'

import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/components/firebase/firebaseConfig'

// Définition d'une interface pour le formulaire
interface FormData {
  gender: string
  last_name: string
  first_name: string
  birth_date: string
  phone_number: string
  zip_code: string
  city: string
  email: string
  occupation: string
  password: string
  newsletter: boolean
  why_naymo: string[]
}

interface StepProps {
  formData: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const steps = [
  {
    id: 'customer',
    title: 'Information client',
    fields: ['gender', 'last_name', 'first_name', 'birth_date', 'phone_number', 'occupation', 'email', 'password',],
  },
  {
    id: 'location',
    title: 'Localisation',
    fields: ['city', 'zip_code'],
  },
  {
    id: 'preferences',
    title: 'Préférences',
    fields: ['newsletter', 'why_naymo']
  }
]

const CustomerRegisterSteps = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    gender: '',
    last_name: '',
    first_name: '',
    birth_date: '',
    phone_number: '',
    zip_code: '',
    city: '',
    email: '',
    occupation: '',
    password: '',
    newsletter: false,
    why_naymo: []
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked })
    } else if (name === 'why_naymo') {
      setFormData({ ...formData, [name]: value.split(',').map((item) => item.trim()) })
    } else if (name === 'phone_number') {
      const onlyDigits = value.replace(/\D/g, '') // Supprime tout sauf chiffres
      if (onlyDigits.length <= 10) {
        setFormData({ ...formData, [name]: onlyDigits })
      }
    } else if (name === 'zip_code') {
      const onlyDigits = value.replace(/\D/g, '') // Supprime tout sauf chiffres
      if (onlyDigits.length <= 5) {
        setFormData({ ...formData, [name]: onlyDigits })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmitRegister = async () => {
    try {
      // Créer l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      console.log("Utilisateur créé avec UID :", user.uid)

      

      // Enregistrer les données du commerçant dans Firestore sous le document correspondant à son UID
      await setDoc(doc(db, "customer", user.uid), {
        ...formData
      })

      console.log("Données du client enregistrées sous l'UID : ", user.uid)

      navigate('/customer/dashboard')
      
    } catch (error) {
      console.log("Erreur lors de l'enregistrement des données : ", error)
    }
  }

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      // Submit form and redirect to dashboard
      handleSubmitRegister()
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-primary-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Créer votre compte client
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="space-y-6">
            {currentStep === 0 && (
              <CustomerInfoStep formData={formData} onChange={handleInputChange} />
            )}
            {currentStep === 1 && (
              <LocationStep formData={formData} onChange={handleInputChange} />
            )}
            {currentStep === 2 && (
              <PreferencesStep formData={formData} onChange={handleInputChange} />
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="space-x-2"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Précédent</span>
              </Button>
              <Button
                onClick={nextStep}
                className="space-x-2"
                size="lg"
              >
                <span>{currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Étape 1
const CustomerInfoStep = ({ formData, onChange }: StepProps) => {

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
      <div className="flex gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="gender"
            value="Masculin"
            checked={formData.gender === 'Masculin'}
            onChange={onChange}
          />
          <span>Masculin</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="gender"
            value="Féminin"
            checked={formData.gender === 'Féminin'}
            onChange={onChange}
          />
          <span>Féminin</span>
        </label>
      </div>
      <Input
        label="Prénom"
        name="first_name"
        value={formData.first_name}
        onChange={onChange}
        placeholder="Ex: François"
      />
      <Input
        label="Nom"
        name="last_name"
        value={formData.last_name}
        onChange={onChange}
        placeholder="Ex: Dupont"
      />
      <Input
        label="Date de naissance"
        name="birth_date"
        type="date"
        value={formData.birth_date}
        onChange={onChange}
      />
      <Input
        label="Numéro de téléphone"
        name="phone_number"
        value={formData.phone_number}
        onChange={onChange}
        placeholder="Ex: 0601020304"
        maxLength={10}
        pattern="\d{10}"
        type="tel"
      />
      <Input 
        label="Profession" 
        name="occupation" 
        value={formData.occupation} 
        onChange={onChange} 
        placeholder="Ex: Fleuriste" 
      />
      <Input 
        label="Adresse e-mail" 
        name="email" 
        type="email" 
        value={formData.email} 
        onChange={onChange} 
        placeholder="Ex: exemple@mail.com" 
      />
      <Input 
        label="Mot de passe" 
        name="password" 
        type="password" 
        value={formData.password} 
        onChange={onChange} 
        placeholder="********" 
      />
    </div>
  )
}

// Étape 2
const LocationStep = ({ formData, onChange }: StepProps) => (
  <div className="space-y-6">
    <Input
      label="Ville"
      name="city"
      value={formData.city}
      onChange={onChange}
      placeholder="Ex: Grenoble"
    />
    <Input
      label="Code postal"
      name="zip_code"
      value={formData.zip_code}
      onChange={onChange}
      placeholder="Ex: 38000"
      maxLength={5}
      type="text"
    />
  </div>
)

// Étape 3
const PreferencesStep = ({ formData, onChange }: StepProps) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-2">
      <Input
        label="S'inscrire à la newsletter"
        name="newsletter"
        type="checkbox"
        checked={formData.newsletter}
        onChange={onChange}
      />
    </div>
    <Input
      label="Pourquoi Naymo ?"
      name="why_naymo"
      value={formData.why_naymo.join(', ')}
      onChange={onChange}
      placeholder="Ex: Visibilité, communauté..."
    />
  </div>
)

export default CustomerRegisterSteps
