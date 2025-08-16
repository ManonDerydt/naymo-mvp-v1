import { useEffect, useState } from 'react'
import { Eye, Pencil, ShoppingBag, Trash, TrendingUp } from 'lucide-react'
import { collection, query, where, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/components/firebase/firebaseConfig'
import { Button } from '@/components/ui'
import EditOfferModal from './EditOfferModal'
import { useAuth } from '@/components/firebase/useAuth'

type Offer = {
  id: string
  name: string
  duration: string
  target: string,
  description: string
  views: number
  revenue: string
  purchases: number
  isBoosted: boolean
  createdAt: any
}

const CurrentOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  const { merchant } = useAuth()

  useEffect(() => {
    if (!merchant) return;

    const merchantOfferQuery = query(
      collection(db, 'merchant_has_offer'),
      where('merchant_id', '==', merchant.uid)
    );

    const unsubscribe = onSnapshot(merchantOfferQuery, async (merchantOfferSnapshot) => {
      const offerIds = merchantOfferSnapshot.docs
        .map(doc => doc.data().offer_id)
        .filter(Boolean);

      if (offerIds.length === 0) {
        setOffers([]);
        setLoading(false);
        return;
      }

      const offersQuery = query(
        collection(db, 'offer'),
        where('__name__', 'in', offerIds)
      );

      // Utiliser onSnapshot pour écouter aussi les changements sur "offer"
      const unsubscribeOffers = onSnapshot(offersQuery, (offersSnapshot) => {
        const fetchedOffers = offersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Offer[];

        const sortedOffers = fetchedOffers.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() ?? new Date(0)
          const dateB = b.createdAt?.toDate?.() ?? new Date(0)
          return dateB.getTime() - dateA.getTime()
        })

        setOffers(sortedOffers);
        setLoading(false);
      });

      // Nettoyage pour l'écoute sur "offer"
      return () => unsubscribeOffers();
    });

    // Nettoyage pour l'écoute sur "merchant_has_offer"
    return () => unsubscribe();
  }, [merchant]);


  const handleDeleteOffer = async (offerId: string) => {
    try {
      if (!merchant) {
        console.error("Utilisateur non connecté !");
        return;
      }
  
      // Étape 1 : Récupérer le document dans "merchant_has_offer"
      const merchantOffersRef = collection(db, "merchant_has_offer");
      const q = query(merchantOffersRef, where("offer_id", "==", offerId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Suppression des documents correspondants dans "merchant_has_offer"
        await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
      }
  
      // Étape 2 : Suppression du document dans "offer"
      await deleteDoc(doc(db, "offer", offerId));

      // Mise à jour de l'état pour enlever l'offre supprimée
      setOffers(prevOffers => prevOffers.filter(offer => offer.id !== offerId));
  
      console.log("Offre supprimée avec succès :", offerId);
  
    } catch (error) {
      console.error("Erreur lors de la suppression de l'offre :", error);
    }
  }

  const handleDeleteConfirm = (offerId: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette offre ? Cette action est irréversible.")) {
      handleDeleteOffer(offerId);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Chargement des offres...</p>
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#ebffbc] to-[#d4f5a3] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
          <ShoppingBag className="w-16 h-16 text-[#589507]" />
        </div>
        <h3 className="text-2xl font-bold text-[#396F04] mb-4">Aucune offre en cours</h3>
        <p className="text-gray-700 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
          Créez votre première offre pour attirer de nouveaux clients et booster vos ventes.
        </p>
        <div className="bg-gradient-to-r from-[#ebffbc] to-[#d4f5a3] p-6 rounded-2xl max-w-md mx-auto mb-8">
          <p className="text-[#396F04] font-medium">💡 Conseil : Une première offre attractive peut augmenter votre visibilité de 300% !</p>
        </div>
        <Button 
          onClick={() => {
            const createTab = document.querySelector('[data-tab="create"]') as HTMLElement;
            if (createTab) createTab.click();
          }}
          className="bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
        >
          <Plus className="w-6 h-6 mr-3" />
          Créer ma première offre
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-gradient-to-r from-white to-[#ebffbc]/30 border border-[#7ebd07]/30 rounded-3xl p-8 space-y-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div className="flex justify-between items-center">
            <div>
              {offer.isBoosted && (
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-[#FFCD29] to-yellow-500 text-white text-2xl w-14 h-14 rounded-full mb-4 shadow-2xl animate-bounce">
                  ⭐
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => {
                  setSelectedOffer(offer)  // Définir l'offre sélectionnée
                  setShowEditModal(true)
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Pencil className="w-4 h-4" />
                <span>Modifier</span>
              </Button>
              <Button 
                onClick={() => handleDeleteConfirm(offer.id)}  // Suppression de l'offre
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Trash className="w-4 h-4" />  {/* Icône de suppression */}
                <span>Supprimer</span>
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-[#589507] to-[#396F04] bg-clip-text text-transparent mb-3">{offer.name}</h3>
              <div className="inline-flex items-center bg-gradient-to-r from-[#ebffbc] to-[#d4f5a3] text-[#396F04] px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-md">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                {offer.duration} mois
              </div>
              <p className="text-gray-800 leading-relaxed text-lg">{offer.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Vues</p>
                <p className="text-3xl font-bold text-gray-900">{offer.views || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-4 bg-gradient-to-br from-[#ebffbc] to-[#d4f5a3] rounded-2xl shadow-lg">
                <TrendingUp className="w-5 h-5 text-[#589507]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">CA généré</p>
                <p className="text-3xl font-bold text-gray-900">{offer.revenue || "0 €"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-lg">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Achats</p>
                <p className="text-3xl font-bold text-gray-900">{offer.purchases || 0}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {showEditModal && selectedOffer && (
        <EditOfferModal
          onClose={() => setShowEditModal(false)}
          initialData={selectedOffer}  // Passer les données de l'offre sélectionnée
        />
      )}
    </div>
  )
}

export default CurrentOffers
