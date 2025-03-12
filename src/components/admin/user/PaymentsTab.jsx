import { useState } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

function PaymentsTab({ user, payments, onUpdatePayment, onCreatePayment }) {
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    invoice: '',
    amount: '',
    dueDate: '',
    project: '',
    project_id: ''
  })

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Fonction pour obtenir la classe de statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le libellé de statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  // Fonction pour marquer une facture comme payée
  const handleMarkAsPaid = (paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    onUpdatePayment({
      ...payment,
      status: 'paid',
      paidAt: new Date().toISOString()
    });
  };

  // Fonction pour marquer une facture comme en retard
  const handleMarkAsOverdue = (paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    onUpdatePayment({
      ...payment,
      status: 'overdue'
    });
  };

  // Fonction pour ajouter une nouvelle facture
  const handleAddInvoice = (e) => {
    e.preventDefault();
    
    // Vérifier que les champs obligatoires sont remplis
    if (!newInvoice.invoice || !newInvoice.amount || !newInvoice.dueDate || !newInvoice.project) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Créer un nouvel objet de paiement
    const newPayment = {
      invoice: newInvoice.invoice,
      amount: parseFloat(newInvoice.amount),
      dueDate: newInvoice.dueDate,
      project: newInvoice.project,
      project_id: parseInt(newInvoice.project_id || 1) // Utiliser l'ID du projet si disponible
    };
    
    // Appeler la fonction de création de paiement
    onCreatePayment(newPayment);
    
    // Réinitialiser le formulaire
    setNewInvoice({
      invoice: '',
      amount: '',
      dueDate: '',
      project: '',
      project_id: ''
    });
    
    // Fermer le modal
    setShowAddInvoiceModal(false);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Paiements et factures</h3>
        <button
          type="button"
          onClick={() => setShowAddInvoiceModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une facture
        </button>
      </div>

      <div className="border-t border-gray-200">
        {payments.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm">Aucune facture disponible pour cet utilisateur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'émission
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'échéance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.invoice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(payment.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Marquer comme payée"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleMarkAsOverdue(payment.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Marquer comme en retard"
                            >
                              <ClockIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          className="text-void hover:text-void-dark"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'ajout de facture */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Ajouter une facture
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddInvoice}>
                        <div className="grid grid-cols-6 gap-6">
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="invoice" className="block text-sm font-medium text-gray-700">
                              N° Facture *
                            </label>
                            <input
                              type="text"
                              name="invoice"
                              id="invoice"
                              value={newInvoice.invoice}
                              onChange={(e) => setNewInvoice({...newInvoice, invoice: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                              Montant (€) *
                            </label>
                            <input
                              type="number"
                              name="amount"
                              id="amount"
                              value={newInvoice.amount}
                              onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                              Date d'échéance *
                            </label>
                            <input
                              type="date"
                              name="dueDate"
                              id="dueDate"
                              value={newInvoice.dueDate}
                              onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                              Projet *
                            </label>
                            <input
                              type="text"
                              name="project"
                              id="project"
                              value={newInvoice.project}
                              onChange={(e) => setNewInvoice({...newInvoice, project: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-void text-base font-medium text-white hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:col-start-2 sm:text-sm"
                          >
                            Ajouter
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddInvoiceModal(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:mt-0 sm:col-start-1 sm:text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsTab 