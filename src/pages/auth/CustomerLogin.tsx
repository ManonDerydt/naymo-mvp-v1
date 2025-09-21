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
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const customerQuery = query(collection(db, "customer"), where("email", "==", email))
      const customerSnapshot = await getDocs(customerQuery)
      
      if (customerSnapshot.empty) {
        await signOut(auth)
        setError('Cet email n\'est pas associé à un compte client. Veuillez utiliser un compte client ou vous inscrire.')
        return
      }

      navigate('/customer/dashboard')
    } catch (err: any) {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc]">
      <div className="absolute top-6 left-6">
        <Link to="/" className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl border border-[#c9eaad]/30 hover:bg-white transition-all duration-200 transform hover:scale-110">
          <ArrowLeft className="w-6 h-6 text-[#396F04]" />
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <Users className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#0A2004] mb-2">
              Connexion Client
            </h2>
            <p className="text-[#589507] font-medium">
              Connectez-vous à votre espace client
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-[#c9eaad]/30 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#396F04]">
                Email professionnel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-[#589507]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-14 pr-4 py-4 border-2 border-[#c9eaad] rounded-2xl bg-[#f8fdf4] placeholder-[#589507]/60 text-[#0A2004] focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] font-medium"
                  placeholder="commerce@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#396F04]">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-[#589507]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-14 pr-14 py-4 border-2 border-[#c9eaad] rounded-2xl bg-[#f8fdf4] placeholder-[#589507]/60 text-[#0A2004] focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] font-medium"
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
                    <EyeOff className="h-6 w-6 text-[#589507]" />
                  ) : (
                    <Eye className="h-6 w-6 text-[#589507]" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link 
                to="/reset-password?type=customer" 
                className="text-[#7DBD07] hover:text-[#396F04] font-bold transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-white font-bold bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] hover:from-[#589507] hover:to-[#7DBD07] focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="w-6 h-6 mr-3" />
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            </form>
          </div>

          <div className="text-center">
            <span className="text-[#589507] font-medium">Nouveau client ? </span>
            <Link 
              to="/customer/register" 
              className="font-bold text-[#7DBD07] hover:text-[#396F04] transition-colors"
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