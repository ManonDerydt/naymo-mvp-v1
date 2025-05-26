import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Store } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input, FileUpload } from '@/components/forms'

import { doc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db, storage } from '@/components/firebase/firebaseConfig'

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
  | React.ChangeEvent<HTMLInputElement>
  | { target: { name: keyof FormData | 'keywords' | 'commitments'; value: any } }

interface StepProps {
  formData: FormData
  onChange: (e: FieldChangeEvent) => void
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

  const handleSubmitRegister = async () => {
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
      
    } catch (error) {
      console.log("Erreur lors de l'enregistrement des données : ", error)
    }
  }

  const handleInputChange = (e: FieldChangeEvent) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (type: 'logo' | 'cover_photo' | 'store_photos', files: File[]) => {
    setFormData({
      ...formData,
      media: {
        ...formData.media,
        [type]: type === 'store_photos' ? files : files[0],
      },
    })
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
            Créer votre compte commerçant
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="space-y-6">
            {currentStep === 0 && (
              <BusinessInfoStep formData={formData} onChange={handleInputChange} />
            )}
            {currentStep === 1 && (
              <OwnerInfoStep formData={formData} onChange={handleInputChange} />
            )}
            {currentStep === 2 && (
              <LocationStep formData={formData} onChange={handleInputChange} />
            )}
            {currentStep === 3 && (
              <MediaStep onFileChange={handleFileChange} />
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

const BusinessInfoStep = ({ formData, onChange }: StepProps) => {
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
      setNewKeyword('') // Réinitialiser le champ de texte
    }
  }

  const handleSelectCommitment = (commitment: string) => {
    if (!selectedCommitments.includes(commitment)) {
      const newCommitments = [...selectedCommitments, commitment]
      setSelectedCommitments(newCommitments)
      onChange({
        target: { name: 'commitments', value: newCommitments },
      })
    }
  }

  const pictograms = [
    { name: 'Accueil', imageUrl: '/src/assets/engagements/Accueil_icon.png' },
    { name: 'Client', imageUrl: '/src/assets/engagements/Client_icon.png' },
    { name: 'Humain', imageUrl: '/src/assets/engagements/Humain_icon.png' },
    { name: 'Magasin', imageUrl: '/src/assets/engagements/Mon_Magasin_icon.png' },
    { name: 'Environnement', imageUrl: '/src/assets/engagements/Respect_Environnement_icon.png' },
    // Ajoute d'autres pictogrammes selon tes besoins
  ]

  const handleRemoveKeyword = (keywordToRemove: string) => {
    onChange({
      target: {
        name: 'keywords',
        value: formData.keywords.filter(keyword => keyword !== keywordToRemove),
      }
    })
  }

  return (
    <div className="space-y-6">
      <Input 
        label="Email"
        name="email"
        value={formData.email}
        onChange={onChange}
        placeholder="Ex: yourname@mail.com"
      />
      <Input
        label="Mot de passe"
        name="password"
        value={formData.password}
        onChange={onChange}
        placeholder="Ex: mypassword1234"
      />
      <Input
        label="Nom de l'entreprise"
        name="company_name"
        value={formData.company_name}
        onChange={onChange}
        placeholder="Ex: Ma Boutique"
      />
      <Input
        label="Description courte"
        name="shortDescription"
        value={formData.shortDescription}
        onChange={onChange}
        placeholder="Ex: Voici l'entreprise XXX..."
      />
      <Input
        label="Type d'activité"
        name="business_type"
        value={formData.business_type}
        onChange={onChange}
        placeholder="Ex: Restaurant, Boutique, Service..."
      />
      {/* Ajout des mots-clés */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Mots-clés</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ajoutez un mot-clé"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
          />
          <Button type="button" onClick={handleAddKeyword} disabled={!newKeyword}>
            Ajouter
          </Button>
        </div>
        <ul className="mt-2 space-y-1">
          {formData.keywords.map((keyword, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{keyword}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(keyword)}
                className="text-red-500"
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
        <div className="flex flex-wrap gap-4 mt-2">
          {pictograms.map((pictogram, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectCommitment(pictogram.name)}
              className={`border p-2 rounded-md ${selectedCommitments.includes(pictogram.name) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <img src={pictogram.imageUrl} alt={pictogram.name} className="w-12 h-12" />
              <p className="mt-1 text-xs text-center">{pictogram.name}</p>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Engagements sélectionnés :</p>
          <ul className="mt-2 space-y-1">
            {selectedCommitments.map((commitment, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{commitment}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCommitments(selectedCommitments.filter(c => c !== commitment))}
                  className="text-red-500"
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

const OwnerInfoStep = ({ formData, onChange }: StepProps) => (
  <div className="space-y-6">
    <Input
      label="Nom et prénom du gérant"
      name="owner_name"
      value={formData.owner_name}
      onChange={onChange}
      placeholder="Ex: Jean Dupont"
    />
    <Input
      label="Date de naissance"
      name="owner_birthdate"
      type="date"
      value={formData.owner_birthdate}
      onChange={onChange}
    />
  </div>
)

const LocationStep = ({ formData, onChange }: StepProps) => (
  <div className="space-y-6">
    <Input
      label="Adresse"
      name="address"
      value={formData.address}
      onChange={onChange}
      placeholder="Ex: 123 rue du Commerce"
    />
    <Input
      label="Ville"
      name="city"
      value={formData.city}
      onChange={onChange}
      placeholder="Ex: Paris"
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
    />
  </div>
)

const MediaStep = ({ onFileChange }: { onFileChange: (type: 'logo' | 'cover_photo' | 'store_photos', files: File[]) => void }) => (
  <div className="space-y-8">
    <FileUpload
      label="Logo de votre entreprise"
      onChange={(files) => onFileChange('logo', files)}
    />
    <FileUpload
      label="Photo de couverture"
      onChange={(files) => onFileChange('cover_photo', files)}
    />
    <FileUpload
      label="Photos du commerce (min. 3)"
      multiple
      maxFiles={5}
      onChange={(files) => onFileChange('store_photos', files)}
    />
  </div>
)

export default RegisterSteps
