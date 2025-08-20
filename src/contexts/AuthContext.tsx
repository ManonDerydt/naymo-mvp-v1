import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { auth, db } from '../components/firebase/firebaseConfig';

interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  postalCode: string;
  points: number;
  level: number;
  createdAt: any;
}

interface MerchantData {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  category: string;
  description: string;
  website?: string;
  logo?: string;
  isVerified: boolean;
  createdAt: any;
}

interface AuthContextType {
  // Auth state
  user: User | null;
  customerData: CustomerData | null;
  merchantData: MerchantData | null;
  loading: boolean;
  error: string | null;
  
  // Auth methods
  loginCustomer: (email: string, password: string) => Promise<void>;
  loginMerchant: (email: string, password: string) => Promise<void>;
  registerCustomer: (userData: Partial<CustomerData>, password: string) => Promise<void>;
  registerMerchant: (userData: Partial<MerchantData>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  
  // Utility methods
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
  const [user, setUser] = useState<User | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError(null);

      if (currentUser) {
        setUser(currentUser);
        
        // Check if user is a customer
        try {
          const customerDoc = await getDoc(doc(db, 'customers', currentUser.uid));
          if (customerDoc.exists()) {
            setCustomerData({ id: currentUser.uid, ...customerDoc.data() } as CustomerData);
            setMerchantData(null);
          } else {
            // Check if user is a merchant
            const merchantDoc = await getDoc(doc(db, 'merchants', currentUser.uid));
            if (merchantDoc.exists()) {
              setMerchantData({ id: currentUser.uid, ...merchantDoc.data() } as MerchantData);
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
        setUser(null);
        setCustomerData(null);
        setMerchantData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Real-time customer data listener
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (user && customerData) {
      unsubscribe = onSnapshot(
        doc(db, 'customers', user.uid),
        (doc) => {
          if (doc.exists()) {
            setCustomerData({ id: user.uid, ...doc.data() } as CustomerData);
          }
        },
        (error) => {
          console.error('Error listening to customer data:', error);
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, customerData?.id]);

  // Real-time merchant data listener
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (user && merchantData) {
      unsubscribe = onSnapshot(
        doc(db, 'merchants', user.uid),
        (doc) => {
          if (doc.exists()) {
            setMerchantData({ id: user.uid, ...doc.data() } as MerchantData);
          }
        },
        (error) => {
          console.error('Error listening to merchant data:', error);
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, merchantData?.id]);

  const loginCustomer = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verify user is a customer
      const customerDoc = await getDoc(doc(db, 'customers', user.uid));
      if (!customerDoc.exists()) {
        await signOut(auth);
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
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verify user is a merchant
      const merchantDoc = await getDoc(doc(db, 'merchants', user.uid));
      if (!merchantDoc.exists()) {
        await signOut(auth);
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

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Save customer data
      const customerData: CustomerData = {
        id: user.uid,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        city: userData.city || '',
        postalCode: userData.postalCode || '',
        points: 0,
        level: 1,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'customers', user.uid), customerData);
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

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: userData.businessName
      });

      // Save merchant data
      const merchantData: MerchantData = {
        id: user.uid,
        businessName: userData.businessName || '',
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        postalCode: userData.postalCode || '',
        category: userData.category || '',
        description: userData.description || '',
        website: userData.website,
        logo: userData.logo,
        isVerified: false,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'merchants', user.uid), merchantData);
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
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      throw err;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    try {
      setError(null);
      if (user) {
        await updateProfile(user, { displayName });
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    }
  };

  const value: AuthContextType = {
    // State
    user,
    customerData,
    merchantData,
    loading,
    error,
    
    // Methods
    loginCustomer,
    loginMerchant,
    registerCustomer,
    registerMerchant,
    logout,
    resetPassword,
    updateUserProfile,
    
    // Computed
    isCustomer: !!customerData,
    isMerchant: !!merchantData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};