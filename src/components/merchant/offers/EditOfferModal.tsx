import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/forms'
import { db } from '@/components/firebase/firebaseConfig'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { useAuth } from '@/components/firebase/useAuth'

interface EditOfferModalProps {
  onClose: () => void
  initialData: {
    description: string
    duration: string
    isBoosted: boolean
    name: string
    target: string
  }
}

const EditOfferModal = ({ onClose, initialData }: EditOfferModalProps) => {
  const [formData, setFormData] = useState({
    description: initialData?.description ?? "",
    duration: initialData?.duration ?? "",
    isBoosted: initialData?.isBoosted ?? false,
    name: initialData?.name ?? "",
    target: initialData?.target ?? "",
  })
  const [step, setStep] = useState<'info' | 'success'>('info')

  const { merchant } = useAuth();

  // Initialise formData avec les données de l'offre
  useEffect(() => {
    setFormData({
      description: initialData?.description ?? "",
      duration: initialData?.duration ?? "",
      isBoosted: initialData?.isBoosted ?? false,
      name: initialData?.name ?? "",
      target: initialData?.target ?? "",
    });
  }, [initialData]);

  const handleSubmit = async () => {
    try {
        if (!merchant) {
          console.error("Utilisateur non connecté !");
          return;
        }
    
        // Étape 1 : Chercher le document dans "merchant_has_offer" qui correspond au merchant_id
        const merchantOffersRef = collection(db, "merchant_has_offer");
        const q = query(merchantOffersRef, where("merchant_id", "==", merchant.uid));
        const querySnapshot = await getDocs(q);
        
        
        if (querySnapshot.empty) {
            console.error("Aucune offre trouvée pour ce marchand !");
            return;
        }
        
        // Récupérer le premier document trouvé (si plusieurs, adapter la logique selon le besoin)
        const merchantOfferDoc = querySnapshot.docs[0];
        const offerId = merchantOfferDoc.data().offer_id;
    
        if (!offerId) {
          console.error("L'ID de l'offre est manquant !");
          return;
        }
    
        // Étape 2 : Mise à jour des données de l'offre
        const updatedData = {
          description: formData.description,
          duration: formData.duration,
          isBoosted: formData.isBoosted,
          name: formData.name,
          target: formData.target
        };
    
        await updateDoc(doc(db, "offer", offerId), updatedData);
    
        console.log("Données de l'offre mises à jour sous l'ID :", offerId);
    
        setFormData((prev) => ({
          ...prev,
          ...updatedData,
        }));
    
        setStep('success');
      } catch (error) {
        console.error("Erreur lors de la mise à jour des données : ", error);
      }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Modifications enregistrées !</h3>
          <p className="mt-2 text-sm text-gray-500">
            Les informations de votre offre ont été mises à jour avec succès.
          </p>
          <Button
            onClick={onClose}
            className="mt-6"
          >
            Fermer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Modifier les informations de l'offre</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'info' ? (
            <div className="space-y-6">
              <Input
                label="Nom de l'offre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description de l'offre
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <Input
                label="Durée"
                value={formData.duration}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, ''); // Supprime tout sauf les chiffres
                  const numericValue = parseInt(onlyDigits, 10);
                  if (onlyDigits === '' || (numericValue >= 1 && numericValue <= 12)) {
                    setFormData(prev => ({
                      ...prev,
                      duration: onlyDigits,
                    }));
                  }
                }}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Est boosté ?</label>
                <input
                  type="checkbox"
                  checked={formData.isBoosted}
                  onChange={(e) => setFormData({ ...formData, isBoosted: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
              </div>

              <Input
                label="Cible"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              />

              <div className="pt-4 flex justify-end space-x-4">
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={() => {
                    handleSubmit()
                }}>
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-4 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setStep('info')}>
                Retour
              </Button>
              <Button onClick={handleSubmit}>
                Fermer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditOfferModal
