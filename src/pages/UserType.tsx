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
            <Button className="w-full justify-center space-x-2">
              <Store className="w-5 h-5" />
              <span>Je suis commerçant</span>
            </Button>
          </Link>
          
          <Link to="/customer/login">
            <Button 
              variant="outline" 
              className="w-full justify-center space-x-2  mt-10"
            >
              <Users className="w-5 h-5" />
              <span>Je suis client</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserType
