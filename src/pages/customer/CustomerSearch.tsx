import { Bell, Search, MapPin, Star, Filter } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/firebase/useAuth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"
import Map from "@/components/map/Map"

const CustomerSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [stores, setStores] = useState<{ 
        name: string; 
        type: string; 
        owner_name: string; 
        shortDescription: string; 
        logo: string, 
        hasOffers: boolean;
        address: string;
        longDescription?: string;
        keywords?: string[];
        commitments?: string[];
        cover_photo?: string;
        store_photos?: string[];
        city?: string;
        postal_code?: string;
    }[]>([]);
    const [loading, setLoading] = useState(true);

    const { customer, customerData } = useAuth();
    
    useEffect(() => {
        const fetchMerchantsAndOffers = async () => {
            try {
                const merchantSnapshot = await getDocs(collection(db, "merchant"));
                const merchantData = await Promise.all(
                    merchantSnapshot.docs.map(async (doc) => {
                        const merchantId = doc.id;
                        const data = doc.data();

                        const merchant = {
                            id: merchantId,
                            name: data.company_name || "Nom inconnu",
                            type: data.business_type || "Type inconnu",
                            owner_name: data.owner_name || "Propriétaire inconnu",
                            shortDescription: data.shortDescription || "Aucune description",
                            longDescription: data.longDescription || data.shortDescription || "Aucune description",
                            logo: data.logo || "/default-logo.png",
                            cover_photo: data.cover_photo || "",
                            store_photos: data.store_photos || [],
                            keywords: data.keywords || [],
                            commitments: data.commitments || [],
                            city: data.city || "",
                            postal_code: data.postal_code || "",
                            hasOffers: false,
                            address: data.address && data.address !== "Adresse inconnue" ? data.address : "",
                        };

                        const offerQuery = query(
                            collection(db, "merchant_has_offer"),
                            where("merchant_id", "==", merchantId)
                        );
                        const offerSnapshot = await getDocs(offerQuery);
                        if (offerSnapshot.docs.length > 0) {
                            merchant.hasOffers = true;
                        }

                        return merchant;
                    })
                );
                setStores(merchantData);
            } catch (error) {
                console.error("Erreur lors de la récupération des magasins ou des offres :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMerchantsAndOffers();
    }, []);

    const uniqueTypes = [...new Set(stores.map((store) => store.type))].sort();

    const filteredResults = stores
        .filter((store) => {
            const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !selectedType || store.type === selectedType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => (a.hasOffers === b.hasOffers ? 0 : a.hasOffers ? -1 : 1));

    const getTypeEmoji = (type: string) => {
        const emojiMap: { [key: string]: string } = {
            'Restaurant': '🍽️',
            'Mode': '👗',
            'Tech': '💻',
            'Beauté': '💄',
            'Sport': '⚽',
            'Alimentation': '🛒',
            'Services': '🔧',
            'Santé': '🏥',
            'Culture': '🎭',
            'Loisirs': '🎮'
        };
        return emojiMap[type] || '🏪';
    };

    const openMerchantModal = (merchant: any) => {
        setSelectedMerchant(merchant);
        setIsModalOpen(true);
    };

    const closeMerchantModal = () => {
        setSelectedMerchant(null);
        setIsModalOpen(false);
    };

    const openImageModal = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsImageModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-white pb-10">
            {/* ID Client en haut */}
            {customerData?.code && (
                <div className="text-center pt-6 pb-4">
                    <div className="inline-block bg-white px-4 sm:px-8 py-3 sm:py-4 rounded-3xl shadow-xl border-2 border-[#c9eaad]">
                        <p className="text-sm font-medium text-[#589507] mb-1">Votre ID Client</p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#0A2004] tracking-wider">{customerData.code}</p>
                    </div>
                </div>
            )}

            {/* Titre principal */}
            <div className="px-4 sm:px-6 pt-8 pb-6">
                <h1 className="text-2xl font-bold text-[#0A2004] text-center">Découvrir</h1>
            </div>

            {/* Contenu principal */}
            <div className="px-4 space-y-8">

                {/* Barre de recherche */}
                <div className="relative max-w-md mx-auto px-2">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-[#589507]" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher un magasin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-14 py-3 sm:py-4 bg-white border-2 border-[#c9eaad] rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] placeholder-[#589507]/60 font-medium text-base sm:text-lg"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <MapPin className="h-6 w-6 text-[#7DBD07]" />
                    </div>
                </div>

                {/* Filtres par type */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 mb-4 px-2">
                        <Filter className="w-5 h-5 text-[#396F04]" />
                        <h3 className="text-base sm:text-lg font-bold text-[#0A2004]">Catégories</h3>
                    </div>
                    <div className="flex overflow-x-auto space-x-2 sm:space-x-3 pb-2 px-2 sm:px-4">
                        <button
                            className={`flex-shrink-0 flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base ${
                                selectedType === null
                                    ? "bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white shadow-xl" 
                                    : "bg-white text-[#589507] border-2 border-[#c9eaad] hover:border-[#7DBD07]"
                            }`}
                            onClick={() => setSelectedType(null)}
                        >
                            <span className="text-base sm:text-lg">🏪</span>
                            <span className="whitespace-nowrap">Tous</span>
                        </button>
                        {uniqueTypes.map((type) => (
                            <button
                                key={type}
                                className={`flex-shrink-0 flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base ${
                                    selectedType === type 
                                        ? "bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white shadow-xl" 
                                        : "bg-white text-[#589507] border-2 border-[#c9eaad] hover:border-[#7DBD07]"
                                }`}
                                onClick={() => setSelectedType(selectedType === type ? null : type)}
                            >
                                <span className="text-base sm:text-lg">{getTypeEmoji(type)}</span>
                                <span className="whitespace-nowrap">{type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Carte interactive */}
                <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-bold text-[#0A2004] text-center px-2">Carte interactive</h3>
                    <div className="w-full h-96 bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-[#c9eaad]/30">
                        <Map stores={filteredResults} />
                    </div>
                </div>

                {/* Résultats de la recherche */}
                {(searchTerm.length > 0 || selectedType) && !loading && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-[#0A2004]">
                                Résultats ({filteredResults.length})
                            </h3>
                            {selectedType && (
                                <button
                                    onClick={() => setSelectedType(null)}
                                    className="text-xs sm:text-sm text-[#7DBD07] font-bold bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-[#c9eaad] hover:bg-[#f8fdf4] transition-colors"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                        </div>
                        
                        {filteredResults.length > 0 ? (
                            <div className="space-y-4">
                                {filteredResults.map((result, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-[#c9eaad]/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-102 cursor-pointer"
                                        onClick={() => openMerchantModal(result)}
                                    >
                                        <div className="flex items-start space-x-3 sm:space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={result.logo}
                                                    alt={`${result.name} logo`}
                                                    className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-2xl shadow-lg border-2 border-[#c9eaad]/30"
                                                    onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
                                                />
                                                {result.hasOffers && (
                                                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-gradient-to-br from-[#FFCD29] to-[#B7DB25] rounded-full p-1 sm:p-2 shadow-lg">
                                                        <Star className="w-3 sm:w-4 h-3 sm:h-4 text-[#0A2004] fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                                                    <div>
                                                        <h4 className="text-base sm:text-lg font-bold text-[#0A2004]">{result.name}</h4>
                                                        <div className="flex items-center space-x-2 mt-1 flex-wrap">
                                                            <span className="text-base sm:text-lg">{getTypeEmoji(result.type)}</span>
                                                            <span className="text-xs sm:text-sm font-bold text-[#7DBD07] bg-[#ebffbc] px-2 sm:px-3 py-1 rounded-full">{result.type}</span>
                                                        </div>
                                                    </div>
                                                    {result.hasOffers && (
                                                        <span className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-[#0A2004] px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                                            🎁 Offres dispo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[#589507] mb-3 leading-relaxed">{result.shortDescription}</p>
                                                <div className="flex items-start space-x-2 mb-2">
                                                    <MapPin className="w-4 h-4 text-[#7DBD07] flex-shrink-0 mt-0.5" />
                                                    <p className="text-xs text-[#396F04] font-medium">{result.address}</p>
                                                </div>
                                                <p className="text-xs text-[#589507]">Propriétaire : {result.owner_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-[#ebffbc] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-12 h-12 text-[#589507]" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#396F04] mb-2">Aucun magasin trouvé</h3>
                                <p className="text-sm text-[#589507]">Essayez de modifier vos critères de recherche</p>
                            </div>
                        )}
                    </div>
                )}
                
                {loading && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#c9eaad] border-t-[#7DBD07]"></div>
                            <span className="text-[#396F04] font-bold text-lg">Chargement des magasins...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modale du commerçant */}
            {isModalOpen && selectedMerchant && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={closeMerchantModal}
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-8 sm:w-10 h-8 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 transition-all shadow-lg"
                        >
                            ✕
                        </button>
                        
                        {/* Header avec photo de couverture */}
                        <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden rounded-t-3xl">
                            <img
                                src={selectedMerchant.cover_photo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30" />
                        </div>

                        {/* Profil principal */}
                        <div className="px-3 sm:px-6 relative -mt-12 sm:-mt-16">
                            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
                                <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
                                    {/* Logo de l'entreprise */}
                                    <div className="flex-shrink-0 mx-auto md:mx-0">
                                        <img
                                            src={selectedMerchant.logo}
                                            alt="Logo"
                                            className="w-16 sm:w-24 h-16 sm:h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    </div>

                                    {/* Informations principales */}
                                    <div className="flex-1 text-center md:text-left">
                                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                            {selectedMerchant.name}
                                        </h1>
                                        <p className="text-base sm:text-lg text-[#7fbd07] font-semibold mb-3">
                                            {selectedMerchant.type}
                                        </p>
                                        <div className="flex flex-col md:flex-row items-center text-gray-600 mb-4">
                                            <div className="flex items-start">
                                                <MapPin className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm sm:text-base">{selectedMerchant.address}</span>
                                                {selectedMerchant.postal_code && (
                                                    <span>, {selectedMerchant.postal_code}</span>
                                                )}
                                                {selectedMerchant.city && (
                                                    <span> {selectedMerchant.city}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu principal */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pb-4 sm:pb-6">
                                {/* Colonne principale */}
                                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                    {/* Description */}
                                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Description</h2>
                                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                            {selectedMerchant.longDescription}
                                        </p>
                                    </div>

                                    {/* Mots-clés */}
                                    {selectedMerchant.keywords && selectedMerchant.keywords.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Mots-clés</h2>
                                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                                {selectedMerchant.keywords.map((keyword: string, index: number) => (
                                                    <span 
                                                        key={index} 
                                                        className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-100 text-blue-800 rounded-full font-medium text-xs sm:text-sm"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Engagements */}
                                    {selectedMerchant.commitments && selectedMerchant.commitments.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Engagements</h2>
                                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                                {selectedMerchant.commitments.map((commitment: string, index: number) => (
                                                    <span 
                                                        key={index} 
                                                        className="px-3 sm:px-4 py-1 sm:py-2 bg-green-100 text-green-800 rounded-full font-medium text-xs sm:text-sm"
                                                    >
                                                        {commitment}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Galerie photos */}
                                    {selectedMerchant.store_photos && selectedMerchant.store_photos.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Galerie photos</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                                                {selectedMerchant.store_photos.map((photo: string, index: number) => (
                                                    <img
                                                        key={index}
                                                        src={photo}
                                                        alt={`Store image ${index + 1}`}
                                                        className="rounded-lg aspect-square object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => openImageModal(photo)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar */}
                                <div className="hidden lg:block space-y-4 sm:space-y-6">
                                    {/* Informations rapides */}
                                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Informations</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 h-5 text-gray-400 mt-1">🏪</div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Type d'activité</p>
                                                    <p className="text-gray-600 text-sm">{selectedMerchant.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Adresse</p>
                                                    <p className="text-gray-600 text-sm">{selectedMerchant.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 h-5 text-gray-400 mt-1">👤</div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Propriétaire</p>
                                                    <p className="text-gray-600 text-sm">{selectedMerchant.owner_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistiques */}
                                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Statistiques</h3>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale d'image en plein écran */}
            {isImageModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-2 sm:p-4">
                    <button
                        onClick={closeImageModal}
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-10 sm:w-12 h-10 sm:h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all text-lg sm:text-xl font-bold"
                    >
                        ✕
                    </button>
                    <img
                        src={selectedImage}
                        alt="Image en plein écran"
                        className="max-h-[85vh] sm:max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                        onClick={closeImageModal}
                    />
                </div>
            )}
        </div>
    )
}
export default CustomerSearch;