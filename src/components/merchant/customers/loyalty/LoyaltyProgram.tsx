import { useState } from 'react'
import LoyaltyForm from './LoyaltyForm'
import LoyaltyOverview from './LoyaltyOverview'
import LoyaltyTutorial from './LoyaltyTutorial'
import SuccessMessage from '../shared/SuccessMessage'
import { auth, db } from '@/components/firebase/firebaseConfig'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { useAuth } from '@/components/firebase/useAuth'

type Step = 'overview' | 'form' | 'success'

const LoyaltyProgram = () => {
  const [step, setStep] = useState<Step>('overview')
  const [activeSubTab, setActiveSubTab] = useState<'program' | 'tutorial'>('program')
  const [formData, setFormData] = useState({
    frequency: '',
    reward: '',
    value: '',
  })

  const [selectedLoyaltyProgramId, setSelectedLoyaltyProgramId] = useState<string | null>(null)

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'create' | 'edit' | 'delete'>('create')

  const handleCreate = async () => {
      setError(null)
  
      try {
        const user = auth.currentUser
        if (!user) {
          throw new Error("Vous devez être connecté pour créer un programme de fidélité")
        }
  
        // Ajout dans loyalty_program
        const loyaltyProgramRef = collection(db, "loyalty_program")
        const loyaltyProgramDoc = await addDoc(loyaltyProgramRef, {
          ...formData
        })
  
        // Ajout dans merchant_has_loyalty_program
        const merchantHasLoyaltyProgramRef = collection(db, "merchant_has_loyalty_program")
        await addDoc(merchantHasLoyaltyProgramRef, {
          merchant_id: user.uid,
          loyalty_program_id: loyaltyProgramDoc.id
        })
  
        console.log("Programme de fidélité enregistré avec succès !")
        setStep('success')
      } catch (err: any) {
        console.error("Erreur lors de l'enregistrement :", err);
        setError("Une erreur est survenue lors de la création du programme de fidélité.")
      }
    }
  
  const { merchant } = useAuth();

  const handleEdit = async (loyaltyProgramId: string) => {
    try {
      const loyaltyProgramDocRef = doc(db, "loyalty_program", loyaltyProgramId);
      const loyaltyProgramDocSnap = await getDoc(loyaltyProgramDocRef);

      if (loyaltyProgramDocSnap.exists()) {
        const data = loyaltyProgramDocSnap.data();
        setFormData({
          frequency: data.frequency || '',
          reward: data.reward || '',
          value: data.value || ''
        });
        setMode('edit');
        setStep('form');

        setSelectedLoyaltyProgramId(loyaltyProgramId)
      } else {
        console.error("Document programme de fidélité introuvable !");
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des données : ", error);
      setError("Impossible de récupérer les données.")
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedLoyaltyProgramId) {
        console.error("Aucun ID sélectionné pour la mise à jour")
        return
      }
  
      await updateDoc(doc(db, "loyalty_program", selectedLoyaltyProgramId), formData);
  
      console.log("Données mises à jour !");
      setStep('success');
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour :", err);
      setError("Erreur lors de la modification.");
    }
  };

  const [loyaltyPrograms, setLoyaltyPrograms] = useState<any[]>([]);  // Ajout de l'état pour gérer la liste des programmes

  const handleDelete = async (loyaltyProgramId: string) => {
    try {
      if (!merchant) {
        console.error("Utilisateur non connecté !");
        return;
      }
  
      // Étape 1 : Récupérer le document dans "merchant_has_loyalty_program"
      const merchantLoyaltyProgramsRef = collection(db, "merchant_has_loyalty_program");
      const q = query(merchantLoyaltyProgramsRef, where("loyalty_program_id", "==", loyaltyProgramId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Suppression des documents correspondants dans "merchant_has_loyalty_program"
        await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
      }
  
      // Étape 2 : Suppression du document dans "loyalty_program"
      await deleteDoc(doc(db, "loyalty_program", loyaltyProgramId));

      // Mise à jour de l'état pour enlever le programme de fidélité supprimé
      setLoyaltyPrograms(prevLoyaltyPrograms => prevLoyaltyPrograms.filter(loyaltyProgram => loyaltyProgram.id !== loyaltyProgramId));
  
      console.log("Programme de fidélité supprimé avec succès :", loyaltyProgramId);
  
    } catch (error) {
      console.error("Erreur lors de la suppression du programme de fidélité :", error);
    }
  }

  if (step === 'form') {
    return (
      <div>
        <LoyaltyForm
          formData={formData}
          onSubmit={mode === 'create' ? handleCreate : handleUpdate}
          onCancel={() => setStep('overview')}
          onChange={handleFormChange}
          mode={mode}
        />
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    )
  }

  if (step === 'success') {
    return (
      <SuccessMessage
        title={
          mode === 'create' ? "Programme de fidélité créé !" : 
          mode === 'edit' ? "Programme mis à jour !" : 
          'Programme de fidélité supprimé !'
        }
        message={
          mode === 'create' ? "Votre programme de fidélité a été créé avec succès." :
          mode === 'edit' ? "Votre programme de fidélité a été mis à jour avec succès." : 
          "Votre programme de fidélité a été suppprimé avec succès."
        }
        buttonText="Retour à l'aperçu"
        onButtonClick={() => setStep('overview')}
      />
    )
  }

  return (
    <div>
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <TabButton
            active={activeSubTab === 'program'}
            onClick={() => setActiveSubTab('program')}
          >
            Programme fidélité
          </TabButton>
          <TabButton
            active={activeSubTab === 'tutorial'}
            onClick={() => setActiveSubTab('tutorial')}
          >
            Tuto Vidéo
          </TabButton>
        </div>
      </div>

      {activeSubTab === 'program' ? (
        <LoyaltyOverview 
        onAdd={() => {
          setFormData({ frequency: '', reward: '', value: '' })
          setMode('create')
          setStep('form')
        }} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      ) : (
        <LoyaltyTutorial />
      )}
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

const TabButton = ({ active, onClick, children }: TabButtonProps) => (
  <button
    className={`pb-4 px-4 text-sm font-medium border-b-2 ${
      active
        ? 'border-primary-500 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
)

export default LoyaltyProgram