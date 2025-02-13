import { Menu, Bell } from 'lucide-react'
import UserMenu from './UserMenu'

const TopBar = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <button className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 lg:ml-0" />

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="h-8 w-px bg-gray-200" />
          
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

export default TopBar