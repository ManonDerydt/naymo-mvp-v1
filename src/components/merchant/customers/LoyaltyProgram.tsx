import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'

type Step = 'overview' | 'form' | 'success'

const LoyaltyProgram = () => {
  const [step, setStep] = useState<Step>('overview')
  const [activeSubTab, setActiveSubTab] = useState<'program' | 'tutorial'>('program')
  const [formData, setFormData] = useState({
    frequency: '',
    reward: '',
    value: '',
  })

  if (step === 'form') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Configurer le programme de fidélité
        </h3>

        <Input
          label="Fréquence"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          placeholder="Ex: Tous les 5 achats"
        />

        <Input
          label="Récompense"
          value={formData.reward}
          onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
          placeholder="Ex: -10% sur le prochain achat"
        />

        <Input
          label="Valeur"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="Ex: 50€ ou 5 achats"
        />

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setStep('overview')}
          >
            Annuler
          </Button>
          <Button onClick={() => setStep('success')}>
            Enregistrer
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Programme mis à jour !</h3>
        <p className="mt-2 text-sm text-gray-500">
          Votre programme de fidélité a été mis à jour avec succès.
        </p>
        <Button
          onClick={() => setStep('overview')}
          className="mt-6"
        >
          Retour à l'aperçu
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            className={`pb-4 px-4 text-sm font-medium border-b-2 ${
              activeSubTab === 'program'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveSubTab('program')}
          >
            Programme fidélité
          </button>
          <button
            className={`pb-4 px-4 text-sm font-medium border-b-2 ${
              activeSubTab === 'tutorial'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveSubTab('tutorial')}
          >
            Tuto Vidéo
          </button>
        </div>
      </div>

      {activeSubTab === 'program' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Programme actuel</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuration de votre programme de fidélité
              </p>
            </div>
            <Button onClick={() => setStep('form')}>
              Modifier
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Fréquence</p>
              <p className="mt-1">Tous les 10 achats</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Récompense</p>
              <p className="mt-1">-15% sur le prochain achat</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Valeur minimum</p>
              <p className="mt-1">50€ d'achat</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <p className="text-gray-500">Vidéo tutoriel</p>
          </div>
          <h3 className="font-medium text-gray-900">
            Comment optimiser votre programme de fidélité
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Découvrez les meilleures pratiques pour fidéliser vos clients et augmenter
            leur engagement.
          </p>
        </div>
      )}
    </div>
  )
}