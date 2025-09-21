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
    
    useEffect(() => {
        const fetchMerchantsAndOffers = async () => {
            try {
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
                            address: doc.data().address && doc.data().address !== "Adresse inconnue" ? doc.data().address : "",
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

    return (
        <div className="min-h-screen bg-white pb-10">
            {/* Titre principal */}
            <div className="px-6 pt-8 pb-6">
                <h1 className="text-2xl font-bold text-[#0A2004] text-center">Découvrir</h1>
            </div>

            {/* Contenu principal */}
            <div className="px-4 space-y-8">

                {/* Barre de recherche */}
                <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-[#589507]" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher un magasin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-14 py-4 bg-white border-2 border-[#c9eaad] rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] placeholder-[#589507]/60 font-medium text-lg"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <MapPin className="h-6 w-6 text-[#7DBD07]" />
                    </div>
                </div>

                {/* Filtres par type */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <Filter className="w-5 h-5 text-[#396F04]" />
                        <h3 className="text-lg font-bold text-[#0A2004]">Catégories</h3>
                    </div>
                    <div className="flex overflow-x-auto space-x-3 pb-2 px-4">
                        <button
                            className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                                selectedType === null
                                    ? "bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white shadow-xl" 
                                    : "bg-white text-[#589507] border-2 border-[#c9eaad] hover:border-[#7DBD07]"
                            }`}
                            onClick={() => setSelectedType(null)}
                        >
                            <span className="text-lg">🏪</span>
                            <span className="whitespace-nowrap">Tous</span>
                        </button>
                        {uniqueTypes.map((type) => (
                            <button
                                key={type}
                                className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                                    selectedType === type 
                                        ? "bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white shadow-xl" 
                                        : "bg-white text-[#589507] border-2 border-[#c9eaad] hover:border-[#7DBD07]"
                                }`}
                                onClick={() => setSelectedType(selectedType === type ? null : type)}
                            >
                                <span className="text-lg">{getTypeEmoji(type)}</span>
                                <span className="whitespace-nowrap">{type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Carte interactive */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#0A2004] text-center">Carte interactive</h3>
                    <div className="w-full h-96 bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-[#c9eaad]/30">
                        <Map stores={filteredResults} />
                    </div>
                </div>

                {/* Résultats de la recherche */}
                {(searchTerm.length > 0 || selectedType) && !loading && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold text-[#0A2004]">
                                Résultats ({filteredResults.length})
                            </h3>
                            {selectedType && (
                                <button
                                    onClick={() => setSelectedType(null)}
                                    className="text-sm text-[#7DBD07] font-bold bg-white px-4 py-2 rounded-full border border-[#c9eaad] hover:bg-[#f8fdf4] transition-colors"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                        </div>
                        
                        {filteredResults.length > 0 ? (
                            <div className="space-y-4">
                                {filteredResults.map((result, index) => (
                                    <div key={index} className="bg-white rounded-3xl shadow-xl p-6 border border-[#c9eaad]/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-102">
                                        <div className="flex items-start space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={result.logo}
                                                    alt={`${result.name} logo`}
                                                    className="w-16 h-16 object-cover rounded-2xl shadow-lg border-2 border-[#c9eaad]/30"
                                                    onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
                                                />
                                                {result.hasOffers && (
                                                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-[#FFCD29] to-[#B7DB25] rounded-full p-2 shadow-lg">
                                                        <Star className="w-4 h-4 text-[#0A2004] fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-[#0A2004]">{result.name}</h4>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-lg">{getTypeEmoji(result.type)}</span>
                                                            <span className="text-sm font-bold text-[#7DBD07] bg-[#ebffbc] px-3 py-1 rounded-full">{result.type}</span>
                                                        </div>
                                                    </div>
                                                    {result.hasOffers && (
                                                        <span className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-[#0A2004] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                            🎁 Offres dispo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[#589507] mb-3 leading-relaxed">{result.shortDescription}</p>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <MapPin className="w-4 h-4 text-[#7DBD07]" />
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
                                <h3 className="text-xl font-bold text-[#396F04] mb-2">Aucun magasin trouvé</h3>
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
        </div>
    )
}

export default CustomerSearch;