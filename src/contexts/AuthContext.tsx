import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  city: string;
  zip_code: string;
  points: number;
  offers?: string[];
  createdAt: any;
}

interface MerchantData {
  id: string;
  company_name: string;
  business_type: string;
  owner_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  shortDescription: string;
  longDescription?: string;
  logo?: string;
  cover_photo?: string;
  store_photos?: string[];
  keywords?: string[];
  commitments?: string[];
  createdAt: any;
}

interface AuthContextType {
  customer: any;
  customerData: CustomerData | null;
  merchant: any;
  merchantData: MerchantData | null;
  loading: boolean;
  error: string | null;
  loginCustomer: (email: string, password: string) => Promise<void>;
  loginMerchant: (email: string, password: string) => Promise<void>;
  registerCustomer: (userData: Partial<CustomerData>, password: string) => Promise<void>;
  registerMerchant: (userData: Partial<MerchantData>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isCustomer: boolean;
  isMerchant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [customer, setCustomer] = useState<any>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
      setLoading(true);
      setError(null);

      if (currentUser) {
        // Check if user is a customer
        try {
          const customerDoc = await firestore().collection('customer').doc(currentUser.uid).get();
          if (customerDoc.exists) {
            setCustomer(currentUser);
            setCustomerData({ id: currentUser.uid, ...customerDoc.data() } as CustomerData);
            setMerchant(null);
            setMerchantData(null);
          } else {
            // Check if user is a merchant
            const merchantDoc = await firestore().collection('merchant').doc(currentUser.uid).get();
            if (merchantDoc.exists) {
              setMerchant(currentUser);
              setMerchantData({ id: currentUser.uid, ...merchantDoc.data() } as MerchantData);
              setCustomer(null);
              setCustomerData(null);
            } else {
              setError('User data not found');
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
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

  const loginCustomer = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Verify user is a customer
      const customerDoc = await firestore().collection('customer').doc(user.uid).get();
      if (!customerDoc.exists) {
        await auth().signOut();
        throw new Error('Account not found as customer');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginMerchant = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Verify user is a merchant
      const merchantDoc = await firestore().collection('merchant').doc(user.uid).get();
      if (!merchantDoc.exists) {
        await auth().signOut();
        throw new Error('Account not found as merchant');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (userData: Partial<CustomerData>, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!userData.email) {
        throw new Error('Email is required');
      }

      const userCredential = await auth().createUserWithEmailAndPassword(userData.email, password);
      const user = userCredential.user;

      // Save customer data
      const customerData: CustomerData = {
        id: user.uid,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email,
        phone_number: userData.phone_number || '',
        birth_date: userData.birth_date || '',
        city: userData.city || '',
        zip_code: userData.zip_code || '',
        points: 0,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      await firestore().collection('customer').doc(user.uid).set(customerData);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerMerchant = async (userData: Partial<MerchantData>, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!userData.email) {
        throw new Error('Email is required');
      }

      const userCredential = await auth().createUserWithEmailAndPassword(userData.email, password);
      const user = userCredential.user;

      // Save merchant data
      const merchantData: MerchantData = {
        id: user.uid,
        company_name: userData.company_name || '',
        business_type: userData.business_type || '',
        owner_name: userData.owner_name || '',
        email: userData.email,
        address: userData.address || '',
        city: userData.city || '',
        postal_code: userData.postal_code || '',
        shortDescription: userData.shortDescription || '',
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      await firestore().collection('merchant').doc(user.uid).set(merchantData);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await auth().signOut();
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await auth().sendPasswordResetEmail(email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      throw err;
    }
  };

  const value: AuthContextType = {
    customer,
    customerData,
    merchant,
    merchantData,
    loading,
    error,
    loginCustomer,
    loginMerchant,
    registerCustomer,
    registerMerchant,
    logout,
    resetPassword,
    isCustomer: !!customerData,
    isMerchant: !!merchantData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};