import { useState } from 'react'
import { 
  ArrowPathRoundedSquareIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'

function Payments() {
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      number: 'FAC-2024-001',
      amount: 1500,
      dueDate: '2024-03-25',
      status: 'late',
      project: 'Refonte Site E-commerce',
      department: 'Direction Financière',
      reminders: [
        {
          id: 1,
          date: '2024-03-20',
          type: 'email',
          target: {
            name: 'Marie Dupont',
            email: 'marie.dupont@client.fr',
            department: 'Comptabilité'
          },
          status: 'sent'
        },
        {
          id: 2,
          date: '2024-03-15',
          type: 'phone',
          target: {
            name: 'Jean Martin',
            phone: '+33 6 12 34 56 78',
            department: 'Direction Financière'
          },
          notes: 'En attente de validation du service achat'
        }
      ]
    }
  ])

  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    comment: ''
  })

  const [expandedInvoices, setExpandedInvoices] = useState(new Set())

  const handleTransfer = (invoice) => {
    setSelectedInvoice(invoice)
    setShowContactForm(true)
  }

  const handleSubmitContact = (e) => {
    e.preventDefault()
    // TODO: Implémenter l'envoi des informations
    console.log('Contact info:', contactInfo)
    setShowContactForm(false)
    setContactInfo({ email: '', phone: '', comment: '' })
  }

  const toggleInvoiceExpand = (invoiceId) => {
    const newExpanded = new Set(expandedInvoices)
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId)
    } else {
      newExpanded.add(invoiceId)
    }
    setExpandedInvoices(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des paiements</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id}>
              {/* Informations principales de la facture */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Facture {invoice.number}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        En retard
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>Projet : {invoice.project}</p>
                      <p>Service concerné : {invoice.department}</p>
                      <p className="font-medium">Montant : {invoice.amount}€</p>
                      <p>Échéance : {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleTransfer(invoice)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2" />
                      Ce n'est pas mon service
                    </button>
                    <button
                      onClick={() => toggleInvoiceExpand(invoice.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <ChevronDownIcon 
                        className={`h-5 w-5 transform transition-transform ${
                          expandedInvoices.has(invoice.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  </div>
                </div>

                {/* Historique des relances */}
                {expandedInvoices.has(invoice.id) && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      Historique des relances
                    </h4>
                    <div className="space-y-4">
                      {invoice.reminders.map((reminder) => (
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
                              <div className="text-sm font-medium text-gray-900">
                                {reminder.target.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(reminder.date).toLocaleDateString('fr-FR', {
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
                                {reminder.target.department}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                {reminder.type === 'email' ? (
                                  <span>{reminder.target.email}</span>
                                ) : (
                                  <span>{reminder.target.phone}</span>
                                )}
                              </div>
                            </div>
                            {reminder.notes && (
                              <p className="mt-2 text-sm text-gray-600">
                                {reminder.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Alerte informative */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Si cette facture ne concerne pas votre service, merci d'indiquer les coordonnées de la personne à contacter.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal/Form pour le transfert */}
      {showContactForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Indiquer le contact à relancer
            </h3>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                    placeholder="exemple@entreprise.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={contactInfo.comment}
                  onChange={(e) => setContactInfo({...contactInfo, comment: e.target.value})}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  placeholder="Informations complémentaires..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                >
                  Transmettre l'information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments 