import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'
import SuccessMessage from './shared/SuccessMessage'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { useAuth } from '@/components/firebase/useAuth'

interface ConfirmModalProps {
  onClose: () => void
  onConfirm: () => void
  message: string
}

const ConfirmModal = ({ onClose, onConfirm, message }: ConfirmModalProps) => {
  // console.log("Modal activé")
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center" role="dialog" aria-labelledby="confirmationTitle" aria-describedby="confirmationMessage">
        <h3 id="confirmationTitle" className="text-lg font-medium text-gray-900">Confirmation</h3>
        <p id="confirmationMessage" className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="pt-4 flex justify-center space-x-4">
          <Button variant="outline" onClick={onClose}>Non</Button>
          <Button onClick={onConfirm}>Oui</Button>
        </div>
      </div>
    </div>
  )
}

type Step = 'overview' | 'form' | 'success'

type PromoVip = {
  id: string
  frequency: string
  reward: string
  value: string
}

const VipProgram = () => {
  const [promosVip, setPromosVip] = useState<PromoVip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPromoVipId, setSelectedPromoVipId] = useState<string | null>(null)
  const [promoVipToDelete, setPromoVipToDelete] = useState<string | null>(null)

  const [step, setStep] = useState<Step>('overview')
  const [formData, setFormData] = useState({
    frequency: '',
    reward: '',
    value: '',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleConfirmModal = () => {
    setIsModalOpen(true) // Ouvrir le modal au clic sur "Enregistrer"
  }

  const confirmProgram = async () => {
    setIsModalOpen(false)
    setLoading(true) // 👉 Démarre le loading

    try {
      if (mode === 'create') {
        await handleCreate()
      } else if (mode === 'edit') {
        await handleUpdate()
      } else if (mode === 'delete') {
        await handleDelete(promoVipToDelete!)
      }
    } finally {
      setLoading(false) // 👉 Termine le loading, même en cas d'erreur
    }
  }

  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'create' | 'edit' | 'delete'>('create')

  const handleCreate = async () => {
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("Vous devez être connecté pour créer une promo VIP")
      }

      // Ajout dans loyalty_program
      const promoVipRef = collection(db, "promo_vip")
      const promoVipDoc = await addDoc(promoVipRef, {
        ...formData
      })

      // Ajout dans merchant_has_loyalty_program
      const merchantHasPromoVipRef = collection(db, "merchant_has_promo_vip")
      await addDoc(merchantHasPromoVipRef, {
        merchant_id: user.uid,
        promo_vip_id: promoVipDoc.id
      })

      const newPromo: PromoVip = {
        id: promoVipDoc.id,
        frequency: formData.frequency,
        reward: formData.reward,
        value: formData.value
      }
      setPromosVip((prevPromosVip) => [...prevPromosVip, newPromo])

      console.log("Promo VIP enregistré avec succès !")
      setStep('success')
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement :", err);
      setError("Une erreur est survenue lors de la création de la promo VIP.")
    }
  }
    
  const { merchant } = useAuth();

  const handleEdit = async (promoVipId: string) => {
    try {
      const promoVipDocRef = doc(db, "promo_vip", promoVipId)
      const promoVipDocSnap = await getDoc(promoVipDocRef)
  
      if (promoVipDocSnap.exists()) {
        const data = promoVipDocSnap.data()
        setFormData({
          frequency: data.frequency || '',
          reward: data.reward || '',
          value: data.value || ''
        })
        setMode('edit')
        setStep('form')
  
        // Optionnel : stocker l’ID pour la mise à jour
        setSelectedPromoVipId(promoVipId)
      } else {
        console.error("Document promo VIP introuvable !")
      }
    } catch (err: any) {
      console.error("Erreur dans handleEdit :", err)
      setError("Impossible de récupérer les données.")
    }
  }

  const handleUpdate = async () => {
    try {
      if (!selectedPromoVipId) {
        console.error("Aucun ID sélectionné pour la mise à jour")
        return
      }
  
      await updateDoc(doc(db, "promo_vip", selectedPromoVipId), formData)

      setPromosVip((prevPromosVip) =>
        prevPromosVip.map((promo) =>
          promo.id === selectedPromoVipId ? { ...promo, ...formData } : promo
        )
      )
  
      console.log("Données mises à jour !")
      setStep('success')
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour :", err)
      setError("Erreur lors de la modification.")
    }
  }

  const handleDelete = async (promoVipId: string) => {
    try {
      if (!merchant) {
        console.error("Utilisateur non connecté !");
        return;
      }
      
      // Étape 1 : Récupérer le document dans "merchant_has_promo_vip"
      const merchantPromosVipRef = collection(db, "merchant_has_promo_vip");
      const q = query(merchantPromosVipRef, where("promo_vip_id", "==", promoVipId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Suppression des documents correspondants dans "merchant_has_promo_vip"
        await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
      }
  
      // Étape 2 : Suppression du document dans "promo_vip"
      await deleteDoc(doc(db, "promo_vip", promoVipId));

      // Mise à jour de l'état pour enlever la promo VIP supprimée
      setPromosVip(prevPromosVip => prevPromosVip.filter(promoVip => promoVip.id !== promoVipId));
  
      console.log("Promo VIP supprimée avec succès :", promoVipId);
  
    } catch (error) {
      console.error("Erreur lors de la suppression de la promo VIP :", error);
    }
  }

  useEffect(() => {
    const fetchPromosVip = async () => {
      
      if (!merchant) return
      
      try {
        const merchantPromoVipQuery = query(
          collection(db, 'merchant_has_promo_vip'),
          where('merchant_id', '==', merchant.uid)
        )
        const merchantPromoVipSnapshot = await getDocs(merchantPromoVipQuery)
  
        const promoVipIds = merchantPromoVipSnapshot.docs
          .map(doc => doc.data().promo_vip_id)
          .filter(Boolean)
  
        if (promoVipIds.length === 0) {
          setPromosVip([])
          return
        }
  
        const promosVipQuery = query(
          collection(db, 'promo_vip'),
          where('__name__', 'in', promoVipIds)
        )
        const promosVipSnapshot = await getDocs(promosVipQuery)
  
        const fetchedPromosVip = promosVipSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            frequency: data.frequency || '',
            reward: data.reward || '',
            value: data.value || ''
          }
        }) as PromoVip[]
  
        setPromosVip(fetchedPromosVip)
      } catch (error) {
        console.error("Erreur lors de la récupération des programmes de fidélité :", error)
      } finally {
        setLoading(false)
      }
    }
  
    fetchPromosVip()
  }, [merchant])
    

  if (step === 'form') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Configurer le programme VIP
        </h3>

        <Input
          label="Fréquence"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          placeholder="Ex: Une fois par mois"
        />

        <Input
          label="Récompense"
          value={formData.reward}
          onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
          placeholder="Ex: Accès prioritaire aux ventes"
        />

        <Input
          label="Valeur minimum"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="Ex: 1000€ d'achats cumulés"
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setStep('overview')}>
            Annuler
          </Button>
          <Button onClick={handleConfirmModal}>
            Enregistrer
          </Button>
        </div>

        {/* Modal de confirmation */}
        {isModalOpen && (
          <ConfirmModal
            onClose={() => setIsModalOpen(false)}
            onConfirm={confirmProgram}
            message={
              mode === 'create' ? "Êtes-vous sûr de vouloir créer ce programme VIP ?" :
              mode === 'edit' ? "Êtes-vous sûr de vouloir modifier ces informations ?" :
              "Etes-vous sûr de vouloir supprimer ces informations ? Cette action est irréversible."
            }
          />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}
      </div>
    )
  }

  
  if (step === 'success') {
    return (
      <SuccessMessage
        title={
          mode === 'create' ? 'Programme VIP créé !' :
          mode === 'edit' ? 'Programme VIP mis à jour !' :
          'Programme VIP supprimé !'
        }
        message={
          mode === 'create' ? "Votre programme VIP a été créé avec succès." :
          mode === 'edit' ? "Votre programme VIP a été mis à jour avec succès." :
          "Votre programme VIP a été supprimé avec succès."
        }
        buttonText="Retour à l'aperçu"
        onButtonClick={() => setStep('overview')}
      />
    )
  }

  if (loading) {
    return <p className="text-center text-gray-500">Chargement des promos VIP...</p>
  }
  
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Programme VIP actuel</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configuration de votre programme VIP
          </p>
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={() => {
            setFormData({ frequency: '', reward: '', value: '' })
            setMode('create')
            setStep('form')
            }}
            className="bg-[#7fbd07] hover:bg-[#6ba006] text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Ajouter
          </Button>
        </div>
      </div>

      {promosVip.length === 0 ? (
        <p className="text-center text-gray-500">Aucune promo VIP disponible.</p>
      ) : (
        promosVip.map((promoVip) => (
          <div key={promoVip.id} className="space-y-4 border-b border-gray-100 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
            <div>
              <p className="text-sm font-medium text-gray-500">Fréquence</p>
              <p className="mt-1">{promoVip.frequency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Récompense</p>
              <p className="mt-1">{promoVip.reward}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Valeur minimum</p>
              <p className="mt-1">{promoVip.value}</p>
            </div>
            <div className="text-right space-x-4">
              <Button 
                size="sm" 
                onClick={() => handleEdit(promoVip.id)}
                className="bg-[#7fbd07] hover:bg-[#6ba006] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Modifier
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleDelete(promoVip.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-red-200 hover:border-red-300"
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default VipProgram
