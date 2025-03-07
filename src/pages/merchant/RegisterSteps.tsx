import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Store } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input, FileUpload } from '@/components/forms'

import { doc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db, storage } from '@/components/firebase/firebaseConfig'

const steps = [
  {
    id: 'business',
    title: 'Information entreprise',
    fields: ['email', 'password', 'company_name', 'business_type', 'keywords', 'commitments'],
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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
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
      const user = userCredential.user;

      console.log("Utilisateur créé avec UID :", user.uid);

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
        email: formData.email,
        company_name: formData.company_name,
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

      console.log("Données du commerçant enregistrées sous l'UID : ", user.uid);

      navigate('/dashboard')
      
    } catch (error) {
      console.log("Erreur lors de l'enregistrement des données : ", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const [newCommitment, setNewCommitment] = useState('')

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

  const handleAddCommitment = () => {
    if (newCommitment && !formData.keywords.includes(newCommitment)) {
      onChange({
        target: {
          name: 'commitments',
          value: [...formData.commitments, newCommitment],
        },
      })
      setNewCommitment('') // Réinitialiser le champ de texte
    }
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
        label="Type d'activité"
        name="business_type"
        value={formData.business_type}
        onChange={onChange}
        placeholder="Ex: Restaurant, Boutique, Service..."
      />
      {/* Ajout des mots clés */}
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
            </li>
          ))}
        </ul>
      </div>
      {/* Ajout des pictogrammes d'engagements */}
      <div>
      <label className="block text-sm font-medium text-gray-700">Pictogrammes d'engagements</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ajoutez un engagement"
            value={newCommitment}
            onChange={(e) => setNewCommitment(e.target.value)}
          />
          <Button type="button" onClick={handleAddCommitment} disabled={!newCommitment}>
            Ajouter
          </Button>
        </div>
        <ul className="mt-2 space-y-1">
          {formData.commitments.map((commitment, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{commitment}</span>
            </li>
          ))}
        </ul>
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
      onChange={onChange}
      placeholder="Ex: 75001"
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

interface StepProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default RegisterSteps