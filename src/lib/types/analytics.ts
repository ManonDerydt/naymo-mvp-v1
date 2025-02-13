export interface Distribution {
  label: string
  value: number
}

export interface AnalyticsItem {
  title: string
  value: string
  distribution: Distribution[]
  iconType: 'users' | 'map' | 'chart' | 'heart'
}