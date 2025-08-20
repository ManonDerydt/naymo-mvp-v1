import { Bell, Star, MapPin, Mail, Phone, Award, Calendar, TrendingUp } from "lucide-react"
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
            if (!customer?.uid) return;

            // 1. Récupère tous les documents pour ce client dans pointsHistory
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

            // 2. Récupère toutes les notes du client dans fidelisation
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

            // 3. Pour chaque merchantId, récupère les infos du commerçant
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

            // 4. Récupération des offres actives
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

        // Requête vers le doc fidelisation spécifique au client et au commerçant
        const q = query(
            collection(db, "fidelisation"),
            where("customerId", "==", customer.uid),
            where("merchantId", "==", merchantId)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
            // On prend le premier doc (logique: un seul couple customerId/merchantId)
            const docRef = snap.docs[0].ref;

            // Mise à jour du champ rating uniquement, et un updatedAt facultatif
            await setDoc(docRef, {
                rating,
                updatedAt: new Date(), // facultatif
            }, { merge: true });

            // Mise à jour de l’état local
            setHistory(prev =>
                prev.map(item =>
                    item.id === merchantId
                        ? { ...item, rating }
                        : item
                )
            );
        } else {
            // Si aucun document n'existe, on peut en créer un nouveau minimaliste
            const newDocRef = doc(collection(db, "fidelisation"));
            await setDoc(newDocRef, {
                customerId: customer.uid,
                merchantId,
                rating,
                createdAt: new Date(),
            });

            // Optionnel : tu peux aussi ajouter ce nouvel item dans l’état local si besoin
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ebffbc]/10 via-white to-[#ebffbc]/20 pb-28">
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-[#7ebd07]/20 shadow-xl z-50">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center shadow-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Mon historique</p>
                            <p className="text-xs text-gray-500">Mes achats et offres</p>
                        </div>
                    </div>
                    <img src={logo} alt="Naymo" className="h-8" />
                </div>
            </div>

            {/* CONTENU */}
            <div className="pt-24 pb-10 px-4 space-y-6">
                {/* SECTION : Mes commerçants */}
                <section>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-[#396F04]">Mes commerçants</h2>
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">Aucun commerçant visité</p>
                            <p className="text-sm text-gray-400 mt-1">Vos achats apparaîtront ici</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((merchant) => (
                                <div key={merchant.id} className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
                                    <div className="flex items-start space-x-4 mb-4">
                                        <img
                                            src={merchant.logo}
                                            alt={merchant.company_name}
                                            className="w-16 h-16 rounded-2xl object-cover shadow-md"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{merchant.company_name}</h3>
                                            <p className="text-sm text-[#589507] font-medium">{merchant.business_type}</p>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <div className="flex items-center space-x-1">
                                                    <Award className="w-4 h-4 text-[#7ebd07]" />
                                                    <span className="text-sm font-medium text-[#396F04]">{merchant.points} pts</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                                        {merchant.address && (
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    {merchant.address}
                                                    {merchant.postal_code && `, ${merchant.postal_code}`}
                                                    {merchant.city && ` - ${merchant.city}`}
                                                </p>
                                            </div>
                                        )}
                                        {merchant.email && (
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm text-gray-600">{merchant.email}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Votre note</p>
                                            <StarRating
                                                rating={merchant.rating}
                                                onRate={(rate) => handleRating(merchant.id, rate)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION : Offres actives */}
                <section>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FFCD29] to-yellow-500 rounded-full flex items-center justify-center">
                            <Award className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-[#396F04]">Mes offres actives</h2>
                    </div>

                    {activeOffers.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-yellow-500" />
                            </div>
                            <p className="text-gray-600 font-medium">Aucune offre active</p>
                            <p className="text-sm text-gray-400 mt-1">Découvrez les offres disponibles</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeOffers.map((offer) => (
                                <div key={offer.id} className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#FFCD29] to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{offer.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                                            
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-500">Durée : {offer.duration} mois</span>
                                                </div>
                                                {offer.discount && (
                                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                                        <span className="text-xs font-bold">-{offer.discount}%</span>
                                                    </div>
                                                )}
                                            </div>
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
                    <h2 className="text-xl font-bold text-[#396F04]">Offres en cours</h2>

                    {activeOffers.length === 0 ? (
                        <p className="text-gray-600">Aucune offre en cours.</p>
                    ) : (
                        <div className="space-y-4 mt-4">
                            {activeOffers.map((offer) => (
                                <div key={offer.id} className="bg-white rounded-xl shadow-lg border border-[#7ebd07]/20 p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{offer.name}</h3>
                                            <p className="text-sm text-gray-600">{offer.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">Durée : {offer.duration} mois</p>
                                            {offer.discount && (
                                                <p className="text-xs text-[#589507] font-semibold">Réduction : {offer.discount}%</p>
                                            )}
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