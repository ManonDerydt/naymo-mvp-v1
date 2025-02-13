export const analyticsData = [
  {
    title: 'Âge moyen',
    value: '32 ans',
    distribution: [
      { label: '18-25', value: 20 },
      { label: '26-35', value: 45 },
      { label: '36-50', value: 25 },
      { label: '50+', value: 10 },
    ],
    iconType: 'users' as const,
  },
  {
    title: 'Localisation',
    value: 'Paris',
    distribution: [
      { label: 'Paris', value: 60 },
      { label: 'Banlieue', value: 30 },
      { label: 'Province', value: 10 },
    ],
    iconType: 'map' as const,
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
    iconType: 'chart' as const,
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
    iconType: 'heart' as const,
  },
]

export type AnalyticsItem = typeof analyticsData[number]