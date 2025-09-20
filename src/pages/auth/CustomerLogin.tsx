import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'

const CustomerLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen" style={{ backgroundColor: '#f8fdf4' }}>
      {/* Bouton retour */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Icône avec cercle vert */}
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-[#ebffbc] rounded-full flex items-center justify-center mb-8">
              <Users className="w-10 h-10" color="#7ebd07" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Connexion Client
            </h2>
            <p className="text-gray-600">
              Connectez-vous à votre espace client
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email professionnel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="commerce@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              <Link 
                to="/reset-password?type=customer" 
                className="text-[#7FBD07] hover:text-green-700 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-sm text-white font-medium bg-[#7fbd07] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Se connecter
            </button>
          </form>

          {/* Lien d'inscription */}
          <div className="text-center">
            <span className="text-gray-600">Nouveau client ? </span>
            <Link 
              to="/customer/register" 
              className="font-medium text-[#7FBD07] hover:text-green-700"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerLogin