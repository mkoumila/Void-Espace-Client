import { useState } from 'react'
import { 
  DocumentArrowDownIcon, 
  ArrowPathRoundedSquareIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'

function SignaturePV() {
  const [documents] = useState([
    {
      id: 1,
      title: 'PV de réception - Projet A',
      date: '2024-03-20',
      status: 'pending',
      fileUrl: '/documents/pv-projet-a.pdf',
      hasUploadedSignedVersion: false,
      reminders: [
        {
          id: 1,
          date: '2024-03-18T10:30:00',
          type: 'email',
          sender: {
            name: 'John Doe',
            role: 'Chef de projet'
          },
          recipient: {
            name: 'Marie Dupont',
            email: 'marie.dupont@client.fr'
          },
          message: 'Bonjour Marie, Pourriez-vous nous retourner le PV signé ? Cordialement'
        },
        {
          id: 2,
          date: '2024-03-15T14:45:00',
          type: 'phone',
          sender: {
            name: 'John Doe',
            role: 'Chef de projet'
          },
          recipient: {
            name: 'Marie Dupont',
            phone: '+33 6 12 34 56 78'
          },
          message: 'Appel pour rappeler la signature du PV en attente'
        }
      ]
    }
  ])

  const handleFileUpload = (docId, event) => {
    const file = event.target.files[0]
    if (file) {
      // TODO: Implémenter l'upload du fichier
      console.log('Uploading signed document:', file.name)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Documents à valider</h1>
      
      <div className="bg-white shadow rounded-lg">
        {documents.map(doc => (
          <div key={doc.id} className="p-6 border-b last:border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{doc.title}</h3>
                <p className="text-sm text-gray-500">Date limite : {doc.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={doc.fileUrl}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Télécharger le PV
                </a>

                <div className="relative">
                  <input
                    type="file"
                    id={`signed-doc-${doc.id}`}
                    className="sr-only"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(doc.id, e)}
                  />
                  <label
                    htmlFor={`signed-doc-${doc.id}`}
                    className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                      ${doc.hasUploadedSignedVersion 
                        ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                        : 'border-void text-void bg-white hover:bg-gray-50'
                      } cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                  >
                    {doc.hasUploadedSignedVersion ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        PV signé déposé
                      </>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Déposer le PV signé
                      </>
                    )}
                  </label>
                </div>

                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                >
                  <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2" />
                  Transférer à un collaborateur
                </button>
              </div>
            </div>

            {/* Historique des relances */}
            {doc.reminders && doc.reminders.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Historique des relances
                </h4>
                <div className="space-y-4">
                  {doc.reminders.map((reminder) => (
                    <div 
                      key={reminder.id}
                      className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {reminder.type === 'email' ? (
                          <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <PhoneIcon className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {reminder.sender.name}
                            </span>
                            <span className="text-gray-500 ml-2">
                              {reminder.sender.role}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(reminder.date).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <UserIcon className="h-4 w-4 mr-1" />
                            <span>À : {reminder.recipient.name}</span>
                            {reminder.type === 'email' ? (
                              <span className="ml-2">({reminder.recipient.email})</span>
                            ) : (
                              <span className="ml-2">({reminder.recipient.phone})</span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            {reminder.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SignaturePV 