import { Bell, Search, MapPin, Star, Filter, Grid, List } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/firebase/useAuth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"
import Map from "@/components/map/Map"

const CustomerSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [stores, setStores] = useState<{ 
        name: string; 
        type: string; 
        owner_name: string; 
        shortDescription: string; 
        logo: string, 
        hasOffers: boolean;
        address: string
    }[]>([]);
    const [loading, setLoading] = useState(true);

    const { customer, customerData } = useAuth();
    
    // Récupérer les données de la collection "merchant" et vérifier les offres
    useEffect(() => {
        const fetchMerchantsAndOffers = async () => {
            try {
                // Récupérer tous les commerçants
                const merchantSnapshot = await getDocs(collection(db, "merchant"));
                const merchantData = await Promise.all(
                    merchantSnapshot.docs.map(async (doc) => {
                        const merchantId = doc.id;

                        const merchant = {
                            name: doc.data().company_name || "Nom inconnu",
                            type: doc.data().business_type || "Type inconnu",
                            owner_name: doc.data().owner_name || "Propriétaire inconnu",
                            shortDescription: doc.data().shortDescription || "Aucune description",
                            logo: doc.data().logo || "/default-logo.png",
                            hasOffers: false,
                            address: doc.data().address || "Adresse inconnue",
                        };

                        // Vérifier si ce commerçant a des offres via "merchant_has_offer"
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

    // Extraire les types uniques pour les filtres
    const uniqueTypes = [...new Set(stores.map((store) => store.type))].sort();

    // Filtrer les résultats en fonction du terme de recherche et du type sélectionné
    const filteredResults = stores
        .filter((store) => {
            const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !selectedType || store.type === selectedType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => (a.hasOffers === b.hasOffers ? 0 : a.hasOffers ? -1 : 1));

    // Emojis pour les types de magasins
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ebffbc]/10 via-white to-[#ebffbc]/20 pb-28">
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-[#7ebd07]/20 shadow-xl z-50">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center shadow-lg">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Recherche</p>
                            <p className="text-xs text-gray-500">Trouvez vos commerces</p>
                        </div>
                    </div>
                    <img src={logo} alt="Naymo" className="h-8" />
                </div>
            </div>

            {/* Contenu principal */}
            <div className="pt-24 pb-10 px-4 space-y-6">
                {/* Barre de recherche moderne */}
                <div className="relative bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-[#7ebd07]" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher un magasin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-16 py-4 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                                className="p-2 rounded-lg bg-[#ebffbc]/50 text-[#589507] hover:bg-[#ebffbc] transition-colors"
                            >
                                {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtres par type - Style gamifié */}
                <section className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[#396F04] flex items-center">
                            <Filter className="w-5 h-5 mr-2" />
                            Catégories
                        </h3>
                        {selectedType && (
                            <button
                                onClick={() => setSelectedType(null)}
                                className="text-sm text-[#589507] font-medium hover:text-[#396F04] transition-colors"
                            >
                                Tout afficher
                            </button>
                        )}
                    </div>
                    <div className="flex overflow-x-auto space-x-3 pb-2">
                        {uniqueTypes.map((type) => (
                            <button
                                key={type}
                                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 transform ${
                                    selectedType === type 
                                        ? "bg-gradient-to-r from-[#7ebd07] to-[#589507] text-white scale-105 shadow-xl" 
                                        : "bg-white text-gray-700 hover:bg-[#ebffbc]/50 hover:scale-105 border border-[#7ebd07]/20"
                                }`}
                                onClick={() => setSelectedType(selectedType === type ? null : type)}
                            >
                                <span className="text-lg">{getTypeEmoji(type)}</span>
                                <span className="font-medium whitespace-nowrap">{type}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Carte interactive avec style moderne */}
                <section className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
                    <h3 className="text-lg font-bold text-[#396F04] mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Carte interactive
                    </h3>
                    <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden">
                        <Map stores={filteredResults} />
                    </div>
                </section>

                {/* Résultats de la recherche - Style cards modernes */}
                {(searchTerm.length > 0 || selectedType) && !loading && (
                    <section className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#396F04] flex items-center">
                                <Search className="w-5 h-5 mr-2" />
                                Résultats ({filteredResults.length})
                            </h3>
                        </div>
                        
                        {filteredResults.length > 0 ? (
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
                                {filteredResults.map((result, index) => (
                                    <div key={index} className="bg-gray-50 rounded-2xl p-5 border border-[#7ebd07]/10 hover:shadow-lg hover:bg-white transition-all duration-200">
                                        <div className="flex items-start space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={result.logo}
                                                    alt={`${result.name} logo`}
                                                    className="w-14 h-14 object-cover rounded-2xl shadow-md"
                                                    onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
                                                />
                                                {result.hasOffers && (
                                                    <div className="absolute -top-1 -right-1 bg-[#FFCD29] rounded-full p-1 shadow-lg">
                                                        <Star className="w-3 h-3 text-white fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-base font-bold text-gray-900">{result.name}</h4>
                                                        <div className="flex items-center space-x-2 mt-1 mb-2">
                                                            <span className="text-sm">{getTypeEmoji(result.type)}</span>
                                                            <span className="text-sm font-medium text-[#589507]">{result.type}</span>
                                                        </div>
                                                    </div>
                                                    {result.hasOffers && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FFCD29] text-white shadow-sm">
                                                            Offres
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{result.shortDescription}</p>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <p className="text-xs text-gray-500">{result.address}</p>
                                                </div>
                                                <p className="text-xs text-gray-400">Gérant : {result.owner_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium">Aucun commerce trouvé</p>
                                <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos critères</p>
                            </div>
                        )}
                    </section>
                )}
                
                {loading && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20">
                        <div className="inline-flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7ebd07]"></div>
                            <span className="text-gray-600 font-medium">Chargement des magasins...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CustomerSearch;
