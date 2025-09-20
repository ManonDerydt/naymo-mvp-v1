import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Store } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input, FileUpload } from '@/components/forms'

import { doc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db, storage } from '@/components/firebase/firebaseConfig'

// Interface pour les erreurs
interface FormErrors {
  email?: string
  password?: string
  company_name?: string
  shortDescription?: string
  business_type?: string
  keywords?: string
  commitments?: string
  owner_name?: string
  owner_birthdate?: string
  address?: string
  city?: string
  postal_code?: string
  logo?: string
  cover_photo?: string
  store_photos?: string
  general?: string
}

// Définition d'une interface pour le formulaire
interface FormData {
  email: string
  password: string
  company_name: string
  shortDescription: string
  business_type: string
  keywords: string[]
  commitments: string[]
  owner_name: string
  owner_birthdate: string
  address: string
  city: string
  postal_code: string
  media: {
    logo: File | null
    cover_photo: File | null
    store_photos: File[]
  }
}

// Définition d'un type pour l'événement de changement
type FieldChangeEvent =
  | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  | { target: { name: keyof FormData | 'keywords' | 'commitments'; value: any } }

interface StepProps {
  formData: FormData
  onChange: (e: FieldChangeEvent) => void
  errors: FormErrors
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>> // Ajout de setErrors
}

const steps = [
  {
    id: 'business',
    title: 'Information entreprise',
    fields: ['email', 'password', 'company_name', 'shortDescription', 'business_type', 'keywords', 'commitments'],
  },
  {
    id: 'owner',
    title: 'Information gérant',
    fields: ['owner_name', 'owner_birthdate'],
  },
  {
    id: 'location',
    title: 'Localisation',
    fields: ['address', 'city', 'postal_code'],
  },
  {
    id: 'media',
    title: 'Médias',
    fields: ['logo', 'cover_photo', 'store_photos'],
  },
]

const RegisterSteps = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    company_name: '',
    shortDescription: '',
    business_type: '',
    keywords: [],
    commitments: [],
    owner_name: '',
    owner_birthdate: '',
    address: '',
    city: '',
    postal_code: '',
    media: {
      logo: null,
      cover_photo: null,
      store_photos: [],
    },
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Fonction de validation pour chaque étape
  const validateStep = (stepIndex: number): boolean => {
    const newErrors: FormErrors = {}
    const stepFields = steps[stepIndex].fields

    if (stepFields.includes('email')) {
      if (!formData.email) newErrors.email = 'L\'email est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide'
    }
    if (stepFields.includes('password')) {
      if (!formData.password) newErrors.password = 'Le mot de passe est requis'
      else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    if (stepFields.includes('company_name')) {
      if (!formData.company_name) newErrors.company_name = 'Le nom de l\'entreprise est requis'
    }
    if (stepFields.includes('shortDescription')) {
      if (!formData.shortDescription) newErrors.shortDescription = 'La description est requise'
      else if (formData.shortDescription.length > 200) newErrors.shortDescription = 'La description ne doit pas dépasser 200 caractères'
    }
    if (stepFields.includes('business_type')) {
      if (!formData.business_type) newErrors.business_type = 'Le type d\'activité est requis'
    }
    if (stepFields.includes('keywords')) {
      if (formData.keywords.length === 0) newErrors.keywords = 'Au moins un mot-clé est requis'
    }
    if (stepFields.includes('commitments')) {
      if (formData.commitments.length === 0) newErrors.commitments = 'Au moins un engagement est requis'
    }
    if (stepFields.includes('owner_name')) {
      if (!formData.owner_name) newErrors.owner_name = 'Le nom du gérant est requis'
    }
    if (stepFields.includes('owner_birthdate')) {
      if (!formData.owner_birthdate) newErrors.owner_birthdate = 'La date de naissance est requise'
      else {
        const birthDate = new Date(formData.owner_birthdate)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 18) newErrors.owner_birthdate = 'Le gérant doit avoir au moins 18 ans'
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
    if (stepFields.includes('logo')) {
      if (!formData.media.logo) newErrors.logo = 'Le logo est requis'
    }
    if (stepFields.includes('cover_photo')) {
      if (!formData.media.cover_photo) newErrors.cover_photo = 'La photo de couverture est requise'
    }
    if (stepFields.includes('store_photos')) {
      if (formData.media.store_photos.length < 3) newErrors.store_photos = 'Au moins 3 photos du commerce sont requises'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitRegister = async () => {
    if (!validateStep(currentStep)) return

    try {
      // Créer l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      console.log("Utilisateur créé avec UID :", user.uid)

      // Uploader le logo
      let logoURL: string | null = null
      if (formData.media.logo) {
        const logoRef = ref(storage, `logos/${formData.media.logo.name}`)
        await uploadBytes(logoRef, formData.media.logo)
        logoURL = await getDownloadURL(logoRef)
      }

      // Uploader la photo de couverture
      let coverPhotoURL: string | null = null
      if (formData.media.cover_photo) {
        const coverPhotoRef = ref(storage, `cover_photos/${formData.media.cover_photo.name}`)
        await uploadBytes(coverPhotoRef, formData.media.cover_photo)
        coverPhotoURL = await getDownloadURL(coverPhotoRef)
      }

      // Uploader les photos du commerce
      let storePhotoURLs: string[] = []
      for (const photo of formData.media.store_photos) {
        const storePhotoRef = ref(storage, `store_photos/${photo.name}`)
        await uploadBytes(storePhotoRef, photo)
        const photoURL = await getDownloadURL(storePhotoRef)
        storePhotoURLs.push(photoURL)
      }

      // Enregistrer les données du commerçant dans Firestore sous le document correspondant à son UID
      await setDoc(doc(db, "merchant", user.uid), {
        email: formData.email,
        company_name: formData.company_name,
        shortDescription: formData.shortDescription,
        business_type: formData.business_type,
        keywords: formData.keywords,
        commitments: formData.commitments,
        owner_name: formData.owner_name,
        owner_birthdate: formData.owner_birthdate,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
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

  const handleInputChange = (e: FieldChangeEvent) => {
    const { name, value } = e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement
      ? e.target
      : e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Effacer l'erreur du champ modifié
    setErrors({ ...errors, [name]: undefined });
  };

  const handleFileChange = (type: 'logo' | 'cover_photo' | 'store_photos', files: File[]) => {
    const newErrors: FormErrors = { ...errors }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        newErrors[type] = 'Seuls les fichiers image sont acceptés';
        setErrors(newErrors);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5 MB
        newErrors[type] = 'La taille du fichier ne doit pas dépasser 5 Mo';
        setErrors(newErrors);
        return;
      }
    }

    // Update formData
    setFormData({
      ...formData,
      media: {
        ...formData.media,
        [type]: type === 'store_photos' ? files : files[0] || null,
      },
    });

    // Clear error for this field
    setErrors({ ...newErrors, [type]: undefined });
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
    setErrors({}) // Réinitiliser les erreurs lors du retour en arrière
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
            <Store className="w-10 h-10" color="#7ebd07" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Créer votre compte commerçant
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
              <BusinessInfoStep formData={formData} onChange={handleInputChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 1 && (
              <OwnerInfoStep formData={formData} onChange={handleInputChange} errors={errors} setErrors={setErrors}/>
            )}
            {currentStep === 2 && (
              <LocationStep formData={formData} onChange={handleInputChange} errors={errors} setErrors={setErrors} />
            )}
            {currentStep === 3 && (
              <MediaStep onFileChange={handleFileChange} errors={errors} />
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

const BusinessInfoStep = ({ formData, onChange, errors, setErrors }: StepProps) => {
  const [newKeyword, setNewKeyword] = useState('')
  // const [newCommitment, setNewCommitment] = useState('')
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>(formData.commitments || [])

  const handleAddKeyword = () => {
    if (newKeyword && !formData.keywords.includes(newKeyword)) {
      onChange({
        target: {
          name: 'keywords',
          value: [...formData.keywords, newKeyword],
        },
      })
      setNewKeyword('')
      setErrors({ ...errors, keywords: undefined })
    }
  }

  const handleSelectCommitment = (commitment: string) => {
    if (!selectedCommitments.includes(commitment)) {
      const newCommitments = [...selectedCommitments, commitment]
      setSelectedCommitments(newCommitments)
      onChange({
        target: { name: 'commitments', value: newCommitments },
      })
      setErrors({ ...errors, commitments: undefined })
    }
  }

  const pictograms = [
    { name: 'Accueil', imageUrl: '/src/assets/engagements/Accueil_icon.png' },
    { name: 'Client', imageUrl: '/src/assets/engagements/Client_icon.png' },
    { name: 'Humain', imageUrl: '/src/assets/engagements/Humain_icon.png' },
    { name: 'Magasin', imageUrl: '/src/assets/engagements/Mon_Magasin_icon.png' },
    { name: 'Environnement', imageUrl: '/src/assets/engagements/Respect_Environnement_icon.png' }
  ]

  const handleRemoveKeyword = (keywordToRemove: string) => {
    onChange({
      target: {
        name: 'keywords',
        value: formData.keywords.filter(keyword => keyword !== keywordToRemove),
      }
    })
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6">
      <Input 
        label="Email"
        name="email"
        value={formData.email}
        onChange={onChange}
        placeholder="Ex: yourname@mail.com"
        error={errors.email}
      />
      <div className="relative">
        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={onChange}
          placeholder="Ex: mypassword1234"
          className="pr-10 rounded-2xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[40px] text-gray-400"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
      <Input
        label="Nom de l'entreprise"
        name="company_name"
        value={formData.company_name}
        onChange={onChange}
        placeholder="Ex: Ma Boutique"
        error={errors.company_name}
      />
      <Input
        label="Description courte"
        name="shortDescription"
        value={formData.shortDescription}
        onChange={onChange}
        placeholder="Ex: Voici l'entreprise XXX..."
        error={errors.shortDescription}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Type d'activité</label>
        <select
          name="business_type"
          value={formData.business_type}
          onChange={onChange}
          className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
        >
          <option value="">Sélectionnez un type d'activité</option>
          <option value="Alimentation">Alimentation</option>
          <option value="Vestimentaire">Vestimentaire</option>
          <option value="Décoration">Décoration</option>
          <option value="Artisanat">Artisanat</option>
          <option value="Restauration">Restauration</option>
          <option value="Événementiel">Événementiel</option>
        </select>
        {errors.business_type && <p className="mt-1 text-sm text-red-600">{errors.business_type}</p>}
      </div>
      {/* Ajout des mots-clés */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Mots-clés</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
            placeholder="Ajoutez un mot-clé"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
          />
          <Button 
            type="button" 
            onClick={handleAddKeyword} 
            disabled={!newKeyword}
            className="rounded-2xl bg-[#7ebd07] hover:bg-green-700 text-white px-4 py-3"
          >
            Ajouter
          </Button>
        </div>
        {errors.keywords && <p className="mt-1 text-sm text-red-600">{errors.keywords}</p>}
        <ul className="mt-2 space-y-1">
          {formData.keywords.map((keyword, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{keyword}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(keyword)}
                className="text-red-500 hover:text-red-700"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Ajout des pictogrammes d'engagements */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Pictogrammes d'engagements</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {pictograms.map((pictogram, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectCommitment(pictogram.name)}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
                selectedCommitments.includes(pictogram.name) 
                  ? 'border-[#7ebd07] bg-[#ebffbc] shadow-lg transform scale-105' 
                  : 'border-gray-200 bg-white hover:border-[#7ebd07] hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedCommitments.includes(pictogram.name) 
                    ? 'bg-[#7ebd07] text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getEngagementIcon(pictogram.name)}
                </div>
                <p className={`text-sm font-medium text-center ${
                  selectedCommitments.includes(pictogram.name) 
                    ? 'text-[#7ebd07]' 
                    : 'text-gray-700'
                }`}>
                  {pictogram.name}
                </p>
                {selectedCommitments.includes(pictogram.name) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#7ebd07] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        {errors.commitments && <p className="mt-1 text-sm text-red-600">{errors.commitments}</p>}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Engagements sélectionnés :</p>
          <ul className="mt-2 space-y-1">
            {selectedCommitments.map((commitment, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{commitment}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCommitments(selectedCommitments.filter(c => c !== commitment))}
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const OwnerInfoStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <Input
      label="Nom et prénom du gérant"
      name="owner_name"
      value={formData.owner_name}
      onChange={onChange}
      placeholder="Ex: Jean Dupont"
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

const LocationStep = ({ formData, onChange, errors }: StepProps) => (
  <div className="space-y-6">
    <Input
      label="Adresse"
      name="address"
      value={formData.address}
      onChange={onChange}
      placeholder="Ex: 123 rue du Commerce"
      error={errors.address}
    />
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
      onChange={(e) => {
        const onlyDigits = e.target.value.replace(/\D/g, '') // Supprime tout sauf les chiffres
        if (onlyDigits.length <= 5) {
          onChange({
            target: {
              name: 'postal_code',
              value: onlyDigits,
            }
          })
        }
      }}
      placeholder="Ex: 75001"
      maxLength={5}
      pattern="\d{5}"
      type="text"
      error={errors.postal_code}
    />
  </div>
)

const MediaStep = ({ onFileChange, errors }: { onFileChange: (type: 'logo' | 'cover_photo' | 'store_photos', files: File[]) => void, errors: FormErrors }) => (
  <div className="space-y-8">
    <FileUpload
      label="Logo de votre entreprise"
      onChange={(files) => onFileChange('logo', files)}
      error={errors.logo}
    />
    <FileUpload
      label="Photo de couverture"
      onChange={(files) => onFileChange('cover_photo', files)}
      error={errors.cover_photo}
    />
    <FileUpload
      label="Photos du commerce (min. 3)"
      multiple
      maxFiles={5}
      onChange={(files) => onFileChange('store_photos', files)}
      error={errors.store_photos}
    />
  </div>
)

// Fonction pour obtenir les icônes d'engagement
const getEngagementIcon = (name: string) => {
  switch (name) {
    case 'Accueil':
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    case 'Client':
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      )
    case 'Humain':
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      )
    case 'Magasin':
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    case 'Environnement':
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      )
    default:
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      )
  }
}

export default RegisterSteps