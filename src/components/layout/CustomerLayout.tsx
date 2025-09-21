import { Bell, History, Home, Search, Settings, User } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import logo from "../../assets/Logo.png"

const CustomerLayout = () => {
    const location = useLocation()

    const navItems = [
        { path: '/customer/dashboard', icon: <Home size={24} />, label: "Accueil" },
        { path: '/customer/myNaymo', icon: <User size={24} />, label: "Profil" },
        { path: '/customer/history', icon: <History size={24} />, label: "Historique" },
        { path: '/customer/search', icon: <Search size={24} />, label: "Recherche" },
        { path: '/customer/settings', icon: <Settings size={24} />, label: "Paramètres" }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Header uniforme */}
            <div className="fixed top-0 left-0 right-0 bg-[#c9eaad] shadow-lg z-50 flex items-center px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex-1" />
                <img src={logo} alt="Naymo" className="h-10 sm:h-12 mx-auto" />
                <div className="flex-1 flex justify-end">
                    <div className="relative">
                        <Bell size={20} className="sm:w-6 sm:h-6 text-[#396F04] hover:text-[#589507] transition-colors cursor-pointer" />
                        <span className="absolute -top-1 -right-1 bg-[#FFCD29] text-[#0A2004] text-xs rounded-full w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center font-bold">3</span>
                    </div>
                </div>
            </div>
            
            {/* Contenu principal */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <main className="flex-1 pb-20 sm:pb-24 pt-16 sm:pt-20">
                    <Outlet />
                </main>
            </div>

            {/* Barre de navigation mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-[#c9eaad]/30 shadow-2xl z-50 lg:hidden safe-area-inset-bottom">
                <div className="bg-gradient-to-r from-[#c9eaad]/10 to-[#ebffbc]/10 h-1"></div>
                <ul className="flex justify-around py-2 sm:py-3">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path
                        return (
                            <li key={index} className="flex-1 text-center">
                                <Link
                                    to={item.path}
                                    className={`flex flex-col items-center text-xs transition-all duration-200 px-1 ${
                                        isActive 
                                            ? 'text-[#396F04] font-bold transform scale-110' 
                                            : 'text-[#589507] hover:text-[#396F04]'
                                    }`}
                                >
                                    <div className={`p-2 sm:p-3 rounded-2xl transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-[#7fbd07] text-white shadow-lg transform -translate-y-1' 
                                            : 'hover:bg-[#ebffbc] hover:shadow-md'
                                    }`}>
                                        <div className="w-5 h-5 sm:w-6 sm:h-6">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <span className="mt-1 font-medium text-xs leading-tight">{item.label}</span>
                                    {isActive && (
                                        <div className="w-1 h-1 bg-[#7fbd07] rounded-full mt-1"></div>
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