import { 
  LayoutDashboard, 
  Store, 
  Tag, 
  Users, 
  Settings 
} from 'lucide-react'

export const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Mon Magasin', 
    href: '/store', 
    icon: Store 
  },
  { 
    name: 'Mes Offres', 
    href: '/offers', 
    icon: Tag 
  },
  { 
    name: 'Mes Clients', 
    href: '/customers', 
    icon: Users 
  },
  { 
    name: 'Paramètres', 
    href: '/settings', 
    icon: Settings 
  }
]