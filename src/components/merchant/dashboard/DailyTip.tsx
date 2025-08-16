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

  useEffect(() => {
    const fetchTutorial = async () => {
      try { 
        const querySnapshot = await getDocs(collection(db, "tutorial"));
        const data = querySnapshot.docs.map(doc => {
          const docData = doc.data() as Omit<Tutorial, "id">;
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

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-[#7ebd07]/20 h-full">
      <h2 className="text-base font-bold mb-3 text-gray-800 flex items-center">
        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
        </svg>
        Tuto du jour
      </h2>

      {/* Liste des vidéos filtrées */}
      <div>
        {tutorials.map((tuto) => (
          <div key={tuto.id} className="p-4 bg-[#ebffbc] rounded-xl border border-[#7ebd07]/30">
            <h3 className="font-semibold text-[#396F04] capitalize mb-3">
              {tuto.category}
            </h3>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '140px' }}>
              <iframe
                className="w-full h-full rounded-lg shadow-md"
                src={tuto.url.replace("watch?v=", "embed/")}
                title={`Vidéo ${tuto.category}`}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DailyTip