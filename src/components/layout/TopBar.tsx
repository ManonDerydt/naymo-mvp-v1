import { Bell } from 'lucide-react'
import UserMenu from './UserMenu'

const TopBar = () => {
  return (
    <header className="bg-[#032313] sticky top-0 z-10 shadow-lg">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex-1 lg:ml-0" />

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-white hover:text-green-300 hover:bg-green-800/30 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="h-8 w-px bg-green-600" />
          
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

export default TopBar