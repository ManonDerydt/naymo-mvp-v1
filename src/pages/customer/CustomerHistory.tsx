import { Bell, Star } from "lucide-react"
import logo from "../../assets/Logo.png"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, getDocs, query, setDoc, where, DocumentData } from "firebase/firestore"
import { db } from "@/components/firebase/firebaseConfig"
import { useAuth } from "@/components/firebase/useAuth"

type MerchantHistory = {
    id: string
    name: string
    points: number
    rating: number
    address?: string
    city?: string
    postal_code?: string
    email?: string
    business_type?: string
    company_name?: string
    logo?: string
}

type StarRatingProps = {
    rating: number
    onRate: (rating: number) => void
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          aria-label={`${star} étoiles`}
          className={`cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          onClick={() => onRate(star)}
        />
      ))}
    </div>
  )
}

const CustomerHistory = () => {
    const { customer } = useAuth()
    const [history, setHistory] = useState<MerchantHistory[]>([])
    const [activeOffers, setActiveOffers] = useState<any[]>([])

    useEffect(() => {
        const fetchHistory = async () => {
            if (!customer?.uid) return

            const q = query(collection(db, "fidelisation"), where("customerId", "==", customer.uid))
            const snap = await getDocs(q)

            const merchantData: MerchantHistory[] = []

            for (const docSnap of snap.docs) {
                const data = docSnap.data() as DocumentData & { merchantId?: string; points?: number; rating?: number }
                if (!data.merchantId) continue

                const merchantDoc = await getDoc(doc(db, "merchant", data.merchantId))
                const merchantInfo = merchantDoc.exists() 
                    ? merchantDoc.data() as { 
                        owner_name?: string
                        address?: string
                        city?: string,
                        postal_code?: string,
                        email?: string
                        business_type?: string,
                        company_name?: string,
                        logo?: string
                      } 
                    : {}

                merchantData.push({
                    id: data.merchantId,
                    name: merchantInfo.owner_name ?? "Inconnu",
                    points: data.points ?? 0,
                    rating: data.rating ?? 0,
                    address: merchantInfo.address,
                    city: merchantInfo.city,
                    postal_code: merchantInfo.postal_code,
                    email: merchantInfo.email,
                    business_type: merchantInfo.business_type,
                    company_name: merchantInfo.company_name,
                    logo: merchantInfo.logo
                })
            }
            
            setHistory(merchantData)


            const customerRef = doc(db, "customer", customer.uid);
            const customerSnap = await getDoc(customerRef);
            const customerData = customerSnap.exists() ? customerSnap.data() : null;

            if (customerData?.offers?.length > 0) {
                const offerRefs = customerData.offers;
                const offerPromises = offerRefs.map((id: string) => getDoc(doc(db, "offer", id)));
                const offerDocs = await Promise.all(offerPromises);

                const offers = offerDocs
                    .filter(doc => doc.exists())
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                setActiveOffers(offers);
            } else {
                setActiveOffers([]);
            }
        }

        fetchHistory()
    }, [customer])

    const handleRating = async (merchantId: string, rating: number) => {
        // Ajoute ou met à jour la note dans Firestore
        const q = query(
            collection(db, "fidelisation"),
            where("customerId", "==", customer?.uid), 
            where("merchantId", "==", merchantId)
        )
        const snap = await getDocs(q)

        if (!snap.empty) {
            const docRef = snap.docs[0].ref
            await setDoc(docRef, { rating }, { merge: true })

            // MAJ de l'état local
            setHistory(prev =>
                prev.map(item =>
                    item.id === merchantId ? { ...item, rating } : item
                )
            )
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 bg-[#032313] border-b shadow-sm z-50 flex items-center px-4 py-3">
                <div className="flex-1" />
                <img src={logo} alt="Naymo" className="h-10 mx-auto" />
                <div className="flex-1 flex justify-end">
                    {/* <div className="relative">
                        <Bell size={24} className="text-green-500 fill-current" />
                        <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                    </div> */}
                </div>
            </div>

            {/* CONTENU */}
            <div className="pt-20 px-4 space-y-4">
                {/* SECTION : Historique de vos commerçants */}
                <h2 className="text-xl font-semibold">Historique de vos commerçants</h2>
                    {history.length === 0 ? (
                        <p className="text-gray-600">Aucun commerçant visité pour le moment.</p>
                    ) : (
                        history.map((merchant) => (
                            <div key={merchant.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col">
                                <div className="flex items-center mb-2">
                                    <img
                                        src={merchant.logo}
                                        alt={merchant.company_name}
                                        className="w-12 h-12 rounded-full mr-4 object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{merchant.company_name}</h3>
                                        <p className="text-sm text-gray-500">{merchant.business_type}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{merchant.points} pts</span>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1 mb-2">
                                    {merchant.address && (
                                        <p>📍 {merchant.address}{merchant.postal_code && `, ${merchant.postal_code}`} {merchant.city && `- ${merchant.city}`}</p>
                                    )}
                                    {merchant.email && <p>✉️ {merchant.email}</p>}
                                </div>

                                <StarRating
                                    rating={merchant.rating}
                                    onRate={(rate) => handleRating(merchant.id, rate)}
                                />
                            </div>
                        ))
                    )}
                {/* SECTION : Offres en cours */}
                <div className="mt-10">
                    <h2 className="text-xl font-semibold">Offres en cours</h2>

                    {activeOffers.length === 0 ? (
                        <p className="text-gray-600">Aucune offre en cours.</p>
                    ) : (
                        <div className="space-y-4 mt-4">
                            {activeOffers.map((offer) => (
                                <div key={offer.id} className="bg-white rounded-xl shadow p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{offer.name}</h3>
                                            <p className="text-sm text-gray-600">{offer.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">Durée : {offer.duration} mois</p>
                                        </div>
                                        <img
                                            src="https://img.icons8.com/color/96/000000/discount.png"
                                            alt="icon"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CustomerHistory