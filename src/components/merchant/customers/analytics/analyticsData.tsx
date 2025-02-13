import { ReactNode } from 'react'
import { BarChart3, MapPin, Users, Heart } from 'lucide-react'

interface AnalyticsItem {
  title: string
  value: string
  distribution: Array<{
    label: string
    value: number
  }>
  icon: ReactNode
}

export const analyticsData: AnalyticsItem[] = [
  {
    title: 'Âge moyen',
    value: '32 ans',
    distribution: [
      { label: '18-25', value: 20 },
      { label: '26-35', value: 45 },
      { label: '36-50', value: 25 },
      { label: '50+', value: 10 },
    ],
    icon: <Users className="w-5 h-5 text-blue-500" />,
  },
  {
    title: 'Localisation',
    value: 'Paris',
    distribution: [
      { label: 'Paris', value: 60 },
      { label: 'Banlieue', value: 30 },
      { label: 'Province', value: 10 },
    ],
    icon: <MapPin className="w-5 h-5 text-red-500" />,
  },
  {
    title: 'Panier moyen',
    value: '45 €',
    distribution: [
      { label: '< 20€', value: 15 },
      { label: '20-50€', value: 45 },
      { label: '50-100€', value: 30 },
      { label: '> 100€', value: 10 },
    ],
    icon: <BarChart3 className="w-5 h-5 text-green-500" />,
  },
  {
    title: "Centre d'intérêt",
    value: 'Mode & Beauté',
    distribution: [
      { label: 'Mode', value: 40 },
      { label: 'Beauté', value: 30 },
      { label: 'Sport', value: 20 },
      { label: 'Tech', value: 10 },
    ],
    icon: <Heart className="w-5 h-5 text-purple-500" />,
  },
]