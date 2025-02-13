const DailyTip = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Tuto du jour</h2>
      <div className="space-y-4">
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
          <h3 className="font-medium text-primary-900">Comment augmenter votre visibilité ?</h3>
          <ul className="mt-2 space-y-2">
            <li className="flex items-center text-sm text-primary-700">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
              Complétez votre profil à 100%
            </li>
            <li className="flex items-center text-sm text-primary-700">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
              Ajoutez des photos de qualité
            </li>
            <li className="flex items-center text-sm text-primary-700">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
              Répondez aux avis clients
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DailyTip