import { BarChart3, MapPin, Users, Heart } from 'lucide-react'
import { ReactNode } from 'react'

export interface AnalyticsItem {
  title: string
  value: string
  distribution: Array<{
    label: string
    value: number
  }>
  iconType: 'users' | 'map' | 'chart' | 'heart'
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
    iconType: 'users',
  },
  {
    title: 'Localisation',
    value: 'Paris',
    distribution: [
      { label: 'Paris', value: 60 },
      { label: 'Banlieue', value: 30 },
      { label: 'Province', value: 10 },
    ],
    iconType: 'map',
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
    iconType: 'chart',
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
    iconType: 'heart',
  },
]