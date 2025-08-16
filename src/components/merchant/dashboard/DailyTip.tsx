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
        // Sélectionner un tutoriel aléatoire par jour
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('dailyTutorialDate');
        const savedTutorial = localStorage.getItem('dailyTutorial');
        
        if (savedDate === today && savedTutorial) {
          setTutorials([JSON.parse(savedTutorial)]);
        } else {
          const randomTutorial = data[Math.floor(Math.random() * data.length)];
          setTutorials([randomTutorial]);
          localStorage.setItem('dailyTutorialDate', today);
          localStorage.setItem('dailyTutorial', JSON.stringify(randomTutorial));
        }
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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
        </svg>
        Tuto du jour
      </h2>

      {/* Filtre par catégorie */}
      <div className="mb-6">
        <select
          className="border border-green-200 rounded-lg px-4 py-2 bg-green-50 text-gray-700 focus:ring-2 focus:ring-green-400 focus:border-transparent"
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
      <div className="space-y-4">
        {filteredTutorials.map((tuto) => (
          <div key={tuto.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-green-900 capitalize mb-3">
              {tuto.category}
            </h3>
            <iframe
              className="w-full aspect-video rounded-lg shadow-md"
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