import { useState } from 'react'
import LoyaltyForm from './LoyaltyForm'
import LoyaltyOverview from './LoyaltyOverview'
import LoyaltyTutorial from './LoyaltyTutorial'
import SuccessMessage from '../shared/SuccessMessage'

type Step = 'overview' | 'form' | 'success'

const LoyaltyProgram = () => {
  const [step, setStep] = useState<Step>('overview')
  const [activeSubTab, setActiveSubTab] = useState<'program' | 'tutorial'>('program')
  const [formData, setFormData] = useState({
    frequency: '',
    reward: '',
    value: '',
  })

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (step === 'form') {
    return (
      <LoyaltyForm
        formData={formData}
        onSubmit={() => setStep('success')}
        onCancel={() => setStep('overview')}
        onChange={handleFormChange}
      />
    )
  }

  if (step === 'success') {
    return (
      <SuccessMessage
        title="Programme mis à jour !"
        message="Votre programme de fidélité a été mis à jour avec succès."
        buttonText="Retour à l'aperçu"
        onButtonClick={() => setStep('overview')}
      />
    )
  }

  return (
    <div>
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <TabButton
            active={activeSubTab === 'program'}
            onClick={() => setActiveSubTab('program')}
          >
            Programme fidélité
          </TabButton>
          <TabButton
            active={activeSubTab === 'tutorial'}
            onClick={() => setActiveSubTab('tutorial')}
          >
            Tuto Vidéo
          </TabButton>
        </div>
      </div>

      {activeSubTab === 'program' ? (
        <LoyaltyOverview onEdit={() => setStep('form')} />
      ) : (
        <LoyaltyTutorial />
      )}
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

const TabButton = ({ active, onClick, children }: TabButtonProps) => (
  <button
    className={`pb-4 px-4 text-sm font-medium border-b-2 ${
      active
        ? 'border-primary-500 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
)

export default LoyaltyProgram