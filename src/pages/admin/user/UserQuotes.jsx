import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

import UserHeader from '../../../components/admin/user/UserHeader'
import UserTabs from '../../../components/admin/user/UserTabs'
import QuotesTab from '../../../components/admin/user/QuotesTab'
import supabaseClient from '../../../api/supabaseClient'
import * as quoteService from '../../../api/quoteService'

function UserQuotes() {
  const { userId } = useParams()
  const location = useLocation()
  const dataFetchedRef = useRef(false)
  
  // Déterminer l'onglet actif en fonction de l'URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/documents')) return 'documents'
    if (path.includes('/payments')) return 'payments'
    if (path.includes('/projects')) return 'projects'
    if (path.includes('/quotes')) return 'quotes'
    return 'profile' // Par défaut
  }
  
  const activeTab = getActiveTab()
  
  const [user, setUser] = useState({
    id: userId,
    name: '',
    email: '',
    phone: '',
    company: '',
    status: '',
    role: ''
  })
  
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les données de l'utilisateur et ses devis en un seul useEffect
  useEffect(() => {
    // Éviter les doubles appels en mode strict
    if (dataFetchedRef.current) return;
    
    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch complete user data from the users table
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (userError) {
          throw new Error(userError.message || 'Erreur lors du chargement des données utilisateur');
        }
        
        // 2. Fetch client data for this user
        const { data: clientData, error: clientError } = await supabaseClient
          .from('clients')
          .select('*')
          .eq('user_id', userId);
        
        if (clientError) {
          throw new Error(clientError.message || 'Erreur lors du chargement des données client');
        }
        
        let quotesData = [];
        // 3. If we have a client record, fetch quotes for this client
        if (clientData && clientData.length > 0) {
          // Update any expired quotes first
          await quoteService.updateExpiredQuotes();
          
          const clientId = clientData[0].id;
          const { data: clientQuotes, error: quotesError } = await supabaseClient
            .from('quotes')
            .select('*, clients(name)')
            .eq('client_id', clientId)
            .order('issue_date', { ascending: false });
          
          if (quotesError) {
            throw new Error(quotesError.message || 'Erreur lors du chargement des devis');
          }
          
          quotesData = clientQuotes || [];
        }
        
        // 4. Format the user data combining both user and client information
        const formattedUser = {
          id: userData.id,
          name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || userData.email,
          email: userData.email,
          phone: userData.phone || (clientData && clientData[0]?.phone) || '',
          company: userData.company || (clientData && clientData[0]?.name) || '',
          address: clientData && clientData[0]?.address || '',
          city: clientData && clientData[0]?.city || '',
          postal_code: clientData && clientData[0]?.postal_code || '',
          country: clientData && clientData[0]?.country || '',
          status: clientData && clientData.length > 0 ? 'active' : 'inactive',
          role: userData.role,
          avatar_url: userData.avatar_url
        };
        
        setUser(formattedUser);
        setQuotes(quotesData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(`Erreur: ${err.message}`);
        setLoading(false);
      }
      
      // Marquer les données comme chargées
      dataFetchedRef.current = true;
    }
    
    if (userId) {
      fetchData();
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      dataFetchedRef.current = false;
    }
  }, [userId])

  // Fonction pour mettre à jour un devis
  const handleUpdateQuote = async (updatedQuote) => {
    try {
      // Extract id and prepare the quote data object without the id
      const { id, ...quoteData } = updatedQuote;
      
      const result = await quoteService.updateQuote(id, quoteData);
      
      if (result) {
        // Mettre à jour l'état local des devis
        setQuotes(quotes.map(quote => 
          quote.id === id ? { ...quote, ...result } : quote
        ));
        return { success: true };
      }
      return { success: false, error: 'Échec de la mise à jour du devis' };
    } catch (err) {
      console.error('Erreur lors de la mise à jour du devis:', err);
      return { success: false, error: err.message };
    }
  }

  // Fonction pour créer un nouveau devis
  const handleCreateQuote = async (newQuote) => {
    try {
      const result = await quoteService.createQuote(newQuote);
      
      if (result) {
        // Ajouter le nouveau devis à l'état local
        setQuotes([result, ...quotes]);
        return { success: true, data: result };
      }
      return { success: false, error: 'Échec de la création du devis' };
    } catch (err) {
      console.error('Erreur lors de la création du devis:', err);
      return { success: false, error: err.message };
    }
  }

  // Fonction pour supprimer un devis
  const handleDeleteQuote = async (quoteId) => {
    try {
      const { success } = await quoteService.deleteQuote(quoteId);
      
      if (success) {
        // Mettre à jour l'état local en supprimant le devis
        setQuotes(quotes.filter(quote => quote.id !== quoteId));
        return { success: true };
      }
      return { success: false, error: 'Échec de la suppression du devis' };
    } catch (err) {
      console.error('Erreur lors de la suppression du devis:', err);
      return { success: false, error: err.message };
    }
  }

  return (
    <>
      <UserHeader user={user} loading={loading} />
      <UserTabs userId={userId} activeTab={activeTab} />
      
      <div className="mt-6">
        <QuotesTab 
          quotes={quotes} 
          loading={loading} 
          error={error} 
          onUpdateQuote={handleUpdateQuote}
          onCreateQuote={handleCreateQuote}
          onDeleteQuote={handleDeleteQuote}
          userId={userId}
        />
      </div>
    </>
  )
}

export default UserQuotes 