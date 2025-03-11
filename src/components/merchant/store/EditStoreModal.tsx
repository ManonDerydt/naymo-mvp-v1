import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'
import FileUpload from '@/components/forms/FileUpload'
import { db, storage } from '@/components/firebase/firebaseConfig'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/components/firebase/useAuth'

interface EditStoreModalProps {
  onClose: () => void
  initialData: {
    name: string
    description: string
    shortDescription: string
    address: string
    type: string
    commitments: string[];
    logo?: string;
    cover_photo?: string;
    store_photos?: string;
  }
}

const EditStoreModal = ({ onClose, initialData }: EditStoreModalProps) => {
  const [formData, setFormData] = useState(initialData)
  const [step, setStep] = useState<'info' | 'media' | 'success'>('info')
  const [mediaFiles, setMediaFiles] = useState({
    logo: [] as File[],
    cover: [] as File[],
    gallery: [] as File[]
  })
  
  const { merchant, merchantData } = useAuth();

  // Initialise formData avec merchantData si disponible
  useEffect(() => {
    if (merchantData) {
      setFormData({
        name: merchantData.name || "",
        description: merchantData.description || "",
        shortDescription: merchantData.shortDescription || "",
        address: merchantData.address || "",
        type: merchantData.type || "",
        commitments: merchantData.commitments || [],
        logo: merchantData.logo || "",
        cover_photo: merchantData.cover_photo || "",
        store_photos: merchantData.store_photos || "",
      });
    }
  }, [merchantData]); // Ce useEffect s'exécute lorsque merchantData change

  const handleSubmit = async () => {
    try {
      // Uploader le logo
      let logoURL: string | null = null;
      if (mediaFiles.logo.length > 0) {
        const logoRef = ref(storage, `logos/${mediaFiles.logo[0].name}`);
        await uploadBytes(logoRef, mediaFiles.logo[0]);
        logoURL = await getDownloadURL(logoRef);
      }

      // Uploader la photo de couverture
      let coverPhotoURL: string | null = null;
      if (mediaFiles.cover.length > 0) {
        const coverPhotoRef = ref(storage, `cover_photos/${mediaFiles.cover[0].name}`);
        await uploadBytes(coverPhotoRef, mediaFiles.cover[0]);
        coverPhotoURL = await getDownloadURL(coverPhotoRef);
      }

      // Uploader les photos du commerce
      let storePhotoURLs: string[] = [];
      for (const photo of mediaFiles.gallery) {
        const storePhotoRef = ref(storage, `store_photos/${photo.name}`);
        await uploadBytes(storePhotoRef, photo);
        const photoURL = await getDownloadURL(storePhotoRef);
        storePhotoURLs.push(photoURL);
      }

      const updatedData: any = {
        name: formData.name,
        longDescription: formData.description,
        shortDescription: formData.shortDescription,
        address: formData.address,
        business_type: formData.type,
        commitments: formData.commitments,
      };

      // Ajoute uniquement si une nouvelle image a été uploadée
      if (logoURL) updatedData.logo = logoURL;
      if (coverPhotoURL) updatedData.cover_photo = coverPhotoURL;
      if (storePhotoURLs.length > 0) updatedData.store_photos = storePhotoURLs;

      // Enregistrer les données du commerçant dans Firestore sous le document correspondant à son UID
      if (merchant) {
        // console.log("Données envoyées à Firestore:", {
        //   name: formData.name,
        //   longDescription: formData.description,
        //   shortDescription: formData.shortDescription,
        //   address: formData.address,
        //   business_type: formData.type,
        //   commitments: formData.commitments,
        //   logo: logoURL || initialData.logo,
        //   cover_photo: coverPhotoURL || initialData.cover_photo,
        //   store_photos: storePhotoURLs.length > 0 ? storePhotoURLs : initialData.store_photos
        // });

        await updateDoc(doc(db, "merchant", merchant.uid), updatedData)
        
        console.log("Données du commerçant mises à jour sous l'UID : ", merchant.uid);

        setFormData((prev) => ({
          ...prev,
          ...updatedData,
        }));
      }
      
      setStep('success')
    } catch (error) {
      console.log("Erreur lors de la mise à jour des données : ", error)
    }
  }

  const handleFileChange = (type: 'logo' | 'cover' | 'gallery', files: File[]) => {
    console.log(`Fichiers ajoutés pour ${type}:`, files);
    setMediaFiles(prev => ({
      ...prev,
      [type]: files
    }))
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Modifications enregistrées !</h3>
          <p className="mt-2 text-sm text-gray-500">
            Les informations de votre magasin ont été mises à jour avec succès.
          </p>
          <Button
            onClick={onClose}
            className="mt-6"
          >
            Fermer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Modifier les informations</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'info' ? (
            <div className="space-y-6">
              <Input
                label="Nom du commerce"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description courte
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description complète
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <Input
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <Input
                label="Type de commerce"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />

              <Input
                label="Pictogrammes d'engagements"
                value={formData.commitments.join(', ')}
                onChange={(e) => setFormData({ ...formData, commitments: e.target.value.split(',').map(item => item.trim()) })}
              />

              <div className="pt-4 flex justify-end space-x-4">
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={() => setStep('media')}>
                  Suivant
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <FileUpload
                label="Logo"
                onChange={(files) => handleFileChange('logo', files)}
                maxFiles={1}
              />
              
              <FileUpload
                label="Photo de couverture"
                onChange={(files) => handleFileChange('cover', files)}
                maxFiles={1}
              />
              
              <FileUpload
                label="Photos du commerce"
                multiple
                maxFiles={5}
                onChange={(files) => handleFileChange('gallery', files)}
              />

              <div className="pt-4 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setStep('info')}>
                  Retour
                </Button>
                <Button onClick={handleSubmit}>
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditStoreModal
