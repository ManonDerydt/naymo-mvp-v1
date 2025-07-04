import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'

const CustomerLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement login logic

    setError('')

    try {
      // Authentification avec Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Vérification dans la collection "customer"
      const customerQuery = query(collection(db, "customer"), where("email", "==", email))
      const customerSnapshot = await getDocs(customerQuery)
      
      if (customerSnapshot.empty) {
        // Si aucun document n'est trouvé dans "customer", déconnecter l'utilisateur
        await signOut(auth)
        setError('Cet email n\'est pas associé à un compte client. Veuillez utiliser un compte client ou vous inscrire.')
        return
      }

      // Si l'utilisateur est trouvé dans "customer", rediriger vers le dashboard client
      navigate('/customer/dashboard')
    } catch (err: any) {
      // Gestion des erreurs d'authentification (email/mot de passe incorrect)
      setError('Email ou mot de passe incorrect.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Store className="mx-auto h-12 w-12 text-primary-500" />
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Connexion à votre compte
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="text-right">
              <Link to="/reset-password?type=customer" className="text-sm text-primary-500 hover:text-primary-600">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full justify-center">
              Se connecter
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/customer/register" className="font-medium text-primary-500 hover:text-primary-600">
              Créer un compte client
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CustomerLogin