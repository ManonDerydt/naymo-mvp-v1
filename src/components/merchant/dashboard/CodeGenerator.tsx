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
  serverTimestamp
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

  const { merchant } = useAuth();

  // Log customer pour debug
  useEffect(() => {
    console.log("Customer:", customer);
  }, [customer]);

  const handleOpenModal = async () => {
    if (phone.trim() === "") {
      alert("Veuillez entrer un numéro de téléphone");
      return;
    }
    setLoading(true);
    setCustomer(null);
    setPointsAdded(false);
    try {
      const normalizedPhone = phone.replace(/\D/g, "");
      const q = query(
        collection(db, "customer"),
        where("phone_number", "==", normalizedPhone)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setCustomer({ id: docSnap.id, ...docSnap.data() });
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
    const pointsToAdd = Number(amount);
    if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
      alert("Veuillez entrer un montant valide (> 0)");
      return;
    }
    setAddingPoints(true);
    try {
      const customerRef = doc(db, "customer", customer.id);
      await updateDoc(customerRef, {
        points: increment(pointsToAdd),
      });

      // 🔁 Enregistrer dans la collection "fidelisation"
      const fidelisationRef = query(
        collection(db, "fidelisation"),
        where("merchantId", "==", merchant?.uid),
        where("customerId", "==", customer.id)
      );
      const fidelisationSnap = await getDocs(fidelisationRef);

      if (fidelisationSnap.empty) {
        // ➕ Créer une nouvelle entrée
        await addDoc(collection(db, "fidelisation"), {
          merchantId: merchant?.uid,
          customerId: customer.id,
          points: pointsToAdd,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // 🔁 Incrémenter les points existants
        const existingDoc = fidelisationSnap.docs[0];
        await updateDoc(existingDoc.ref, {
          points: increment(pointsToAdd),
          updatedAt: serverTimestamp(),
        });
      }

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
      setAmount("");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Générer un code client</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="tel"
            placeholder="Numéro de téléphone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="md:w-auto w-full py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            onClick={handleOpenModal}
            disabled={loading}
          >
            {loading ? "Recherche..." : "Générer un code"}
          </button>
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
                className="mt-6 py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
              >
                Ajouter des points à un autre client
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center mb-4">Résultat de la recherche</h2>
              {customer ? (
                <div className="bg-gray-50 rounded-md p-4 space-y-2">
                  <p><span className="font-semibold">Nom :</span> {customer.last_name}</p>
                  <p><span className="font-semibold">Prénom :</span> {customer.first_name}</p>
                  <p><span className="font-semibold">Email :</span> {customer.email}</p>
                  <p><span className="font-semibold">Téléphone :</span> {customer.phone_number}</p>
                  <p><span className="font-semibold">Points actuels :</span> {customer.points ?? 0}</p>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddPoints}
                      className="w-full mt-3 py-2 px-4 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      disabled={addingPoints}
                    >
                      {addingPoints ? "Ajout..." : "Ajouter les points"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 rounded-md p-4 text-center text-red-700 font-semibold">
                  Ce numéro n'est pas dans la liste client.
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
