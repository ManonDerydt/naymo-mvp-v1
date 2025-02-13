import { Button } from '@/components/ui'

const HelpSection = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Aide</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Centre d'aide</h3>
          <p className="text-sm text-gray-600 mb-4">
            Consultez nos guides et tutoriels pour tirer le meilleur parti de Naymo.
          </p>
          <Button variant="outline" size="sm">
            Accéder aux guides
          </Button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Tutoriels vidéo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Découvrez nos vidéos explicatives sur les fonctionnalités de la plateforme.
          </p>
          <Button variant="outline" size="sm">
            Voir les tutoriels
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HelpSection