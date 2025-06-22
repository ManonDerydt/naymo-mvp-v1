import { useState } from 'react'
import { Users, Award, Crown } from 'lucide-react'
import { Button } from '@/components/ui'
import CustomerAnalytics from '@/components/merchant/customers/analytics/CustomerAnalytics'
import LoyaltyProgram from '@/components/merchant/customers/loyalty/LoyaltyProgram'
import VipProgram from '@/components/merchant/customers/VipProgram'

type TabType = 'analytics' | 'loyalty' | 'vip'

const Customers = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics')

  const tabs = [
    { id: 'analytics', label: 'Typologie client', icon: Users },
    { id: 'loyalty', label: 'Programme fidélité', icon: Award },
    { id: 'vip', label: 'Promo VIP', icon: Crown },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes Clients</h1>
      </div>

        <p className="text-md text-gray-500">
Vous retrouverez toutes les statistiques de vos clients pour potentiellement ajuster vos offres.      </p>

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
          {activeTab === 'analytics' && <CustomerAnalytics />}
          {activeTab === 'loyalty' && <LoyaltyProgram />}
          {activeTab === 'vip' && <VipProgram />}
        </div>
      </div>
    </div>
  )
}

export default Customers