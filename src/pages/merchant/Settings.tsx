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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

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
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
          {activeTab === 'assistance' && <AssistanceTab />}
        </div>
      </div>
    </div>
  )
}

export default Settings