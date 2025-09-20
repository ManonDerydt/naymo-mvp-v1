import { useState, useEffect } from "react";
import { db } from "@/components/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { useAuth } from "@/components/firebase/useAuth";

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl font-bold hover:text-gray-800"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function CodeGenerator() {
  const [phone, setPhone] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [addingPoints, setAddingPoints] = useState(false);
  const [pointsAdded, setPointsAdded] = useState(false);
  const [addedAmount, setAddedAmount] = useState(0);
  const [couponsToApply, setCouponsToApply] = useState(0);
  const [offers, setOffers] = useState([]);
  const [clientCode, setClientCode] = useState("");

  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [reducedAmount, setReducedAmount] = useState(null);


  const maxCoupons =  customer ? Math.floor((customer.points ?? 0) / 100) : 0;

  const numericAmount = parseFloat(amount);
  const discountPercentage = couponsToApply * 10;
  const totalAfterDiscount = 
    numericAmount && couponsToApply
      ? numericAmount * (1 - discountPercentage / 100)
      : numericAmount || 0;

  const { merchant } = useAuth();

  // Log customer pour debug
  useEffect(() => {
    console.log("Customer:", customer);
  }, [customer]);

  const handleOpenModal = async () => {
    if (clientCode.trim() === "") {
      alert("Veuillez entrer un numéro de téléphone");
      return;
    }
    setLoading(true);
    setCustomer(null);
    setPointsAdded(false);
    try {
      const normalizedPhone = clientCode.replace(/\D/g, "");
      const q = query(
        collection(db, "customer"),
        where("code", "==", normalizedPhone)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const customerData = { id: docSnap.id, ...docSnap.data() };
        setCustomer(customerData);

        // ✅ Récupérer les offres depuis les IDs stockés dans customerData.offers
        if (customerData.offers && Array.isArray(customerData.offers)) {
          const offerDocs = await Promise.all(
            customerData.offers.map(async (offerId) => {
              const offerRef = doc(db, "offer", offerId);
              const offerSnap = await getDoc(offerRef);
              if (offerSnap.exists()) {
                return { id: offerSnap.id, ...offerSnap.data() };
              }
              return null;
            })
          );
          const filteredOffers = offerDocs.filter(Boolean); // retire les nulls
          setOffers(filteredOffers);
        } else {
          setOffers([]);
        }
      } else {
        setCustomer(null);
      }
      setIsModalOpen(true);
    } catch (e) {
      setCustomer(null);
      setIsModalOpen(true);
    }
    setLoading(false);
  };

  // Ajoute les points au client
  const handleAddPoints = async () => {
    if (!customer || !amount) return;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Veuillez entrer un montant valide (> 0)");
      return;
    }
    if (couponsToApply > maxCoupons) {
      alert("Nombre de bons dépasse les bons disponibles");
      return;
    }
    
    setAddingPoints(true);
    try {
      const pointsToAdd = Math.floor(totalAfterDiscount);
      const pointsToDeduct = couponsToApply * 100;
      const netPointsChange = pointsToAdd - pointsToDeduct;

      const customerRef = doc(db, "customer", customer.id);
      await updateDoc(customerRef, {
        points: increment(netPointsChange),
      });

      // ➕ Ajouter une entrée dans la collection "pointsHistory"
      await addDoc(collection(db, "pointsHistory"), {
        merchantId: merchant?.uid,
        customerId: customer.id,
        pointsAdded: pointsToAdd,
        pointsDeducted: pointsToDeduct,
        netPoints: netPointsChange,
        totalRevenue: totalAfterDiscount,
        usedBons: couponsToApply,
        createdAt: serverTimestamp(),
      });

      // Recharge le client pour afficher le nouveau solde
      const updatedSnap = await getDocs(
        query(
          collection(db, "customer"),
          where("code", "==", customer.code)
        )
      );
      if (!updatedSnap.empty) {
        const updatedDoc = updatedSnap.docs[0];
        setCustomer({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setAddedAmount(pointsToAdd);
      setAmount("");
      setCouponsToApply(0);
      setPointsAdded(true);
    } catch (e) {
      alert("Erreur lors de l'ajout des points");
    }
    setAddingPoints(false);
  };

  const resetForm = () => {
    setPhone("");
    setAmount("");
    setCustomer(null);
    setPointsAdded(false);
    setIsModalOpen(false);
  };

  const handleApplyOffer = async () => {
    if (!customer || !selectedOfferId || !offerAmount) return;

    const numericAmount = parseFloat(offerAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Veuillez entrer un montant valide pour l'offre");
      return;
    }

    // Calcul du montant après réduction de l'offre
    const discount = offers.find(offer => offer.id === selectedOfferId)?.discount ?? 0;
    const reducedAmount = numericAmount * (1 - discount / 100);

    // Ajouter ou ajuster les points en fonction du montant réduit
    const pointsToAdd = Math.floor(reducedAmount);
    const pointsToDeduct = couponsToApply * 100;

    if (pointsToAdd <= 0) {
      alert("Le montant réduit ne suffit pas pour ajouter des points.");
      return;
    }

    // Mettre à jour les points du client
    const customerRef = doc(db, "customer", customer.id);
    await updateDoc(customerRef, {
      points: increment(pointsToAdd - pointsToDeduct),
    });

    // Ajouter l'historique de points (facultatif)
    await addDoc(collection(db, "pointsHistory"), {
      merchantId: merchant?.uid,
      customerId: customer.id,
      pointsAdded: pointsToAdd,
      pointsDeducted: pointsToDeduct,
      netPoints: pointsToAdd - pointsToDeduct,
      totalRevenue: reducedAmount,
      usedBons: couponsToApply,
      createdAt: serverTimestamp(),
    });

    // Recharge le client pour afficher le nouveau solde
    const updatedSnap = await getDocs(
      query(
        collection(db, "customer"),
        where("phone_number", "==", customer.phone_number)
      )
    );
    if (!updatedSnap.empty) {
      const updatedDoc = updatedSnap.docs[0];
      setCustomer({ id: updatedDoc.id, ...updatedDoc.data() });
    }

    setAddedAmount(pointsToAdd);

    setPointsAdded(true);

    // Réinitialisation des champs de l'offre après application
    setOfferAmount('');
    setReducedAmount(null);
    setSelectedOfferId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Générer un code client</h2>
          <p className="text-sm text-gray-500">Recherchez et ajoutez des points à vos clients</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#c9eaad]/20 to-[#7ebd07]/20">
          <svg className="w-6 h-6 text-[#7ebd07]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="tel"
            placeholder="Numéro de téléphone"
            value={clientCode}
            onChange={e => setClientCode(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent transition-all"
          />
          <button
            className="md:w-auto w-full py-3 px-6 rounded-xl text-white font-medium bg-gradient-to-r from-[#7ebd07] to-[#c9eaad] hover:from-[#6ba006] hover:to-[#b8d99c] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={handleOpenModal}
            disabled={loading}
          >
            {loading ? "Recherche..." : "Générer un code"}
          </button>
        </div>
      </div>
    </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          {pointsAdded ? (
            // Style de validation élégant
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Points ajoutés avec succès !</h3>
              <p className="mt-2 text-sm text-gray-500">
                {addedAmount} points ont été ajoutés à {customer?.first_name} {customer?.last_name}.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Nouveau solde : {customer?.points ?? 0} points
              </p>
              <button
                onClick={resetForm}
                className="mt-6 py-3 px-6 rounded-xl text-white font-medium bg-gradient-to-r from-[#7ebd07] to-[#c9eaad] hover:from-[#6ba006] hover:to-[#b8d99c] transition-all duration-200"
              >
                Ajouter des points à un autre client
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center mb-4">Résultat de la recherche</h2>
              {customer ? (
                <div className="bg-gradient-to-br from-[#c9eaad]/10 to-[#7ebd07]/10 rounded-xl p-4 space-y-2 border border-[#c9eaad]/20">
                  <p><span className="font-semibold">Nom :</span> {customer.last_name}</p>
                  <p><span className="font-semibold">Prénom :</span> {customer.first_name}</p>
                  <p><span className="font-semibold">Email :</span> {customer.email}</p>
                  <p><span className="font-semibold">Téléphone :</span> {customer.phone_number}</p>
                  <p><span className="font-semibold">Points actuels :</span> {customer.points ?? 0}</p>
                  <p><span className="font-semibold">Bons disponibles :</span> {maxCoupons}</p>
                  {/* Offres associées au client */}
                  <ul className="space-y-2">
                    {offers.map((offer) => {
                      const isSelected = selectedOfferId === offer.id;
                      const discount = offer.discount ?? 0;
                      const hasDiscount = discount > 0;

                      return (
                        <li key={offer.id} className="bg-white p-3 rounded-xl text-sm text-gray-800 border border-gray-200 shadow-sm">
                          <p className="font-semibold">{offer.title}</p>
                          <p>{offer.name}</p>

                          {hasDiscount && (
                            <>
                              <p className="text-xs text-green-600">Réduction : {discount}%</p>
                              <button
                                onClick={() =>
                                  setSelectedOfferId(isSelected ? null : offer.id)
                                }
                                className="mt-2 text-white bg-gradient-to-r from-[#7ebd07] to-[#c9eaad] hover:from-[#6ba006] hover:to-[#b8d99c] px-3 py-1 rounded-lg text-xs transition-all"
                              >
                                {isSelected ? 'Annuler' : 'Appliquer l’offre'}
                              </button>
                            </>
                          )}

                          {isSelected && (
                            <div className="mt-2 space-y-1">
                              <label className="block text-xs text-gray-700">
                                Montant d’achat (€) :
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={offerAmount}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  setOfferAmount(e.target.value);
                                  setReducedAmount(
                                    isNaN(value) ? null : (value * (1 - discount / 100)).toFixed(2)
                                  );
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7ebd07]"
                                placeholder="Ex : 50"
                              />

                              {reducedAmount && (
                                <p className="text-sm text-blue-800">
                                  Montant après réduction : <strong>{reducedAmount} €</strong>
                                </p>
                              )}

                              {/* Bouton pour appliquer l'offre */}
                              <button
                                onClick={handleApplyOffer}
                                className="mt-2 w-full text-white bg-gradient-to-r from-[#7ebd07] to-[#c9eaad] hover:from-[#6ba006] hover:to-[#b8d99c] px-3 py-2 rounded-lg text-xs transition-all"
                                disabled={!offerAmount}
                              >
                                Appliquer la réduction et ajouter les points
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant de l'achat (€) = points à ajouter
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Ex : 55"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
                    />
                  </div>
                    
                  {/* Bons à appliquer */}
                  {maxCoupons > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bons à appliquer (1 bon = -10%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={maxCoupons}
                        value={couponsToApply}
                        onChange={e => setCouponsToApply(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-[#c9eaad] rounded-xl bg-[#c9eaad]/10 focus:outline-none focus:ring-2 focus:ring-[#7ebd07]"
                      />
                    </div>
                  )}

                  {/* Résumé */}
                  <div className="mt-4 text-sm text-gray-800">
                    <p><span className="font-semibold">Réduction :</span> {discountPercentage}%</p>
                    <p><span className="font-semibold">Montant après réduction :</span> {totalAfterDiscount.toFixed(2)} €</p>
                  </div>

                  {/* Ajouter les points */}
                  <button
                    onClick={handleAddPoints}
                    className="w-full mt-4 py-3 px-6 rounded-xl text-white font-medium bg-gradient-to-r from-[#7ebd07] to-[#c9eaad] hover:from-[#6ba006] hover:to-[#b8d99c] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={addingPoints}
                  >
                    {addingPoints ? "Ajout..." : "Ajouter les points"}
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 rounded-xl p-4 text-center text-red-700 font-semibold border border-red-200">
                  Ce numéro n'est pas dans la liste client.
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
  );
}
