import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Store, User } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'

import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/components/firebase/firebaseConfig'

// Interface pour les erreurs
interface FormErrors {
  last_name?: string
  first_name?: string
  birth_date?: string
  phone_number?: string
  zip_code?: string
  city?: string
  email?: string
  occupation?: string
  password?: string
  confirmPassword?: string
  why_naymo?: string
  general?: string
}

// Définition d'une interface pour le formulaire
interface FormData {
  last_name: string
  first_name: string
  birth_date: string
  phone_number: string
  zip_code: string
  city: string
  email: string
  occupation: string
  password: string
  confirmPassword: string
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
    fields: ['last_name', 'first_name', 'birth_date', 'phone_number', 'occupation', 'email', 'password'],
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
    last_name: '',
    first_name: '',
    birth_date: '',
    phone_number: '',
    zip_code: '',
    city: '',
    email: '',
    occupation: '',
    password: '',
    confirmPassword: '',
    newsletter: false,
    why_naymo: []
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: FormErrors = {}
    const stepFields = steps[stepIndex].fields

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
    if (stepFields.includes('password') && formData.password) {
      if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation du mot de passe est requise'
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
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

  const handleSubmitRegister = async () => {
    if (!validateStep(currentStep)) return

    try {
      // Créer l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      console.log("Utilisateur créé avec UID :", user.uid)

      

      // Enregistrer les données du commerçant dans Firestore sous le document correspondant à son UID
      await setDoc(doc(db, "customer", user.uid), {
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
    <div className="min-h-screen bg-gradient-to-br from-[#ebffbc]/20 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex justify-start">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </Link>
        </div>
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center shadow-2xl mb-6">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#589507] to-[#396F04] bg-clip-text text-transparent">
            Créer votre compte client
          </h2>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="text-sm font-medium text-[#589507] bg-[#ebffbc] px-3 py-1 rounded-full">
              Étape {currentStep + 1} sur {steps.length}
            </div>
            <div className="group relative">
              <div className="text-sm text-gray-500 cursor-help">
                {steps[currentStep].title}
              </div>
            </div>
          </div>
          {errors.general && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
        </div>

        <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-[#7ebd07]/30">
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
                className="flex items-center space-x-2 px-6 py-3 border-[#7ebd07] text-[#589507] hover:bg-[#ebffbc] disabled:opacity-50"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Précédent</span>
              </Button>
              <Button
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] shadow-lg transform hover:scale-105 transition-all duration-200"
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
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#ebffbc] to-[#d4f5a3] rounded-full flex items-center justify-center shadow-xl">
          <User className="w-8 h-8 text-[#589507]" />
        </div>
        <h3 className="text-xl font-bold text-[#396F04]">Vos informations personnelles</h3>
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
      <Input 
        label="Confirmer le mot de passe" 
        name="confirmPassword" 
        type="password" 
        value={formData.confirmPassword} 
        onChange={onChange} 
        placeholder="********"
        error={errors.confirmPassword} 
      />
    </div>
  )
}

// Étape 2
const LocationStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-xl">
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#396F04]">Où habitez-vous ?</h3>
    </div>
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
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-xl">
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#396F04]">Vos préférences</h3>
    </div>
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
      error={errors.why_naymo}
    />
  </div>
)

export default CustomerRegisterSteps
