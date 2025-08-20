import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import UserType from './pages/UserType';
import CustomerLogin from './pages/auth/CustomerLogin';
import MerchantLogin from './pages/auth/MerchantLogin';
import ResetPassword from './pages/auth/ResetPassword';
import CustomerRegisterSteps from './pages/customer/CustomerRegisterSteps';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerMyNaymo from './pages/customer/CustomerMyNaymo';
import CustomerHistory from './pages/customer/CustomerHistory';
import CustomerSearch from './pages/customer/CustomerSearch';
import CustomerSettings from './pages/customer/CustomerSettings';
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantStore from './pages/merchant/Store';
import MerchantOffers from './pages/merchant/Offers';
import MerchantCustomers from './pages/merchant/Customers';
import MerchantSettings from './pages/merchant/Settings';
import MerchantRegisterSteps from './pages/merchant/RegisterSteps';
import CustomerLayout from './components/layout/CustomerLayout';
import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/user-type" replace />} />
          <Route path="/user-type" element={<UserType />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/customer/register" element={<CustomerRegisterSteps />} />
          <Route path="/merchant/register" element={<MerchantRegisterSteps />} />

          {/* Customer routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<CustomerMyNaymo />} />
            <Route path="history" element={<CustomerHistory />} />
            <Route path="search" element={<CustomerSearch />} />
            <Route path="settings" element={<CustomerSettings />} />
          </Route>

          {/* Merchant routes */}
          <Route path="/merchant" element={<Layout />}>
            <Route index element={<Navigate to="/merchant/dashboard" replace />} />
            <Route path="dashboard" element={<MerchantDashboard />} />
            <Route path="store" element={<MerchantStore />} />
            <Route path="offers" element={<MerchantOffers />} />
            <Route path="customers" element={<MerchantCustomers />} />
            <Route path="settings" element={<MerchantSettings />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/user-type" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;