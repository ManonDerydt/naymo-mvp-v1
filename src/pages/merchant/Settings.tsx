import { useState } from 'react'
import { User, Shield, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import AccountTab from '@/components/merchant/settings/AccountTab'
import PrivacyTab from '@/components/merchant/settings/PrivacyTab'
import AssistanceTab from '@/components/merchant/settings/AssistanceTab'

type TabType = 'account' | 'privacy' | 'assistance'

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account')

  const tabs = [
    { id: 'account', label: 'Mon compte', icon: User },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'assistance', label: 'Assistance', icon: HelpCircle },
  ]

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-2 lg:gap-4 p-4 lg:p-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'primary' : 'outline'}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-medium transition-all duration-200 text-sm lg:text-base ${
                  activeTab === id 
                    ? 'bg-[#7fbd07] text-white shadow-md hover:bg-[#6ba006]' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm border-gray-200'
                }`}
              >
                <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
          {activeTab === 'assistance' && <AssistanceTab />}
        </div>
      </div>
    </div>
  )
}

export default Settings