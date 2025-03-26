import { Button } from '@/components/ui'
import { useState } from 'react'

interface LoyaltyOverviewProps {
  onEdit: () => void
  onAdd: () => void // Ajout de la fonction onAdd pour gérer l'ajout
}

const LoyaltyOverview = ({ onEdit, onAdd }: LoyaltyOverviewProps) => {
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
          <Button onClick={onEdit}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Fréquence</p>
          <p className="mt-1"></p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Récompense</p>
          <p className="mt-1"></p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Valeur minimum</p>
          <p className="mt-1"></p>
        </div>
      </div>
    </div>
  )
}

export default LoyaltyOverview
