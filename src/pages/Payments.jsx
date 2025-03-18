import { useState, useEffect } from 'react'
import { 
  ArrowPathRoundedSquareIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { paymentService } from '../api/paymentService'
import supabaseClient from '../api/supabaseClient'

function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    comment: ''
  })
  const [expandedPayments, setExpandedPayments] = useState(new Set())
  const [followups, setFollowups] = useState({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  // Fetch followups when a payment is expanded
  useEffect(() => {
    const fetchFollowups = async () => {
      for (const paymentId of expandedPayments) {
        if (!followups[paymentId]) {
          try {
            const data = await paymentService.fetchPaymentFollowups(paymentId)
            setFollowups(prev => ({ ...prev, [paymentId]: data }))
          } catch (err) {
            console.error('Error fetching followups:', err)
          }
        }
      }
    }

    fetchFollowups()
  }, [expandedPayments])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      // Get the current user's client ID
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Get the client record for the current user
      const { data: clientData, error: clientError } = await supabaseClient
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (clientError) {
        throw clientError
      }

      if (!clientData) {
        throw new Error('No client record found for user')
      }

      // Fetch payments using the actual client ID
      const data = await paymentService.fetchPayments(clientData.id)
      setPayments(data)
    } catch (err) {
      setError('Failed to fetch payments')
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = (payment) => {
    setSelectedPayment(payment)
    setShowContactForm(true)
  }

  /* const handleSubmitContact = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      if (!contactInfo.email && !contactInfo.phone) {
        setFormError('Veuillez remplir au moins l\'email ou le numéro de téléphone')
        return
      }

      await paymentService.createPaymentFollowup(selectedPayment.id, contactInfo)
      
      // Update the followups state
      const newFollowup = {
        id: Date.now(), // Temporary ID until we get the real one
        email: contactInfo.email,
        phone: contactInfo.phone,
        comment: contactInfo.comment,
        created_at: new Date().toISOString(),
        created_by: (await supabaseClient.auth.getUser()).data.user.id
      }
      
      setFollowups(prev => ({
        ...prev,
        [selectedPayment.id]: [newFollowup, ...(prev[selectedPayment.id] || [])]
      }))

      setShowContactForm(false)
      setContactInfo({ email: '', phone: '', comment: '' })
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setFormError('Erreur lors de la soumission du formulaire')
    }
  } */

  const togglePaymentExpand = (paymentId) => {
    const newExpanded = new Set(expandedPayments)
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId)
    } else {
      newExpanded.add(paymentId)
    }
    setExpandedPayments(newExpanded)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des paiements</h1>
      </div>

      <div className="shadow rounded-lg overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-6 text-center">
            <div className="flex flex-col items-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Aucun paiement disponible</p>
              <p className="text-gray-400 text-sm mt-2">
                Vous n'avez pas encore de paiements à suivre.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {payments.map((payment) => (
              <div key={payment.id} className='bg-white'>
                {/* Main payment information */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          Paiement {payment.reference || payment.id}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'Payé' ? 'bg-green-100 text-green-800' :
                          payment.status === 'En attente' && new Date(payment.due_date) < new Date() ? 'bg-red-100 text-red-800' :
                          payment.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'Annulé' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status === 'Payé' ? 'Payé' :
                           payment.status === 'En attente' && new Date(payment.due_date) < new Date() ? 'En retard' :
                           payment.status === 'En attente' ? 'En attente' :
                           payment.status === 'Annulé' ? 'Annulé' :
                           payment.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Montant : {payment.amount}€</p>
                        <p>Date d'émission : {new Date(payment.payment_date).toLocaleDateString('fr-FR')}</p>
                        <p>Date d'échéance : {new Date(payment.due_date).toLocaleDateString('fr-FR')}</p>
                        {payment.description && <p>Description : {payment.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleTransfer(payment)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2" />
                        Ce n'est pas mon service
                      </button>
                      <button
                        onClick={() => togglePaymentExpand(payment.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <ChevronDownIcon 
                          className={`h-5 w-5 transform transition-transform ${
                            expandedPayments.has(payment.id) ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Payment details */}
                  {expandedPayments.has(payment.id) && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        Historique des relances
                      </h4>
                      <div className="space-y-4">
                        {followups[payment.id]?.length > 0 ? (
                          followups[payment.id].map((followup) => (
                            <div key={followup.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                              <div className="flex-shrink-0">
                                {followup.email ? (
                                  <EnvelopeIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                  <PhoneIcon className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-900">
                                    {followup.email || followup.phone}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(followup.created_at).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                <div className="mt-1">
                                  {followup.email && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                                      <span>{followup.email}</span>
                                    </div>
                                  )}
                                  {followup.phone && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <PhoneIcon className="h-4 w-4 mr-1" />
                                      <span>{followup.phone}</span>
                                    </div>
                                  )}
                                </div>
                                {followup.comment && (
                                  <p className="mt-2 text-sm text-gray-600">{followup.comment}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Aucun relancement enregistré</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Informative alert */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-700">
                      Si ce paiement ne concerne pas votre service, merci d'indiquer les coordonnées de la personne à contacter.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact form modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Indiquer le contact à relancer
            </h3>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
            <form onSubmit={() => null} className="space-y-4">
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