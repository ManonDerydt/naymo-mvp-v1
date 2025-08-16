import { Link, useLocation } from 'react-router-dom'
import { Store, LayoutDashboard, Tag, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../firebase/useAuth'
import Logo from "../../assets/Logo.png" // Correction ici

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mon Magasin', href: '/store', icon: Store },
  { name: 'Mes Offres', href: '/offers', icon: Tag },
  { name: 'Mes Clients', href: '/customers', icon: Users },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

const Sidebar = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { merchant, merchantData } = useAuth()

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#032313] text-white hover:bg-green-800"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col transition-transform duration-300 ease-in-out z-40`}>
        <div className="flex flex-col flex-grow border-r border-green-700 bg-gradient-to-b from-[#2d5016] to-[#032313] shadow-2xl">
        <div className="flex items-center h-16 flex-shrink-0">
         {merchant && merchantData ? 
          <div className="flex justify-center">
            <img 
              className='w-2/3 max-w-md mx-auto mt-5' 
              // src={merchantData.logo} 
              // alt={merchantData.logo}
               src={Logo}  // Utilisation du logo importé
                alt="Logo par défaut"
            />
          </div>
          : 
          <div className="flex justify-center">
            <Store className="h-16 w-16 text-primary-500" />
          </div>
        }

          {/* <span className="ml-2 text-xl font-bold text-gray-900">{merchantData && merchantData ? merchantData.company_name : "Naymo"}</span> */}
        </div>
          <div className="flex-grow flex flex-col p-4">
            <h3 className="text-green-200 mt-10 font-semibold tracking-wider text-sm">MENU</h3>
            <nav className="flex-1 space-y-2 mt-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    location.pathname === item.href
                      ? 'bg-[#e3ffbf] text-[#032313] shadow-lg transform scale-105'
                      : 'text-green-100 hover:bg-green-800/50 hover:text-white hover:transform hover:scale-105'
                  )}
                >
                  <Icon className={cn(
                    'mr-4 h-5 w-5 flex-shrink-0 transition-colors',
                    location.pathname === item.href
                      ? 'text-[#032313]'
                      : 'text-green-200 group-hover:text-white'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>


          {merchant && merchantData && (
            <>
              <hr className="border-green-600 my-6" />
              <div className="flex items-center space-x-4">
                <img
                  src={merchantData.logo}
                  alt="Logo du marchand"
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
                />
                <div className="text-green-100">
                  <p className="font-semibold text-white">{merchantData.company_name}</p>
                  <p className="text-sm text-green-200">{merchantData.email}</p>
                </div>
              </div>
            </>
          )}
          
        </div>
      </div>
      </div>
    </>
  )
}

export default Sidebar