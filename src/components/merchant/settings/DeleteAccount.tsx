import { useState } from 'react'
import { Button } from '@/components/ui'

type DeleteStep = 'reason' | 'confirm' | 'success'

interface DeleteAccountProps {
  onClose: () => void
}

const DeleteAccount = ({ onClose }: DeleteAccountProps) => {
  const [step, setStep] = useState<DeleteStep>('reason')
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {step === 'reason' && (
          <div className="space-y-4">
            <h3 className="font-medium text-red-900">Raison de la suppression</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Dites-nous pourquoi vous souhaitez supprimer votre compte..."
            />
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button 
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setStep('confirm')}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <h3 className="font-medium text-red-900">Confirmation de suppression</h3>
            <p className="text-sm text-red-600">
              Un email de confirmation a été envoyé à votre adresse. 
              Veuillez confirmer la suppression en cliquant sur le lien dans l'email.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeleteAccount