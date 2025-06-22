import { db } from "@/components/firebase/firebaseConfig";
import { useAuth } from "@/components/firebase/useAuth";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';
import logo from '../../assets/Logo.png'
import { Bell, Star } from "lucide-react";

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
  const address = customerData?.address || "Torvegade 49, 1400 Copenhagen, Denmark";
  const level = customerData?.level || 4;
  const points = customerData?.points || 127;
  const challengesLeft = customerData?.challengesLeft || 2;
  const coupons = customerData?.coupons || 3;
  const discount = customerData?.discount || 2;

  // Fonction pour choisir une image différente pour chaque offre
  const getOfferImg = (idx) => foodImages[idx % foodImages.length];

  // Fonction pour toggle l'affichage des offres
  const toggleOffers = () => {
    setShowAllOffers(!showAllOffers);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-[#032313] border-b shadow-sm z-50 flex items-center px-4 py-3">
        <div className="flex-1" />
        <img src={logo} alt="Naymo" className="h-10 mx-auto" />
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <Bell size={24} className="text-green-500 fill-current" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
          </div>
        </div>
      </div>
      
      {/* SECTION PROFIL */}
      <div className="flex justify-center pt-20 px-2">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-5 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Hello, {customerData?.first_name}!
          </h1>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <svg width="16" height="16" fill="none" className="mr-1" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/>
            </svg>
            {address}
          </div>
          <div className="flex items-center mb-1 mt-2">
            <span className="font-semibold text-gray-900 text-sm">Level {level}</span>
            <div className="flex-1 mx-3">
              <div className="relative w-full h-3 bg-gray-200 rounded-full">
                <div
                  className="absolute left-0 top-0 h-3 bg-[#7e3af2] rounded-full"
                  style={{ width: "60%" }}
                />
              </div>
            </div>
            <span className="font-semibold text-gray-900 text-sm">{points} points</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 mb-2">
            {challengesLeft} challenges to next reward
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-base text-gray-900 font-semibold">
              {coupons} Coupons • {discount}% Discount
            </span>
            <button className="bg-[#032313] text-white px-5 py-2 rounded-full font-semibold text-sm shadow hover:bg-gray-900 transition">
              Get It
            </button>
          </div>
        </div>
      </div>

      {/* SECTION OFFRE DU MOMENT */}
      <div className="flex justify-center mb-4 px-2">
        <div className="w-full max-w-md bg-gray-100 rounded-2xl shadow p-5 flex items-center justify-between">
          {topMomentOffer.length > 0 ? (
            <>
              <div>
                <h2 className="font-bold text-lg text-gray-900 mb-1">
                  {topMomentOffer[0].name}
                  <br />
                  <span className="font-semibold">
                    {topMomentOffer[0].discount || "5%"} Discount
                  </span>
                </h2>
                <p className="text-gray-7 text-sm">
                  {topMomentOffer[0].description}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <img
                  src={foodImages[0]}
                  alt="burger"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </>
          ) : (
            <p className="text-gray-500">Aucune offre boostée actuellement.</p>
          )}
        </div>
      </div>

      {/* SECTION OFFRES EN COURS */}
      <div className="flex flex-col items-center px-2 mb-8">
        <div className="flex justify-between items-center w-full max-w-md mb-2">
          <h2 className="text-xl font-semibold text-gray-800">Les offres en cours</h2>
          {otherOffers.length > 1 && (
            <button
              onClick={toggleOffers}
              className="w-8 h-8 rounded-full bg-[#032313] text-white text-lg flex items-center justify-center shadow hover:bg-gray-900 transition"
              aria-label={showAllOffers ? "Voir moins d'offres" : "Voir plus d'offres"}
            >
              {showAllOffers ? "−" : "+"}
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Rechercher une offre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-md p-2 border rounded-lg mb-4"
        />

        {otherOffers.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune offre disponible pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-md">
            {(showAllOffers ? otherOffers : otherOffers.slice(0, 1)).map((offer, idx) => (
              <div
                key={offer.id}
                className="bg-gray-100 rounded-2xl shadow flex items-center justify-between p-5"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                    {offer.name}
                    {offer.isBoosted && (
                      <span className="inline-flex items-center justify-center bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                        Boostée
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-700 text-sm mb-1">{offer.description}</p>
                  <p className="text-xs text-gray-500">Durée : {offer.duration} mois</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <img
                    src={getOfferImg(idx + 1)}
                    alt="food"
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION OFFRES BOOSTÉES - PLEINE LARGEUR, FIN DE PAGE */}
      {topBoostedOffers.length > 0 && (
        <div className="relative left-1/2 w-screen -translate-x-1/2 bg- via-pink-100 to-blue-100 py-8">
          <div className="px-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">⭐ Offres Boostées ⭐</h2>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-4 px-4" style={{ width: 'max-content' }}>
                {topBoostedOffers.map((offer, idx) => (
                  <div
                    key={offer.id}
                    className="relative min-w-[280px] max-w-[300px] bg-white rounded-2xl shadow-lg p-5 flex-shrink-0 border-2 border-yellow-200"
                  >
                    {/* Étoile en haut à droite */}
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {offer.name}
                        </h3>
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold mb-2 inline-block">
                          {offer.discount || "5%"} OFF
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{offer.description}</p>
                        <p className="text-xs text-gray-500">Durée : {offer.duration} mois</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <img
                          src={getOfferImg(idx)}
                          alt="offer"
                          className="w-16 h-16 object-contain"
                        />
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
    </div>
  );
};

export default CustomerDashboard;
