import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CalendarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  PlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../api/AuthContext'
import * as quoteService from '../api/quoteService'

function Quotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user, userRole, hasPermission, loading: authLoading, sessionChecked } = useAuth()

  // Fetch quotes from Supabase - only when auth is ready
  useEffect(() => {
    // Don't fetch quotes until authentication is confirmed
    if (authLoading && !sessionChecked) {
      return;
    }
    
    // If session is checked but no user, redirect to login
    if (sessionChecked && !user) {
      navigate('/login');
      return;
    }

    async function fetchQuotes() {
      setLoading(true)
      setError(null)
      
      try {
        // Use the new quote service which includes expired quote checks
        const data = await quoteService.fetchQuotes(filter);
        setQuotes(data || []);
      } catch (err) {
        console.error('Exception when fetching quotes:', err)
        setError(`Une erreur est survenue: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuotes()
  }, [user, authLoading, sessionChecked, navigate, filter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Validé':
        return 'bg-green-100 text-green-800'
      case 'En attente de validation':
        return 'bg-yellow-100 text-yellow-800'
      case 'Expiré':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleValidateQuote = async (quoteId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Skip debug permission check and go straight to validation
      // This ensures we don't rely on functions that might not be in the database
      
      // Use the quote service's validateQuote method
      const { success } = await quoteService.validateQuote(quoteId);
      
      if (!success) {
        console.error('Error validating quote: server returned false');
        setError('Impossible de valider ce devis. Vous n\'avez pas les permissions nécessaires ou le devis n\'est plus en attente de validation.');
        return;
      }
      
      // Update local state
      setQuotes(quotes.map(quote => 
        quote.id === quoteId 
          ? { ...quote, status: 'Validé' }
          : quote
      ));
    } catch (err) {
      console.error('Exception when validating quote:', err);
      setError(`Erreur lors de la validation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadFile = async (filePath, quoteReference) => {
    try {
      // Use the quote service to handle file download
      await quoteService.downloadQuoteFile(filePath, quoteReference);
    } catch (err) {
      setError(`Une erreur est survenue lors du téléchargement: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/€/g, '€ HT');
  };

  // If auth is still loading, show a loading indicator
  if (authLoading && !sessionChecked) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-2 text-gray-500">Chargement de la session...</p>
      </div>
    );
  }

  // If no user after session check, component will redirect to login
  if (sessionChecked && !user) {
    return null;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
        <div className="flex gap-4 items-center">
          <select 
            className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tous les devis</option>
            <option value="pending">En attente</option>
            <option value="validated">Validés</option>
            <option value="expired">Expirés</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Chargement des devis...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg shadow-sm border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white p-10 flex flex-col items-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="mt-2 text-gray-500">Aucun devis disponible</p>
        </div>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote) => (
            <div 
              key={quote.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold">{quote.title}</h2>
                    <span className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Référence : {quote.reference}</p>
                  <p className="text-sm text-gray-600">{quote.description}</p>
                </div>
                <div className="flex gap-2">
                  {/* Both users and admins can download quotes */}
                  <button
                    onClick={() => handleDownloadFile(quote.file_path, quote.reference)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Télécharger le devis
                  </button>
                  
                  {/* Only clients can validate quotes that are pending */}
                  {quote.status === 'En attente de validation' && hasPermission('client') && !hasPermission('admin') && (
                    <button
                      onClick={() => handleValidateQuote(quote.id)}
                      className="inline-flex items-center px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                      </svg>
                      Je valide ce devis
                    </button>
                  )}

                  {/* Admin actions */}
                  {hasPermission('admin') && (
                    <>
                      {quote.status === 'En attente de validation' && (
                        <button
                          onClick={() => handleValidateQuote(quote.id)}
                          className="inline-flex items-center px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                          </svg>
                          Valider
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium">Date d'émission</p>
                    <p>{formatDate(quote.issue_date)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium">Valide jusqu'au</p>
                    <p>{formatDate(quote.valid_until)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium">Montant</p>
                    <p>{formatAmount(quote.amount)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Quotes 