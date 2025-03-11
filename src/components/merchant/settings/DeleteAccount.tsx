import { useState } from 'react'
import { Button } from '@/components/ui'
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { useNavigate } from 'react-router-dom'
import { deleteDoc, doc } from 'firebase/firestore'

type DeleteStep = 'reason' | 'confirm' | 'reauthenticate' | 'success'

interface DeleteAccountProps {
  onClose: () => void
}

const DeleteAccount = ({ onClose }: DeleteAccountProps) => {
  const [step, setStep] = useState<DeleteStep>('reason')
  const [reason, setReason] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  // Fonction pour re-authentifier et supprimer le compte
  const handleReauthenticateAndDelete = async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      // Création d'une "credential" avec l'email et le mot de passe
      const credential = EmailAuthProvider.credential(email, password)

      // Ré-authentification de l'utilisateur
      await reauthenticateWithCredential(user, credential)
      console.log('Ré-authentification réussie')

      // Supprimer le document dans Firestore
      await deleteDoc(doc(db, "merchant", user.uid))
      console.log('Document supprimé de Firestore')

      // Supprimer l'utilisateur
      await deleteUser(user)
      console.log('Compte supprimé avec succès')

      setStep('success')
      navigate('/')
    } catch (err: any) {
      setError('Erreur de la ré-authentification ou suppression')
      console.error('Erreur lors de la suppression:', err)
    }
  }

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
              <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setStep('confirm')}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <h3 className="font-medium text-red-900">Confirmation de suppression</h3>
            <p className="text-sm text-red-600">
              Pour des raisons de sécurité, veuillez entrer vos identifiants pour confirmer la suppression.
            </p>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setStep('reauthenticate')}>
              Vérifier mon identité
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          </div>
        )}

        {step === 'reauthenticate' && (
          <div className="space-y-4">
            <h3 className="font-medium text-red-900">Vérification d'identité</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Votre email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Votre mot de passe"
            />
            {error && <p className="text-red-600">{error}</p>}
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReauthenticateAndDelete}>
              Supprimer mon compte
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <h3 className="font-medium text-green-900">Compte supprimé avec succès</h3>
            <p className="text-sm text-green-600">
              Votre compte a été supprimé. Merci de nous avoir utilisé.
            </p>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>
              Fermer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeleteAccount
