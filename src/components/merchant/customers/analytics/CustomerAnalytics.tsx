import { analyticsData } from './analyticsData'
import AnalyticsCard from './AnalyticsCard'

const CustomerAnalytics = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsData.map((item, index) => (
          <AnalyticsCard key={index} {...item} />
        ))}
      </div>
    </div>
  )
}

export default CustomerAnalytics