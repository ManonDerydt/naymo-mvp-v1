import { Link } from 'react-router-dom'
import { Store, Users, ArrowRight, Sparkles, Shield, Heart } from 'lucide-react'
import { Button } from '@/components/ui'
import logo from '../assets/Logo.png'

const UserType = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebffbc] via-white to-[#ebffbc]/30">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7ebd07]/10 to-[#589507]/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img src={logo} alt="Naymo" className="h-20 w-auto" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-[#589507] to-[#396F04] bg-clip-text text-transparent mb-6">
              Bienvenue sur Naymo
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto leading-relaxed">
              La plateforme qui connecte les commerçants locaux avec leurs clients
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Découvrez, fidélisez et développez votre activité locale
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#396F04] mb-3">Découvrez</h3>
            <p className="text-gray-600">Trouvez les meilleurs commerces locaux près de chez vous</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#396F04] mb-3">Fidélisez</h3>
            <p className="text-gray-600">Gagnez des points et profitez d'offres exclusives</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#396F04] mb-3">Sécurisé</h3>
            <p className="text-gray-600">Vos données sont protégées et sécurisées</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#396F04] mb-8">Choisissez votre profil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Commerçant Card */}
            <Link to="/merchant/login" className="group">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-[#7ebd07]/30 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-[#7ebd07]">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Store className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#396F04] mb-4">Je suis commerçant</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Gérez votre commerce, créez des offres et fidélisez vos clients
                </p>
                <div className="flex items-center justify-center text-[#7ebd07] font-semibold group-hover:text-[#589507] transition-colors">
                  <span>Commencer</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Client Card */}
            <Link to="/customer/login" className="group">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-[#7ebd07]/30 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-[#7ebd07]">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#396F04] mb-4">Je suis client</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Découvrez les commerces locaux et profitez d'offres exclusives
                </p>
                <div className="flex items-center justify-center text-[#7ebd07] font-semibold group-hover:text-[#589507] transition-colors">
                  <span>Découvrir</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-[#ebffbc]/50 to-white rounded-2xl p-8 border border-[#7ebd07]/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#396F04] mb-2">500+</div>
              <div className="text-gray-600">Commerçants partenaires</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#396F04] mb-2">10k+</div>
              <div className="text-gray-600">Clients satisfaits</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#396F04] mb-2">50k+</div>
              <div className="text-gray-600">Points distribués</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserType
