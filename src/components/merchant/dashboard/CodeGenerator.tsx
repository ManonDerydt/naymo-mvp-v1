import { Button } from '@/components/ui'

const CodeGenerator = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Générer un code client</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Nombre de points"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button className="w-full md:w-auto">Générer un code</Button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Les points seront automatiquement crédités sur le compte du client lorsqu'il utilisera le code généré.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CodeGenerator