import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Store, LayoutDashboard, Tag, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../firebase/useAuth'
import Logo from "../../assets/Logo.png"

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
        <div className="space-y-1">
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </div>
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed inset-y-0 lg:flex w-screen lg:w-64 lg:flex-col transition-transform duration-300 ease-in-out z-40`}>
        <div className="flex flex-col flex-grow border-r border-[#7ebd07]/30 bg-[#ebffbc] shadow-2xl">
        <div className="flex items-center h-16 flex-shrink-0">
         {merchant && merchantData ? 
          <div className="flex justify-center">
            <img 
              className='w-2/3 max-w-md mx-auto mt-5' 
               src={Logo}
                alt="Logo par défaut"
            />
          </div>
          : 
          <div className="flex justify-center">
            <Store className="h-16 w-16 text-[#589507]" />
          </div>
        }
        </div>
          <div className="flex-grow flex flex-col p-6">
            <h3 className="text-[#396F04] mt-10 font-bold tracking-wider text-sm">MENU</h3>
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
                      ? 'bg-white text-black shadow-lg transform scale-105'
                      : 'text-black hover:bg-white/50 hover:text-black hover:transform hover:scale-105'
                  )}
                >
                  <Icon className={cn(
                    'mr-4 h-5 w-5 flex-shrink-0 transition-colors',
                    location.pathname === item.href
                      ? 'text-black'
                      : 'text-black group-hover:text-black'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>


            {merchant && merchantData && (
              <>
                <hr className="border-[#7ebd07] my-6" />
                <div className="flex items-center space-x-4 px-2">
                  <img
                    src={merchantData.logo}
                    alt="Logo du marchand"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#7ebd07]"
                  />
                  <div>
                    <p className="font-semibold text-black text-sm">{merchantData.company_name}</p>
                    <p className="text-xs text-black/70">{merchantData.email}</p>
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