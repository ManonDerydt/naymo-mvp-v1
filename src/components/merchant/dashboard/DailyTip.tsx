import { useState } from "react";

const DailyTip = () => {
  const [showTutorials, setShowTutorials] = useState(false);
  
  return (
    <div className="p-6 h-full flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tutoriels</h2>
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#c9eaad]/20 to-[#7ebd07]/20">
          <svg className="w-5 h-5 text-[#7ebd07]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-[#c9eaad]/20 to-[#7ebd07]/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-[#7ebd07]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5V12a1.5 1.5 0 01-1.5 1.5H9m0-4.5V9a1.5 1.5 0 011.5-1.5H12a1.5 1.5 0 011.5 1.5v1.5m-6 0h6m-6 0v1.5a1.5 1.5 0 001.5 1.5H12a1.5 1.5 0 001.5-1.5V12m-6 0V9a1.5 1.5 0 011.5-1.5H12a1.5 1.5 0 011.5 1.5v3" />
          </svg>
        </div>
     
        
        <button
          onClick={() => setShowTutorials(!showTutorials)}
          className="px-6 py-2 bg-[#7fbd07] text-white rounded-xl font-medium hover:bg-[#6ba006] transition-colors text-sm"
        >
          {showTutorials ? 'Masquer les tutoriels' : 'Voir les tutoriels'}
        </button>
      </div>

      {showTutorials && (
        <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
          <div className="p-2 bg-gradient-to-br from-[#c9eaad]/10 to-[#7ebd07]/10 rounded-xl border border-[#c9eaad]/20">
            <h4 className="font-semibold text-[#032313] mb-1 text-xs">Configuration initiale</h4>
            <iframe
              className="w-full h-20 rounded-lg"
              src="https://www.youtube.com/embed/zoFnEF-A7kQ"
              title="Configuration Naymo"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="p-2 bg-gradient-to-br from-[#c9eaad]/10 to-[#7ebd07]/10 rounded-xl border border-[#c9eaad]/20">
            <h4 className="font-semibold text-[#032313] mb-1 text-xs">Gestion des offres</h4>
            <iframe
              className="w-full h-20 rounded-lg"
              src="https://www.youtube.com/embed/zoFnEF-A7kQ"
              title="Gestion des offres"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyTip