import { useEffect, useState } from 'react'
import { User, MapPin, Calendar, ShoppingCart } from 'lucide-react'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '@/components/firebase/firebaseConfig'
import { useAuth } from '@/components/firebase/useAuth'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  city?: string
  zip_code?: string
  birth_date?: string
  points: number
  totalSpent: number
  purchaseCount: number
  averageBasket: number
}

const CustomersList = () => {
  const { merchant } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!merchant?.uid) return

      try {
        // 1. Récupérer les relations de fidélisation pour ce commerçant
        const fidelisationQuery = query(
          collection(db, 'fidelisation'),
          where('merchantId', '==', merchant.uid)
        )
        const fidelisationSnap = await getDocs(fidelisationQuery)

        // 2. Récupérer les données des clients et calculer les statistiques
        const customerPromises = fidelisationSnap.docs.map(async (fidelDoc) => {
          const fidelData = fidelDoc.data()
          const customerId = fidelData.customerId

          // Récupérer les infos du client
          const customerDoc = await getDoc(doc(db, 'customer', customerId))
          if (!customerDoc.exists()) return null

          const customerData = customerDoc.data()

          // Récupérer l'historique des points pour ce client et ce commerçant
          const pointsHistoryQuery = query(
            collection(db, 'pointsHistory'),
            where('customerId', '==', customerId),
            where('merchantId', '==', merchant.uid)
          )
          const pointsHistorySnap = await getDocs(pointsHistoryQuery)

          let totalSpent = 0
          let purchaseCount = 0

          pointsHistorySnap.docs.forEach(doc => {
            const data = doc.data()
            totalSpent += data.totalRevenue || 0
            purchaseCount += 1
          })

          const averageBasket = purchaseCount > 0 ? totalSpent / purchaseCount : 0

          // Calculer l'âge
          let age = null
          if (customerData.birth_date) {
            const birthDate = new Date(customerData.birth_date)
            const today = new Date()
            age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--
            }
          }

          return {
            id: customerId,
            first_name: customerData.first_name || '',
            last_name: customerData.last_name || '',
            email: customerData.email || '',
            city: customerData.city || '',
            zip_code: customerData.zip_code || '',
            age,
            points: fidelData.points || 0,
            totalSpent,
            purchaseCount,
            averageBasket
          }
        })

        const customersData = await Promise.all(customerPromises)
        const validCustomers = customersData.filter(customer => customer !== null) as Customer[]

        // Trier par montant total dépensé (décroissant)
        validCustomers.sort((a, b) => b.totalSpent - a.totalSpent)

        setCustomers(validCustomers)
      } catch (error) {
        console.error('Erreur lors de la récupération des clients :', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [merchant])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7fbd07]"></div>
        <span className="ml-3 text-gray-600">Chargement des clients...</span>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
        <p className="text-gray-500">Vos clients apparaîtront ici une fois qu'ils auront effectué des achats.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Liste des clients</h2>
        <span className="text-sm text-gray-500">{customers.length} client{customers.length > 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              {/* Informations principales */}
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-[#6366f1]" />
                </div>

                {/* Détails du client */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{customer.email}</p>

                  {/* Informations détaillées */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {customer.age && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{customer.age} ans</span>
                      </div>
                    )}
                    
                    {customer.city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{customer.city} {customer.zip_code && `(${customer.zip_code})`}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Panier moyen: {customer.averageBasket.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="text-right">
                <div className="text-2xl font-bold text-[#13b981] mb-1">
                  {customer.totalSpent.toFixed(2)} €
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {customer.purchaseCount} achat{customer.purchaseCount > 1 ? 's' : ''}
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#7fbd07]/10 text-[#7fbd07]">
                  {customer.points} points
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomersList