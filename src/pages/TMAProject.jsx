import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  DocumentTextIcon,
  FolderIcon,
  TicketIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ServerIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

function TMAProject() {
  const { projectId } = useParams()
  const [project, setProject] = useState({
    id: 1,
    name: 'Attijari CIB',
    url: 'attijaricib.com',
    contact: {
      name: 'Marie Lambert',
      role: 'Chargée de TMA',
      email: 'marie.lambert@void.fr',
      phone: '+33 6 12 34 56 78',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80'
    },
    redmineTickets: [
      {
        id: 'RED-123',
        title: 'Optimisation des performances de la page d\'accueil',
        status: 'En cours',
        priority: 'Normale',
        created_at: '2024-03-15',
        updated_at: '2024-03-18'
      }
      // ... autres tickets
    ],
    reports: [
      {
        id: 1,
        title: 'Rapport TMA T1 2024',
        date: '2024-03-01',
        type: 'Trimestriel',
        fileUrl: '/reports/tma-t1-2024.pdf',
        size: '2.4 MB'
      },
      {
        id: 2,
        title: 'Rapport Mensuel Février 2024',
        date: '2024-02-29',
        type: 'Mensuel',
        fileUrl: '/reports/tma-02-2024.pdf',
        size: '1.8 MB'
      },
      {
        id: 3,
        title: 'Rapport Mensuel Janvier 2024',
        date: '2024-01-31',
        type: 'Mensuel',
        fileUrl: '/reports/tma-01-2024.pdf',
        size: '1.6 MB'
      },
      {
        id: 4,
        title: 'Rapport TMA T4 2023',
        date: '2023-12-31',
        type: 'Trimestriel',
        fileUrl: '/reports/tma-t4-2023.pdf',
        size: '2.8 MB'
      },
      {
        id: 5,
        title: 'Rapport Mensuel Décembre 2023',
        date: '2023-12-31',
        type: 'Mensuel',
        fileUrl: '/reports/tma-12-2023.pdf',
        size: '1.5 MB'
      },
      {
        id: 6,
        title: 'Rapport Mensuel Novembre 2023',
        date: '2023-11-30',
        type: 'Mensuel',
        fileUrl: '/reports/tma-11-2023.pdf',
        size: '1.7 MB'
      },
      {
        id: 7,
        title: 'Rapport Mensuel Octobre 2023',
        date: '2023-10-31',
        type: 'Mensuel',
        fileUrl: '/reports/tma-10-2023.pdf',
        size: '1.9 MB'
      },
      {
        id: 8,
        title: 'Rapport TMA T3 2023',
        date: '2023-09-30',
        type: 'Trimestriel',
        fileUrl: '/reports/tma-t3-2023.pdf',
        size: '2.6 MB'
      },
      {
        id: 9,
        title: 'Bilan Annuel TMA 2023',
        date: '2023-12-31',
        type: 'Annuel',
        fileUrl: '/reports/tma-annual-2023.pdf',
        size: '4.2 MB'
      },
      {
        id: 10,
        title: 'Audit de Performance 2023',
        date: '2023-11-15',
        type: 'Spécial',
        fileUrl: '/reports/tma-audit-2023.pdf',
        size: '3.1 MB'
      }
    ],
    documents: {
      technical: {
        title: 'DAT v2.3',
        lastUpdate: '2024-01-15',
        fileUrl: '/docs/dat-v2.3.pdf'
      },
      userManual: {
        title: 'Manuel Utilisateur v1.8',
        lastUpdate: '2024-02-20',
        fileUrl: '/docs/manual-v1.8.pdf'
      }
    },
    criticalAlerts: [
      {
        id: 1,
        date: '2024-03-20T10:30:00',
        type: 'critical',
        title: 'Limite de connexions atteinte',
        environment: 'Production',
        url: 'https://attijariwafabank.com',
        description: 'L\'instance subit des interruptions en raison de l\'erreur suivante :',
        error: 'PDOException: SQLSTATE[08004] [1040] Too many connections',
        technicalDetails: {
          current: 'max_connections = 151',
          issue: 'max_used_connections = 152'
        },
        status: 'pending',
        action: 'Augmentation nécessaire de la limite de connexions',
        pendingSince: '2024-03-20T10:30:00'
      },
      {
        id: 2,
        date: '2024-03-19T15:45:00',
        type: 'critical',
        title: 'Certificat SSL expiré',
        environment: 'Production',
        url: 'https://secure.attijariwafabank.com',
        description: 'Le certificat SSL arrive à expiration dans 5 jours',
        status: 'pending',
        action: 'Renouvellement du certificat requis',
        pendingSince: '2024-03-19T15:45:00'
      }
    ]
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/tma" className="text-gray-500 hover:text-void">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <a 
            href={`https://${project.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-void hover:text-void-light text-sm"
          >
            {project.url}
          </a>
        </div>
      </div>

      {/* Alertes critiques */}
      {project.criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-red-800 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                Actions requises ({project.criticalAlerts.length})
              </h2>
              <span className="text-sm text-red-700">
                Temps de réponse moyen attendu : 4h
              </span>
            </div>

            <div className="space-y-4">
              {project.criticalAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-white rounded-lg border border-red-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-red-800">
                          {alert.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {alert.environment}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {alert.url}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-red-700">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        En attente depuis {new Date(alert.pendingSince).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-gray-700">{alert.description}</p>
                    {alert.error && (
                      <div className="bg-gray-100 rounded p-2 font-mono text-sm text-gray-800">
                        {alert.error}
                      </div>
                    )}
                    {alert.technicalDetails && (
                      <div className="flex items-start space-x-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <ServerIcon className="h-4 w-4 mr-1" />
                          Configuration actuelle : {alert.technicalDetails.current}
                        </div>
                        <div className="text-red-600">
                          Problème : {alert.technicalDetails.issue}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-red-100">
                    <p className="text-sm font-medium text-red-800">
                      Action requise : {alert.action}
                    </p>
                    <button className="inline-flex items-center px-3 py-1.5 border border-red-500 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100">
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Marquer comme résolu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Colonne Contact */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact TMA</h2>
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src={project.contact.avatar} 
                alt={project.contact.name}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{project.contact.name}</p>
                <p className="text-sm text-gray-500">{project.contact.role}</p>
              </div>
            </div>
            <div className="space-y-3">
              <a 
                href={`mailto:${project.contact.email}`}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-void"
              >
                <EnvelopeIcon className="h-5 w-5" />
                <span>{project.contact.email}</span>
              </a>
              <a 
                href={`tel:${project.contact.phone}`}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-void"
              >
                <PhoneIcon className="h-5 w-5" />
                <span>{project.contact.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Colonne Centrale - Tickets Redmine */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-medium text-gray-900">Suivi des interventions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {project.redmineTickets.map(ticket => (
                <div key={ticket.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">#{ticket.id}</span>
                        <h3 className="text-base font-medium text-gray-900">{ticket.title}</h3>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Mis à jour le {new Date(ticket.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Documents et Rapports */}
      <div className="grid grid-cols-3 gap-6">
        {/* Rapports TMA */}
        <div className="col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900">Rapports TMA</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {project.reports.map(report => (
              <a
                key={report.id}
                href={report.fileUrl}
                className="flex items-center p-4 hover:bg-gray-50 group"
              >
                <div className="p-2 bg-void/5 rounded-lg group-hover:bg-void/10">
                  <ChartBarIcon className="h-5 w-5 text-void" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <div className="flex items-center mt-1 space-x-4">
                    <p className="text-xs text-gray-500">
                      {new Date(report.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {report.type}
                    </span>
                    <span className="text-xs text-gray-500">{report.size}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <DocumentArrowDownIcon className="h-5 w-5 text-gray-400 group-hover:text-void transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Documentation */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900">Documentation</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* DAT */}
            <div className="flex items-start p-4 bg-gray-50 rounded-lg">
              <FolderIcon className="h-8 w-8 text-void mr-4" />
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900">
                  Dossier d'Architecture Technique
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Dernière mise à jour : {new Date(project.documents.technical.lastUpdate).toLocaleDateString()}
                </p>
                <a
                  href={project.documents.technical.fileUrl}
                  className="mt-2 inline-flex items-center text-sm text-void hover:text-void-light"
                >
                  Télécharger le DAT
                </a>
              </div>
            </div>

            {/* Manuel */}
            <div className="flex items-start p-4 bg-gray-50 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-void mr-4" />
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900">
                  Manuel d'utilisation
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Dernière mise à jour : {new Date(project.documents.userManual.lastUpdate).toLocaleDateString()}
                </p>
                <a
                  href={project.documents.userManual.fileUrl}
                  className="mt-2 inline-flex items-center text-sm text-void hover:text-void-light"
                >
                  Télécharger le manuel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TMAProject 