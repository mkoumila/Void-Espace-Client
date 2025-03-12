import { useState } from 'react'
import { 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon as PendingIcon,
  GlobeAltIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

function TMA() {
  const [platforms] = useState([
    {
      id: 1,
      name: 'Attijari CIB',
      url: 'attijaricib.com',
      contact: {
        name: 'Marie Lambert',
        role: 'Chargée de TMA',
        email: 'marie.lambert@void.fr',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80'
      },
      tickets: [
        {
          id: 1,
          title: 'Bug sur la page de paiement',
          priority: 'Haute',
          status: 'En cours',
          createdAt: '2024-03-18T10:30:00',
          estimatedTime: '4h',
          description: 'Le bouton de paiement ne répond pas sur mobile',
          category: 'Bug'
        }
      ]
    },
    {
      id: 2,
      name: 'Attijari Entreprises',
      url: 'attijarientreprises.com',
      contact: {
        name: 'Thomas Durand',
        role: 'Chargé de TMA',
        email: 'thomas.durand@void.fr',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'
      },
      tickets: [
        {
          id: 2,
          title: 'Mise à jour du slider homepage',
          priority: 'Normale',
          status: 'En attente',
          createdAt: '2024-03-17T14:20:00',
          estimatedTime: '2h',
          description: 'Ajouter les nouvelles images dans le carousel',
          category: 'Évolution'
        }
      ]
    },
    {
      id: 3,
      name: 'Attijari MDM',
      url: 'attijarimdm.com',
      contact: {
        name: 'Sophie Martin',
        role: 'Chargée de TMA',
        email: 'sophie.martin@void.fr',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
      },
      tickets: []
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours':
        return 'bg-blue-100 text-blue-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Terminé':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Haute':
        return 'text-red-600'
      case 'Normale':
        return 'text-orange-600'
      case 'Basse':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">TMA</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void">
            Nouveau ticket
          </button>
          <select className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void">
            <option>Toutes les plateformes</option>
            {platforms.map(p => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">En cours</h3>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <PendingIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">En attente</h3>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Terminés ce mois</h3>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des plateformes */}
      <div className="space-y-8">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <GlobeAltIcon className="h-6 w-6 text-void" />
                  <div>
                    <Link 
                      to={`/tma/${platform.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-void"
                    >
                      {platform.name}
                    </Link>
                    <a 
                      href={`https://${platform.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-void hover:text-void-light"
                    >
                      {platform.url}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={platform.contact.avatar} 
                      alt={platform.contact.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{platform.contact.name}</p>
                      <p>{platform.contact.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des tickets */}
            {platform.tickets.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {platform.tickets.map((ticket) => (
                  <li key={ticket.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {ticket.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span>Créé le {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="ml-6 flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">{ticket.estimatedTime}</span> estimées
                        </div>
                        <Link 
                          to={`/tma/${platform.id}/tickets/${ticket.id}`}
                          className="text-void hover:text-void-light"
                        >
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucun ticket en cours pour cette plateforme
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TMA