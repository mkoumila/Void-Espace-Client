import { useState } from 'react'
import { 
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  KeyIcon,
  UserIcon,
  DocumentCheckIcon,
  UserCircleIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

function ProfileTab({ user, onResetPassword, onToggleStatus, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(user)

  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Gestion des champs imbriqués (comme address.city)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedUser({
        ...editedUser,
        [parent]: {
          ...editedUser[parent],
          [child]: value
        }
      });
    } else {
      setEditedUser({
        ...editedUser,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  // Vérifier si les projets existent avant d'essayer d'y accéder
  const activeProjects = user.projects ? user.projects.filter(p => p.status !== 'completed') : [];
  const completedProjects = user.projects ? user.projects.filter(p => p.status === 'completed') : [];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Informations du profil</h3>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
          >
            Modifier
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                Nom complet
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                Téléphone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phone || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                Entreprise
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.company || 'N/A'}</dd>
            </div>
            {user.department && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Département
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.department}</dd>
              </div>
            )}
            {user.position && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Poste
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.position}</dd>
              </div>
            )}
            {user.address && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Adresse
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.address.street && <div>{user.address.street}</div>}
                  {user.address.city && user.address.postalCode && (
                    <div>{user.address.postalCode} {user.address.city}</div>
                  )}
                  {user.address.country && <div>{user.address.country}</div>}
                </dd>
              </div>
            )}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                Date d'inscription
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                Dernière connexion
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={editedUser.name || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={editedUser.email || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={editedUser.phone || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Entreprise
              </label>
              <input
                type="text"
                name="company"
                id="company"
                value={editedUser.company || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Département
              </label>
              <input
                type="text"
                name="department"
                id="department"
                value={editedUser.department || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Poste
              </label>
              <input
                type="text"
                name="position"
                id="position"
                value={editedUser.position || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            {editedUser.address && (
              <>
                <div className="col-span-6">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                    Rue
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    id="address.street"
                    value={editedUser.address.street || ''}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    id="address.postalCode"
                    value={editedUser.address.postalCode || ''}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    id="address.city"
                    value={editedUser.address.city || ''}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    id="address.country"
                    value={editedUser.address.country || ''}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Projets de l'utilisateur */}
      {(activeProjects.length > 0 || completedProjects.length > 0) && (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Projets associés</h3>
          
          {activeProjects.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">Projets en cours</h4>
              <ul className="divide-y divide-gray-200">
                {activeProjects.map(project => (
                  <li key={project.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-void">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                        project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'in_progress' ? 'En cours' : 
                         project.status === 'planning' ? 'Planification' : 
                         project.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-void">
                              Progression
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-void">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-void-light">
                          <div style={{ width: `${project.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-void"></div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {completedProjects.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Projets terminés</h4>
              <ul className="divide-y divide-gray-200">
                {completedProjects.map(project => (
                  <li key={project.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-void">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Terminé
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileTab 