import { Bell } from "lucide-react"
import logo from "../../assets/Logo.png"
import BarChartSecteurs from "@/components/charts/BarChartSecteurs"
import BarChartEngagements from "@/components/charts/BarChartEngagements"
import { useAuth } from "@/components/firebase/useAuth"

const CustomerMyNaymo = () => {
  const { customer, customerData } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-[#032313] border-b shadow-sm z-50 flex items-center px-4 py-3">
        <div className="flex-1" />
        <img src={logo} alt="Naymo" className="h-10 mx-auto" />
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <Bell size={24} className="text-green-500 fill-current" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-24 px-6 space-y-10 max-w-5xl mx-auto">
        
        {/* Section Points - Nouveau style */}
        <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Vos points</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Carte Points */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-purple-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-purple-500 w-3 h-3 rounded-full"></div>
                <p className="text-purple-700 font-semibold text-lg">Nombre de points</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">1234</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                  style={{ width: '75%' }}>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Prochain niveau: 200 points</p>
            </div>

            {/* Carte Vues */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                <p className="text-green-700 font-semibold text-lg">Nombre de vues</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">567</p>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 font-semibold">+12%</span>
                <span className="text-gray-500 text-sm ml-2">vs mois dernier</span>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-yellow-500 w-3 h-3 rounded-full"></div>
                <p className="text-yellow-700 font-semibold text-lg">Historique de points</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-yellow-600 font-medium mt-2 underline">Voir détails</p>
            </div>

            {/* Achats */}
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-pink-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-pink-500 w-3 h-3 rounded-full"></div>
                <p className="text-pink-700 font-semibold text-lg">Nombre d'achats</p>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">12</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                  Top 20%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ... le reste de votre code ... */}
      </div>
    </div>
  )
}

export default CustomerMyNaymo