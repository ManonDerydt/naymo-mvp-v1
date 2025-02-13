import { Eye, ShoppingBag, TrendingUp } from 'lucide-react'

const mockOffers = [
  {
    id: 1,
    name: "Réduction de printemps",
    views: 245,
    revenue: "1,230 €",
    purchases: 52,
    description: "20% de réduction sur tous les produits de saison",
  },
  {
    id: 2,
    name: "Happy Hour",
    views: 189,
    revenue: "890 €",
    purchases: 37,
    description: "2 produits achetés = 1 offert entre 17h et 19h",
  },
]

const CurrentOffers = () => {
  return (
    <div className="space-y-6">
      {mockOffers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{offer.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vues</p>
                <p className="text-lg font-semibold">{offer.views}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">CA généré</p>
                <p className="text-lg font-semibold">{offer.revenue}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Achats</p>
                <p className="text-lg font-semibold">{offer.purchases}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CurrentOffers