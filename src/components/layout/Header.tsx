import { LogOut, Menu, Settings, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Store className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Naymo</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Accueil</Link>
            <Link to="/store" className="text-gray-600 hover:text-gray-900">Mon Magasin</Link>
            <Link to="/offers" className="text-gray-600 hover:text-gray-900">Mes Offres</Link>
            <Link to="/customers" className="text-gray-600 hover:text-gray-900">Mes Clients</Link>
            <Link to="/settings" className="text-gray-600 hover:text-gray-900">Paramètres</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <LogOut className="w-5 h-5" />
            </button>
            <button className="md:hidden text-gray-600 hover:text-gray-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header