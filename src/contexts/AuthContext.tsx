import React, {createContext, useContext, useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface AuthContextType {
  customer: any;
  customerData: any;
  merchant: any;
  merchantData: any;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  customerData: null,
  merchant: null,
  merchantData: null,
  loading: true,
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [customer, setCustomer] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [merchantData, setMerchantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async currentUser => {
      setLoading(true);

      if (currentUser) {
        try {
          // Check if user is a customer
          const customerDoc = await firestore()
            .collection('customer')
            .doc(currentUser.uid)
            .get();

          if (customerDoc.exists) {
            setCustomer(currentUser);
            setCustomerData(customerDoc.data());
            setMerchant(null);
            setMerchantData(null);
          } else {
            // Check if user is a merchant
            const merchantDoc = await firestore()
              .collection('merchant')
              .doc(currentUser.uid)
              .get();

            if (merchantDoc.exists) {
              setMerchant(currentUser);
              setMerchantData(merchantDoc.data());
              setCustomer(null);
              setCustomerData(null);
            }
          }
        } catch (err) {
          setError('Error fetching user data');
          console.error(err);
        }
      } else {
        setCustomer(null);
        setCustomerData(null);
        setMerchant(null);
        setMerchantData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    customer,
    customerData,
    merchant,
    merchantData,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};