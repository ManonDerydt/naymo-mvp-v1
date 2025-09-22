import { Menu, Bell } from 'lucide-react'
import UserMenu from './UserMenu'

const TopBar = () => {
  return (
    <header className="bg-white border-b border-[#c9eaad] sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <button className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 lg:ml-0 flex justify-center lg:justify-start">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 lg:hidden">Naymo</h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button className="p-2 rounded-full text-gray-400 hover:text-[#7ebd07] hover:bg-[#c9eaad]/20 transition-colors">
            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
          
          <div className="h-6 lg:h-8 w-px bg-[#c9eaad]" />
          
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

export default TopBar