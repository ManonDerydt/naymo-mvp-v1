// import { Activity, Gift, Star, Users } from 'lucide-react'
// import StatCard from '@/components/merchant/dashboard/StatCard'
// import CodeGenerator from '@/components/merchant/dashboard/CodeGenerator'
// import DailyTip from '@/components/merchant/dashboard/DailyTip'
import { db } from "@/components/firebase/firebaseConfig";
import { useAuth } from "@/components/firebase/useAuth";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';
import logo from '../../assets/Logo.png'
import { Bell } from "lucide-react";

const CustomerDashboard = () => {
  const { customer, customerData } = useAuth()

  const [offers, setOffers] = useState<Offer[]>([])
  const [showAllOffers, setShowAllOffers] = useState(false)
  const [filter, setFilter] = useState('')

  type Offer = {
    id: string
    name: string
    description: string
    duration: string
    isBoosted?: boolean
  }

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'offer'))
        const offersList = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...(doc.data() as Omit<Offer, 'id'>)
        }))
        setOffers(offersList)
      } catch (error) {
        console.error("Erreur lors de la récupération des offres :", error)
      }
    }

    fetchOffers()
  }, [])

  // Filtrer et trier les offres
  const filteredOffers = offers
    .filter(offer => 
      offer.name.toLowerCase().includes(filter.toLowerCase()) ||
      offer.description.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0))

  // Les trois premières offres boostées
  const topBoostedOffers = filteredOffers
    .filter(offer => offer.isBoosted)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex justify-between items-center px-4 py-3">
        {customer && customerData ? <p>{customerData.city}</p> : null }

        <img src={logo} alt="Naymo" className="h-10" />

        <div className="rounded-full border-2 border-gray-300 p-2">
          <Bell size={24} className="text-green-500 fill-current"/>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-24 px-6">
        {customer && customerData ? (
          <span>
            Bienvenue <strong>{customerData.first_name} {customerData.last_name}</strong>
          </span>
        ) : (
          "Pas de données pour le moment"
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-green-100">
          <img src="" alt="logo points naymo" />
          <button>Ajouter des nay</button>
        </div>
        <div className="lg:col-span-2">
          <p className="font-semibold mb-2">L'offre du moment*</p>
          {topBoostedOffers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topBoostedOffers.map(offer => (
                <div key={offer.id} className="border p-4 rounded shadow bg-primary-50">
                  <h3 className="text-lg font-bold text-primary-700 flex items-center">
                    {offer.name}
                    {offer.isBoosted && (
                      <span className="ml-2 inline-flex items-center justify-center bg-yellow-500 text-white text-sm w-5 h-5 rounded-full">
                        ⭐
                      </span>
                    )}
                  </h3>
                  <p>{offer.description}</p>
                  <p className="text-sm text-gray-600">Durée : {offer.duration} mois</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune offre boostée actuellement.</p>
          )}
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Les offres en cours*</h2>
            {!showAllOffers && (
              <button
                onClick={() => setShowAllOffers(true)}
                className="text-primary-600 hover:text-primary-800 text-sm underline"
              >
                Voir les offres en cours
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Rechercher une offre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
          />

          {filteredOffers.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune offre disponible pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-2">
                {(!showAllOffers ? topBoostedOffers : filteredOffers).map((offer) => (
                  <div
                    key={offer.id}
                    className="min-w-[250px] max-w-[300px] p-4 border rounded-lg shadow-sm bg-white flex-shrink-0"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-primary-600">{offer.name}</h3>
                      {offer.isBoosted && (
                        <span className="inline-flex items-center justify-center bg-yellow-500 text-white text-sm w-6 h-6 rounded-full">
                          ⭐
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{offer.description}</p>
                    <p className="text-xs text-gray-400">Durée : {offer.duration} mois</p>
                  </div>
                ))}
              </div>
              <hr />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <h2 className="text-xl font-semibold text-gray-800">Les évènements à venir</h2>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2">
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            </div>
          </div>
              <span className="text-green-600">*Voir conditions d'utilisations et d'éligibilité, offre limitée.</span>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard