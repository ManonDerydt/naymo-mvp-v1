import { useState } from 'react'
import { Building2, MapPin, Tags, Pencil, Edit } from 'lucide-react'
import { Button } from '@/components/ui'
import ImageGallery from '@/components/merchant/store/ImageGallery'
import EditStoreModal from '@/components/merchant/store/EditStoreModal'
import { useAuth } from '@/components/firebase/useAuth'

const Store = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  
  const { merchant, merchantData } = useAuth()
  
  const storeImages = merchant && merchantData && merchantData.store_photos 
    ? merchantData.store_photos.map((photo: string | undefined, index: number) => ({
        src: photo || null,
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
    company_name: "Mon entreprise",
    business_type: "Mon type d'entreprise",
    longDescription: "Notre boutique est spécialisée dans la vente de produits locaux et artisanaux. Nous travaillons directement avec les producteurs de la région pour vous offrir les meilleurs produits.",
    shortDescription: "Boutique de produits locaux et artisanaux",
    address: "123 Rue du Commerce, 75001 Paris",
    type: "Épicerie fine",
    keywords: ["Bio", "Local", "Artisanal"],
    commitments: ["Produits 100% locaux", "Emballages recyclables", "Circuit court"]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec photo de couverture */}
      <div className="relative h-80 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        <img
          src={merchant && merchantData ? merchantData.cover_photo : "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      {/* Profil principal */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo de l'entreprise */}
            <div className="flex-shrink-0">
              <img
                src={merchant && merchantData ? merchantData.logo : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43"}
                alt="Logo"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {merchant && merchantData ? merchantData.company_name : initialStoreData.company_name}
              </h1>
              <p className="text-lg text-[#7fbd07] font-semibold mb-3">
                {merchant && merchantData ? merchantData.business_type : initialStoreData.business_type}
              </p>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{merchant && merchantData ? merchantData.address : initialStoreData.address}</span>
              </div>
            </div>

            {/* Bouton modifier */}
            <div className="flex-shrink-0">
              <Button 
                onClick={() => setShowEditModal(true)}
                className="bg-[#7fbd07] hover:bg-[#6ba006] text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Edit className="w-5 h-5" />
                Modifier mon magasin
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {merchant && merchantData ? 
                  (merchantData.longDescription || merchantData.shortDescription) : 
                  initialStoreData.longDescription
                }
              </p>
            </div>

            {/* Mots-clés */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mots-clés</h2>
              <div className="flex flex-wrap gap-3">
                {(merchant && merchantData && merchantData.keywords ? merchantData.keywords : initialStoreData.keywords).map((keyword: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagements */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Engagements</h2>
              <div className="flex flex-wrap gap-3">
                {(merchant && merchantData && merchantData.commitments ? merchantData.commitments : initialStoreData.commitments).map((commitment: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {commitment}
                  </span>
                ))}
              </div>
            </div>

            {/* Galerie photos */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Galerie photos</h2>
              <ImageGallery images={storeImages} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations rapides */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Type d'activité</p>
                    <p className="text-gray-600">{merchant && merchantData ? merchantData.business_type : initialStoreData.business_type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600">{merchant && merchantData ? merchantData.address : initialStoreData.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vues du profil</span>
                  <span className="font-bold text-gray-900">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clients fidèles</span>
                  <span className="font-bold text-gray-900">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Note moyenne</span>
                  <span className="font-bold text-yellow-600">4.8/5</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Créer une offre</p>
                  <p className="text-sm text-gray-600">Proposer une promotion</p>
                </button>
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Voir mes clients</p>
                  <p className="text-sm text-gray-600">Gérer la fidélité</p>
                </button>
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Statistiques</p>
                  <p className="text-sm text-gray-600">Analyser les performances</p>
                </button>
              </div>
            </div>
          </div>
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