import { useEffect, useState } from "react";
import { BarChart3, MapPin, Users, Heart } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/components/firebase/firebaseConfig";
// import { db } from "../firebase"; // <-- adapte ce chemin selon ton projet

const CustomerAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "customer"));
      const clients = snapshot.docs.map(doc => doc.data());

      const processed = processAnalyticsData(clients);
      setAnalytics(processed);
    };

    fetchData();
  }, []);

  const processAnalyticsData = (clients) => {
    if (clients.length === 0) {
      return [
        {
          title: "Âge moyen",
          value: "0 ans",
          distribution: [
            { label: "18-25", value: 0 },
            { label: "26-35", value: 0 },
            { label: "36-50", value: 0 },
            { label: "50+", value: 0 },
          ],
          icon: <Users className="w-5 h-5 text-blue-500" />,
          barColor: "bg-blue-500",
        },
      ];
    }

    // Calcule l'âge moyen
    const ages = clients.map(c => c.age).filter(Boolean);
    const ageAvg = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);

    // Crée les tranches d'âge
    const ageGroups = {
      "18-25": 0,
      "26-35": 0,
      "36-50": 0,
      "50+": 0,
    };

    ages.forEach(age => {
      if (age >= 18 && age <= 25) ageGroups["18-25"]++;
      else if (age >= 26 && age <= 35) ageGroups["26-35"]++;
      else if (age >= 36 && age <= 50) ageGroups["36-50"]++;
      else if (age > 50) ageGroups["50+"]++;
    });

    const total = ages.length;
    const distribution = Object.entries(ageGroups).map(([label, count]) => ({
      label,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    return [
      {
        title: "Âge moyen",
        value: `${ageAvg} ans`,
        distribution,
        icon: <Users className="w-5 h-5 text-blue-500" />,
        barColor: "bg-blue-500",
      },
    ];
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.map((item, index) => {
          const maxValue = Math.max(...item.distribution.map(d => d.value));
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {item.value}
                  </p>
                </div>
              </div>

              

              <div className="space-y-3">
                {item.distribution.map((dist, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{dist.label}</span>
                      <span>{dist.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          dist.value === maxValue
                            ? item.barColor
                            : "bg-gray-300"
                        }`}
                        style={{ width: `${dist.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerAnalytics;
