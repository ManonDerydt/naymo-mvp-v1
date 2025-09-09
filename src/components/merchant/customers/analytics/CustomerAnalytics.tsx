import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/components/firebase/firebaseConfig";
import AnalyticsCard from './AnalyticsCard';
import { useAuth } from "@/components/firebase/useAuth";

const CustomerAnalytics = () => {
  const { merchant } = useAuth()
  const [analytics, setAnalytics] = useState([]);

  // Données factices pour simuler des clients
  const fakeClients = [
    { age: 22, city: "Paris", points: 15 },
    { age: 28, city: "Lyon", points: 35 },
    { age: 34, city: "Marseille", points: 80 },
    { age: 41, city: "Paris", points: 120 },
    { age: 55, city: "Toulouse", points: 60 },
    { age: 62, city: "Bordeaux", points: 45 },
  ];


  useEffect(() => {
    if (!merchant) return

    const fetchData = async () => {
      // Étape 1 : récupérer les relations clients fidèles
      const q = query(
        collection(db, "fidelisation"),
        where("merchantId", "==", merchant.uid)
      )
      const snap = await getDocs(q)
      const fidelisations = snap.docs.map(doc => doc.data())

      // Liste unique des customerId associés à ce commerçant
      const customerIds = [...new Set(fidelisations.map(f => f.customerId))]

      // Étape 2 : récupérer les infos des clients
      const clientData = await Promise.all(
        customerIds.map(async (id) => {
          const customerDoc = await getDoc(doc(db, "customer", id))
          const data = customerDoc.exists() ? customerDoc.data() : null
          if (!data) return null

          const birthDate = data.birth_date ? new Date(data.birth_date) : null
          const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : null

          // Trouver les points depuis la relation de fidélité (car pas dans customer)
          const fidelisation = fidelisations.find(f => f.customerId === id)
          const points = fidelisation?.points || 0

          return {
            age,
            city: data.city || "Inconnu",
            points,
          }
        })
      )

      const validClients = clientData.filter(c => c !== null)
      // console.log("Clients valides :", validClients)

      // 👉 Si aucun client Firestore, on prend les données fictives
      const processed = processAnalyticsData(
        validClients.length > 0 ? validClients : fakeClients
      );
      
      setAnalytics(processed)
    }

    fetchData()
  }, [merchant])

  const processAnalyticsData = (clients) => {
    if (clients.length === 0) return [];

    const validAges = clients.map(c => c.age).filter(a => typeof a === "number");
    const ageAvg = Math.round(validAges.reduce((a, b) => a + b, 0) / validAges.length);

    const ageGroups = {
      "18-25": 0,
      "26-35": 0,
      "36-50": 0,
      "50+": 0,
    };

    validAges.forEach(age => {
      if (age >= 18 && age <= 25) ageGroups["18-25"]++;
      else if (age >= 26 && age <= 35) ageGroups["26-35"]++;
      else if (age >= 36 && age <= 50) ageGroups["36-50"]++;
      else if (age > 50) ageGroups["50+"]++;
    });

    const ageDistribution = Object.entries(ageGroups).map(([label, count]) => ({
      label,
      value: Math.round((count / validAges.length) * 100),
    }));

    const euros = clients.map(c => c.points || 0).filter(p => p > 0);
    const panierMoyen = euros.length > 0
      ? Math.round(euros.reduce((a, b) => a + b, 0) / euros.length)
      : 0;

    const panierGroups = {
      "< 20€": 0,
      "20-50€": 0,
      "50-100€": 0,
      "> 100€": 0,
    };

    euros.forEach(e => {
      if (e < 20) panierGroups["< 20€"]++;
      else if (e < 50) panierGroups["20-50€"]++;
      else if (e < 100) panierGroups["50-100€"]++;
      else panierGroups["> 100€"]++;
    });

    const panierDistribution = Object.entries(panierGroups).map(([label, count]) => ({
      label,
      value: euros.length > 0 ? Math.round((count / euros.length) * 100) : 0,
    }));

    const cityCounts = {};
    clients.forEach(c => {
      const city = c.city.toLowerCase();
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const locationDistribution = Object.entries(cityCounts).map(([city, count]) => ({
      label: city.charAt(0).toUpperCase() + city.slice(1),
      value: Math.round((count / clients.length) * 100),
    }));

    return [
      {
        title: "Âge moyen",
        value: `${ageAvg} ans`,
        distribution: ageDistribution,
        iconType: "users",
      },
      {
        title: "Panier moyen",
        value: `${panierMoyen} €`,
        distribution: panierDistribution,
        iconType: "chart",
      },
      {
        title: "Localisation",
        value: locationDistribution.length === 1 ? locationDistribution[0].label : "Mixte",
        distribution: locationDistribution,
        iconType: "map",
      },
    ];
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.map((item, index) => (
          <AnalyticsCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default CustomerAnalytics;
