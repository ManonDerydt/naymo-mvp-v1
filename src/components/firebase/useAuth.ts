import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export function useAuth() {
  const [merchant, setMerchant] = useState<User | null>(null);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        setMerchant(currentUser);
        const userDocRef = doc(db, "merchant", currentUser.uid);

        try {
          // 🔹 Option 2 : Mise à jour en temps réel (décommente si besoin)
          const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
            setMerchantData(docSnap.exists() ? docSnap.data() : null);
          });

          return () => unsubscribeSnapshot(); // Si on utilise onSnapshot
        } catch (err) {
          console.error("Erreur lors de la récupération des données :", err);
          setError("Impossible de charger les données");
        }
      } else {
        setMerchant(null);
        setMerchantData(null);
      }

      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return { merchant, merchantData, loading, error };
}
