import { useState } from 'react'
import { Button } from '@/components/ui'
import LegalDocumentModal from './LegalDocumentModal'

const legalDocuments = [
  {
    title: 'CGU',
    description: "Conditions générales d'utilisation de la plateforme",
    content: `Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme Naymo.

Ces CGU constituent un contrat entre vous et Naymo. En utilisant notre plateforme, vous acceptez ces conditions dans leur intégralité.

1. Inscription et compte
- L'inscription est gratuite
- Vous devez fournir des informations exactes
- Vous êtes responsable de la confidentialité de vos identifiants

2. Utilisation de la plateforme
- La plateforme doit être utilisée conformément aux lois en vigueur
- Tout contenu publié doit respecter nos règles de communauté
- Nous nous réservons le droit de suspendre ou supprimer un compte en cas d'utilisation abusive`
  },
  {
    title: 'CGV',
    description: 'Conditions générales de vente',
    content: `Les présentes conditions générales de vente (CGV) définissent les modalités de vente entre les commerçants et leurs clients via la plateforme Naymo.

1. Prix et paiement
- Les prix sont indiqués en euros TTC
- Le paiement est sécurisé
- Plusieurs moyens de paiement sont acceptés

2. Livraison
- Les délais de livraison sont indicatifs
- Les frais de livraison sont calculés en fonction de la distance

3. Retours et remboursements
- Les conditions de retour sont définies par chaque commerçant
- Les remboursements sont effectués sous 14 jours`
  },
  {
    title: 'Politique de confidentialité',
    description: 'Gestion de vos données personnelles',
    content: `Notre politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.

1. Collecte des données
- Informations d'inscription
- Données de navigation
- Historique des achats

2. Utilisation des données
- Amélioration de nos services
- Personnalisation de votre expérience
- Communications marketing (avec votre consentement)

3. Protection des données
- Stockage sécurisé
- Non-transmission à des tiers
- Durée de conservation limitée`
  },
  {
    title: 'Charte cookies',
    description: 'Utilisation des cookies sur la plateforme',
    content: `Notre charte cookies explique comment nous utilisons les cookies et technologies similaires sur notre plateforme.

1. Types de cookies utilisés
- Cookies essentiels
- Cookies de performance
- Cookies de personnalisation

2. Gestion des cookies
- Vous pouvez modifier vos préférences à tout moment
- Certains cookies sont nécessaires au fonctionnement du site
- Les cookies tiers peuvent être désactivés

3. Durée de conservation
- Les cookies temporaires sont supprimés à la fermeture du navigateur
- Les cookies permanents ont une durée de vie limitée`
  },
]

const PrivacyTab = () => {
  const [selectedDocument, setSelectedDocument] = useState<typeof legalDocuments[0] | null>(null)

  return (
    <div className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Documents légaux</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {legalDocuments.map((doc) => (
            <div key={doc.title} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDocument(doc)}
              >
                Consulter
              </Button>
            </div>
          ))}
        </div>
      </section>

      {selectedDocument && (
        <LegalDocumentModal
          title={selectedDocument.title}
          content={selectedDocument.content}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  )
}

export default PrivacyTab