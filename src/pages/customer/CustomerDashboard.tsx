import { db } from "@/components/firebase/firebaseConfig";
import { useAuth } from "@/components/firebase/useAuth";
import { arrayUnion, collection, doc, getDoc, getDocs, increment, updateDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import logo from '../../assets/Logo.png'
import { Bell, Star, Gift, Zap, MapPin, TrendingUp } from "lucide-react";

// Images d'exemple (libres de droits)
const foodImages = [
  "https://img.icons8.com/color/96/000000/hamburger.png", // burger
  "https://img.icons8.com/color/96/000000/pizza.png",     // pizza
  "https://img.icons8.com/color/96/000000/sushi.png",     // sushi
  "https://img.icons8.com/color/96/000000/french-fries.png", // frites
  "https://img.icons8.com/color/96/000000/doughnut.png",  // donut
];

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

  // Fonction pour choisir une image différente pour chaque offre
  const getOfferImg = (idx) => foodImages[idx % foodImages.length];

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

  // État pour l'animation des points
  const [animatedPoints, setAnimatedPoints] = useState(0);

  // Animation des points au chargement
  useEffect(() => {
    if (points > 0) {
      const duration = 1000;
      const steps = 30;
      const increment = points / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= points) {
          setAnimatedPoints(points);
          clearInterval(timer);
        } else {
          setAnimatedPoints(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [points]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#ebffbc]/10 via-white to-[#ebffbc]/20 overflow-x-hidden">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-[#7ebd07]/20 shadow-xl z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {customerData?.first_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Salut {customerData?.first_name} ! 👋
              </p>
              <p className="text-xs text-gray-500">Niveau {level}</p>
            </div>
          </div>
          <img src={logo} alt="Naymo" className="h-8" />
        </div>
      </div>
      
      {/* CONTENU PRINCIPAL */}
      <div className="pt-24 pb-28 px-4 space-y-6">
        
        {/* CARTE POINTS & NIVEAU */}
        <div className="bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Mes points</p>
                <p className="text-4xl font-bold">{animatedPoints}</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm font-medium">Niveau</p>
                <p className="text-2xl font-bold">{level}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-white" />
                <span className="text-sm font-medium">{coupons} bon{coupons > 1 ? 's' : ''} disponible{coupons > 1 ? 's' : ''}</span>
              </div>
              <button 
                onClick={toggleCoupons}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
              >
                Voir mes bons
              </button>
            </div>
          </div>
        </div>

        {/* MODAL COUPONS */}
        {showCoupons && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFCD29] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mes bons de réduction</h3>
              </div>
              
              {coupons > 0 ? (
                <div className="space-y-3 mb-6">
                  {[...Array(coupons)].map((_, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-[#ebffbc] to-[#d4f5a3] rounded-2xl p-4 border-2 border-dashed border-[#7ebd07]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#396F04]">-10% de réduction</p>
                          <p className="text-sm text-[#589507]">Valable chez tous nos partenaires</p>
                        </div>
                        <div className="text-2xl">🎁</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Aucun bon disponible</p>
                  <p className="text-sm text-gray-400">Continuez à acheter pour en gagner !</p>
                </div>
              )}
              
              <button
                onClick={toggleCoupons}
                className="w-full bg-gradient-to-r from-[#7ebd07] to-[#589507] text-white py-3 rounded-2xl font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Localisation</p>
                <p className="text-sm font-bold text-gray-900">{customerData?.city || 'Non définie'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Économies</p>
                <p className="text-sm font-bold text-gray-900">{discount}% dispo</p>
              </div>
            </div>
          </div>
        </div>

        {/* OFFRE DU MOMENT */}
        {topMomentOffer.length > 0 && (
          <div className="bg-gradient-to-br from-[#FFCD29]/20 to-yellow-100 rounded-3xl p-6 border-2 border-[#FFCD29]/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-yellow-600" />
                <h2 className="text-lg font-bold text-gray-900">Offre du moment</h2>
              </div>
              <div className="bg-[#FFCD29] text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                ⭐ BOOSTÉE
              </div>
            </div>
            
            <div 
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => openOfferModal(topMomentOffer[0])}
            >
              <img
                src={foodImages[0]}
                alt="offer"
                className="w-16 h-16 object-contain"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{topMomentOffer[0].name}</h3>
                <p className="text-sm text-gray-600 mb-2">{topMomentOffer[0].description}</p>
                {topMomentOffer[0].discount && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold inline-block">
                    -{topMomentOffer[0].discount}% de réduction
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RECHERCHE OFFRES */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Découvrir les offres</h2>
            {otherOffers.length > 2 && (
              <button
                onClick={toggleOffers}
                className="text-[#7ebd07] text-sm font-semibold"
              >
                {showAllOffers ? 'Voir moins' : `Voir tout (${otherOffers.length})`}
              </button>
            )}
          </div>
          
          <input
            type="text"
            placeholder="Rechercher une offre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent mb-4"
          />
          
          {otherOffers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-500">Aucune offre trouvée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(showAllOffers ? otherOffers : otherOffers.slice(0, 2)).map((offer, idx) => (
                <div
                  key={offer.id}
                  className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => openOfferModal(offer)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={getOfferImg(idx + 1)}
                      alt="offer"
                      className="w-12 h-12 object-contain"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                        {offer.isBoosted && (
                          <span className="bg-[#FFCD29] text-white text-xs px-2 py-1 rounded-full font-bold">
                            ⭐
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Durée: {offer.duration} mois</span>
                        {offer.discount && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
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


        {/* OFFRES BOOSTÉES */}
        {topBoostedOffers.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#7ebd07]/10">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-[#FFCD29] mr-2" />
              Offres premium
            </h2>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-2">
                {topBoostedOffers.slice(1).map((offer, idx) => (
                  <div
                    key={offer.id}
                    className="min-w-[250px] bg-gradient-to-br from-[#FFCD29]/10 to-yellow-50 rounded-2xl p-4 border border-[#FFCD29]/30 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => openOfferModal(offer)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{offer.name}</h3>
                      <Star className="w-4 h-4 text-[#FFCD29] fill-current" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{offer.duration} mois</span>
                      {offer.discount && (
                        <span className="bg-[#FFCD29] text-white text-xs px-2 py-1 rounded-full font-bold">
                          -{offer.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL OFFRE */}
      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={closeOfferModal}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <img
                src={getOfferImg(0)}
                alt="offer"
                className="w-20 h-20 object-contain mx-auto mb-4"
              />
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedOffer.name}</h2>
              <p className="text-gray-600 mb-4">{selectedOffer.description}</p>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                <span>Durée: {selectedOffer.duration} mois</span>
                {selectedOffer.discount && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    -{selectedOffer.discount}%
                  </span>
                )}
              </div>
              
              {selectedOffer.createdAt && (
                <p className="text-xs text-gray-400 mb-6">
                  Publiée le {selectedOffer.createdAt.toDate
                    ? selectedOffer.createdAt.toDate().toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Date inconnue"}
                </p>
              )}
            </div>

            <div className="text-center">
              {hasAddedOffer(selectedOffer.id) ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                  <p className="text-green-800 font-semibold">✅ Offre déjà ajoutée</p>
                  <p className="text-sm text-green-600">Vous pouvez l'utiliser chez le commerçant</p>
                </div>
              ) : (
                <button
                  onClick={() => addOfferToCustomer(selectedOffer.id)}
                  className="w-full bg-gradient-to-r from-[#7ebd07] to-[#589507] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
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