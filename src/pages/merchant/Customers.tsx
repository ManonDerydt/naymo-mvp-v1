import { useState } from 'react'
import { Users, Award, Crown, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui'
import CustomerAnalytics from '@/components/merchant/customers/analytics/CustomerAnalytics'
import LoyaltyProgram from '@/components/merchant/customers/loyalty/LoyaltyProgram'
import VipProgram from '@/components/merchant/customers/VipProgram'
import CustomersList from '@/components/merchant/customers/CustomersList'

type TabType = 'analytics' | 'loyalty' | 'vip' | 'list'

const Customers = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics')

  const tabs = [
    { id: 'analytics', label: 'Typologie client', icon: Users },
    { id: 'list', label: 'Liste des clients', icon: UserCheck },
    { id: 'loyalty', label: 'Programme fidélité', icon: Award },
    { id: 'vip', label: 'Promo VIP', icon: Crown },
  ]

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6 -m-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Clients</h1>
          <p className="text-gray-600 leading-relaxed">
            Vous retrouverez toutes les statistiques de vos clients pour potentiellement ajuster vos offres.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex space-x-2 p-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === id 
                    ? 'bg-[#7fbd07] text-white shadow-md hover:bg-[#6ba006]' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'analytics' && <CustomerAnalytics />}
          {activeTab === 'list' && <CustomersList />}
          {activeTab === 'loyalty' && <LoyaltyProgram />}
          {activeTab === 'vip' && <VipProgram />}
        </div>
      </div>
    </div>
  )
}

export default Customers