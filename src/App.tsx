import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import UserType from './pages/UserType'
import Login from './pages/auth/Login'
import RegisterSteps from './pages/merchant/RegisterSteps'
import Dashboard from './pages/merchant/Dashboard'
import Store from './pages/merchant/Store'
import Offers from './pages/merchant/Offers'
import Customers from './pages/merchant/Customers'
import Settings from './pages/merchant/Settings'
import CustomerRegisterSteps from './pages/customer/CustomerRegisterSteps'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerLogin from './pages/auth/CustomerLogin'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserType />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/merchant/register" element={<RegisterSteps />} />
        <Route path="/customer/register" element={<CustomerRegisterSteps />} />
        
        {/* Protected routes - will need authentication later */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/store" element={<Store />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App