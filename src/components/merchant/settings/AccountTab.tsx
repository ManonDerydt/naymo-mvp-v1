import { useState } from 'react'
import { LogOut, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import DeleteAccount from './DeleteAccount'

const AccountTab = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className="max-w-2xl space-y-8">
      {/* Email Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Email</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">contact@moncommerce.com</p>
            <p className="text-sm text-gray-500">Email principal</p>
          </div>
          <Button variant="outline" size="sm">Modifier</Button>
        </div>
      </section>

      {/* Password Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Mot de passe</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <Button variant="outline" size="sm">Changer le mot de passe</Button>
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
              <Button variant="outline" size="sm" className="space-x-2">
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

      {showDeleteConfirm && (
        <DeleteAccount onClose={() => setShowDeleteConfirm(false)} />
      )}
    </div>
  )
}

export default AccountTab