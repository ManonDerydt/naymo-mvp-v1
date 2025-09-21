import { db } from "@/components/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

interface Tutorial {
  id: string;
  category: string;
  url: string;
}

const DailyTip = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchTutorial = async () => {
      try { 
        const querySnapshot = await getDocs(collection(db, "tutorial"));
        const data = querySnapshot.docs.map(doc => {
          const docData = doc.data() as Omit<Tutorial, "id">;
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());
          return {
            id: doc.id,
            ...docData,
          };
        });
        setTutorials(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des tutoriels :", error);
      }
    };

    fetchTutorial();
  }, []);

  const filteredTutorials = selectedCategory === "all"
    ? tutorials
    : tutorials.filter(tuto => tuto.category === selectedCategory);

  const uniqueCategories = [
    "all",
    ...new Set(tutorials.map(tuto => tuto.category)),
  ]
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Tuto du jour</h2>
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#c9eaad]/20 to-[#7ebd07]/20">
          <svg className="w-5 h-5 text-[#7ebd07]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Filtre par catégorie */}
      <div className="mb-4">
        <select
          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "Toutes les catégories" : category}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des vidéos filtrées */}
      <div className="space-y-3">
        {filteredTutorials.map((tuto) => (
          <div key={tuto.id} className="p-2 bg-gradient-to-br from-[#c9eaad]/10 to-[#7ebd07]/10 rounded-xl border border-[#c9eaad]/20">
            <h3 className="font-semibold text-[#032313] capitalize mb-2 flex items-center text-sm">
              <span className="w-2 h-2 bg-[#7ebd07] rounded-full mr-2"></span>
              {tuto.category}
            </h3>
            <iframe
              className="w-full h-24 rounded-xl shadow-sm"
              src={tuto.url.replace("watch?v=", "embed/")}
              title={`Vidéo ${tuto.category}`}
              allowFullScreen
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DailyTip