import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/components/firebase/firebaseConfig'
import { Button } from '@/components/ui'
import { Link, useSearchParams } from 'react-router-dom'

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Réinitialiser le mot de passe
          </h2>
        </div>
        <form onSubmit={handleReset} className="space-y-6">
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label htmlFor="email" className="sr-only">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full justify-center">
            Envoyer l’email de réinitialisation
          </Button>
        </form>

        <div className="text-center">
          <Link to={loginRoute} className="text-sm text-primary-500 hover:text-primary-600">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
