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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Tuto du jour</h2>

      {/* Filtre par catégorie */}
      <div className="mb-4">
        <select
          className="border border-gray-300 rounded px-3 py-2"
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
      <div className="space-y-6">
        {filteredTutorials.map((tuto) => (
          <div key={tuto.id} className="p-4 bg-primary-50 rounded-lg border border-primary-100">
            <h3 className="font-medium text-primary-900 capitalize mb-2">
              {tuto.category}
            </h3>
            <iframe
              className="w-full aspect-video rounded"
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