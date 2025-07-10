import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import UserType from './pages/UserType'
import MerchantLogin from './pages/auth/MerchantLogin'
import RegisterSteps from './pages/merchant/RegisterSteps'
import Dashboard from './pages/merchant/Dashboard'
import Store from './pages/merchant/Store'
import Offers from './pages/merchant/Offers'
import Customers from './pages/merchant/Customers'
import Settings from './pages/merchant/Settings'
import CustomerRegisterSteps from './pages/customer/CustomerRegisterSteps'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerLogin from './pages/auth/CustomerLogin'
import CustomerLayout from './components/layout/CustomerLayout'
import CustomerSearch from './pages/customer/CustomerSearch'
import CustomerSettings from './pages/customer/CustomerSettings'
import CustomerMyNaymo from './pages/customer/CustomerMyNaymo'
import ResetPassword from './pages/auth/ResetPassword'
import CustomerHistory from './pages/customer/CustomerHistory'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserType />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/merchant/register" element={<RegisterSteps />} />
        <Route path="/customer/register" element={<CustomerRegisterSteps />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected routes - will need authentication later */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/store" element={<Store />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Partie client */}
        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/myNaymo" element={<CustomerMyNaymo />} />
          <Route path="/customer/history" element={<CustomerHistory />} />
          <Route path="/customer/search" element={<CustomerSearch />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App