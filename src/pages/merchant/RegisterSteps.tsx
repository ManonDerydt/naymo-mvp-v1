import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Store } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input, FileUpload } from '@/components/forms'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db, storage } from '@/components/firebase/firebaseConfig'

// Interface pour les erreurs
interface FormErrors {
  company_name?: string
  business_type?: string
  owner_name?: string
  owner_birthdate?: string
  address?: string
  city?: string
  postal_code?: string
  email?: string
  password?: string
  logo?: string
  cover_photo?: string
  store_photos?: string
  general?: string
}

// Définition d'une interface pour le formulaire
interface FormData {
  company_name: string
  business_type: string
  owner_name: string
  owner_birthdate: string
  address: string
  city: string
  postal_code: string
  email: string
  password: string
  media: {
    logo: File | null
    cover_photo: File | null
    store_photos: File[]
  }
}

interface StepProps {
  formData: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileChange: (type: 'logo' | 'cover_photo' | 'store_photos', files: File[]) => void
  errors: FormErrors
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const steps = [
  {
    id: 'business',
    title: 'Information entreprise',
    description: 'Renseignez les informations de base de votre entreprise',
    fields: ['company_name', 'business_type'],
  },
  {
    id: 'owner',
    title: 'Information gérant',
    description: 'Vos informations personnelles en tant que gérant',
    fields: ['owner_name', 'owner_birthdate'],
  },
  {
    id: 'location',
    title: 'Localisation',
    description: 'Où se trouve votre commerce ?',
    fields: ['address', 'city', 'postal_code'],
  },
  {
    id: 'account',
    title: 'Compte',
    description: 'Créez votre compte pour accéder à la plateforme',
    fields: ['email', 'password'],
  },
  {
    id: 'media',
    title: 'Médias',
    description: 'Ajoutez des images pour présenter votre commerce',
    fields: ['logo', 'cover_photo', 'store_photos'],
  },
]

const RegisterSteps = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    business_type: '',
    owner_name: '',
    owner_birthdate: '',
    address: '',
    city: '',
    postal_code: '',
    email: '',
    password: '',
    media: {
      logo: null,
      cover_photo: null,
      store_photos: []
    }
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: FormErrors = {}
    const stepFields = steps[stepIndex].fields

    if (stepFields.includes('company_name')) {
      if (!formData.company_name) newErrors.company_name = 'Le nom de l\'entreprise est requis'
    }
    if (stepFields.includes('business_type')) {
      if (!formData.business_type) newErrors.business_type = 'Le type d\'entreprise est requis'
    }
    if (stepFields.includes('owner_name')) {
      if (!formData.owner_name) newErrors.owner_name = 'Le nom du gérant est requis'
    }
    if (stepFields.includes('owner_birthdate')) {
      if (!formData.owner_birthdate) newErrors.owner_birthdate = 'La date de naissance est requise'
      else {
        const birthDate = new Date(formData.owner_birthdate)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age < 18) newErrors.owner_birthdate = 'Vous devez avoir au moins 18 ans'
      }
    }
    if (stepFields.includes('address')) {
      if (!formData.address) newErrors.address = 'L\'adresse est requise'
    }
    if (stepFields.includes('city')) {
      if (!formData.city) newErrors.city = 'La ville est requise'
    }
    if (stepFields.includes('postal_code')) {
      if (!formData.postal_code) newErrors.postal_code = 'Le code postal est requis'
      else if (!/^\d{5}$/.test(formData.postal_code)) newErrors.postal_code = 'Code postal invalide (5 chiffres requis)'
    }
    if (stepFields.includes('email')) {
      if (!formData.email) newErrors.email = 'L\'email est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide'
    }
    if (stepFields.includes('password')) {
      if (!formData.password) newErrors.password = 'Le mot de passe est requis'
      else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setErrors({ ...errors, [name]: undefined }) // Effacer l'erreur du champ modifié

    if (name === 'postal_code') {
      const onlyDigits = value.replace(/\D/g, '') // Supprime tout sauf chiffres
      if (onlyDigits.length <= 5) {
        setFormData({ ...formData, [name]: onlyDigits })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFileChange = (type: 'logo' | 'cover_photo' | 'store_photos', files: File[]) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [type]: type === 'store_photos' ? files : files[0] || null
      }
    }))
  }

  const handleSubmitRegister = async () => {
    if (!validateStep(currentStep)) return

    try {
      // Créer l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      console.log("Utilisateur créé avec UID :", user.uid)

      // Uploader le logo
      let logoURL: string | null = null;
      if (formData.media.logo) {
        const logoRef = ref(storage, `logos/${formData.media.logo.name}`);
        await uploadBytes(logoRef, formData.media.logo);
        logoURL = await getDownloadURL(logoRef);
      }

      // Uploader la photo de couverture
      let coverPhotoURL: string | null = null;
      if (formData.media.cover_photo) {
        const coverPhotoRef = ref(storage, `cover_photos/${formData.media.cover_photo.name}`);
        await uploadBytes(coverPhotoRef, formData.media.cover_photo);
        coverPhotoURL = await getDownloadURL(coverPhotoRef);
      }

      // Uploader les photos du commerce
      let storePhotoURLs: string[] = [];
      for (const photo of formData.media.store_photos) {
        const storePhotoRef = ref(storage, `store_photos/${photo.name}`);
        await uploadBytes(storePhotoRef, photo);
        const photoURL = await getDownloadURL(storePhotoRef);
        storePhotoURLs.push(photoURL);
      }

      // Enregistrer les données du commerçant dans Firestore sous le document correspondant à son UID
      await setDoc(doc(db, "merchant", user.uid), {
        company_name: formData.company_name,
        business_type: formData.business_type,
        owner_name: formData.owner_name,
        owner_birthdate: formData.owner_birthdate,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        email: formData.email,
        logo: logoURL,
        cover_photo: coverPhotoURL,
        store_photos: storePhotoURLs
      })

      console.log("Données du commerçant enregistrées sous l'UID : ", user.uid)

      navigate('/dashboard')
      
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
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center shadow-2xl mb-6">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#589507] to-[#396F04] bg-clip-text text-transparent">
            Créer votre compte commerçant
          </h2>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="text-sm font-medium text-[#589507] bg-[#ebffbc] px-3 py-1 rounded-full">
              Étape {currentStep + 1} sur {steps.length}
            </div>
            <div className="group relative">
              <div className="text-sm text-gray-500 cursor-help">
                {steps[currentStep].title}
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {steps[currentStep].description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
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
              <BusinessInfoStep formData={formData} onChange={handleInputChange} onFileChange={handleFileChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 1 && (
              <OwnerInfoStep formData={formData} onChange={handleInputChange} onFileChange={handleFileChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 2 && (
              <LocationStep formData={formData} onChange={handleInputChange} onFileChange={handleFileChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 3 && (
              <AccountStep formData={formData} onChange={handleInputChange} onFileChange={handleFileChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 4 && (
              <MediaStep formData={formData} onChange={handleInputChange} onFileChange={handleFileChange} errors={errors} setErrors={setErrors} />
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

// Étape 1 : Information entreprise
const BusinessInfoStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#ebffbc] to-[#d4f5a3] rounded-full flex items-center justify-center shadow-xl">
        <Store className="w-8 h-8 text-[#589507]" />
      </div>
      <h3 className="text-xl font-bold text-[#396F04]">Parlez-nous de votre entreprise</h3>
    </div>
    <Input
      label="Nom de l'entreprise"
      name="company_name"
      value={formData.company_name}
      onChange={onChange}
      placeholder="Ex: Boulangerie Martin"
      error={errors.company_name}
    />
    <Input
      label="Type d'entreprise"
      name="business_type"
      value={formData.business_type}
      onChange={onChange}
      placeholder="Ex: Boulangerie, Restaurant, Boutique..."
      error={errors.business_type}
    />
  </div>
)

// Étape 2 : Information gérant
const OwnerInfoStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-xl">
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#396F04]">Vos informations personnelles</h3>
    </div>
    <Input
      label="Nom du gérant"
      name="owner_name"
      value={formData.owner_name}
      onChange={onChange}
      placeholder="Ex: Jean Martin"
      error={errors.owner_name}
    />
    <Input
      label="Date de naissance"
      name="owner_birthdate"
      type="date"
      value={formData.owner_birthdate}
      onChange={onChange}
      error={errors.owner_birthdate}
    />
  </div>
)

// Étape 3 : Localisation
const LocationStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-xl">
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#396F04]">Où se trouve votre commerce ?</h3>
    </div>
    <Input
      label="Adresse complète"
      name="address"
      value={formData.address}
      onChange={onChange}
      placeholder="Ex: 123 Rue de la Paix"
      error={errors.address}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Ville"
        name="city"
        value={formData.city}
        onChange={onChange}
        placeholder="Ex: Paris"
        error={errors.city}
      />
      <Input
        label="Code postal"
        name="postal_code"
        value={formData.postal_code}
        onChange={onChange}
        placeholder="Ex: 75001"
        maxLength={5}
        type="text"
        error={errors.postal_code}
      />
    </div>
  </div>
)

// Étape 4 : Compte
const AccountStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-xl">
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 .257-.257A6 6 0 1118 8zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#396F04]">Créez votre compte</h3>
    </div>
    <Input
      label="Adresse e-mail"
      name="email"
      type="email"
      value={formData.email}
      onChange={onChange}
      placeholder="Ex: contact@moncommerce.com"
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
  </div>
)

// Étape 5 : Médias
const MediaStep = ({ formData, onFileChange, errors }: StepProps) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-xl">
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#396F04]">Ajoutez vos images</h3>
      <p className="text-gray-600 mt-2">Ces images aideront vos clients à vous reconnaître</p>
    </div>
    <FileUpload
      label="Logo de votre commerce"
      onChange={(files) => onFileChange('logo', files)}
      maxFiles={1}
      error={errors.logo}
    />
    <FileUpload
      label="Photo de couverture"
      onChange={(files) => onFileChange('cover_photo', files)}
      maxFiles={1}
      error={errors.cover_photo}
    />
    <FileUpload
      label="Photos de votre commerce"
      multiple
      maxFiles={5}
      onChange={(files) => onFileChange('store_photos', files)}
      error={errors.store_photos}
    />
  </div>
)

export default RegisterSteps