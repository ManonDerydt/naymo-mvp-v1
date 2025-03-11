import { useState } from 'react'
import { Building2, MapPin, Tags, Pencil } from 'lucide-react'
import { Button } from '@/components/ui'
import ImageGallery from '@/components/merchant/store/ImageGallery'
import EditStoreModal from '@/components/merchant/store/EditStoreModal'
import { useAuth } from '@/components/firebase/useAuth'


const Store = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  
  const { merchant, merchantData } = useAuth()
  
  const storeImages = merchant && merchantData && merchantData.store_photos 
    ? merchantData.store_photos.map((photo: string | undefined, index: number) => ({
        src: photo || null, // Affiche null si la photo est absente
        alt: `Store image ${index + 1}`
      })) 
    : [
        {
          src: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d",
          alt: "Store interior"
        },
        {
          src: "https://images.unsplash.com/photo-1534723452862-4c874018d66d",
          alt: "Products display"
        },
        {
          src: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a",
          alt: "Store front"
        }
      ]

  const initialStoreData = {
    name: "Ma Boutique",
    description: "Notre boutique est spécialisée dans la vente de produits locaux et artisanaux. Nous travaillons directement avec les producteurs de la région pour vous offrir les meilleurs produits.",
    shortDescription: "Boutique de produits locaux et artisanaux",
    address: "123 Rue du Commerce, 75001 Paris",
    type: "Épicerie fine",
    commitments: ["Produits 100% locaux", "Emballages recyclables", "Circuit court"]
  }

  return (
    <div className="space-y-8">
      <div className="relative h-64 rounded-xl overflow-hidden">
        <img
          src={merchant && merchantData ? merchantData.cover_photo : "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
          alt={merchant && merchantData ? "" : "Store cover"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
          <h1 className="text-3xl font-bold text-white">Mon Magasin</h1>
          <Button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2"
          >
            <Pencil className="w-4 h-4" />
            <span>Modifier</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">À propos</h2>
            <p className="text-gray-600">
              {merchant && merchantData ? merchantData.shortDescription : initialStoreData.shortDescription}
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Galerie photos</h2>
            <ImageGallery images={storeImages} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span>{merchant && merchantData ? merchantData.business_type : initialStoreData.type}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{merchant && merchantData ? merchantData.address : initialStoreData.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Tags className="w-5 h-5 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                {merchant && merchantData && merchantData.keywords 
                  ? merchantData.keywords.map((keyword: string | undefined, index: number) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{keyword}</span>
                    )) 
                  : (
                    <>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Bio</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Local</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Artisanal</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Engagements</h2>
            <div className="space-y-3">
            {Array.isArray(merchantData?.commitments) && merchantData.commitments.length > 0
              ? merchantData.commitments.map((commitment: string | undefined, index: number) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{commitment}</span>
                ))
              : (
                initialStoreData.commitments.map((commitment, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>{commitment}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {showEditModal && (
        <EditStoreModal
          onClose={() => setShowEditModal(false)}
          initialData={initialStoreData}
        />
      )}
    </div>
  )
}

export default Store