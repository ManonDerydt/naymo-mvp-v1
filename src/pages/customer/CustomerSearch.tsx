import { Bell } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/firebase/useAuth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"

const CustomerSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null); // État pour le type sélectionné
    const [stores, setStores] = useState<{ name: string, type: string; owner_name: string; shortDescription: string; logo: string, hasOffers: boolean }[]>([]);
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
                    // console.log(`Vérification pour merchant_id: ${merchantId}, nom: ${doc.data().company_name || "Nom inconnu"}`);
                    const merchant = {
                        name: doc.data().company_name || "Nom inconnu",
                        type: doc.data().business_type || "Type inconnu",
                        owner_name: doc.data().owner_name || "Propriétaire inconnu",
                        shortDescription: doc.data().shortDescription || "Aucune description",
                        logo: doc.data().logo || "/default-logo.png",
                        hasOffers: false,
                    };

                    // Vérifier si ce commerçant a des offres via "merchant_has_offer"
                    const offerQuery = query(
                        collection(db, "merchant_has_offer"),
                        where("merchant_id", "==", merchantId)
                    );
                    const offerSnapshot = await getDocs(offerQuery);
                    const offerDocs = offerSnapshot.docs;
                    if (offerDocs.length > 0) {
                        merchant.hasOffers = true; // Au moins une offre associée
                        // console.log(`Offres trouvées pour ${merchant.name} (merchant_id: ${merchantId}), nombre d'offres: ${offerDocs.length}, exemples d'IDs: ${offerDocs.map(doc => doc.data().offer_id).join(', ')}`);
                    } else {
                        // console.log(`Aucune offre trouvée pour ${merchant.name} (merchant_id: ${merchantId})`);
                    }

                    // console.log(`Merchant: ${merchant.name}, hasOffers: ${merchant.hasOffers}`);
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
        .sort((a, b) => (a.hasOffers === b.hasOffers ? 0 : a.hasOffers ? -1 : 1)); // tri : true avant false
    
    // console.log("Résultats triés : ", filteredResults.map(m => `${m.name} (${m.hasOffers})`));    

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Barre du haut */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex justify-between items-center px-4 py-3">
                {customer && customerData ? <p>{customerData.city}</p> : null }

                <img src={logo} alt="Naymo" className="h-10" />
                
                <div className="rounded-full border-2 border-gray-300 p-2">
                    <Bell size={24} className="text-green-500 fill-current" />
                </div>
            </div>

            {/* Contenu principal */}
            <div className="pt-20 px-4 space-y-6">
                {/* Barre de recherche */}
                <div>
                    <input 
                        type="text" 
                        placeholder="Rechercher un magasin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                {/* Choix par type */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {uniqueTypes.map((type) => (
                        <button
                            key={type}
                            className={`bg-white border rounded-lg p-4 text-center shadow hover:bg-green-50 transition ${
                                selectedType === type ? "bg-green-100 border-green-500" : ""
                            }`}
                            onClick={() => setSelectedType(selectedType === type ? null : type)} // Toggle le type
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Carte */}
                <h2 className="text-lg font-semibold">Carte interactive</h2>
                <div className="w-full h-96 bg-gray-300 rounded-lg overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d89987.67037611772!2d5.726812342404504!3d45.18477436052415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sfr!4v1746611347536!5m2!1sfr!2sfr"
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps"
                    ></iframe>
                </div>

                {/* Résultats de la recherche */}
                {(searchTerm.length > 0 || selectedType) && !loading && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Résultats</h2>
                    {filteredResults.length > 0 ? (
                        filteredResults.map((result, index) => (
                            <div key={index} className="bg-white p-4 shadow rounded-lg flex items-center space-x-4">
                                <img
                                    src={result.logo}
                                    alt={`${result.name} logo`}
                                    className="w-16 h-16 object-cover rounded-full"
                                    onError={(e) => { e.currentTarget.src = "/default-logo.png"; }} // Image par défaut en cas d'erreur
                                />
                                <div>
                                    <h3 className="text-md font-medium">{result.name}</h3>
                                    <p className="text-sm text-gray-600">Propriétaire : {result.owner_name}</p>
                                    <p className="text-sm text-gray-500">{result.shortDescription}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Aucun magasin trouvé</p>
                    )}
                </div>
                )}
                {loading && <p className="text-center">Chargement des magasins...</p>}
            </div>
        </div>
    )
}

export default CustomerSearch;
