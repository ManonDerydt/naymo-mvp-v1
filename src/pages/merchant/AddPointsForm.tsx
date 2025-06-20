'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const pointRatio = 10 // 1€ = 10 points

const presetAmounts = [5, 10, 20, 30]

const AddPointsForm = () => {
  const [phone, setPhone] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const amount = selectedAmount || Number(customAmount) || 0
  const points = amount * pointRatio

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !amount) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }

    setIsSubmitting(true)

    try {
      // 🔁 Ici, ajoute ta logique Firebase :
      // - Chercher le client via téléphone
      // - Créer si inexistant
      // - Ajouter une transaction
      // - Mettre à jour les points
      // (À implémenter dans un service)

      // Simulation
      await new Promise((res) => setTimeout(res, 1000))

      toast.success(`${points} points ajoutés au client.`)
      setPhone('')
      setCustomAmount('')
      setSelectedAmount(null)
    } catch (err) {
      toast.error('Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phone">Numéro de téléphone du client</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Ex: 0612345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Montant de l’achat</Label>
        <div className="flex gap-2 flex-wrap">
          {presetAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={selectedAmount === amount ? 'default' : 'outline'}
              onClick={() => {
                setSelectedAmount(amount)
                setCustomAmount('')
              }}
            >
              {amount} €
            </Button>
          ))}
          <Input
            type="number"
            placeholder="Autre montant (€)"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setSelectedAmount(null)
            }}
            className="w-32"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          <strong>{points}</strong> points seront attribués pour {amount.toFixed(2)} €.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ajout en cours...' : 'Valider'}
      </Button>
    </form>
  )
}

export default AddPointsForm
