import { Bell, Search, MapPin, Star } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/firebase/useAuth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"
import Map from "@/components/map/Map"

const CustomerSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null);
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
        <div className="min-h-screen to-blue-50 pb-10">
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 bg-[#032313] border-b shadow-lg z-50 flex items-center px-4 py-3">
                <div className="flex-1" />
                <img src={logo} alt="Naymo" className="h-10 mx-auto" />
                <div className="flex-1 flex justify-end">
                    <div className="relative">
                        <Bell size={24} className="text-green-500 fill-current" />
                        <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">0</span>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="pt-20 px-4 space-y-6">
                {/* Barre de recherche moderne */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher un magasin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-200 text-gray-900 placeholder-gray-500 font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <MapPin className="h-5 w-5 text-purple-500" />
                    </div>
                </div>

                {/* Filtres par type - Style gamifié */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 px-2">Catégories</h3>
                    <div className="flex overflow-x-auto space-x-3 pb-2 px-2">
                        {uniqueTypes.map((type) => (
                            <button
                                key={type}
                                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 transform ${
                                    selectedType === type 
                                        ? "bg-[#7ebd07] to-pink-500 text-white scale-105 shadow-xl" 
                                        : "bg-white text-gray-700 hover:bg-gray-50 hover:scale-105"
                                }`}
                                onClick={() => setSelectedType(selectedType === type ? null : type)}
                            >
                                <span className="text-lg">{getTypeEmoji(type)}</span>
                                <span className="font-medium whitespace-nowrap">{type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Carte interactive avec style moderne */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 px-2">Carte interactive</h3>
                    <div className="w-full h-96 bg-white rounded-2xl overflow-hidden shadow-lg border border-purple-100">
                        <Map stores={filteredResults} />
                    </div>
                </div>

                {/* Résultats de la recherche - Style cards modernes */}
                {(searchTerm.length > 0 || selectedType) && !loading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-gray-800">
                                Résultats ({filteredResults.length})
                            </h3>
                            {selectedType && (
                                <button
                                    onClick={() => setSelectedType(null)}
                                    className="text-sm text-purple-600 font-medium"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                        </div>
                        
                        {filteredResults.length > 0 ? (
                            <div className="space-y-3">
                                {filteredResults.map((result, index) => (
                                    <div key={index} className="bg-white rounded-2xl shadow-lg p-5 border border-purple-100 hover:shadow-xl transition-all duration-200">
                                        <div className="flex items-start space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={result.logo}
                                                    alt={`${result.name} logo`}
                                                    className="w-16 h-16 object-cover rounded-2xl shadow-md"
                                                    onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
                                                />
                                                {result.hasOffers && (
                                                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg">
                                                        <Star className="w-3 h-3 text-white fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900">{result.name}</h4>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-sm">{getTypeEmoji(result.type)}</span>
                                                            <span className="text-sm font-medium text-purple-600">{result.type}</span>
                                                        </div>
                                                    </div>
                                                    {result.hasOffers && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                                                            Offres disponibles
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">{result.shortDescription}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <p className="text-xs text-gray-500">{result.address}</p>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Propriétaire : {result.owner_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-gray-500 font-medium">Aucun magasin trouvé</p>
                                <p className="text-sm text-gray-400">Essayez de modifier vos critères de recherche</p>
                            </div>
                        )}
                    </div>
                )}
                
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                            <span className="text-gray-600 font-medium">Chargement des magasins...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CustomerSearch;
