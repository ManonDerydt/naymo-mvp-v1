import { Link, useLocation } from 'react-router-dom'
import { Store, LayoutDashboard, Tag, Users, Settings, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../firebase/useAuth'
import { useState } from 'react'
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
      {/* Menu burger mobile */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl bg-[#c9eaad] text-[#032313] shadow-lg hover:bg-[#7fbd07] hover:text-white transition-all duration-200"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 flex w-72 sm:w-80 flex-col transition-transform duration-300 ease-in-out z-40",
        "lg:translate-x-0 lg:static lg:inset-0",
        "lg:w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-[#c9eaad] shadow-xl lg:shadow-none">
          <div className="flex items-center h-16 lg:h-16 flex-shrink-0 px-4 lg:px-0">
            {merchant && merchantData ? 
              <div className="flex justify-center w-full">
                <img 
                  className='w-2/3 max-w-[120px] lg:max-w-md mx-auto mt-3 lg:mt-5' 
                  src={Logo}
                  alt="Logo par défaut"
                />
              </div>
              : 
              <div className="flex justify-center w-full">
                <Store className="h-12 w-12 lg:h-16 lg:w-16 text-primary-500" />
              </div>
            }
          </div>
          <div className="flex-grow flex flex-col p-4 lg:p-4">
            <h3 className="text-white font-semibold mt-6 lg:mt-10 mb-4 text-sm lg:text-base">MENU</h3>
            <nav className="flex-1 space-y-4 lg:space-y-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'group flex items-center px-4 py-3 text-sm lg:text-sm font-medium rounded-xl transition-all duration-200',
                      location.pathname === item.href
                        ? 'bg-white text-[#7fbd07] shadow-md'
                        : 'text-[#032313] hover:bg-[#7fbd07] hover:text-white hover:shadow-sm'
                    )}
                  >
                    <Icon className={cn(
                      'mr-3 h-5 w-5 lg:h-5 lg:w-5 flex-shrink-0',
                      location.pathname === item.href
                        ? 'text-[#7fbd07]'
                        : 'text-[#032313] group-hover:text-white'
                    )} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {merchant && merchantData && (
              <>
                <hr className="border-white/20 my-4 lg:my-4" />
                <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-0">
                  <img
                    src={merchantData.logo}
                    alt="Logo du marchand"
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  <div className="text-[#032313] flex-1 min-w-0">
                    <p className="font-semibold text-sm lg:text-base truncate">{merchantData.company_name}</p>
                    <p className="text-xs lg:text-sm opacity-80 truncate">{merchantData.email}</p>
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