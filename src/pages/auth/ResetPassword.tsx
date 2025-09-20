import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/components/firebase/firebaseConfig'
import { Button } from '@/components/ui'

const ResetPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Email de réinitialisation envoyé ! Vérifie ta boîte mail.')
    } catch (err) {
      setError("Impossible d'envoyer l'email. Vérifie l'adresse saisie.")
    }
  }

  const [searchParams] = useSearchParams()
  const userType = searchParams.get('type') // 'merchant' ou 'customer'
  const loginRoute = userType === 'merchant' ? '/merchant/login' : '/customer/login'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fdf4' }}>
      {/* Bouton retour */}
      <div className="absolute top-6 left-6">
        <Link to={loginRoute} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Icône avec cercle vert */}
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-[#ebffbc] rounded-full flex items-center justify-center mb-8">
              <Mail className="w-10 h-10" color="#7ebd07" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Réinitialiser le mot de passe
            </h2>
            <p className="text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Bouton d'envoi */}
            <button
              type="submit"
              className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-sm text-white font-medium bg-[#7fbd07] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Envoyer l'email de réinitialisation
            </button>
          </form>

          {/* Lien de retour */}
          <div className="text-center">
            <Link 
              to={loginRoute} 
              className="font-medium text-[#7FBD07] hover:text-green-700"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
