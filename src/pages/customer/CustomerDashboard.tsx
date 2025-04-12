import { Activity, Gift, Star, Users } from 'lucide-react'
import StatCard from '@/components/merchant/dashboard/StatCard'
import CodeGenerator from '@/components/merchant/dashboard/CodeGenerator'
import DailyTip from '@/components/merchant/dashboard/DailyTip'
import { useAuth } from "@/components/firebase/useAuth";

const CustomerDashboard = () => {
  const { customer, customerData } = useAuth()  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Dernière mise à jour: aujourd'hui</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {customer && customerData ? (
          <span>
            Bienvenue <strong>{customerData.first_name} {customerData.last_name}</strong>
          </span>
        ) : (
          "Pas de données pour le moment"
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* <CodeGenerator /> */}
        </div>
        <div>
          {/* <DailyTip /> */}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard