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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserType />} />
        <Route path="/login" element={<Login />} />
        <Route path="/merchant/register" element={<RegisterSteps />} />
        
        {/* Protected routes - will need authentication later */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
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