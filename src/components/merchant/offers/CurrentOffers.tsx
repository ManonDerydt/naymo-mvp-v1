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
    return <p className="text-center text-gray-500">Aucune offre disponible.</p>
  }

  return (
    <div className="space-y-6">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <div>
              {offer.isBoosted && (
                <h6 className="inline-flex items-center justify-center bg-yellow-500 text-white text-2xl w-10 h-10 rounded-full mb-2">
                  ⭐
                </h6>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => {
                  setSelectedOffer(offer)  // Définir l'offre sélectionnée
                  setShowEditModal(true)
                }}
                className="flex items-center space-x-2"
              >
                <Pencil className="w-4 h-4" />
                <span>Modifier</span>
              </Button>
              <Button 
                onClick={() => handleDeleteConfirm(offer.id)}  // Suppression de l'offre
                className="flex items-center space-x-2 text-red-600 hover:text-red-800"
              >
                <Trash className="w-4 h-4" />  {/* Icône de suppression */}
                <span>Supprimer</span>
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
              <h4 className="text-lg font-semibold text-gray-900">{offer.duration + " mois"}</h4>
              <p className="mt-1 text-sm text-gray-500">{offer.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vues</p>
                <p className="text-lg font-semibold">{offer.views || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">CA généré</p>
                <p className="text-lg font-semibold">{offer.revenue || "0 €"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Achats</p>
                <p className="text-lg font-semibold">{offer.purchases || 0}</p>
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
