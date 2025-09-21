import { Bell, Star, Award, Calendar, MapPin } from "lucide-react"
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
    <div className="flex justify-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={24}
          aria-label={`${star} étoiles`}
          className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
            star <= rating 
              ? "fill-[#FFCD29] text-[#FFCD29]" 
              : "text-[#c9eaad] hover:text-[#B7DB25]"
          }`}
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
            if (!customer?.uid) return;

            const pointsSnap = await getDocs(
                query(
                    collection(db, "pointsHistory"),
                    where("customerId", "==", customer.uid)
                )
            );

            const merchantPointsMap = new Map<string, number>();

            pointsSnap.forEach(docSnap => {
                const data = docSnap.data() as { merchantId?: string; pointsAdded?: number };
                if (!data.merchantId) return;

                const total = merchantPointsMap.get(data.merchantId) ?? 0;
                merchantPointsMap.set(data.merchantId, total + (data.pointsAdded ?? 0));
            });

            const ratingSnap = await getDocs(
                query(
                    collection(db, "fidelisation"),
                    where("customerId", "==", customer.uid)
                )
            );

            const merchantRatingMap = new Map<string, number>();

            ratingSnap.forEach(docSnap => {
                const data = docSnap.data() as { merchantId?: string; rating?: number };
                if (data.merchantId && data.rating !== undefined) {
                    merchantRatingMap.set(data.merchantId, data.rating);
                }
            });

            const merchantData: MerchantHistory[] = [];

            for (const merchantId of new Set([
                ...merchantPointsMap.keys(),
                ...merchantRatingMap.keys(),
            ])) {
                const merchantDoc = await getDoc(doc(db, "merchant", merchantId));
                const merchantInfo = merchantDoc.exists()
                    ? merchantDoc.data()
                    : {};

                merchantData.push({
                    id: merchantId,
                    name: merchantInfo.owner_name ?? "Inconnu",
                    points: merchantPointsMap.get(merchantId) ?? 0,
                    rating: merchantRatingMap.get(merchantId) ?? 0,
                    address: merchantInfo.address,
                    city: merchantInfo.city,
                    postal_code: merchantInfo.postal_code,
                    email: merchantInfo.email,
                    business_type: merchantInfo.business_type,
                    company_name: merchantInfo.company_name,
                    logo: merchantInfo.logo,
                });
            }

            setHistory(merchantData);

            const customerRef = doc(db, "customer", customer.uid);
            const customerSnap = await getDoc(customerRef);
            const customerData = customerSnap.exists() ? customerSnap.data() : null;

            if (customerData?.offers?.length > 0) {
                const offerPromises = customerData.offers.map((id: string) =>
                    getDoc(doc(db, "offer", id))
                );
                const offerDocs = await Promise.all(offerPromises);

                const offers = offerDocs
                    .filter(doc => doc.exists())
                    .map(doc => ({ id: doc.id, ...doc.data() }));

                setActiveOffers(offers);
            } else {
                setActiveOffers([]);
            }
        };

        fetchHistory();
    }, [customer]);

    const handleRating = async (merchantId: string, rating: number) => {
        if (!customer?.uid) return;

        const q = query(
            collection(db, "fidelisation"),
            where("customerId", "==", customer.uid),
            where("merchantId", "==", merchantId)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
            const docRef = snap.docs[0].ref;

            await setDoc(docRef, {
                rating,
                updatedAt: new Date(),
            }, { merge: true });

            setHistory(prev =>
                prev.map(item =>
                    item.id === merchantId
                        ? { ...item, rating }
                        : item
                )
            );
        } else {
            const newDocRef = doc(collection(db, "fidelisation"));
            await setDoc(newDocRef, {
                customerId: customer.uid,
                merchantId,
                rating,
                createdAt: new Date(),
            });
        }
    };

    return (
        <div className="min-h-screen bg-white pb-28 px-2 sm:px-0">
            {/* Titre principal */}
            <div className="px-4 sm:px-6 pt-8 pb-6">
                <h1 className="text-2xl font-bold text-[#0A2004] text-center">Mon Historique</h1>
            </div>

            {/* CONTENU */}
            <div className="px-4 space-y-8">

                {/* SECTION : Historique de vos commerçants */}
                <section className="space-y-6">
                    <div className="flex items-center justify-center space-x-2 mb-6 px-2">
                        <Award className="w-6 h-6 text-[#7DBD07]" />
                        <h2 className="text-2xl font-bold text-[#0A2004]">Vos Commerçants</h2>
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-[#ebffbc] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award className="w-12 h-12 text-[#589507]" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#396F04] mb-2">Aucun commerçant visité</h3>
                            <p className="text-[#589507]">Commencez à explorer pour voir votre historique ici !</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((merchant) => (
                                <div key={merchant.id} className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-[#c9eaad]/30 hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-center mb-4 space-x-3">
                                        <div className="relative">
                                            <img
                                                src={merchant.logo}
                                                alt={merchant.company_name}
                                                className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl object-cover shadow-lg border-2 border-[#c9eaad]/30"
                                            />
                                            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                                                <span className="text-xs font-bold text-white">{merchant.points}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base sm:text-lg font-bold text-[#0A2004]">{merchant.company_name}</h3>
                                            <p className="text-xs sm:text-sm font-medium text-[#7DBD07] bg-[#ebffbc] px-2 sm:px-3 py-1 rounded-full inline-block mt-1">{merchant.business_type}</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#f8fdf4] rounded-2xl p-3 sm:p-4 mb-4 space-y-2">
                                        {merchant.address && (
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-[#7DBD07]" />
                                                <p className="text-xs sm:text-sm text-[#396F04] font-medium">
                                                    {merchant.address}{merchant.postal_code && `, ${merchant.postal_code}`} {merchant.city && `- ${merchant.city}`}
                                                </p>
                                            </div>
                                        )}
                                        {merchant.email && (
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-[#7DBD07]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                                <p className="text-xs sm:text-sm text-[#396F04] font-medium">{merchant.email}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white border border-[#c9eaad]/30 rounded-2xl p-3 sm:p-4">
                                        <p className="text-xs sm:text-sm font-bold text-[#396F04] mb-3 text-center">Évaluez ce commerçant</p>
                                        <StarRating
                                            rating={merchant.rating}
                                            onRate={(rate) => handleRating(merchant.id, rate)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION : Offres en cours */}
                <section className="space-y-6">
                    <div className="flex items-center justify-center space-x-2 mb-6 px-2">
                        <Star className="w-6 h-6 text-[#FFCD29] fill-current" />
                        <h2 className="text-2xl font-bold text-[#0A2004]">Mes Offres Actives</h2>
                    </div>

                    {activeOffers.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-[#ebffbc] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Star className="w-12 h-12 text-[#589507]" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#396F04] mb-2">Aucune offre active</h3>
                            <p className="text-[#589507]">Explorez les magasins pour découvrir des offres !</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeOffers.map((offer) => (
                                <div key={offer.id} className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-[#c9eaad]/30">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-3">
                                                <h3 className="text-base sm:text-lg font-bold text-[#0A2004] mr-2">{offer.name}</h3>
                                                {offer.discount && (
                                                    <span className="bg-gradient-to-r from-[#FFCD29] to-[#B7DB25] text-[#0A2004] px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                                                        -{offer.discount}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-[#589507] mb-3 leading-relaxed">{offer.description}</p>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4 text-[#7DBD07]" />
                                                    <span className="text-[#396F04] font-medium">Durée : {offer.duration} mois</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                            <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default CustomerHistory