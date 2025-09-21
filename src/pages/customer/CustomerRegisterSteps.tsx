import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Store, Users } from 'lucide-react'
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
  last_name: string
  first_name: string
  email: string
  password: string
  confirmPassword: string
}

interface StepProps {
  formData: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  errors: FormErrors
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const steps = [
  {
    id: 'registration',
    title: 'Inscription',
    fields: ['first_name', 'last_name', 'email', 'password', 'confirmPassword'],
  }
]

const CustomerRegisterSteps = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (stepFields.includes('email')) {
      if (!formData.email) newErrors.email = 'L\'email est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide'
    }
    if (stepFields.includes('password')) {
      if (!formData.password) newErrors.password = 'Le mot de passe est requis'
      else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    if (stepFields.includes('confirmPassword')) {
      if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation du mot de passe est requise'
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setErrors({ ...errors, [name]: undefined }) // Effacer l'erreur du champ modifié

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked })
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

    setLoading(true)
    setErrors({})

    try {
      // Créer l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      console.log("Utilisateur créé avec UID :", user.uid)

      // Générer un code client
      const customerCode = generateCustomerCode();

      // Enregistrer les données du commerçant dans Firestore sous le document correspondant à son UID
      await setDoc(doc(db, "customer", user.uid), {
        code: customerCode,
        last_name: formData.last_name,
        first_name: formData.first_name,
        email: formData.email,
        points: 0
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
    } finally {
      setLoading(false)
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc]">
      <div className="max-w-2xl w-full space-y-8">
        <div className="absolute top-6 left-6">
          <button 
            onClick={() => navigate('/')}
            className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl border border-[#c9eaad]/30 hover:bg-white transition-all duration-200 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6 text-[#396F04]" />
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto w-28 h-28 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <Users className="w-14 h-14 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#0A2004]">
            Créer votre compte client
          </h2>
          <p className="mt-2 text-sm text-[#589507] font-medium">
            Étape {currentStep + 1} sur {steps.length}
          </p>
          {errors.general && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.general}</p>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur shadow-2xl rounded-3xl border border-[#c9eaad]/30 p-8">
          <div className="space-y-6">
            {currentStep === 0 && (
              <RegistrationStep formData={formData} onChange={handleInputChange} errors={errors} setErrors={setErrors} />
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="space-x-2 rounded-2xl py-4 px-6 border-2 border-[#7DBD07] text-[#396F04] hover:bg-[#7DBD07] hover:text-white font-bold transition-all duration-200"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Précédent</span>
              </Button>
              <Button
                onClick={nextStep}
                disabled={loading}
                className="space-x-2 rounded-2xl py-4 px-6 bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] hover:from-[#589507] hover:to-[#7DBD07] text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <span>{loading ? 'Inscription...' : (currentStep === steps.length - 1 ? 'Terminer' : 'Suivant')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Étape unique d'inscription
const RegistrationStep = ({ formData, onChange, errors }: StepProps) => {
  return (
    <div className="space-y-6">
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
        label="Adresse e-mail" 
        name="email" 
        type="email" 
        value={formData.email} 
        onChange={onChange} 
        placeholder="Ex: client@exemple.com"
        error={errors.email}
      />
      <Input 
        label="Mot de passe" 
        name="password" 
        type="password" 
        value={formData.password} 
        onChange={onChange} 
        placeholder="Minimum 6 caractères"
        error={errors.password} 
      />
      <Input 
        label="Confirmer le mot de passe" 
        name="confirmPassword" 
        type="password" 
        value={formData.confirmPassword} 
        onChange={onChange} 
        placeholder="Retapez votre mot de passe"
        error={errors.confirmPassword} 
      />
    </div>
  )
}

export default CustomerRegisterSteps
