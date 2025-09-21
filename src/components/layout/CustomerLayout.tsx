import { History, Home, Search, Settings, User } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

const CustomerLayout = () => {
    const location = useLocation()

    const navItems = [
        { path: '/customer/dashboard', icon: <Home size={24} />, label: "Accueil" },
        { path: '/customer/myNaymo', icon: <User size={24} />, label: "Profil" },
        { path: '/customer/history', icon: <History size={24} />, label: "Historique" },
        { path: '/customer/search', icon: <Search size={24} />, label: "Recherche" },
        { path: '/customer/settings', icon: <Settings size={24} />, label: "Paramètres" }
    ]

            <div className="fixed top-0 left-0 right-0 bg-[#c9eaad] shadow-lg z-50 flex items-center px-6 py-4">
        <div className="min-h-screen bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc]">
            {/* Contenu principal */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <main className="flex-1 pb-24">
                        <Bell size={24} className="text-[#396F04] hover:text-[#589507] transition-colors cursor-pointer" />
                        <span className="absolute -top-1 -right-1 bg-[#FFCD29] text-[#0A2004] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">0</span>
                    </div>
                </main>
            </div>

            {/* Barre de navigation mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-[#c9eaad]/30 shadow-2xl z-50 lg:hidden">
                <div className="bg-gradient-to-r from-[#c9eaad]/10 to-[#ebffbc]/10 h-1"></div>
                <ul className="flex justify-around py-3">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path
                        return (
                            <li key={index} className="flex-1 text-center">
                                <Link
                                    to={item.path}
                                    className={`flex flex-col items-center text-xs transition-all duration-200 ${
                                        isActive 
                                            ? 'text-[#396F04] font-bold transform scale-110' 
                                            : 'text-[#589507] hover:text-[#396F04]'
                                    }`}
                                >
                                    <div className={`p-3 rounded-2xl transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] text-white shadow-lg transform -translate-y-1' 
                                            : 'hover:bg-[#ebffbc] hover:shadow-md'
                                    }`}>
                                        {item.icon}
                                    </div>
                                    <span className="mt-1 font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="w-1 h-1 bg-[#396F04] rounded-full mt-1"></div>
                                    )}
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