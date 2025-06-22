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

  const { merchant, merchantData } = useAuth()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-[#032313]">
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
          <h3 className="text-white mt-10">MENU</h3>
          <nav className="flex-1 space-y-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'mt-10 group flex items-center px-3 py-2 text-sm font-medium rounded-lg',
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-white hover:bg-[white] hover:text-black'
                  )}
                >
                  <Icon className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    location.pathname === item.href
                      ? 'text-primary-500'
                      : 'text-white group-hover:text-gray-500'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>


          {merchant && merchantData && (
            <>
              <hr className="border-gray-200 my-4" />
              <div className="flex items-center space-x-4">
                <img
                  src={merchantData.logo}
                  alt="Logo du marchand"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-white">
                  <p className="font-semibold">{merchantData.company_name}</p>
                  <p className="text-sm">{merchantData.email}</p>
                </div>
              </div>
            </>
          )}
          
        </div>
      </div>
    </div>
  )
}

export default Sidebar