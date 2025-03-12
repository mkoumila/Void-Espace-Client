import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CalculatorIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

function Dashboard() {
  const [dashboardData] = useState({
    pendingSignatures: [
      {
        id: 1,
        title: 'PV de réception - Projet A',
        date: '2024-03-20',
        project: 'Refonte E-commerce',
        lastReminder: '2024-03-18'
      }
    ],
    criticalAlerts: [
      {
        id: 1,
        title: 'Limite de connexions atteinte',
        project: 'Attijari CIB',
        environment: 'Production',
        since: '2024-03-20T10:30:00'
      }
    ],
    pendingQuotes: [
      {
        id: 1,
        reference: 'DEV-2024-001',
        title: 'Refonte Application Mobile',
        amount: 25000,
        validUntil: '2024-04-15'
      }
    ],
    testInstances: [
      {
        id: 1,
        name: 'Rapport Annuel',
        url: 'rapport-annuel.sooninprod.com',
        lastDeployment: '2024-03-20T14:30:00'
      }
    ],
    upcomingAudits: [
      {
        id: 1,
        project: 'Refonte E-commerce',
        version: 'v1.1',
        codeProvidedDate: '2024-03-20'
      }
    ],
    maintenanceStats: {
      openTickets: 3,
      resolvedLastMonth: 12,
      averageResponseTime: '4h',
      nextMaintenance: '2024-04-01'
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Actions requises */}
        <div className="col-span-2 space-y-6">
          {/* Documents à signer */}
          {dashboardData.pendingSignatures.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <DocumentCheckIcon className="h-6 w-6 text-orange-500 mr-2" />
                  Documents en attente de signature
                </h2>
                <Link to="/signature-pv" className="text-sm text-void hover:text-void-light">
                  Voir tous les documents
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.pendingSignatures.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500">Projet : {doc.project}</p>
                      <p className="text-sm text-gray-500">
                        Dernière relance : {new Date(doc.lastReminder).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to="/signature-pv"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
                    >
                      Signer le document
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertes critiques */}
          {dashboardData.criticalAlerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                  Actions requises
                </h2>
              </div>
              <div className="space-y-4">
                {dashboardData.criticalAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-500">Projet : {alert.project}</p>
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        En attente depuis {new Date(alert.since).toLocaleString()}
                      </div>
                    </div>
                    <Link
                      to={`/tma`}
                      className="inline-flex items-center px-4 py-2 border border-red-500 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      Voir les détails
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Devis en attente */}
          {dashboardData.pendingQuotes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <CalculatorIcon className="h-6 w-6 text-gray-400 mr-2" />
                  Devis à valider
                </h2>
                <Link to="/quotes" className="text-sm text-void hover:text-void-light">
                  Voir tous les devis
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.pendingQuotes.map(quote => (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{quote.title}</h3>
                      <p className="text-sm text-gray-500">Référence : {quote.reference}</p>
                      <p className="text-sm font-medium text-gray-900">{quote.amount.toLocaleString()}€ HT</p>
                    </div>
                    <Link
                      to="/quotes"
                      className="inline-flex items-center px-4 py-2 border border-void rounded-md text-sm font-medium text-void hover:bg-void hover:text-white"
                    >
                      Consulter le devis
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Statistiques TMA */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400 mr-2" />
                Maintenance
              </h2>
              <Link to="/tma" className="text-sm text-void hover:text-void-light">
                Voir les détails
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Tickets ouverts</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.maintenanceStats.openTickets}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Temps de réponse moyen</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.maintenanceStats.averageResponseTime}</p>
              </div>
            </div>
          </div>

          {/* Instances de test */}
          {dashboardData.testInstances.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <GlobeAltIcon className="h-6 w-6 text-gray-400 mr-2" />
                Instances de test
              </h2>
              <div className="space-y-4">
                {dashboardData.testInstances.map(instance => (
                  <a
                    key={instance.id}
                    href={`https://${instance.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <h3 className="font-medium text-gray-900">{instance.name}</h3>
                    <p className="text-sm text-void">{instance.url}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Dernière mise à jour : {new Date(instance.lastDeployment).toLocaleString()}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Audits à venir */}
          {dashboardData.upcomingAudits.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-2" />
                Audits en cours
              </h2>
              <div className="space-y-4">
                {dashboardData.upcomingAudits.map(audit => (
                  <div key={audit.id} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{audit.project}</h3>
                    <p className="text-sm text-gray-500">Version : {audit.version}</p>
                    <p className="text-xs text-gray-500">
                      Code fourni le : {new Date(audit.codeProvidedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 