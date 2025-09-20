import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Store } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'

import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/components/firebase/firebaseConfig'

// Interface pour les erreurs
interface FormErrors {
  gender?: string
  last_name?: string
  first_name?: string
  birth_date?: string
  phone_number?: string
  zip_code?: string
  city?: string
  email?: string
  occupation?: string
  password?: string
  why_naymo?: string
  general?: string
}

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
  errors: FormErrors
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
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
  const [errors, setErrors] = useState<FormErrors>({})

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: FormErrors = {}
    const stepFields = steps[stepIndex].fields

    if (stepFields.includes('gender')) {
      if (!formData.gender) newErrors.gender = 'Le genre est requis'
    }
    if (stepFields.includes('first_name')) {
      if (!formData.first_name) newErrors.first_name = 'Le prénom est requis'
    }
    if (stepFields.includes('last_name')) {
      if (!formData.last_name) newErrors.last_name = 'Le nom est requis'
    }
    if (stepFields.includes('birth_date')) {
      if (!formData.birth_date) newErrors.birth_date = 'La date de naissance est requise'
      else {
        const birthDate = new Date(formData.birth_date)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age < 18) newErrors.birth_date = 'Vous devez avoir au moins 18 ans'
      }
    }
    if (stepFields.includes('phone_number')) {
      if (!formData.phone_number) newErrors.phone_number = 'Le numéro de téléphone est requis'
      else if (!/^\d{10}$/.test(formData.phone_number)) newErrors.phone_number = 'Numéro de téléphone invalide (10 chiffres requis)'
    }
    if (stepFields.includes('occupation')) {
      if (!formData.occupation) newErrors.occupation = 'La profession est requise'
    }
    if (stepFields.includes('email')) {
      if (!formData.email) newErrors.email = 'L\'email est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide'
    }
    if (stepFields.includes('password')) {
      if (!formData.password) newErrors.password = 'Le mot de passe est requis'
      else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    if (stepFields.includes('city')) {
      if (!formData.city) newErrors.city = 'La ville est requise'
    }
    if (stepFields.includes('zip_code')) {
      if (!formData.zip_code) newErrors.zip_code = 'Le code postal est requis'
      else if (!/^\d{5}$/.test(formData.zip_code)) newErrors.zip_code = 'Code postal invalide (5 chiffres requis)'
    }
    if (stepFields.includes('why_naymo')) {
      if (formData.why_naymo.length === 0) newErrors.why_naymo = 'Au moins une raison est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setErrors({ ...errors, [name]: undefined }) // Effacer l'erreur du champ modifié

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

  // Générateur de code client
  const generateCustomerCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Code à 6 chiffres
  }

  const handleSubmitRegister = async () => {
    if (!validateStep(currentStep)) return

    try {
      // Créer l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      console.log("Utilisateur créé avec UID :", user.uid)

      // Générer un code client
      const customerCode = generateCustomerCode();

      // Enregistrer les données du commerçant dans Firestore sous le document correspondant à son UID
      await setDoc(doc(db, "customer", user.uid), {
        gender: formData.gender,
        code: customerCode,
        last_name: formData.last_name,
        first_name: formData.first_name,
        birth_date: formData.birth_date,
        phone_number: formData.phone_number,
        zip_code: formData.zip_code,
        city: formData.city,
        email: formData.email,
        occupation: formData.occupation,
        newsletter: formData.newsletter,
        why_naymo: formData.why_naymo
      })

      console.log("Données du client enregistrées sous l'UID : ", user.uid)

      navigate('/customer/dashboard')
      
    } catch (error: any) {
      console.log("Erreur lors de l'enregistrement des données : ", error)
      let errorMessage = "Erreur lors de l'enregistrement. Veuillez réessayer."
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé."
        setErrors({ ...errors, email: errorMessage })
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "L'email est invalide."
        setErrors({ ...errors, email: errorMessage })
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe est trop faible."
        setErrors({ ...errors, password: errorMessage })
      } else {
        setErrors({ ...errors, general: errorMessage })
      }
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === steps.length - 1) {
        // Submit form and redirect to dashboard
        handleSubmitRegister()
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
      }
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    setErrors({}) // Réinitialiser les erreurs lors du retour en arrière
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8fdf4' }}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Bouton retour */}
        <div className="absolute top-6 left-6">
          <button 
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-[#ebffbc] rounded-full flex items-center justify-center mb-8">
            <Users className="w-10 h-10" color="#7ebd07" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Créer votre compte client
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Étape {currentStep + 1} sur {steps.length}
          </p>
          {errors.general && (
            <p className="mt-2 text-sm text-red-600">{errors.general}</p>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-8">
          <div className="space-y-6">
            {currentStep === 0 && (
              <CustomerInfoStep formData={formData} onChange={handleInputChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 1 && (
              <LocationStep formData={formData} onChange={handleInputChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 2 && (
              <PreferencesStep formData={formData} onChange={handleInputChange} errors={errors} setErrors={setErrors} />
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="space-x-2 rounded-2xl py-4 px-6 border-[#7ebd07] text-[#7ebd07] hover:bg-[#7ebd07] hover:text-white"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Précédent</span>
              </Button>
              <Button
                onClick={nextStep}
                className="space-x-2 rounded-2xl py-4 px-6 bg-[#7ebd07] hover:bg-green-700 text-white"
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
const CustomerInfoStep = ({ formData, onChange, errors }: StepProps) => {

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
      </div>
      {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
      <div className="flex gap-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="gender"
            value="Masculin"
            checked={formData.gender === 'Masculin'}
            onChange={onChange}
            className="text-[#7ebd07] focus:ring-[#7ebd07]"
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
            className="text-[#7ebd07] focus:ring-[#7ebd07]"
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
        error={errors.first_name}
      />
      <Input
        label="Nom"
        name="last_name"
        value={formData.last_name}
        onChange={onChange}
        placeholder="Ex: Dupont"
        error={errors.last_name}
      />
      <Input
        label="Date de naissance"
        name="birth_date"
        type="date"
        value={formData.birth_date}
        onChange={onChange}
        error={errors.birth_date}
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
        error={errors.phone_number}
      />
      <Input 
        label="Profession" 
        name="occupation" 
        value={formData.occupation} 
        onChange={onChange} 
        placeholder="Ex: Fleuriste" 
        error={errors.occupation}
      />
      <Input 
        label="Adresse e-mail" 
        name="email" 
        type="email" 
        value={formData.email} 
        onChange={onChange} 
        placeholder="Ex: exemple@mail.com"
        error={errors.email}
      />
      <Input 
        label="Mot de passe" 
        name="password" 
        type="password" 
        value={formData.password} 
        onChange={onChange} 
        placeholder="********"
        error={errors.password} 
      />
    </div>
  )
}

// Étape 2
const LocationStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <Input
      label="Ville"
      name="city"
      value={formData.city}
      onChange={onChange}
      placeholder="Ex: Grenoble"
      error={errors.city}
    />
    <Input
      label="Code postal"
      name="zip_code"
      value={formData.zip_code}
      onChange={onChange}
      placeholder="Ex: 38000"
      maxLength={5}
      type="text"
      error={errors.zip_code}
    />
  </div>
)

// Étape 3
const PreferencesStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Newsletter</label>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          name="newsletter"
          checked={formData.newsletter}
          onChange={onChange}
          className="w-4 h-4 text-[#7ebd07] focus:ring-[#7ebd07] border-gray-300 rounded"
        />
        <span className="text-sm text-gray-700">S'inscrire à la newsletter</span>
      </div>
    </div>
    <Input
      label="Pourquoi Naymo ?"
      name="why_naymo"
      value={formData.why_naymo.join(', ')}
      onChange={onChange}
      placeholder="Ex: Visibilité, communauté..."
      error={errors.why_naymo}
    />
  </div>
)

export default CustomerRegisterSteps
