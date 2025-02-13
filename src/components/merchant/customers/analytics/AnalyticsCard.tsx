import { ReactNode } from 'react'
import { BarChart3, MapPin, Users, Heart } from 'lucide-react'
import { AnalyticsItem } from './analyticsData'

const getIcon = (iconType: AnalyticsItem['iconType']): ReactNode => {
  switch (iconType) {
    case 'users':
      return <Users className="w-5 h-5 text-blue-500" />
    case 'map':
      return <MapPin className="w-5 h-5 text-red-500" />
    case 'chart':
      return <BarChart3 className="w-5 h-5 text-green-500" />
    case 'heart':
      return <Heart className="w-5 h-5 text-purple-500" />
  }
}

interface Distribution {
  label: string
  value: number
}

interface AnalyticsCardProps extends Omit<AnalyticsItem, 'icon'> {
  iconType: AnalyticsItem['iconType']
}

const AnalyticsCard = ({ title, value, iconType, distribution }: AnalyticsCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          {getIcon(iconType)}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {value}
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        {distribution.map((dist, i) => (
          <DistributionBar key={i} {...dist} />
        ))}
      </div>
    </div>
  )
}

const DistributionBar = ({ label, value }: Distribution) => (
  <div>
    <div className="flex justify-between text-sm text-gray-600 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary-500 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
)

export default AnalyticsCard