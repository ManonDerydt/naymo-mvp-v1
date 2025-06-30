import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/components/firebase/firebaseConfig";
import AnalyticsCard from './AnalyticsCard';

const CustomerAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "customer"));
      const clients = snapshot.docs.map(doc => {
        const data = doc.data();
        const birthDate = data.birth_date ? new Date(data.birth_date) : null;
        const age = birthDate
          ? new Date().getFullYear() - birthDate.getFullYear()
          : null;

        return {
          age,
          city: data.city || "Inconnu",
          points: data.points || 0,
        };
      });

      const processed = processAnalyticsData(clients);
      setAnalytics(processed);
    };

    fetchData();
  }, []);

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
