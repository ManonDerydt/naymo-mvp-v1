import { useState, useEffect } from 'react'
import { Building2, MapPin, Tags, Pencil, Edit, X } from 'lucide-react'
import { Button } from '@/components/ui'
import ImageGallery from '@/components/merchant/store/ImageGallery'
import EditStoreModal from '@/components/merchant/store/EditStoreModal'
import { useAuth } from '@/components/firebase/useAuth'

const Store = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewMode, setViewMode] = useState('desktop')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  
  const { merchant, merchantData } = useAuth()

  // Détecter si l'utilisateur est sur mobile/tablette
  useEffect(() => {
    const checkMobileDevice = () => {
      const isMobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobileDevice(isMobile)
      if (isMobile) {
        setViewMode('mobile')
      }
    }

    checkMobileDevice()
    window.addEventListener('resize', checkMobileDevice)
    return () => window.removeEventListener('resize', checkMobileDevice)
  }, [])
  
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

  const getCurrentFieldValue = (field: string) => {
    const data = merchant && merchantData ? merchantData : initialStoreData
    switch (field) {
      case 'company_name': return data.company_name
      case 'business_type': return data.business_type
      case 'address': return data.address
      case 'description': return data.longDescription || data.shortDescription
      case 'keywords': return data.keywords
      case 'commitments': return data.commitments
      default: return ''
    }
  }

  const handleSaveField = (field: string, value: any) => {
    console.log(`Saving ${field}:`, value)
  }

  // Contenu de la page magasin
  const StoreContent = ({ isPreview = false }: { isPreview?: boolean }) => (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec photo de couverture */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        <img
          src={merchant && merchantData ? merchantData.cover_photo : "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      {/* Profil principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            {/* Logo de l'entreprise */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={merchant && merchantData ? merchantData.logo : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43"}
                alt="Logo"
                className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>

            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  {merchant && merchantData ? merchantData.company_name : initialStoreData.company_name}
                </h1>
                {!isPreview && (
                  <button
                    onClick={() => setEditingField('company_name')}
                    className="p-1 text-gray-400 hover:text-[#7fbd07] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-3">
                <p className="text-base md:text-lg lg:text-lg text-[#7fbd07] font-semibold">
                  {merchant && merchantData ? merchantData.business_type : initialStoreData.business_type}
                </p>
                {!isPreview && (
                  <button
                    onClick={() => setEditingField('business_type')}
                    className="p-1 text-gray-400 hover:text-[#7fbd07] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col md:flex-row items-center text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  <span className="text-sm md:text-base">{merchant && merchantData ? merchantData.address : initialStoreData.address}</span>
                </div>
                {!isPreview && (
                  <button
                    onClick={() => setEditingField('address')}
                    className="p-1 ml-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Bouton modifier global - seulement en desktop et pas en preview */}
            {!isPreview && viewMode === 'desktop' && (
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => setShowEditModal(true)}
                  className="bg-[#7fbd07] hover:bg-[#6ba006] text-white px-6 md:px-8 py-2 md:py-3 rounded-xl flex items-center gap-2 shadow-lg text-sm md:text-base"
                >
                  <Edit className="w-4 h-4 md:w-5 md:h-5" />
                  Modifier tout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Description</h2>
                {!isPreview && (
                  <button
                    onClick={() => setEditingField('description')}
                    className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {merchant && merchantData ? 
                  (merchantData.longDescription || merchantData.shortDescription) : 
                  initialStoreData.longDescription
                }
              </p>
            </div>

            {/* Mots-clés */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Mots-clés</h2>
                {!isPreview && (
                  <button
                    onClick={() => setEditingField('keywords')}
                    className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {(merchant && merchantData && merchantData.keywords ? merchantData.keywords : initialStoreData.keywords).map((keyword: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 md:px-4 py-1 md:py-2 bg-blue-100 text-blue-800 rounded-full font-medium text-xs md:text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagements */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Engagements</h2>
                {!isPreview && (
                  <button
                    onClick={() => setEditingField('commitments')}
                    className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {(merchant && merchantData && merchantData.commitments ? merchantData.commitments : initialStoreData.commitments).map((commitment: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 md:px-4 py-1 md:py-2 bg-green-100 text-green-800 rounded-full font-medium text-xs md:text-sm"
                  >
                    {commitment}
                  </span>
                ))}
              </div>
            </div>

            {/* Galerie photos */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Galerie photos</h2>
                {!isPreview && (
                  <button
                    onClick={() => setEditingField('gallery')}
                    className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <ImageGallery images={storeImages} />
            </div>
          </div>

          {/* Sidebar - masquée en mobile */}
          <div className="hidden lg:block space-y-4 md:space-y-6">
            {/* Informations rapides */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Type d'activité</p>
                    <p className="text-gray-600 text-sm">{merchant && merchantData ? merchantData.business_type : initialStoreData.business_type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600 text-sm">{merchant && merchantData ? merchantData.address : initialStoreData.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Vues du profil</span>
                  <span className="font-bold text-gray-900">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Clients fidèles</span>
                  <span className="font-bold text-gray-900">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Note moyenne</span>
                  <span className="font-bold text-yellow-600">4.8/5</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl hover:bg-green-50 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">Créer une offre</p>
                  <p className="text-xs text-gray-600">Proposer une promotion</p>
                </button>
                <button className="w-full text-left p-3 rounded-xl hover:bg-green-50 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">Voir mes clients</p>
                  <p className="text-xs text-gray-600">Gérer la fidélité</p>
                </button>
                <button className="w-full text-left p-3 rounded-xl hover:bg-green-50 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">Statistiques</p>
                  <p className="text-xs text-gray-600">Analyser les performances</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* En-tête avec titre et boutons de vue */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Aperçu de votre magasin</h1>
        <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">Voici comment vos clients verront votre magasin sur différents appareils</p>
        
        {/* Sélecteur de vue responsive - seulement sur desktop */}
        {!isMobileDevice && (
          <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mb-4 lg:mb-6">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                viewMode === 'desktop'
                  ? 'bg-[#7fbd07] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🖥️ Desktop
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                viewMode === 'tablet'
                  ? 'bg-[#7fbd07] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              📱 Tablette
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                viewMode === 'mobile'
                  ? 'bg-[#7fbd07] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              📱 Mobile
            </button>
          </div>
        )}

        {/* Message pour les utilisateurs mobiles */}
        {isMobileDevice && (
          <div className="text-center mb-4 lg:mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <span className="text-xs lg:text-sm font-medium">📱 Vue mobile automatique</span>
            </div>
          </div>
        )}
      </div>

      {/* Aperçu responsive */}
      <div className="flex justify-center">
        {viewMode === 'desktop' && !isMobileDevice ? (
          // Vue desktop - pleine largeur
          <div className="w-full">
            <StoreContent />
          </div>
        ) : viewMode === 'tablet' && !isMobileDevice ? (
          // Vue tablette - conteneur simulé
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-2xl">
            <div className="bg-white rounded-xl lg:rounded-2xl overflow-hidden" style={{ width: '320px', height: '480px' }}>
              <div className="h-full overflow-y-auto">
                <StoreContent isPreview={true} />
              </div>
            </div>
            <div className="text-center mt-2 lg:mt-4">
              <span className="text-white text-xs lg:text-sm font-medium">Tablette</span>
            </div>
          </div>
        ) : (
          // Vue mobile - conteneur simulé ou vue native
          isMobileDevice ? (
            // Vue mobile native pour les vrais appareils mobiles
            <div className="w-full">
              <StoreContent />
            </div>
          ) : (
            // Vue mobile simulée pour desktop
            <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-3 lg:p-4 shadow-2xl">
              <div className="bg-white rounded-xl lg:rounded-2xl overflow-hidden" style={{ width: '280px', height: '500px' }}>
                <div className="h-full overflow-y-auto">
                  <StoreContent isPreview={true} />
                </div>
              </div>
              <div className="text-center mt-2 lg:mt-4">
                <span className="text-white text-xs lg:text-sm font-medium">Mobile</span>
              </div>
            </div>
          )
        )}
      </div>

      {/* Bouton d'édition globale pour desktop seulement */}
      {(viewMode === 'desktop' || isMobileDevice) && (
        <div className="fixed bottom-6 lg:bottom-8 right-4 lg:right-8">
          <Button 
            onClick={() => setShowEditModal(true)}
            className="bg-[#7fbd07] hover:bg-[#6ba006] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-full shadow-lg flex items-center gap-2 text-sm lg:text-base"
          >
            <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
            Modifier tout
          </Button>
        </div>
      )}

      {/* Modals d'édition individuelle */}
      {editingField && (
        <EditFieldModal
          field={editingField}
          currentValue={getCurrentFieldValue(editingField)}
          onSave={handleSaveField}
          onClose={() => setEditingField(null)}
        />
      )}

      {/* Modal d'édition globale */}
      {showEditModal && (
        <EditStoreModal
          onClose={() => setShowEditModal(false)}
          initialData={initialStoreData}
        />
      )}
    </div>
  )
}

// Composant pour l'édition de champs individuels
const EditFieldModal = ({ field, currentValue, onSave, onClose }: {
  field: string
  currentValue: any
  onSave: (field: string, value: any) => void
  onClose: () => void
}) => {
  const [value, setValue] = useState(currentValue)

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      company_name: 'Nom de l\'entreprise',
      business_type: 'Type d\'activité',
      address: 'Adresse',
      description: 'Description',
      keywords: 'Mots-clés',
      commitments: 'Engagements',
      gallery: 'Galerie photos'
    }
    return labels[field] || field
  }

  const handleSave = () => {
    onSave(field, value)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Modifier {getFieldLabel(field)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {field === 'description' ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7fbd07] focus:border-transparent"
              placeholder={`Entrez ${getFieldLabel(field).toLowerCase()}`}
            />
          ) : field === 'keywords' || field === 'commitments' ? (
            <textarea
              value={Array.isArray(value) ? value.join(', ') : value}
              onChange={(e) => setValue(e.target.value.split(',').map((item: string) => item.trim()))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7fbd07] focus:border-transparent"
              placeholder="Séparez par des virgules"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7fbd07] focus:border-transparent"
              placeholder={`Entrez ${getFieldLabel(field).toLowerCase()}`}
            />
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Store