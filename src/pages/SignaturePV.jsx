import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  DocumentIcon, 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathRoundedSquareIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { fetchUserPVs, updatePV, uploadSignedPVFile } from '../api/pvService'
import { useAuth } from '../api/AuthContext'

function SignaturePV() {
  const { user: currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const pvIdFromUrl = searchParams.get('pvId')
  
  const [pvs, setPVs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadingPvId, setUploadingPvId] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    if (currentUser?.id) {
      loadPVs(currentUser.id)
    }
  }, [currentUser])

  const loadPVs = async (userId) => {
    try {
      setLoading(true)
      
      if (!userId) {
        setError("Vous devez être connecté pour accéder à cette page.")
        setLoading(false)
        return
      }
      
      const data = await fetchUserPVs(userId)
      setPVs(data)
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors du chargement des documents")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e, pvId) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingPvId(pvId);
      setUploadError(null);
      
      try {
        // Upload the signed file
        const { filePath } = await uploadSignedPVFile(file, pvId);

        // Update the PV status
        await updatePV(pvId, {
          status: 'Signé',
          signed_file_path: filePath,
          signed_at: new Date().toISOString(),
          signed_by: currentUser.id
        });

        // Reload PVs to update the UI
        loadPVs(currentUser.id);
      } catch (err) {
        setUploadError(err.message);
      } finally {
        setUploadingPvId(null);
      }
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
  
  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('fr-FR')} à ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  // Check if PV is overdue
  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'Signé';
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Erreur</h2>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  // Mock data for reminders
  const reminders = {
    // Sample reminders for demo purposes
    "reminder-1": [
      {
        id: 1,
        type: "email",
        sender: "John Doe",
        senderRole: "Chef de projet",
        recipient: "Marie Dupont",
        recipientEmail: "marie.dupont@client.fr",
        date: "2024-03-18T10:30:00",
        message: "Bonjour Marie, Pourriez-vous nous retourner le PV signé ? Cordialement"
      },
      {
        id: 2,
        type: "phone",
        sender: "John Doe",
        senderRole: "Chef de projet",
        recipient: "Marie Dupont",
        recipientPhone: "+33 6 12 34 56 78",
        date: "2024-03-15T14:45:00",
        message: "Appel pour rappeler la signature du PV en attente"
      }
    ]
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Documents à signer</h1>

      <div className="rounded-lg shadow overflow-hidden">
        {pvs.length === 0 ? (
          <div className="bg-white p-10 flex flex-col items-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="mt-2 text-gray-500">
              Aucun document à signer pour le moment.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {pvs.map((pv) => (
              <div key={pv.id} className="bg-white p-6 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{pv.title}</h3>
                    <p className={`text-sm ${
                        isOverdue(pv.due_date, pv.status) ? 'text-red-500' : 'text-gray-500'
                      }`}>
                      Date limite : {formatDate(pv.due_date)}
                      {isOverdue(pv.due_date, pv.status) && 
                        <span className="ml-2 text-red-500">(En retard)</span>
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Download PV button */}
                    <a
                      href={pv.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Télécharger le PV
                    </a>
                    
                    {/* Upload signed PV button */}
                    {pv.status !== 'Signé' && (
                      <div className="relative">
                        <input 
                          id={`signed-doc-${pv.id}`} 
                          className="sr-only"
                          accept=".pdf"
                          type="file"
                          onChange={(e) => handleFileChange(e, pv.id)}
                          disabled={uploadingPvId === pv.id}
                        />
                        <label 
                          htmlFor={`signed-doc-${pv.id}`}
                          className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                          border-void text-void bg-white hover:bg-gray-50 ${uploadingPvId === pv.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                        >
                          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                          {uploadingPvId === pv.id ? 'Chargement...' : 'Déposer le PV signé'}
                        </label>
                      </div>
                    )}
                    
                    {/* Transfer button */}
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void">
                      <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2" />
                      Transférer à un collaborateur
                    </button>
                  </div>
                </div>
                
                {/* Reminders history section - always show it */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Historique des relances</h4>
                  <div className="space-y-4">
                    {reminders[`reminder-${pv.id}`] && reminders[`reminder-${pv.id}`].length > 0 ? (
                      reminders[`reminder-${pv.id}`].map((reminder) => (
                        <div key={reminder.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
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
                                <span className="font-medium text-gray-900">{reminder.sender}</span>
                                <span className="text-gray-500 ml-2">{reminder.senderRole}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatDateTime(reminder.date)}
                              </div>
                            </div>
                            <div className="mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <UserIcon className="h-4 w-4 mr-1" />
                                <span>À : {reminder.recipient}</span>
                                <span className="ml-2">
                                  {reminder.recipientEmail || reminder.recipientPhone}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-700">{reminder.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Aucun historique de relance pour ce document</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Show upload error if any */}
                {uploadError && uploadingPvId === pv.id && (
                  <div className="mt-2 text-sm text-red-600">
                    Erreur: {uploadError}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default SignaturePV 