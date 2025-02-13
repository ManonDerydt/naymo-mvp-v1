import { Button } from '@/components/ui'

const CustomerSupport = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Service Après-Vente</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Nous contacter</h3>
            <p className="text-sm text-gray-600">
              Notre équipe est disponible du lundi au vendredi de 9h à 18h.
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <ContactInfo
              type="email"
              value="support@naymo.com"
            />
            <ContactInfo
              type="phone"
              value="01 23 45 67 89"
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <Button className="w-full justify-center">
              Contacter le support
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ContactInfoProps {
  type: 'email' | 'phone'
  value: string
}

const ContactInfo = ({ type, value }: ContactInfoProps) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0">
      {type === 'email' ? (
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900">{type === 'email' ? 'Email' : 'Téléphone'}</p>
      <p className="text-sm text-gray-600">{value}</p>
    </div>
  </div>
)

export default CustomerSupport