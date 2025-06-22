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
    value: '32 ans', // Changé de "0 ans"
    distribution: [
      { label: '18-25', value: 15 }, // 15% des clients
      { label: '26-35', value: 55 }, // 55% des clients (majorité)
      { label: '36-50', value: 25 }, // 25% des clients
      { label: '50+', value: 5 },   // 5% des clients
    ],
    iconType: 'users',
  },
  {
    title: 'Localisation',
    value: 'Paris', // Changé de "Inconnue"
    distribution: [
      { label: 'Paris', value: 45 },    // 45% à Paris
      { label: 'Banlieue', value: 35 }, // 35% en banlieue
      { label: 'Province', value: 20 }, // 20% en province
    ],
    iconType: 'map',
  },
  {
    title: 'Panier moyen',
    value: '67 €', // Changé de "0 €"
    distribution: [
      { label: '< 20€', value: 10 },   // 10% des achats
      { label: '20-50€', value: 30 },  // 30% des achats
      { label: '50-100€', value: 45 }, // 45% des achats (majoritaire)
      { label: '> 100€', value: 15 },  // 15% des achats
    ],
    iconType: 'chart',
  },
  {
    title: "Centre d'intérêt",
    value: 'Mode & Beauté', // Changé de "Aucun"
    distribution: [
      { label: 'Mode', value: 40 },   // 40% s'intéressent à la mode
      { label: 'Beauté', value: 30 }, // 30% à la beauté
      { label: 'Sport', value: 20 },  // 20% au sport
      { label: 'Tech', value: 10 },   // 10% à la tech
    ],
    iconType: 'heart',
  },
]
