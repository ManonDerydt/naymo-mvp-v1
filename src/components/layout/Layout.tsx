import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Menu à gauche */}
      <Sidebar />

      {/* Contenu à droite */}
      <div className="flex flex-col flex-1 min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
