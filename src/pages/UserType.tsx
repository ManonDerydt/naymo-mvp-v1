import { Link } from 'react-router-dom'
import { Store, Users } from 'lucide-react'
import { Button } from '@/components/ui'
import logo from '../assets/Logo.png'

const UserType = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fdf4' }}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img src={logo} alt="logo" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Bienvenue</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez votre type de compte pour continuer
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Link to="/merchant/login">
            <button className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-sm text-white font-medium bg-[#7fbd07] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
              <Store className="w-5 h-5" />
              <span>Je suis commerçant</span>
            </button>
          </Link>
          
          <Link to="/customer/login">
            <button className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-sm text-[#7fbd07] font-medium bg-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors border-[#7fbd07] mt-10">
              <Users className="w-5 h-5" />
              <span>Je suis client</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserType
