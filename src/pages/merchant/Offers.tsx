import { useState } from 'react'
import { Eye, ShoppingCart, TrendingUp, Plus, Sparkles, Gift } from 'lucide-react'
import { Button } from '@/components/ui'
import CurrentOffers from '@/components/merchant/offers/CurrentOffers'
import CreateOffer from '@/components/merchant/offers/CreateOffer'
import BoostOffer from '@/components/merchant/offers/BoostOffer'

type TabType = 'current' | 'create' | 'boost'

const Offers = () => {
  const [activeTab, setActiveTab] = useState<TabType>('current')

  const tabs = [
    { id: 'current', label: 'Offres en cours', icon: Eye, color: 'text-[#7ebd07]' },
    { id: 'create', label: 'Créer une offre', icon: Plus, color: 'text-[#589507]' },
    { id: 'boost', label: 'Booster une offre', icon: Sparkles, color: 'text-[#396F04]' },
  ]

  return (
    <div className="space-y-8 font-['Inter',_'system-ui',_sans-serif] bg-gradient-to-br from-[#ebffbc]/20 to-white min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#589507] to-[#396F04] bg-clip-text text-transparent tracking-tight">Mes Offres</h1>
          <div className="flex items-center mt-2">
            <Gift className="w-5 h-5 text-[#7ebd07] mr-2" />
            <span className="text-[#589507] font-medium">Gérez vos promotions</span>
          </div>
        </div>
      </div>

      <p className="text-lg text-gray-700 leading-relaxed bg-white/80 p-4 rounded-xl border-l-4 border-[#7ebd07]">
        Ces offres seront rendues visibles par vos clients, c'est une opportunité de générer un chiffre d'affaires supplémentaire et une occasion de booster votre visibilité.
      </p>

      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#7ebd07]/30">
        <div className="border-b border-[#7ebd07]/20">
          <div className="flex space-x-2 p-6">
            {tabs.map(({ id, label, icon: Icon, color }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'primary' : 'outline'}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === id 
                    ? 'bg-gradient-to-r from-[#7ebd07] to-[#589507] text-white shadow-xl transform scale-105 border-2 border-[#ebffbc]' 
                    : 'hover:bg-[#ebffbc]/50 hover:scale-105 border border-[#7ebd07]/30'
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