import { Bell } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useState } from "react"
import { useAuth } from "@/components/firebase/useAuth"

const CustomerSearch = () => {
    const [searchTerm, setSearchTerm] = useState("")

    const magasins = [
        "Boulangerie du Centre",
        "Atelier Déco",
        "Le Vestiaire",
        "Artisan Saveurs",
        "Saveurs du Marché",
        "Café des Artisans"
    ]

    const filteredResults = magasins.filter((magasin) => 
        magasin.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const { customer, customerData } = useAuth()
    

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
                    {["Alimentation", "Vestimentaire", "Décoration", "Artisanat", "Restauration", "Événementiel"].map((type) => (
                        <button
                            key={type}
                            className="bg-white border rounded-lg p-4 text-center shadow hover:bg-green-50 transition"
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Résultats */}
                {searchTerm.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Résultats</h2>
                        {filteredResults.length > 0 ? (
                            filteredResults.map((result, index) => (
                                <div key={index} className="bg-white p-4 shadow rounded-lg">
                                    {result}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Aucun magasin trouvé</p>
                        )}
                    </div>
                )}

                {/* Carte */}
                <h2 className="text-lg font-semibold">Carte interactive</h2>
                <div className="w-full h-96 bg-gray-300 rounded-lg overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d90001.78323013068!2d5.677887686271617!3d45.17584568692289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sfr!4v1745845788795!5m2!1sfr!2sfr"
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps"
                    ></iframe>
                </div>
            </div>
        </div>
    )
}

export default CustomerSearch;
