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
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune offre en cours</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Créez votre première offre pour attirer de nouveaux clients et booster vos ventes.
        </p>
        <Button 
          onClick={() => window.location.hash = '#create'}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
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
          className="bg-gradient-to-r from-white to-green-50 border border-green-200 rounded-2xl p-8 space-y-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex justify-between items-center">
            <div>
              {offer.isBoosted && (
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-2xl w-12 h-12 rounded-full mb-3 shadow-lg animate-pulse">
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
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span>Modifier</span>
              </Button>
              <Button 
                onClick={() => handleDeleteConfirm(offer.id)}  // Suppression de l'offre
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <Trash className="w-4 h-4" />  {/* Icône de suppression */}
                <span>Supprimer</span>
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{offer.name}</h3>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                {offer.duration} mois
              </div>
              <p className="text-gray-700 leading-relaxed">{offer.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Vues</p>
                <p className="text-2xl font-bold text-gray-900">{offer.views || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">CA généré</p>
                <p className="text-2xl font-bold text-gray-900">{offer.revenue || "0 €"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Achats</p>
                <p className="text-2xl font-bold text-gray-900">{offer.purchases || 0}</p>
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
