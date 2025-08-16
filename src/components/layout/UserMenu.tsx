import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-300">
          <User className="h-5 w-5 text-green-700" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-green-200">
          <button
            onClick={() => {
              navigate('/settings')
              setIsOpen(false)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
          >
            Mon compte
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu