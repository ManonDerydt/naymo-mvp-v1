import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'
import SuccessMessage from './shared/SuccessMessage'

type Step = 'overview' | 'form' | 'success'

const VipProgram = () => {
  const [step, setStep] = useState<Step>('overview')
  const [formData, setFormData] = useState({
    frequency: '',
    reward: '',
    value: '',
  })

  if (step === 'form') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Configurer le programme VIP
        </h3>

        <Input
          label="Fréquence"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          placeholder="Ex: Une fois par mois"
        />

        <Input
          label="Récompense"
          value={formData.reward}
          onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
          placeholder="Ex: Accès prioritaire aux ventes"
        />

        <Input
          label="Valeur minimum"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="Ex: 1000€ d'achats cumulés"
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
      <SuccessMessage
        title="Programme VIP mis à jour !"
        message="Votre programme VIP a été mis à jour avec succès."
        buttonText="Retour à l'aperçu"
        onButtonClick={() => setStep('overview')}
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Programme VIP actuel</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configuration de votre programme VIP
          </p>
        </div>
        <Button onClick={() => setStep('form')}>
          Modifier
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Fréquence</p>
          <p className="mt-1">Une fois par mois</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Récompense</p>
          <p className="mt-1">Accès prioritaire aux ventes privées</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Valeur minimum</p>
          <p className="mt-1">1000€ d'achats cumulés</p>
        </div>
      </div>
    </div>
  )
}

export default VipProgram