import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'

type Step = 'form' | 'summary' | 'success'

const CreateOffer = () => {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    target: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('summary')
  }

  const handleConfirm = () => {
    // TODO: Submit to backend
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Une offre a été créée !</h3>
        <p className="mt-2 text-sm text-gray-500">
          Votre offre est maintenant visible par vos clients.
        </p>
        <Button
          onClick={() => setStep('form')}
          className="mt-6"
        >
          Créer une nouvelle offre
        </Button>
      </div>
    )
  }

  if (step === 'summary') {
    return (
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Récapitulatif de l'offre</h3>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nom de l'offre</p>
            <p className="mt-1">{formData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Durée</p>
            <p className="mt-1">{formData.duration}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cible</p>
            <p className="mt-1">{formData.target}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1">{formData.description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setStep('form')}
          >
            Modifier
          </Button>
          <Button onClick={handleConfirm}>
            Confirmer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Input
        label="Nom de l'offre"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ex: Réduction de printemps"
        required
      />
      
      <Input
        label="Durée"
        value={formData.duration}
        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        placeholder="Ex: 1 semaine"
        required
      />
      
      <Input
        label="Cible"
        value={formData.target}
        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
        placeholder="Ex: Nouveaux clients"
        required
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Décrivez votre offre en détail..."
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Suivant
        </Button>
      </div>
    </form>
  )
}

export default CreateOffer