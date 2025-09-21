import { db } from "@/components/firebase/firebaseConfig"
import { useAuth } from "@/components/firebase/useAuth"
import { arrayUnion, collection, doc, getDoc, getDocs, increment, updateDoc } from "firebase/firestore"
import { useEffect, useState } from 'react'
import { Star, Gift, TrendingUp, MapPin } from "lucide-react"
import { EMOJI_MAP } from "./emojiMapping"

const getEmojiForCategory = (category?: string) => {
  if (!category) return "✨"; // Par défaut si pas de catégorie
  return EMOJI_MAP[category.toLowerCase()] || "✨";
};

const CustomerDashboard = () => {
  const { customer, customerData } = useAuth();

  const [offers, setOffers] = useState([]);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'offer'));
        const offersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data())
        }));
        setOffers(offersList);
      } catch (error) {
        console.error("Erreur lors de la récupération des offres :", error);
      }
    };
    fetchOffers();
  }, []);

  // Filtrer et trier les offres
  const filteredOffers = offers
    .filter(offer =>
      offer.name.toLowerCase().includes(filter.toLowerCase()) ||
      offer.description.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0));

  // Les offres boostées
  const topBoostedOffers = filteredOffers.filter(offer => offer.isBoosted);
  // L'offre du moment
  const topMomentOffer = topBoostedOffers.slice(0, 1);
  // Les autres offres à afficher (hors offre du moment)
  const otherOffers = filteredOffers.filter(offer => !topMomentOffer.some(mo => mo.id === offer.id));

  // Variables fictives pour l'exemple, à remplacer par tes vraies données
  const address = customerData?.city || "Torvegade 49, 1400 Copenhagen, Denmark";
  const points = customerData?.points || 0;
  const level = Math.floor(points / 100) || 0; // Niveau basé sur les points (1 niveau par tranche de 100 points)
  const challengesLeft = customerData?.challengesLeft || 0;
  const coupons = Math.floor(points / 100) || 0; // 1 coupon par tranche de 100 points
  const discount = coupons * 10 || 0; // 10% de réduction par coupon
  const progress = points % 100 // Pourcentage de progression dans le niveau actuel

  // Fonction pour toggle l'affichage des offres
  const toggleOffers = () => {
    setShowAllOffers(!showAllOffers);
  };

  // État pour gérer l'affichage des coupons
  const [showCoupons, setShowCoupons] = useState(false);

  // Fonction pour toggle l'affichage des coupons
  const toggleCoupons = () => {
    setShowCoupons(!showCoupons);
  }

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openOfferModal = async (offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);

    try {
      const offerRef = doc(db, "offer", offer.id);
      await updateDoc(offerRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error("Eerreur lors de l'incrémentation des vues de l'offre :", error);
    }
  };

  const closeOfferModal = () => {
    setIsModalOpen(false);
    setSelectedOffer(null);
  };

  const addOfferToCustomer = async (offerId) => {
    if (!customer) return;

    const customerRef = doc(db, "customer", customer.uid);

    try {
      const customerSnap = await getDoc(customerRef);
      const currentOffers = customerSnap.data()?.offers || [];

      if (currentOffers.includes(offerId)) {
        alert("Vous avez déjà cette offre !");
        return;
      }

      await updateDoc(customerRef, {
        offers: arrayUnion(offerId),
      });

      alert("Offre ajoutée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'offre :", error);
    }
  }

  const hasAddedOffer = (offerId) => {
    return customerData?.offers?.includes(offerId);
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Titre principal */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#0A2004] text-center">Accueil</h1>
      </div>

      {/* SECTION PROFIL */}
      <div className="flex justify-center px-4 mb-6">
        <div className="w-full max-w-md bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc] rounded-3xl shadow-xl border border-[#c9eaad]/30 p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-2xl">👋</span>
            </div>
            <h2 className="text-xl font-bold text-[#0A2004] mb-1">
            Hello, {customerData?.first_name}!
            </h2>
            <div className="flex items-center justify-center text-[#589507] text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-medium">{address}</span>
            </div>
          </div>
          
          {/* Niveau et progression */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-4 border border-[#c9eaad]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#396F04] text-sm">Level {level}</span>
              <span className="font-bold text-[#7DBD07] text-sm">{points} points</span>
            </div>
            <div className="relative w-full h-3 bg-[#c9eaad]/30 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-3 bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            <div className="text-xs text-[#589507] mt-2 text-center font-medium">
              {challengesLeft} défis jusqu'à la prochaine récompense
            </div>
          </div>
          
          {/* Section coupons */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-[#c9eaad]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-[#FFCD29]" />
                <span className="text-base text-[#0A2004] font-bold">
                  {coupons} Coupon{coupons > 1 ? "s" : ""} • {discount}% Réduction
                </span>
              </div>
            <button 
              onClick={toggleCoupons}
              className="bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Utiliser
            </button>
            </div>
            
          </div>
            {showCoupons && (
              <div className="mt-4 bg-[#f8fdf4] border border-[#c9eaad]/50 rounded-2xl shadow-lg p-4">
                <h3 className="text-sm font-bold mb-3 text-[#396F04]">🎁 Bons de 10% disponibles :</h3>
                {coupons > 0 ? (
                  <ul className="space-y-2">
                    {[...Array(coupons)].map((_, idx) => (
                      <li key={idx} className="bg-gradient-to-r from-[#7DBD07]/20 to-[#B7DB25]/20 rounded-xl px-4 py-3 border border-[#7DBD07]/30">
                        <div className="flex items-center space-x-2">
                          <Gift className="w-4 h-4 text-[#7DBD07]" />
                          <span className="text-sm font-bold text-[#396F04]">Bon de réduction : 10%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#589507] font-medium">Aucun bon disponible pour l'instant.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION OFFRE DU MOMENT */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-[#0A2004] text-center mb-4">🌟 Offre du moment</h2>
        <div 
          className="max-w-md mx-auto bg-gradient-to-br from-[#FFCD29]/20 to-[#B7DB25]/20 rounded-3xl shadow-xl border-2 border-[#FFCD29]/30 p-6 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          onClick={() => openOfferModal(topMomentOffer[0])}
        >
          {topMomentOffer.length > 0 ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] rounded-full p-3 shadow-lg">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#0A2004] mb-2">
                  {getEmojiForCategory(topMomentOffer[0].type)} {topMomentOffer[0].name}
                </h3>
                {topMomentOffer[0].discount && (
                  <div className="inline-block bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-white px-4 py-2 rounded-full text-sm font-bold mb-3 shadow-lg">
                    {topMomentOffer[0].discount}% de réduction
                  </div>
                )}
                <p className="text-[#589507] text-sm leading-relaxed">
                  {topMomentOffer[0].description}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#c9eaad]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#589507]" />
              </div>
              <p className="text-[#589507] font-medium">Aucune offre boostée actuellement.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION OFFRES EN COURS */}
      <div className="px-4 mb-8">
        <div className="flex justify-between items-center max-w-md mx-auto mb-4">
          <h2 className="text-xl font-bold text-[#0A2004]">Les offres en cours</h2>
          {otherOffers.length > 1 && (
            <button
              onClick={toggleOffers}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] text-white text-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              aria-label={showAllOffers ? "Voir moins d'offres" : "Voir plus d'offres"}
            >
              {showAllOffers ? "−" : "+"}
            </button>
          )}
        </div>
        
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#c9eaad] rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] placeholder-[#589507]/60 font-medium"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[#589507]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {otherOffers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#ebffbc] rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-[#589507]" />
            </div>
            <p className="text-[#589507] font-medium">Aucune offre disponible pour le moment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {(showAllOffers ? otherOffers : otherOffers.slice(0, 1)).map((offer, idx) => (
              <div
                key={offer.id}
                className="bg-white rounded-3xl shadow-xl border border-[#c9eaad]/30 p-6 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => openOfferModal(offer)}
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#0A2004] mb-2 flex items-center justify-center">
                    {getEmojiForCategory(offer.type)} {offer.name}
                    {offer.isBoosted && (
                      <span className="ml-2 inline-flex items-center justify-center bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-[#0A2004] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        ⭐ Boostée
                      </span>
                    )}
                  </h3>
                  <p className="text-[#589507] text-sm mb-3 leading-relaxed">{offer.description}</p>
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <span className="bg-[#ebffbc] text-[#396F04] px-3 py-1 rounded-full font-bold">
                      Durée : {offer.duration} mois
                    </span>
                  {offer.discount && (
                    <span className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-white px-3 py-1 rounded-full font-bold">
                      -{offer.discount}%
                    </span>
                  )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION OFFRES BOOSTÉES - PLEINE LARGEUR, FIN DE PAGE */}
      {topBoostedOffers.length > 0 && (
        <div className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc] py-8 border-t-2 border-[#c9eaad]/30">
          <div className="px-4">
            <h2 className="text-2xl font-bold text-[#0A2004] mb-6 text-center">⭐ Offres Boostées ⭐</h2>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-4 px-4" style={{ width: 'max-content' }}>
                {topBoostedOffers.map((offer, idx) => (
                  <div
                    key={offer.id}
                    className="relative min-w-[280px] max-w-[300px] bg-white rounded-3xl shadow-xl p-6 flex-shrink-0 border-2 border-[#FFCD29]/50 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    onClick={() => openOfferModal(offer)}
                  >
                    {/* Étoile en haut à droite */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#FFCD29] to-[#B7DB25] rounded-full p-3 shadow-xl">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                    
                    <div className="text-center">
                      <div>
                        <h3 className="text-lg font-bold text-[#0A2004] mb-3">
                          {getEmojiForCategory(offer.type)} {offer.name}
                        </h3>
                        {offer.discount && (
                          <div className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-white px-4 py-2 rounded-full text-sm font-bold mb-3 inline-block shadow-lg">
                            {offer.discount}% de réduction
                          </div>
                        )}
                        <p className="text-[#589507] text-sm mb-3 leading-relaxed">{offer.description}</p>
                        <span className="bg-[#ebffbc] text-[#396F04] px-3 py-1 rounded-full text-xs font-bold">
                          Durée : {offer.duration} mois
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style pour masquer la scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-[#c9eaad]/30">
            <button
              onClick={closeOfferModal}
              className="absolute top-4 right-4 w-8 h-8 bg-[#c9eaad]/20 rounded-full flex items-center justify-center text-[#589507] hover:text-[#396F04] hover:bg-[#c9eaad]/40 transition-all duration-200"
            >
              &times;
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl">{getEmojiForCategory(selectedOffer.type)}</span>
              </div>
              <h2 className="text-2xl font-bold text-[#0A2004] mb-3">{selectedOffer.name}</h2>
              {selectedOffer.discount && (
                <div className="inline-block bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                  {selectedOffer.discount}% de réduction
                </div>
              )}
            </div>

            <div className="bg-[#f8fdf4] rounded-2xl p-4 mb-6 border border-[#c9eaad]/30">
              <p className="text-[#589507] text-sm leading-relaxed mb-3">{selectedOffer.description}</p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <span className="bg-[#ebffbc] text-[#396F04] px-3 py-1 rounded-full font-bold">
                  Durée : {selectedOffer.duration} mois
                </span>
              </div>
            </div>
            {/* Nouvelle ligne pour createdAt */}
            {selectedOffer.createdAt && (
              <p className="text-xs text-[#589507] text-center mb-4 font-medium">
                Publiée le :{" "}
                {selectedOffer.createdAt.toDate
                  ? selectedOffer.createdAt.toDate().toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Date inconnue"}
              </p>
            )}

            <div className="mt-6 text-center">
              {hasAddedOffer(selectedOffer.id) ? (
                <div className="bg-gradient-to-r from-[#7DBD07]/20 to-[#B7DB25]/20 border border-[#7DBD07]/30 rounded-2xl p-4">
                  <p className="text-[#396F04] font-bold flex items-center justify-center space-x-2">
                    <span className="text-lg">✅</span>
                    <span>Offre déjà ajoutée</span>
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => addOfferToCustomer(selectedOffer.id)}
                  className="bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] hover:from-[#589507] hover:to-[#7DBD07] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Ajouter cette offre
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard;