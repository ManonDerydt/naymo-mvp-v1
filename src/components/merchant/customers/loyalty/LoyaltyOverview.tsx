import { db } from '@/components/firebase/firebaseConfig'
import { useAuth } from '@/components/firebase/useAuth'
import { Button } from '@/components/ui'
import { on } from 'events'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'

interface LoyaltyOverviewProps {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAdd: () => void // Ajout de la fonction onAdd pour gérer l'ajout
}

type LoyaltyProgram = {
  id: string
  frequency: string
  reward: string
  value: string
}

const LoyaltyOverview = ({ onEdit, onAdd, onDelete }: LoyaltyOverviewProps) => {
  const { merchant } = useAuth()

  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLoyaltyPrograms = async () => {

      if (!merchant) return

      try {
        const merchantLoyaltyProgramQuery = query(
          collection(db, 'merchant_has_loyalty_program'),
          where('merchant_id', '==', merchant.uid)
        )
        const merchantLoyaltyProgramSnapshot = await getDocs(merchantLoyaltyProgramQuery)

        const loyaltyProgramIds = merchantLoyaltyProgramSnapshot.docs
          .map(doc => doc.data().loyalty_program_id)
          .filter(Boolean)

        if (loyaltyProgramIds.length === 0) {
          setLoyaltyPrograms([])
          return
        }

        const loyaltyProgramsQuery = query(collection(db, 'loyalty_program'), where('__name__', 'in', loyaltyProgramIds))
        const loyaltyProgramsSnapshot = await getDocs(loyaltyProgramsQuery)

        const fetchedLoyaltyPrograms = loyaltyProgramsSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            frequency: data.frequency || '',
            reward: data.reward || '',
            value: data.value || ''
          }
        }) as LoyaltyProgram[]

        setLoyaltyPrograms(fetchedLoyaltyPrograms)
      } catch (error) {
        console.error("Erreur lors de la récupération des programmes de fidélité :", error)
      } finally {
        setLoading(false)
      }
    }
  
    fetchLoyaltyPrograms()
  }, [merchant])
  
  if (loading) {
    return <p className="text-center text-gray-500">Chargement des programmes de fidélité...</p>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Programme actuel</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configuration de votre programme de fidélité
          </p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={onAdd}>
            Ajouter
          </Button>
          {/* <Button onClick={onEdit}>
            Modifier
          </Button> */}
        </div>
      </div>

      {loyaltyPrograms.length === 0 ? (
        <p className="text-center text-gray-500">Aucun programme de fidélité disponible.</p>
      ) : (
        loyaltyPrograms.map((loyaltyProgram) => (
          <div key={loyaltyProgram.id} className="space-y-4 border-b pb-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Fréquence</p>
              <p className="mt-1">{loyaltyProgram.frequency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Récompense</p>
              <p className="mt-1">{loyaltyProgram.reward}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Valeur minimum</p>
              <p className="mt-1">{loyaltyProgram.value}</p>
            </div>
            <div className="text-right space-x-4">
              <Button size="sm" onClick={() => onEdit(loyaltyProgram.id)}>
                Modifier
              </Button>
              <Button size="sm" onClick={() => onDelete(loyaltyProgram.id)}>
                Supprimer
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default LoyaltyOverview
