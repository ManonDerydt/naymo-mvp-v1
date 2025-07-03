import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/components/firebase/firebaseConfig'
import { useAuth } from '@/components/firebase/useAuth'
import { Button } from '@/components/ui'

interface LoyaltyOverviewProps {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

type LoyaltyProgram = {
  id: string
  frequency: string
  reward: string
  value: string
}

const LoyaltyOverview = ({ onEdit, onDelete, onAdd }: LoyaltyOverviewProps) => {
  const { merchant } = useAuth()
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLoyaltyPrograms = async () => {
      if (!merchant) return

      try {
        // 1. Récupérer les IDs des programmes associés au marchand
        const merchantProgramRef = collection(db, 'merchant_has_loyalty_program')
        const merchantQuery = query(merchantProgramRef, where('merchant_id', '==', merchant.uid))
        const merchantSnapshot = await getDocs(merchantQuery)

        const loyaltyProgramIds = merchantSnapshot.docs
          .map(doc => doc.data().loyalty_program_id)
          .filter(Boolean)

        if (loyaltyProgramIds.length === 0) {
          setPrograms([])
          return
        }

        // 2. Récupérer les détails de chaque programme via les IDs
        const programQuery = query(
          collection(db, 'loyalty_program'),
          where('__name__', 'in', loyaltyProgramIds)
        )
        const programSnapshot = await getDocs(programQuery)

        const fetchedPrograms: LoyaltyProgram[] = programSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            frequency: data.frequency ?? '',
            reward: data.reward ?? '',
            value: data.value ?? '',
          }
        })

        setPrograms(fetchedPrograms)
      } catch (error) {
        console.error('Erreur lors du chargement des programmes de fidélité :', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoyaltyPrograms()
  }, [merchant])

  if (loading) {
    return <p className="text-center text-gray-500">Chargement en cours...</p>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Programme de fidélité</h3>
          <p className="text-sm text-gray-500">Configurez votre programme actuel</p>
        </div>
        <Button onClick={onAdd}>Ajouter</Button>
      </div>

      {programs.length === 0 ? (
        <p className="text-center text-gray-500">Aucun programme pour le moment.</p>
      ) : (
        programs.map(program => (
          <div key={program.id} className="space-y-4 border-b pb-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Fréquence</p>
              <p className="mt-1">{program.frequency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Récompense</p>
              <p className="mt-1">{program.reward}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Valeur minimum</p>
              <p className="mt-1">{program.value}</p>
            </div>
            <div className="text-right space-x-4">
              <Button size="sm" onClick={() => onEdit(program.id)}>
                Modifier
              </Button>
              <Button size="sm" onClick={() => onDelete(program.id)}>
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
