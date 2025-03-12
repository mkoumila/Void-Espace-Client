import { useState } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

function QuotesTab({ user, quotes, onUpdateQuote, onCreateQuote }) {
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false)
  const [newQuote, setNewQuote] = useState({
    reference: '',
    title: '',
    amount: '',
    validUntil: '',
    fileUrl: ''
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
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le libellé de statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepté';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Refusé';
      case 'expired':
        return 'Expiré';
      default:
        return status;
    }
  };

  // Fonction pour marquer un devis comme accepté
  const handleAcceptQuote = (quoteId) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;
    
    onUpdateQuote({
      ...quote,
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    });
  };

  // Fonction pour marquer un devis comme refusé
  const handleRejectQuote = (quoteId) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;
    
    onUpdateQuote({
      ...quote,
      status: 'rejected',
      rejectedAt: new Date().toISOString()
    });
  };

  // Fonction pour ajouter un nouveau devis
  const handleAddQuote = (e) => {
    e.preventDefault();
    
    // Vérifier que les champs obligatoires sont remplis
    if (!newQuote.reference || !newQuote.title || !newQuote.amount || !newQuote.validUntil) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Créer un nouvel objet de devis
    const quoteToCreate = {
      reference: newQuote.reference,
      title: newQuote.title,
      amount: parseFloat(newQuote.amount),
      validUntil: newQuote.validUntil,
      fileUrl: newQuote.fileUrl || '/quotes/default.pdf'
    };
    
    // Appeler la fonction de création de devis
    onCreateQuote(quoteToCreate);
    
    // Réinitialiser le formulaire
    setNewQuote({
      reference: '',
      title: '',
      amount: '',
      validUntil: '',
      fileUrl: ''
    });
    
    // Fermer le modal
    setShowAddQuoteModal(false);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Devis</h3>
        <button
          type="button"
          onClick={() => setShowAddQuoteModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter un devis
        </button>
      </div>

      <div className="border-t border-gray-200">
        {quotes.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm">Aucun devis disponible pour cet utilisateur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'émission
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valide jusqu'au
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
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quote.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(quote.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quote.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quote.validUntil)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {quote.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptQuote(quote.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Accepter"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRejectQuote(quote.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Refuser"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <a
                          href={quote.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Télécharger"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </a>
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

      {/* Modal d'ajout de devis */}
      {showAddQuoteModal && (
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
                      Ajouter un devis
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddQuote}>
                        <div className="grid grid-cols-6 gap-6">
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                              Référence *
                            </label>
                            <input
                              type="text"
                              name="reference"
                              id="reference"
                              value={newQuote.reference}
                              onChange={(e) => setNewQuote({...newQuote, reference: e.target.value})}
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
                              value={newQuote.amount}
                              onChange={(e) => setNewQuote({...newQuote, amount: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                              Titre *
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              value={newQuote.title}
                              onChange={(e) => setNewQuote({...newQuote, title: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
                              Valide jusqu'au *
                            </label>
                            <input
                              type="date"
                              name="validUntil"
                              id="validUntil"
                              value={newQuote.validUntil}
                              onChange={(e) => setNewQuote({...newQuote, validUntil: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">
                              URL du fichier
                            </label>
                            <input
                              type="text"
                              name="fileUrl"
                              id="fileUrl"
                              value={newQuote.fileUrl}
                              onChange={(e) => setNewQuote({...newQuote, fileUrl: e.target.value})}
                              className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              placeholder="/quotes/example.pdf"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Laissez vide pour utiliser l'URL par défaut
                            </p>
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
                            onClick={() => setShowAddQuoteModal(false)}
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

export default QuotesTab 