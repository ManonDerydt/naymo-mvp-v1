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
    value: '0 ans', // Valeur mise à zéro
    distribution: [
      { label: '18-25', value: 0 }, // Valeur mise à zéro
      { label: '26-35', value: 0 }, // Valeur mise à zéro
      { label: '36-50', value: 0 }, // Valeur mise à zéro
      { label: '50+', value: 0 }, // Valeur mise à zéro
    ],
    iconType: 'users',
  },
  {
    title: 'Localisation',
    value: 'Inconnue', // Valeur mise à zéro
    distribution: [
      { label: 'Paris', value: 0 }, // Valeur mise à zéro
      { label: 'Banlieue', value: 0 }, // Valeur mise à zéro
      { label: 'Province', value: 0 }, // Valeur mise à zéro
    ],
    iconType: 'map',
  },
  {
    title: 'Panier moyen',
    value: '0 €', // Valeur mise à zéro
    distribution: [
      { label: '< 20€', value: 0 }, // Valeur mise à zéro
      { label: '20-50€', value: 0 }, // Valeur mise à zéro
      { label: '50-100€', value: 0 }, // Valeur mise à zéro
      { label: '> 100€', value: 0 }, // Valeur mise à zéro
    ],
    iconType: 'chart',
  },
  {
    title: "Centre d'intérêt",
    value: 'Aucun', // Valeur mise à zéro
    distribution: [
      { label: 'Mode', value: 0 }, // Valeur mise à zéro
      { label: 'Beauté', value: 0 }, // Valeur mise à zéro
      { label: 'Sport', value: 0 }, // Valeur mise à zéro
      { label: 'Tech', value: 0 }, // Valeur mise à zéro
    ],
    iconType: 'heart',
  },
]