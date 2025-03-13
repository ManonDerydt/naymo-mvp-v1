import { useState } from 'react'
import { LogOut, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import DeleteAccount from './DeleteAccount'
import { useAuth } from '@/components/firebase/useAuth'
import ChangePasswordModal from './ChangePasswordModal'
import ChangeEmailModal from './ChangeEmailModal'
import { signOut } from 'firebase/auth'
import { auth } from '@/components/firebase/firebaseConfig'
import { useNavigate } from 'react-router-dom'

const AccountTab = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  const { merchant, merchantData } = useAuth()
  
  const navigate = useNavigate()

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth) // Déconnexion de Firebase
      console.log('Déconnexion réussie')
      navigate("/")
    } catch (error) {
      console.error('Erreur lors de la déconnexion : ', error)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Email Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Email</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">
              {merchant && merchantData ? merchant.email : "contact@moncommerce.com"}
            </p>
            <p className="text-sm text-gray-500">Email principal</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowEmailModal(true)}>Modifier</Button>
        </div>
      </section>

      {/* Password Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Mot de passe</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Changer le mot de passe</Button>
        </div>
      </section>

      {/* Account Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Actions du compte</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Déconnexion</h3>
                <p className="text-sm text-gray-500">Se déconnecter de tous les appareils</p>
              </div>
              <Button variant="outline" size="sm" className="space-x-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-900">Supprimer le compte</h3>
                <p className="text-sm text-red-600">Cette action est irréversible</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="space-x-2 text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {showEmailModal && (
        <ChangeEmailModal
          userId={merchant?.uid ?? ""}
          onClose={() => setShowEmailModal(false)}
          />
      )}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showDeleteConfirm && (
        <DeleteAccount onClose={() => setShowDeleteConfirm(false)} />
      )}
    </div>
  )
}

export default AccountTab