import { Button } from '@/components/ui'
import { Input } from '@/components/forms'

interface LoyaltyFormProps {
  formData: {
    frequency: string
    reward: string
    value: string
  }
  onSubmit: () => void
  onCancel: () => void
  onChange: (field: string, value: string) => void
}

const LoyaltyForm = ({ formData, onSubmit, onCancel, onChange }: LoyaltyFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Configurer le programme de fidélité
      </h3>

      <Input
        label="Fréquence"
        value={formData.frequency}
        onChange={(e) => onChange('frequency', e.target.value)}
        placeholder="Ex: Tous les 5 achats"
      />

      <Input
        label="Récompense"
        value={formData.reward}
        onChange={(e) => onChange('reward', e.target.value)}
        placeholder="Ex: -10% sur le prochain achat"
      />

      <Input
        label="Valeur"
        value={formData.value}
        onChange={(e) => onChange('value', e.target.value)}
        placeholder="Ex: 50€ ou 5 achats"
      />

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          type="button"
        >
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  )
}

export default LoyaltyForm