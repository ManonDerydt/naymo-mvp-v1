// import { Outlet } from 'react-router-dom'
// import Sidebar from './Sidebar'
// import TopBar from './TopBar'

// import CustomerDashboard from "@/pages/customer/CustomerDashboard"
import { Home, Search, Settings, User } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

const CustomerLayout = () => {
    const location = useLocation()

    const navItems = [
        { path: '/customer/dashboard', icon: <Home size={50} />},
        { path: '/customer/myNaymo', icon: <User size={50} />},
        { path: '/customer/search', icon: <Search size={50} />},
        { path: '/customer/settings', icon: <Settings size={50} /> }
    ]
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Sidebar /> */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* <TopBar /> */}
        <main className="flex-1 p-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Barre de navigation mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm z-50 lg:hidden">
        <ul className="flex justify-around py-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex flex-col items-center text-sm ${
                    isActive ? 'text-green-600 font-semibold' : 'text-gray-500'
                  }`}
                >
                  {item.icon}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

    </div>
  )
}

export default CustomerLayout