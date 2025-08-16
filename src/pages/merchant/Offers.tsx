import { useState } from 'react'
import { Eye, ShoppingCart, TrendingUp, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import CurrentOffers from '@/components/merchant/offers/CurrentOffers'
import CreateOffer from '@/components/merchant/offers/CreateOffer'
import BoostOffer from '@/components/merchant/offers/BoostOffer'

type TabType = 'current' | 'create' | 'boost'

const Offers = () => {
  const [activeTab, setActiveTab] = useState<TabType>('current')

  const tabs = [
    { id: 'current', label: 'Offres en cours', icon: Eye, color: 'text-blue-600' },
    { id: 'create', label: 'Créer une offre', icon: Plus, color: 'text-green-600' },
    { id: 'boost', label: 'Booster une offre', icon: Sparkles, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-8 font-['Inter',_'system-ui',_sans-serif]">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mes Offres</h1>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed">
        Ces offres seront rendues visibles par vos clients, c'est une opportunité de générer un chiffre d'affaires supplméentaire et une occasion de booster votre visibilité.
      </p>

      <div className="bg-white rounded-2xl shadow-xl border border-green-100">
        <div className="border-b border-green-100">
          <div className="flex space-x-2 p-6">
            {tabs.map(({ id, label, icon: Icon, color }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'primary' : 'outline'}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === id 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                    : 'hover:bg-green-50 hover:scale-105'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : color}`} />
                <span className="font-medium">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'current' && <CurrentOffers />}
          {activeTab === 'create' && <CreateOffer />}
          {activeTab === 'boost' && <BoostOffer />}
        </div>
      </div>
    </div>
  )
}

export default Offers