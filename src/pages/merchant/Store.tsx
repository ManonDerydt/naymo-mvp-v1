import { useState } from 'react'
import { Building2, MapPin, Tags, Pencil, Edit, X } from 'lucide-react'
import { Button } from '@/components/ui'
import ImageGallery from '@/components/merchant/store/ImageGallery'
import EditStoreModal from '@/components/merchant/store/EditStoreModal'
import { useAuth } from '@/components/firebase/useAuth'

const Store = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewMode, setViewMode] = useState('desktop')
  const [editingField, setEditingField] = useState<string | null>(null)
  
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

  // Fonctions pour les classes responsives
  const getContainerClass = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm'
      case 'tablet': return 'max-w-2xl'
      default: return 'max-w-4xl'
    }
  }

  const getLayoutClass = () => {
    switch (viewMode) {
      case 'mobile': return 'flex-col'
      case 'tablet': return 'flex-col md:flex-row'
      default: return 'flex-col md:flex-row'
    }
  }

  const getLogoSize = () => {
    switch (viewMode) {
      case 'mobile': return 'w-20 h-20'
      case 'tablet': return 'w-24 h-24'
      default: return 'w-32 h-32'
    }
  }

  const getTitleSize = () => {
    switch (viewMode) {
      case 'mobile': return 'text-xl'
      case 'tablet': return 'text-2xl'
      default: return 'text-3xl'
    }
  }

  const getSubtitleSize = () => {
    switch (viewMode) {
      case 'mobile': return 'text-base'
      case 'tablet': return 'text-lg'
      default: return 'text-lg'
    }
  }

  const getSectionTitleSize = () => {
    switch (viewMode) {
      case 'mobile': return 'text-lg'
      case 'tablet': return 'text-xl'
      default: return 'text-xl'
    }
  }

  const getTextSize = () => {
    switch (viewMode) {
      case 'mobile': return 'text-sm'
      case 'tablet': return 'text-base'
      default: return 'text-base'
    }
  }

  const getTagSize = () => {
    switch (viewMode) {
      case 'mobile': return 'text-xs'
      case 'tablet': return 'text-sm'
      default: return 'text-sm'
    }
  }

  const getGridClass = () => {
    switch (viewMode) {
      case 'mobile': return 'grid grid-cols-1'
      case 'tablet': return 'grid grid-cols-1 lg:grid-cols-2'
      default: return 'grid grid-cols-1 lg:grid-cols-3'
    }
  }

  const getMainColumnClass = () => {
    switch (viewMode) {
      case 'mobile': return ''
      case 'tablet': return 'lg:col-span-1'
      default: return 'lg:col-span-2'
    }
  }

  const getSidebarClass = () => {
    switch (viewMode) {
      case 'tablet': return 'lg:col-span-1'
      default: return ''
    }
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
    // Ici vous pouvez implémenter la logique de sauvegarde
    console.log(`Saving ${field}:`, value)
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

      {/* Sélecteur de vue responsive */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 mb-6">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'desktop'
                ? 'bg-[#7fbd07] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🖥️ Desktop
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'tablet'
                ? 'bg-[#7fbd07] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📱 Tablette
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'mobile'
                ? 'bg-[#7fbd07] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📱 Mobile
          </button>
        </div>
      </div>

      {/* Profil principal */}
      <div className={`mx-auto px-6 relative z-10 ${getContainerClass()}`}>
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className={`flex items-start gap-6 ${getLayoutClass()}`}>
            {/* Logo de l'entreprise */}
            <div className="flex-shrink-0">
              <img
                src={merchant && merchantData ? merchantData.logo : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43"}
                alt="Logo"
                className={`rounded-full object-cover border-4 border-white shadow-lg ${getLogoSize()}`}
              />
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`font-bold text-gray-900 ${getTitleSize()}`}>
                  {merchant && merchantData ? merchantData.company_name : initialStoreData.company_name}
                </h1>
                <button
                  onClick={() => setEditingField('company_name')}
                  className="p-1 text-gray-400 hover:text-[#7fbd07] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <p className={`text-[#7fbd07] font-semibold ${getSubtitleSize()}`}>
                  {merchant && merchantData ? merchantData.business_type : initialStoreData.business_type}
                </p>
                <button
                  onClick={() => setEditingField('business_type')}
                  className="p-1 text-gray-400 hover:text-[#7fbd07] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{merchant && merchantData ? merchantData.address : initialStoreData.address}</span>
                <button
                  onClick={() => setEditingField('address')}
                  className="p-1 ml-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bouton modifier global - seulement en desktop */}
            {viewMode === 'desktop' && (
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => setShowEditModal(true)}
                  className="bg-[#7fbd07] hover:bg-[#6ba006] text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <Edit className="w-5 h-5" />
                  Modifier tout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className={`gap-6 ${getGridClass()}`}>
          {/* Colonne principale */}
          <div className={`space-y-6 ${getMainColumnClass()}`}>
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold text-gray-900 ${getSectionTitleSize()}`}>Description</h2>
                <button
                  onClick={() => setEditingField('description')}
                  className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <p className={`text-gray-700 leading-relaxed ${getTextSize()}`}>
                {merchant && merchantData ? 
                  (merchantData.longDescription || merchantData.shortDescription) : 
                  initialStoreData.longDescription
                }
              </p>
            </div>

            {/* Mots-clés */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold text-gray-900 ${getSectionTitleSize()}`}>Mots-clés</h2>
                <button
                  onClick={() => setEditingField('keywords')}
                  className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {(merchant && merchantData && merchantData.keywords ? merchantData.keywords : initialStoreData.keywords).map((keyword: string, index: number) => (
                  <span 
                    key={index} 
                    className={`px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium ${getTagSize()}`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagements */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold text-gray-900 ${getSectionTitleSize()}`}>Engagements</h2>
                <button
                  onClick={() => setEditingField('commitments')}
                  className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {(merchant && merchantData && merchantData.commitments ? merchantData.commitments : initialStoreData.commitments).map((commitment: string, index: number) => (
                  <span 
                    key={index} 
                    className={`px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium ${getTagSize()}`}
                  >
                    {commitment}
                  </span>
                ))}
              </div>
            </div>

            {/* Galerie photos */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold text-gray-900 ${getSectionTitleSize()}`}>Galerie photos</h2>
                <button
                  onClick={() => setEditingField('gallery')}
                  className="p-2 text-gray-400 hover:text-[#7fbd07] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <ImageGallery images={storeImages} />
            </div>
          </div>

          {/* Sidebar - masquée en mobile */}
          {viewMode !== 'mobile' && (
            <div className={`space-y-6 ${getSidebarClass()}`}>
              {/* Informations rapides */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className={`font-bold text-gray-900 mb-4 ${getSectionTitleSize()}`}>Informations</h3>
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
                <h3 className={`font-bold text-gray-900 mb-4 ${getSectionTitleSize()}`}>Statistiques</h3>
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
                <h3 className={`font-bold text-gray-900 mb-4 ${getSectionTitleSize()}`}>Actions rapides</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-xl hover:bg-green-50 transition-colors">
                    <p className="font-medium text-gray-900">Créer une offre</p>
                    <p className="text-sm text-gray-600">Proposer une promotion</p>
                  </button>
                  <button className="w-full text-left p-3 rounded-xl hover:bg-green-50 transition-colors">
                    <p className="font-medium text-gray-900">Voir mes clients</p>
                    <p className="text-sm text-gray-600">Gérer la fidélité</p>
                  </button>
                  <button className="w-full text-left p-3 rounded-xl hover:bg-green-50 transition-colors">
                    <p className="font-medium text-gray-900">Statistiques</p>
                    <p className="text-sm text-gray-600">Analyser les performances</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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