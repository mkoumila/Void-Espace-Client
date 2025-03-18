import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import supabaseClient from '../../../api/supabaseClient'

import UserHeader from '../../../components/admin/user/UserHeader'
import UserTabs from '../../../components/admin/user/UserTabs'
import PaymentsTab from '../../../components/admin/user/PaymentsTab'

function UserPayments() {
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
    id: 1,
    name: '',
    email: '',
    phone: '',
    company: '',
    status: '',
    role: ''
  })
  
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les données de l'utilisateur et ses paiements en un seul useEffect
  useEffect(() => {
    // Éviter les doubles appels en mode strict
    if (dataFetchedRef.current) return;
    
    const fetchData = async () => {
      setLoading(true)
      try {
        // Récupérer les données utilisateur depuis Supabase
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (userError) {
          throw new Error(userError.message || 'Erreur lors du chargement des données utilisateur');
        }
        
        // Récupérer les informations client
        const { data: clientData, error: clientError } = await supabaseClient
          .from('clients')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (clientError && clientError.code !== 'PGRST116') { // Ignore "no rows returned" error
          throw new Error(clientError.message || 'Erreur lors du chargement des données client');
        }
        
        const clientId = clientData?.id;
        
        // Récupérer les paiements depuis Supabase
        const { data: paymentsData, error: paymentsError } = await supabaseClient
          .from('payments')
          .select(`
            id,
            amount,
            payment_date,
            status,
            payment_method,
            reference,
            description,
            project_id,
            quote_id,
            created_at,
            projects(name),
            due_date,
            file_path
          `)
          .eq('client_id', clientId)
          .order('payment_date', { ascending: false });
        
        if (paymentsError) {
          throw new Error(paymentsError.message || 'Erreur lors du chargement des paiements');
        }
        
        // Formater les paiements pour l'affichage
        const formattedPayments = paymentsData.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.payment_date,
          due_date: payment.due_date,
          status: payment.status,
          method: payment.payment_method || 'N/A',
          reference: payment.reference || 'N/A',
          description: payment.description || '',
          project: payment.projects?.name || 'N/A',
          project_id: payment.project_id,
          file_path: payment.file_path
        }));
        
        setUser({
          id: userData.id,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
          email: userData.email,
          phone: userData.phone || '',
          company: userData.company || '',
          status: userData.status || 'active',
          role: userData.role
        });
        
        setPayments(formattedPayments);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        setError(`Erreur: ${err.message}`)
        setLoading(false)
      }
      
      // Marquer les données comme chargées
      dataFetchedRef.current = true
    }
    
    if (userId) {
      fetchData()
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      dataFetchedRef.current = false
    }
  }, [userId])

  // Fonction pour mettre à jour un paiement
  const handleUpdatePayment = async (updatedPayment) => {
    try {
      const { error } = await supabaseClient
        .from('payments')
        .update({
          amount: updatedPayment.amount,
          status: updatedPayment.status,
          payment_method: updatedPayment.method,
          reference: updatedPayment.reference,
          description: updatedPayment.description,
          // Autres champs à mettre à jour si nécessaire
        })
        .eq('id', updatedPayment.id);
        
      if (error) {
        throw new Error(`Erreur lors de la mise à jour du paiement: ${error.message}`);
      }
      
      // Mettre à jour la liste des paiements
      const updatedPayments = payments.map(payment => 
        payment.id === updatedPayment.id ? updatedPayment : payment
      );
      
      setPayments(updatedPayments);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du paiement:', err);
      alert(`Une erreur est survenue: ${err.message}`);
    }
  };

  // Fonction pour créer un nouveau paiement
  const handleCreatePayment = async (newPayment) => {
    try {
      // Récupérer d'abord l'ID client associé à cet utilisateur
      const { data: clientData, error: clientError } = await supabaseClient
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (clientError) {
        throw new Error('Impossible de trouver le client associé à cet utilisateur');
      }
      
      // Créer le paiement dans la base de données
      const { data: paymentData, error: paymentError } = await supabaseClient
        .from('payments')
        .insert([
          {
            amount: newPayment.amount,
            payment_date: newPayment.payment_date,
            due_date: newPayment.due_date,
            status: newPayment.status || 'En attente',
            payment_method: newPayment.payment_method,
            reference: newPayment.reference,
            description: newPayment.description,
            client_id: clientData.id,
            project_id: newPayment.project_id || null,
            quote_id: newPayment.quote_id || null,
            file_path: newPayment.file_path
          }
        ])
        .select()
        .single();
        
      if (paymentError) {
        throw new Error(`Erreur lors de la création du paiement: ${paymentError.message}`);
      }
      
      // Formater le paiement pour l'ajouter à la liste
      const formattedPayment = {
        id: paymentData.id,
        amount: paymentData.amount,
        date: paymentData.payment_date,
        due_date: paymentData.due_date,
        status: paymentData.status,
        method: paymentData.payment_method || 'N/A',
        reference: paymentData.reference || 'N/A',
        description: paymentData.description || '',
        project: newPayment.project || 'N/A',
        project_id: paymentData.project_id,
        file_path: paymentData.file_path
      };
      
      // Ajouter le nouveau paiement à la liste
      setPayments(prevPayments => [formattedPayment, ...prevPayments]);
      
    } catch (err) {
      console.error('Erreur lors de la création du paiement:', err);
      alert(`Une erreur est survenue: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Erreur</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <UserHeader user={user} />

      {/* Onglets de navigation */}
      <UserTabs userId={userId} activeTab={activeTab} />

      {/* Contenu des paiements */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
          </div>
        ) : (
          <PaymentsTab 
            user={user} 
            payments={payments} 
            onUpdatePayment={handleUpdatePayment}
            onCreatePayment={handleCreatePayment}
          />
        )}
      </div>
    </div>
  )
}

export default UserPayments 