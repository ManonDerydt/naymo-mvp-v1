import { Link, useLocation } from 'react-router-dom'
import { Store, LayoutDashboard, Tag, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mon Magasin', href: '/store', icon: Store },
  { name: 'Mes Offres', href: '/offers', icon: Tag },
  { name: 'Mes Clients', href: '/customers', icon: Users },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <Store className="h-8 w-8 text-primary-500" />
          <span className="ml-2 text-xl font-bold text-gray-900">Naymo</span>
        </div>
        <div className="flex-grow flex flex-col p-4">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg',
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    location.pathname === item.href
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar