import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export function useAuth() {
  const [merchant, setMerchant] = useState<User | null>(null);
  const [merchantData, setMerchantData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setMerchant(currentUser);

        // Récupération des infos Firestore
        const userDocRef = doc(db, "merchant", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        setMerchantData(userDocSnap.exists() ? userDocSnap.data() : null);
      } else {
        setMerchant(null);
        setMerchantData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { merchant, merchantData };
}
