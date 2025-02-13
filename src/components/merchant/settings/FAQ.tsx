import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqItems = [
  {
    question: "Comment modifier mes informations de magasin ?",
    answer: "Vous pouvez modifier vos informations dans la section 'Mon Magasin' du tableau de bord."
  },
  {
    question: "Comment créer une nouvelle offre ?",
    answer: "Rendez-vous dans la section 'Mes Offres' et cliquez sur le bouton 'Créer une offre'."
  },
  {
    question: "Comment gérer mon programme de fidélité ?",
    answer: "Accédez à la section 'Mes Clients' puis 'Programme fidélité' pour configurer vos récompenses."
  }
]

const FAQ = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">FAQ</h2>
      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <span className="font-medium text-gray-900">{item.question}</span>
              {expandedFaq === index ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedFaq === index && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQ