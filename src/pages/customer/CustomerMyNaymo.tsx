import { Bell } from "lucide-react"
import logo from "../../assets/Logo.png"
import BarChartSecteurs from "@/components/charts/BarChartSecteurs"
import BarChartEngagements from "@/components/charts/BarChartEngagements"

const CustomerMyNaymo = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Barre du haut */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex justify-between items-center px-4 py-3">
        <img src="" alt="Carte Grenoble" className="h-6" />
        <img src={logo} alt="Naymo" className="h-10" />
        <div className="rounded-full border-2 border-gray-300 p-2">
          <Bell size={24} className="text-green-500 fill-current" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-24 px-6 space-y-10 max-w-5xl mx-auto">
        
        {/* Section Points */}
        <section className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Points</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-600">Nombre de points</p>
              <p className="text-2xl font-bold mt-2">1234</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-600">Nombre de vues</p>
              <p className="text-2xl font-bold mt-2">567</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-600">Historique de points</p>
              <p className="text-sm text-gray-600 mt-2">Voir détails</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-600">Nombre d'achats</p>
              <p className="text-2xl font-bold mt-2">12</p>
            </div>
          </div>
        </section>

        {/* Section Types d'achats et engagements */}
        <section className="bg-white shadow-md rounded-lg p-4 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Type d'achats et engagements
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-100 p-6 rounded-lg">
              <p className="text-lg font-semibold text-indigo-600 mb-4">
                Graphique sur les secteurs d'achats
              </p>
              <div className="bg-white border-dashed border-2 border-gray-300 p-4 rounded-lg">
                <BarChartSecteurs />
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
              <p className="text-lg font-semibold text-indigo-600 mb-4">
                Graphique sur les engagements
              </p>
              <div className="bg-white border-dashed border-2 border-gray-300 p-4 rounded-lg">
                <BarChartEngagements />
              </div>
            </div>

            <div className="bg-green-100 p-6 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-700">
                Message incitatif à continuer ou à mieux faire
              </p>
              <p className="text-sm text-green-600 mt-2">
                "Bravo ! Continuez ainsi pour maximiser vos points."
              </p>
            </div>
          </div>
        </section>


      </div>
    </div>
  )
}

export default CustomerMyNaymo
