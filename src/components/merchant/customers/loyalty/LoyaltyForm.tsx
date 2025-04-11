import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'

interface ConfirmModalProps {
  onClose: () => void
  onConfirm: () => void
  message: string
}

const ConfirmModal = ({ onClose, onConfirm, message }: ConfirmModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900">Confirmation</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>

        <div className="pt-4 flex justify-center space-x-4">
          <Button variant="outline" onClick={onClose}>
            Non
          </Button>
          <Button onClick={onConfirm}>Oui</Button>
        </div>
      </div>
    </div>
  )
}

interface LoyaltyFormProps {
  formData: {
    frequency: string
    reward: string
    value: string
  }
  onSubmit: () => void
  onCancel: () => void
  onChange: (field: string, value: string) => void
  mode: 'create' | 'edit' | 'delete'
}

const LoyaltyForm = ({ formData, onSubmit, onCancel, onChange, mode }: LoyaltyFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSave = () => {
    // Ouvre le modal de confirmation avant de soumettre
    setIsModalOpen(true)
  }

  const handleConfirm = () => {
    // Fermer le modal et envoyer les modifications
    setIsModalOpen(false)
    onSubmit()
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
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
          <Button variant="outline" onClick={onCancel} type="button">
            Annuler
          </Button>
          <Button type="button" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {isModalOpen && (
        <ConfirmModal
          onClose={handleCancel}
          onConfirm={handleConfirm}
          message={
            mode === 'create' ? "Êtes-vous sûr de vouloir créer ce programme ?" : 
            mode === 'edit' ? "Êtes-vous sûr de vouloir modifier ces informations ?" : 
            "Etes-vous sûr de vouloir supprimer ces informations ? Cette action est irréversible."
          }
        />
      )}
    </div>
  )
}

export default LoyaltyForm
