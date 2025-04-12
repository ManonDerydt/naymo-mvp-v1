import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

export function useAuth() {
  const [merchant, setMerchant] = useState<User | null>(null);
  const [merchantData, setMerchantData] = useState<any>(null);

  const [customer, setCustomer] = useState<User | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        // On écoute les deux documents : merchant et customer
        const merchantDocRef = doc(db, "merchant", currentUser.uid);
        const customerDocRef = doc(db, "customer", currentUser.uid);

        // Écoute du document merchant
        const unsubscribeMerchant = onSnapshot(merchantDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setMerchant(currentUser);
            setMerchantData(docSnap.data());
          } else {
            setMerchant(null);
            setMerchantData(null);
          }
        });

        // Écoute du document customer
        const unsubscribeCustomer = onSnapshot(customerDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCustomer(currentUser);
            setCustomerData(docSnap.data());
          } else {
            setCustomer(null);
            setCustomerData(null);
          }
        });

        return () => {
          unsubscribeMerchant();
          unsubscribeCustomer();
        };
      } else {
        // Utilisateur non connecté
        setMerchant(null);
        setMerchantData(null);
        setCustomer(null);
        setCustomerData(null);
      }

      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return {
    merchant,
    merchantData,
    customer,
    customerData,
    loading,
    error,
  };
}
