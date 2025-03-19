import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

export default function CreatePVModal({ newPV, onChangeNewPV, onFileChange, onSubmit, onCancel, projects }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Créer un nouveau PV
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du PV
            </label>
            <input
              type="text"
              value={newPV.title}
              onChange={(e) => onChangeNewPV({...newPV, title: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
              placeholder="Ex: PV de réception - Phase 2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projet associé
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
              required
              value={newPV.project_id || ''}
              onChange={(e) => onChangeNewPV({ ...newPV, project_id: e.target.value })}
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={newPV.description}
              onChange={(e) => onChangeNewPV({...newPV, description: e.target.value})}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
              placeholder="Description du PV..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document PV
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-void hover:text-void-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-void"
                  >
                    <span>Téléverser un fichier</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={onFileChange}
                      accept=".pdf,.doc,.docx,image/*"
                      required
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX ou Image jusqu'à 10MB
                </p>
                {newPV.file && (
                  <p className="text-sm text-green-600">
                    Fichier sélectionné : {newPV.file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
            >
              Créer le PV
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 