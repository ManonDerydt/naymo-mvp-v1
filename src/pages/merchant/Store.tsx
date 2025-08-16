import { useState } from 'react'
import { Building2, MapPin, Tags, Pencil, Edit3, Camera, FileText, Play, Eye, Smartphone, Tablet, Edit, Palette, Image, Star, Users, Award } from 'lucide-react'
import { Button } from '@/components/ui'
import ImageGallery from '@/components/merchant/store/ImageGallery'
import EditStoreModal from '@/components/merchant/store/EditStoreModal'
import { useAuth } from '@/components/firebase/useAuth'

const Store = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editType, setEditType] = useState<'info' | 'description' | 'cover' | 'gallery' | 'engagements'>('info')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  
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
    longDescription: "Notre boutique est spécialisée dans la vente de produits locaux et artisanaux. Nous travaillons directement avec les producteurs de la région pour vous offrir les meilleurs produits de qualité. Découvrez notre sélection unique de produits authentiques, fabriqués avec passion et savoir-faire traditionnel.",
    shortDescription: "Boutique de produits locaux et artisanaux",
    address: "123 Rue du Commerce, 75001 Paris",
    type: "Épicerie fine",
    keywords: ["Bio", "Local", "Artisanal"],
    commitments: ["Produits 100% locaux", "Emballages recyclables", "Circuit court"]
  }

  // Icônes pour les engagements
  const getEngagementIcon = (commitment: string) => {
    const iconMap: { [key: string]: string } = {
      'Produits 100% locaux': '🏠',
      'Agriculture biologique': '🌱',
      'Emballages recyclables': '♻️',
      'Circuit court': '🚚',
      'Fabrication artisanale': '👨‍🎨',
      'Commerce équitable': '🤝',
      'Zéro déchet': '🌍',
      'Énergie verte': '⚡'
    }
    return iconMap[commitment] || '✨'
  }

  const handleEditClick = (type: 'info' | 'description' | 'cover' | 'gallery' | 'engagements') => {
    setEditType(type)
    setShowEditModal(true)
  }

  const renderPreviewContent = () => {
    const data = merchant && merchantData ? merchantData : initialStoreData
    
    return (
      <div className="bg-white min-h-screen">
        {/* Header avec image de couverture */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          <img
            src={data.cover_photo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
            alt="Store cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end space-x-4">
              <img
                src={data.logo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43"}
                alt="Logo"
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover flex-shrink-0"
              />
              <div className="text-white">
                <h1 className="text-3xl font-bold">{data.company_name}</h1>
                <p className="text-lg opacity-90">{data.business_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* À propos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-6 h-6 text-blue-600 mr-2" />
              À propos
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {data.longDescription || data.shortDescription}
            </p>
          </section>

          {/* Informations */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-red-500 mr-2" />
                Localisation
              </h3>
              <p className="text-gray-600">{data.address}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Tags className="w-5 h-5 text-green-500 mr-2" />
                Spécialités
              </h3>
              <div className="flex flex-wrap gap-2">
                {(data.keywords || []).map((keyword: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Galerie photos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Camera className="w-6 h-6 text-purple-600 mr-2" />
              Galerie photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {storeImages.slice(0, 6).map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                />
              ))}
            </div>
          </section>

          {/* Engagements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 text-green-600 mr-2" />
              Nos engagements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(data.commitments || []).map((commitment: string, index: number) => (
                <div key={index} className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-xl border border-green-200">
                  <span className="text-2xl">{getEngagementIcon(commitment)}</span>
                  <span className="text-green-800 font-medium text-xs text-center">{commitment}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col font-['Inter',_'system-ui',_sans-serif]">
      {/* Header */}
      <div className="flex-shrink-0 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mon Magasin</h1>
            <p className="text-sm text-gray-600 leading-relaxed">Gérez et personnalisez la présentation de votre magasin</p>
          </div>
          <Button 
            onClick={() => setShowPreview(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] transform hover:scale-105 transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            <span>Prévisualiser</span>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            {/* Image de couverture */}
            <section className="relative h-48 rounded-xl overflow-hidden group">
              <img
                src={merchant && merchantData ? merchantData.cover_photo : "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
                alt="Store cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold">{merchant && merchantData ? merchantData.company_name : "Mon Magasin"}</h2>
                <p className="text-sm opacity-90">{merchant && merchantData ? merchantData.business_type : "Type d'entreprise"}</p>
              </div>
              <button 
                onClick={() => handleEditClick('cover')}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Modifier la photo de couverture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </section>

            {/* À propos */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 text-[#7ebd07] mr-2" />
                  À propos
                </h2>
                <button 
                  onClick={() => handleEditClick('description')}
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier la description"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {merchant && merchantData ? 
                  (merchantData.longDescription || merchantData.shortDescription) : 
                  initialStoreData.longDescription
                }
              </p>
            </section>

            {/* Galerie photos */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Camera className="w-5 h-5 text-[#7ebd07] mr-2" />
                  Galerie photos
                </h2>
                <button 
                  onClick={() => handleEditClick('gallery')}
                  className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100 text-[#7ebd07] hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier les photos"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
              <ImageGallery images={storeImages} />
            </section>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6 overflow-y-auto">
            {/* Informations */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Building2 className="w-5 h-5 text-[#7ebd07] mr-2" />
                  Informations
                </h2>
                <button 
                  onClick={() => handleEditClick('info')}
                  className="p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier les informations"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-[#7ebd07]" />
                  <span className="text-sm">{merchant && merchantData ? merchantData.business_type : initialStoreData.business_type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-sm">{merchant && merchantData ? merchantData.address : initialStoreData.address}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Tags className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="flex flex-wrap gap-2">
                    {merchant && merchantData && merchantData.keywords 
                      ? merchantData.keywords.map((keyword: string | undefined, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{keyword}</span>
                        )) 
                      : (
                        initialStoreData.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{keyword}</span>
                        ))
                      )}
                  </div>
                </div>
              </div>
            </section>

            {/* Engagements */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Award className="w-5 h-5 text-[#7ebd07] mr-2" />
                  Engagements
                </h2>
                <button 
                  onClick={() => handleEditClick('engagements')}
                  className="p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-600 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Modifier les engagements"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {merchant && merchantData && merchantData.commitments
                  ? merchantData.commitments.map((commitment: string | undefined, index: number) => (
                      <div key={index} className="flex flex-col items-center p-3 bg-[#ebffbc] rounded-lg text-center space-y-1">
                        <span className="text-2xl mb-1">{getEngagementIcon(commitment || '')}</span>
                        <span className="text-[#396F04] font-medium text-xs leading-tight">{commitment}</span>
                      </div>
                    ))
                  : (
                    initialStoreData.commitments.map((commitment, index) => (
                      <div key={index} className="flex flex-col items-center p-3 bg-[#ebffbc] rounded-lg text-center space-y-1">
                        <span className="text-2xl mb-1">{getEngagementIcon(commitment)}</span>
                        <span className="text-[#396F04] font-medium text-xs leading-tight">{commitment}</span>
                      </div>
                    ))
                  )}
              </div>
            </section>

            {/* Tutoriel vidéo */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-[#7ebd07]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Play className="w-5 h-5 text-[#7ebd07] mr-2" />
                  Tutoriel
                </h2>
              </div>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/zoFnEF-A7kQ"
                  title="Comment optimiser votre page magasin"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Découvrez comment optimiser votre page magasin pour attirer plus de clients
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Prévisualisation de votre magasin</h3>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2 bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-[#7ebd07] text-white' : 'text-gray-600 hover:bg-gray-300'}`}
                    title="Vue ordinateur"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded-md transition-all ${previewMode === 'tablet' ? 'bg-[#7ebd07] text-white' : 'text-gray-600 hover:bg-gray-300'}`}
                    title="Vue tablette"
                  >
                    <Tablet className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-[#7ebd07] text-white' : 'text-gray-600 hover:bg-gray-300'}`}
                    title="Vue mobile"
                  >
                    <Smartphone className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 h-full overflow-auto bg-gray-100">
              <div className={`mx-auto bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
                previewMode === 'desktop' ? 'w-full max-w-6xl' :
                previewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'
              }`}>
                <div className="h-[600px] overflow-y-auto">
                  {renderPreviewContent()}
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
          editType={editType}
        />
      )}
    </div>
  )
}

export default Store