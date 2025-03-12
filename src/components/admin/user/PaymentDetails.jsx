import { useState } from 'react'
import { 
  DocumentIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'

function PaymentDetails({ payment, onClose, onUpdatePayment }) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const [emailContent, setEmailContent] = useState(`Bonjour,

Nous vous rappelons que la facture "${payment.invoice}" d'un montant de ${payment.amount.toLocaleString()}€ est en attente de paiement.
Date d'échéance : ${new Date(payment.dueDate).toLocaleDateString()}

Cordialement,
L'équipe VOID`)
  
  const [phoneNote, setPhoneNote] = useState('')
  const [uploadedInvoiceFile, setUploadedInvoiceFile] = useState(null)

  // État pour les informations de transfert
  const hasBeenTransferred = payment.transferredTo && payment.transferredTo.name

  const handleInvoiceFileUpload = (e) => {
    if (e.target.files[0]) {
      setUploadedInvoiceFile(e.target.files[0])
    }
  }

  const handleSaveInvoiceFile = () => {
    if (uploadedInvoiceFile) {
      const updatedPayment = {
        ...payment,
        fileUrl: URL.createObjectURL(uploadedInvoiceFile)
      }
      onUpdatePayment(updatedPayment)
      setUploadedInvoiceFile(null)
    }
  }

  const handleSendEmailReminder = () => {
    const updatedPayment = {
      ...payment,
      reminders: [
        ...(payment.reminders || []),
        {
          id: (payment.reminders?.length || 0) + 1,
          type: 'email',
          date: new Date().toISOString(),
          content: emailContent
        }
      ]
    }
    onUpdatePayment(updatedPayment)
    setShowEmailForm(false)
  }

  const handleSavePhoneReminder = () => {
    if (phoneNote.trim()) {
      const updatedPayment = {
        ...payment,
        reminders: [
          ...(payment.reminders || []),
          {
            id: (payment.reminders?.length || 0) + 1,
            type: 'phone',
            date: new Date().toISOString(),
            content: phoneNote
          }
        ]
      }
      onUpdatePayment(updatedPayment)
      setPhoneNote('')
      setShowPhoneForm(false)
    }
  }

  const handleMarkAsPaid = () => {
    const updatedPayment = {
      ...payment,
      status: 'paid',
      paidAt: new Date().toISOString()
    }
    onUpdatePayment(updatedPayment)
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">Facture {payment.invoice}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne de gauche - Informations générales et fichiers */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Informations générales</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Montant :</span> {payment.amount.toLocaleString()}€
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date d'émission :</span> {new Date(payment.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date d'échéance :</span> {new Date(payment.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Statut :</span>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'paid' ? 'Payé' : 'En attente'}
                  </span>
                </p>
                {payment.paidAt && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date de paiement :</span> {new Date(payment.paidAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Document de facture</h3>
              {payment.fileUrl ? (
                <div className="flex items-center justify-between">
                  <a
                    href={payment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    Visualiser
                  </a>
                  <a
                    href={payment.fileUrl}
                    download
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Télécharger
                  </a>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-yellow-600 mb-2">Aucun document de facture n'a été uploadé.</p>
                  <div>
                    <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Uploader la facture
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleInvoiceFileUpload}
                        accept=".pdf"
                      />
                    </label>
                  </div>
                  {uploadedInvoiceFile && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">Fichier sélectionné : {uploadedInvoiceFile.name}</p>
                      <button
                        onClick={handleSaveInvoiceFile}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                      >
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {payment.status === 'pending' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                <button
                  onClick={handleMarkAsPaid}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <CurrencyEuroIcon className="h-5 w-5 mr-2" />
                  Marquer comme payée
                </button>
              </div>
            )}
          </div>

          {/* Colonne de droite - Transfert et relances */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transfert</h3>
              {hasBeenTransferred ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Cette facture a été transférée à :
                  </p>
                  <div className="flex items-start space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{payment.transferredTo.name}</p>
                      <p className="text-xs text-gray-500">{payment.transferredTo.position}</p>
                    </div>
                  </div>
                  {payment.transferredTo.email && (
                    <div className="flex items-start space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm">{payment.transferredTo.email}</p>
                      </div>
                    </div>
                  )}
                  {payment.transferredTo.phone && (
                    <div className="flex items-start space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm">{payment.transferredTo.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Cette facture n'a pas été transférée à une autre personne.
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Relances</h3>
              
              {payment.status !== 'paid' && (
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    Relance par email
                  </button>
                  <button
                    onClick={() => setShowPhoneForm(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Relance téléphonique
                  </button>
                </div>
              )}

              {showEmailForm && (
                <div className="mb-4 p-3 border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Envoyer une relance par email</h4>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={6}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setShowEmailForm(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendEmailReminder}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                      Envoyer
                    </button>
                  </div>
                </div>
              )}

              {showPhoneForm && (
                <div className="mb-4 p-3 border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Saisir une relance téléphonique</h4>
                  <textarea
                    value={phoneNote}
                    onChange={(e) => setPhoneNote(e.target.value)}
                    placeholder="Saisissez les détails de votre appel..."
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setShowPhoneForm(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSavePhoneReminder}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {payment.reminders && payment.reminders.length > 0 ? (
                  payment.reminders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(reminder => (
                    <div key={reminder.id} className="flex items-start space-x-3 p-2 border-l-2 border-void">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-void-light flex items-center justify-center">
                        {reminder.type === 'email' ? (
                          <EnvelopeIcon className="h-4 w-4 text-void" />
                        ) : (
                          <PhoneIcon className="h-4 w-4 text-void" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Relance {reminder.type === 'email' ? 'par email' : 'téléphonique'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(reminder.date).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                          {reminder.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucune relance effectuée pour le moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetails 