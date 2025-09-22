import { Bell, History, Home, Search, Settings, User } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import logo from "../../assets/Logo.png"

const CustomerLayout = () => {
    const location = useLocation()

    const navItems = [
        { path: '/customer/dashboard', icon: <Home size={20} />, label: "Accueil" },
        { path: '/customer/myNaymo', icon: <User size={20} />, label: "Profil" },
        { path: '/customer/history', icon: <History size={20} />, label: "Historique" },
        { path: '/customer/search', icon: <Search size={20} />, label: "Recherche" },
        { path: '/customer/settings', icon: <Settings size={20} />, label: "Paramètres" }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header fixe */}
            <header className="fixed top-0 left-0 right-0 bg-[#c9eaad] shadow-lg z-50 h-16">
                <div className="flex items-center justify-between px-4 h-full">
                    <div className="flex-1" />
                    <img src={logo} alt="Naymo" className="h-8 sm:h-10" />
                    <div className="flex-1 flex justify-end">
                        <div className="relative">
                            <Bell size={20} className="text-[#396F04] hover:text-[#589507] transition-colors cursor-pointer" />
                            <span className="absolute -top-1 -right-1 bg-[#FFCD29] text-[#0A2004] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">3</span>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Contenu principal avec padding-top pour compenser le header fixe */}
            <main className="pt-16 pb-20">
                <Outlet />
            </main>

            {/* Menu de navigation mobile fixe en bas */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#c9eaad]/30 shadow-lg z-50 h-20">
                <div className="h-full flex items-center justify-center">
                    <div className="flex justify-center items-center w-full max-w-md mx-auto px-4">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                                        isActive 
                                            ? 'text-[#396F04]' 
                                            : 'text-[#589507] hover:text-[#396F04]'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-[#7fbd07] text-white shadow-md' 
                                            : 'hover:bg-[#ebffbc]'
                                    }`}>
                                        {item.icon}
                                    </div>
                                    <span className="mt-1 text-xs font-medium text-center">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default CustomerLayout