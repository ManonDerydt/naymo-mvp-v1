import { useState } from 'react'
import { Building2, MapPin, Tags, Pencil, Edit3, Camera, FileText, Play, Eye, Smartphone, Tablet, Edit, Palette, Image } from 'lucide-react'
import { Button } from '@/components/ui'
import ImageGallery from '@/components/merchant/store/ImageGallery'
import EditStoreModal from '@/components/merchant/store/EditStoreModal'
import { useAuth } from '@/components/firebase/useAuth'


const Store = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  
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
    <div className="space-y-8 font-['Inter',_'system-ui',_sans-serif]">
      <div className="relative h-64 rounded-xl overflow-hidden">
        
        <img
          src={merchant && merchantData ? merchantData.cover_photo : "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
          alt={merchant && merchantData ? "" : "Store cover"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
          <h1 className="text-4xl font-bold text-white tracking-tight">Mon Magasin</h1>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] transform hover:scale-105 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              <span>Prévisualiser</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <p className="text-lg text-gray-600 leading-relaxed">
            Gérez et personnalisez la présentation de votre magasin pour attirer plus de clients.
          </p>
          
          <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">À propos</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier la description"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600">
              {merchant && merchantData ? 
                (merchantData.shortDescription && merchantData.shortDescription.length > 300 ? 
                  merchantData.shortDescription.substring(0, 300) + '...' : 
                  merchantData.shortDescription
                ) : 
                initialStoreData.shortDescription
              }
            </p>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Galerie photos</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100 text-[#7ebd07] hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier les photos"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Organiser la galerie"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ImageGallery images={storeImages} />
          </section>

          {/* Vidéo explicative en bas à droite */}
          <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Tutoriel</h2>
              <Play className="w-5 h-5 text-[#7ebd07]" />
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Comment optimiser votre page magasin"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Découvrez comment optimiser votre page magasin pour attirer plus de clients
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Informations</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier les informations"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier le style"
                >
                  <Palette className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-[#7ebd07]" />
                <span>{merchant && merchantData ? merchantData.business_type : initialStoreData.business_type}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>{merchant && merchantData ? merchantData.address : initialStoreData.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Tags className="w-5 h-5 text-blue-500" />
                <div className="flex flex-wrap gap-2">
                {merchant && merchantData && merchantData.keywords 
                  ? merchantData.keywords.map((keyword: string | undefined, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{keyword}</span>
                    )) 
                  : (
                    initialStoreData.keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{keyword}</span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Engagements</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-600 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier les engagements"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
            {merchant && merchantData && merchantData.commitments
              ? merchantData.commitments.map((commitment: string | undefined, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-[#ebffbc] rounded-lg">
                    <span className="w-3 h-3 bg-[#7ebd07] rounded-full" />
                    <span className="text-[#396F04] font-medium">{commitment}</span>
                  </div>
                ))
              : (
                initialStoreData.commitments.map((commitment, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-[#ebffbc] rounded-lg">
                    <span className="w-2 h-2 bg-[#7ebd07] rounded-full" />
                    <span className="text-[#396F04] font-medium">{commitment}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Prévisualisation</h3>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-lg ${previewMode === 'desktop' ? 'bg-[#7ebd07] text-white' : 'text-gray-400 hover:bg-gray-100'} transition-all duration-200`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded-lg ${previewMode === 'tablet' ? 'bg-[#7ebd07] text-white' : 'text-gray-400 hover:bg-gray-100'} transition-all duration-200`}
                  >
                    <Tablet className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-[#7ebd07] text-white' : 'text-gray-400 hover:bg-gray-100'} transition-all duration-200`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 flex justify-center">
              <div className={`bg-gray-100 rounded-lg overflow-hidden ${
                previewMode === 'desktop' ? 'w-full max-w-4xl' :
                previewMode === 'tablet' ? 'w-96' : 'w-80'
              }`}>
                <div className="bg-white p-4 min-h-96">
                  <h4 className="text-lg font-bold mb-2">
                    {merchant && merchantData ? merchantData.company_name : "Mon Magasin"}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {merchant && merchantData ? merchantData.shortDescription : initialStoreData.shortDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {storeImages.slice(0, 4).map((image, index) => (
                      <img key={index} src={image.src} alt={image.alt} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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