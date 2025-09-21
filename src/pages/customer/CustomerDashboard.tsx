import { db } from "@/components/firebase/firebaseConfig";
import { useAuth } from "@/components/firebase/useAuth";
import { arrayUnion, collection, doc, getDoc, getDocs, increment, updateDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import logo from '../../assets/Logo.png'
import { Bell, Star, Gift, TrendingUp } from "lucide-react";
import { EMOJI_MAP } from "./emojiMapping";

const getEmojiForCategory = (category?: string) => {
  if (!category) return "✨";
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

  const filteredOffers = offers
    .filter(offer =>
      offer.name.toLowerCase().includes(filter.toLowerCase()) ||
      offer.description.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0));

  const topBoostedOffers = filteredOffers.filter(offer => offer.isBoosted);
  const topMomentOffer = topBoostedOffers.slice(0, 1);
  const otherOffers = filteredOffers.filter(offer => !topMomentOffer.some(mo => mo.id === offer.id));

  const address = customerData?.city || "Grenoble, France";
  const points = customerData?.points || 0;
  const level = Math.floor(points / 100) || 1;
  const challengesLeft = customerData?.challengesLeft || 3;
  const coupons = Math.floor(points / 100) || 0;
  const discount = coupons * 10 || 0;
  const progress = points % 100;

  const [showCoupons, setShowCoupons] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleOffers = () => {
    setShowAllOffers(!showAllOffers);
  };

  const toggleCoupons = () => {
    setShowCoupons(!showCoupons);
  }

  const openOfferModal = async (offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);

    try {
      const offerRef = doc(db, "offer", offer.id);
      await updateDoc(offerRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues de l'offre :", error);
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fdf4] to-[#ebffbc] overflow-x-hidden">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#396F04] to-[#589507] shadow-lg z-50 flex items-center px-6 py-4">
        <div className="flex-1" />
        <img src={logo} alt="Naymo" className="h-12 mx-auto" />
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <Bell size={24} className="text-[#B7DB25] hover:text-[#FFCD29] transition-colors cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-[#FFCD29] text-[#0A2004] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
          </div>
        </div>
      </div>
      
      {/* SECTION PROFIL */}
      <div className="flex justify-center pt-24 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#c9eaad]/30 p-6 mb-6">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#7DBD07] to-[#589507] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">{customerData?.first_name?.charAt(0) || 'U'}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A2004] mb-1">
              Bonjour, {customerData?.first_name || 'Utilisateur'} !
            </h1>
            <div className="flex items-center justify-center text-[#589507] text-sm mb-3">
              <svg width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/>
              </svg>
              {address}
            </div>
          </div>

          {/* Barre de progression niveau */}
          <div className="bg-[#f8fdf4] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#396F04] text-sm">Niveau {level}</span>
              <span className="font-bold text-[#396F04] text-sm">{points} points</span>
            </div>
            <div className="relative w-full h-4 bg-[#ebffbc] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-4 bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[#0A2004]">{progress}/100</span>
              </div>
            </div>
            <div className="text-xs text-[#589507] mt-2 text-center">
              {100 - progress} points pour le niveau suivant
            </div>
          </div>

          {/* Section coupons */}
          <div className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6 text-[#0A2004]" />
                <div>
                  <span className="text-lg font-bold text-[#0A2004]">
                    {coupons} Coupon{coupons > 1 ? "s" : ""}
                  </span>
                  <p className="text-sm text-[#396F04]">{discount}% de réduction</p>
                </div>
              </div>
              <button 
                onClick={toggleCoupons}
                className="bg-[#396F04] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-[#0A2004] transition-all duration-200 transform hover:scale-105"
              >
                Utiliser
              </button>
            </div>
            
            {showCoupons && (
              <div className="mt-4 bg-white/90 backdrop-blur rounded-xl p-4 border border-[#396F04]/20">
                <h3 className="text-sm font-bold mb-3 text-[#396F04]">Vos bons de réduction :</h3>
                {coupons > 0 ? (
                  <div className="space-y-2">
                    {[...Array(coupons)].map((_, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] rounded-lg px-4 py-2 flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">🎁 Bon -10%</span>
                        <button className="bg-white text-[#396F04] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#f8fdf4] transition-colors">
                          Utiliser
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#589507] italic">Aucun bon disponible pour l'instant.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION OFFRE DU MOMENT */}
      {topMomentOffer.length > 0 && (
        <div className="flex justify-center mb-6 px-4">
          <div 
            className="w-full max-w-md bg-gradient-to-br from-[#FFCD29] via-[#B7DB25] to-[#7DBD07] rounded-3xl shadow-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300"
            onClick={() => openOfferModal(topMomentOffer[0])}
          >
            <div className="bg-white/95 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-xl text-[#0A2004]">
                  🌟 Offre du moment
                </h2>
                <Star className="w-6 h-6 text-[#FFCD29] fill-current" />
              </div>
              <h3 className="font-bold text-lg text-[#396F04] mb-2">
                {getEmojiForCategory(topMomentOffer[0].type)} {topMomentOffer[0].name}
              </h3>
              {topMomentOffer[0].discount && (
                <div className="bg-gradient-to-r from-[#396F04] to-[#589507] text-white px-4 py-2 rounded-full text-sm font-bold mb-3 inline-block">
                  -{topMomentOffer[0].discount}% de réduction
                </div>
              )}
              <p className="text-[#589507] text-sm leading-relaxed">
                {topMomentOffer[0].description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION OFFRES EN COURS */}
      <div className="flex flex-col items-center px-4 mb-8">
        <div className="flex justify-between items-center w-full max-w-md mb-4">
          <h2 className="text-2xl font-bold text-[#0A2004]">Offres disponibles</h2>
          {otherOffers.length > 2 && (
            <button
              onClick={toggleOffers}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7DBD07] to-[#589507] text-white text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
              aria-label={showAllOffers ? "Voir moins d'offres" : "Voir plus d'offres"}
            >
              {showAllOffers ? "−" : "+"}
            </button>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="w-full max-w-md mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#c9eaad] rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] placeholder-[#589507]/60 font-medium transition-all duration-200"
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
            <p className="text-lg font-semibold text-[#396F04] mb-2">Aucune offre disponible</p>
            <p className="text-sm text-[#589507]">Revenez bientôt pour découvrir de nouvelles offres !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-md">
            {(showAllOffers ? otherOffers : otherOffers.slice(0, 2)).map((offer, idx) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl shadow-lg border border-[#c9eaad]/30 p-5 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                onClick={() => openOfferModal(offer)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-bold text-[#0A2004] flex items-center">
                        {getEmojiForCategory(offer.type)} {offer.name}
                      </h3>
                      {offer.isBoosted && (
                        <span className="ml-2 bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-[#0A2004] text-xs font-bold px-2 py-1 rounded-full">
                          ⭐ Boostée
                        </span>
                      )}
                    </div>
                    <p className="text-[#589507] text-sm mb-3 leading-relaxed">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#396F04] bg-[#ebffbc] px-3 py-1 rounded-full font-medium">
                        Durée : {offer.duration} mois
                      </span>
                      {offer.discount && (
                        <span className="text-xs font-bold text-[#396F04] bg-gradient-to-r from-[#B7DB25] to-[#7DBD07] px-3 py-1 rounded-full text-white">
                          -{offer.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION OFFRES BOOSTÉES */}
      {topBoostedOffers.length > 0 && (
        <div className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-r from-[#396F04] via-[#589507] to-[#7DBD07] py-8">
          <div className="px-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Offres Premium
            </h2>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-4 px-4" style={{ width: 'max-content' }}>
                {topBoostedOffers.map((offer, idx) => (
                  <div
                    key={offer.id}
                    className="relative min-w-[300px] max-w-[320px] bg-white rounded-3xl shadow-2xl p-6 flex-shrink-0 border-2 border-[#FFCD29] cursor-pointer transform hover:scale-105 transition-all duration-300"
                    onClick={() => openOfferModal(offer)}
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#FFCD29] to-[#B7DB25] rounded-full p-3 shadow-lg">
                      <Star className="w-5 h-5 text-[#0A2004] fill-current" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#0A2004] mb-3">
                        {getEmojiForCategory(offer.type)} {offer.name}
                      </h3>
                      {offer.discount && (
                        <div className="bg-gradient-to-r from-[#396F04] to-[#589507] text-white px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block shadow-lg">
                          -{offer.discount}% de réduction
                        </div>
                      )}
                      <p className="text-[#589507] text-sm mb-4 leading-relaxed">{offer.description}</p>
                      <div className="bg-[#f8fdf4] rounded-xl p-3">
                        <span className="text-xs text-[#396F04] font-medium">Durée : {offer.duration} mois</span>
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

      {/* MODAL OFFRE */}
      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-[#c9eaad]/30">
            <button
              onClick={closeOfferModal}
              className="absolute top-4 right-4 w-8 h-8 bg-[#ebffbc] hover:bg-[#c9eaad] rounded-full flex items-center justify-center text-[#396F04] font-bold transition-colors"
            >
              ×
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7DBD07] to-[#589507] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{getEmojiForCategory(selectedOffer.type)}</span>
              </div>
              <h2 className="text-xl font-bold text-[#0A2004] mb-2">{selectedOffer.name}</h2>
              {selectedOffer.discount && (
                <div className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-[#0A2004] px-4 py-2 rounded-full text-sm font-bold mb-3 inline-block">
                  -{selectedOffer.discount}% de réduction
                </div>
              )}
            </div>

            <div className="bg-[#f8fdf4] rounded-2xl p-4 mb-6">
              <p className="text-sm text-[#589507] mb-3 leading-relaxed">{selectedOffer.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#396F04] font-medium">Durée : {selectedOffer.duration} mois</span>
                {selectedOffer.createdAt && (
                  <span className="text-[#589507]">
                    Publiée le {selectedOffer.createdAt.toDate
                      ? selectedOffer.createdAt.toDate().toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Date inconnue"}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center">
              {hasAddedOffer(selectedOffer.id) ? (
                <div className="bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Offre déjà ajoutée
                </div>
              ) : (
                <button
                  onClick={() => addOfferToCustomer(selectedOffer.id)}
                  className="w-full bg-gradient-to-r from-[#396F04] to-[#589507] hover:from-[#0A2004] hover:to-[#396F04] text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Ajouter cette offre
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;