import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

function ProjectAudit() {
  const { projectId } = useParams()
  const [auditRequests, setAuditRequests] = useState([
    {
      id: 1,
      status: 'completed',
      codeProvidedDate: '2024-03-10',
      auditReceivedDate: '2024-03-15',
      sourceCodeUrl: '/audits/source-v1.zip',
      auditReportUrl: '/audits/report-v1.pdf',
      version: 'v1.0',
      findings: {
        critical: 2,
        high: 3,
        medium: 5,
        low: 8
      }
    },
    {
      id: 2,
      status: 'waiting_report',
      codeProvidedDate: '2024-03-20',
      sourceCodeUrl: '/audits/source-v2.zip',
      version: 'v1.1'
    }
  ])

  const handleAuditUpload = (requestId, event) => {
    const file = event.target.files[0]
    if (file) {
      // TODO: Implémenter l'upload du rapport d'audit
      console.log('Uploading audit report:', file.name)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Terminé
          </span>
        )
      case 'waiting_report':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            En attente de votre rapport
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-void">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Audit de sécurité</h1>
      </div>

      {/* Liste des demandes d'audit */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Demandes d'audit</h2>
        
        <div className="space-y-6">
          {auditRequests.map((request) => (
            <div 
              key={request.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Version {request.version}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="mt-2 space-y-2 text-sm text-gray-500">
                    <p>Code source fourni le {new Date(request.codeProvidedDate).toLocaleDateString()}</p>
                    {request.auditReceivedDate && (
                      <p>Rapport reçu le {new Date(request.auditReceivedDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {request.findings && (
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-red-600 font-medium">{request.findings.critical}</div>
                      <div className="text-xs text-gray-500">Critiques</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-600 font-medium">{request.findings.high}</div>
                      <div className="text-xs text-gray-500">Élevées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 font-medium">{request.findings.medium}</div>
                      <div className="text-xs text-gray-500">Moyennes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">{request.findings.low}</div>
                      <div className="text-xs text-gray-500">Faibles</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <a
                    href={request.sourceCodeUrl}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    Télécharger le code source
                  </a>
                  {request.auditReportUrl && (
                    <a
                      href={request.auditReportUrl}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      Voir le rapport
                    </a>
                  )}
                </div>

                {request.status === 'waiting_report' && (
                  <div className="flex items-center">
                    <label
                      htmlFor={`audit-upload-${request.id}`}
                      className="inline-flex items-center px-4 py-2 border border-void rounded-md shadow-sm text-sm font-medium text-void hover:bg-void hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                      Soumettre le rapport d'audit
                      <input
                        id={`audit-upload-${request.id}`}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(e) => handleAuditUpload(request.id, e)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {request.status === 'waiting_report' && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <p className="text-sm text-yellow-700">
                      Merci de télécharger le code source et de nous fournir votre rapport d'audit de sécurité.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectAudit 