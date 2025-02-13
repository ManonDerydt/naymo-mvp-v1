import { BarChart3, MapPin, Users, Heart } from 'lucide-react'

const CustomerAnalytics = () => {
  const analytics = [
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                {item.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {item.value}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {item.distribution.map((dist, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{dist.label}</span>
                    <span>{dist.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${dist.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}