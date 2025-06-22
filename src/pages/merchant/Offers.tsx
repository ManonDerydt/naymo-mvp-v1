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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes Offres</h1>
      </div>

      <p className="text-md text-gray-500">
        Ces offres seront rendues visibles par vos clients, c'est une opportunité de générer un chiffre d'affaires supplméentaire et une occasion de booster votre visibilité.
      </p>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 p-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'primary' : 'outline'}
                onClick={() => setActiveTab(id as TabType)}
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'current' && <CurrentOffers />}
          {activeTab === 'create' && <CreateOffer />}
          {activeTab === 'boost' && <BoostOffer />}
        </div>
      </div>
    </div>
  )
}

export default Offers