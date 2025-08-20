import { Link } from 'react-router-dom'
import { Store, Users } from 'lucide-react'
import { Button } from '@/components/ui'
import logo from '../assets/Logo.png'

const UserType = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EBFFBC' }}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img src={logo} alt="logo" />
        </div>

        <div className="mt-8 space-y-4">
          <Link to="/merchant/login">
            <Button variant="secondary" className="w-full justify-center space-x-2 mb-6">
              <Store className="w-5 h-5" />
              <span>Je suis commerçant</span>
            </Button>
          </Link>
          
          <Link to="/customer/login">
            <Button 
              variant="secondary"
              className="w-full justify-center space-x-2"
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
