import { Home, Search, Settings, User } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

const CustomerLayout = () => {
    const location = useLocation()

    const navItems = [
        { path: '/customer/dashboard', icon: <Home size={24} />, label: "Accueil" },
        { path: '/customer/myNaymo', icon: <User size={24} />, label: "Profil" },
        { path: '/customer/search', icon: <Search size={24} />, label: "Recherche" },
        { path: '/customer/settings', icon: <Settings size={24} />, label: "Paramètres" }
    ]

    return (
        <div className="min-h-screen via-white to-green-100">
            {/* Contenu principal */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <main className="flex-1 p-6 pb-24">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Barre de navigation mobile - style moderne */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 lg:hidden">
                <ul className="flex justify-around py-3">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path
                        return (
                            <li key={index} className="flex-1 text-center">
                                <Link
                                    to={item.path}
                                    className={`flex flex-col items-center text-xs ${
                                        isActive 
                                            ? 'text-[#7ebd07] font-semibold' 
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <div className={`p-2 rounded-full transition-all ${
                                        isActive 
                                            ? 'bg-[#7ebd07]/10 shadow-sm' 
                                            : 'hover:bg-gray-50'
                                    }`}>
                                        {item.icon}
                                    </div>
                                    <span className="mt-1">{item.label}</span>
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
