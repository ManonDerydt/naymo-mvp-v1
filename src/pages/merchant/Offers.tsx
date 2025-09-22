import { useState } from 'react'
import { Eye, ShoppingCart, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui'
import CurrentOffers from '@/components/merchant/offers/CurrentOffers'
import CreateOffer from '@/components/merchant/offers/CreateOffer'
import BoostOffer from '@/components/merchant/offers/BoostOffer'

type TabType = 'current' | 'create' | 'boost'

const Offers = () => {
  const [activeTab, setActiveTab] = useState<TabType>('current')

  const tabs = [
    { id: 'current', label: 'Offres en cours', icon: Eye },
    { id: 'create', label: 'Créer une offre', icon: ShoppingCart },
    { id: 'boost', label: 'Booster une offre', icon: TrendingUp },
  ]

  return (
    <div className="space-y-4 lg:space-y-6 bg-gray-50 min-h-screen p-4 lg:p-6 -m-4 lg:-m-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Mes Offres</h1>
          <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
            Ces offres seront rendues visibles par vos clients, c'est une opportunité de générer un chiffre d'affaires supplémentaire et une occasion de booster votre visibilité.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex flex-wrap gap-2 lg:gap-3 p-4 lg:p-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center space-x-1 lg:space-x-2 px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-medium transition-all duration-200 text-sm lg:text-base ${
                  activeTab === id 
                    ? 'bg-[#7fbd07] text-white shadow-md hover:bg-[#6ba006]' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {activeTab === 'current' && <CurrentOffers />}
          {activeTab === 'create' && <CreateOffer />}
          {activeTab === 'boost' && <BoostOffer />}
        </div>
      </div>
    </div>
  )
}

export default Offers