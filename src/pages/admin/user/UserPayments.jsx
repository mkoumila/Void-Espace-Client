import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

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
        // Utiliser Promise.all pour exécuter les deux requêtes en parallèle
        const [userResponse, paymentsResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/payments`)
        ])
        
        const userData = await userResponse.json()
        const paymentsData = await paymentsResponse.json()
        
        if (userData.error) {
          throw new Error(userData.error.message || 'Erreur lors du chargement des données utilisateur')
        }
        
        if (paymentsData.error) {
          throw new Error(paymentsData.error.message || 'Erreur lors du chargement des paiements')
        }
        
        setUser(userData.data)
        setPayments(paymentsData.data)
        setLoading(false)
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
      const response = await fetch(`/api/payments/${updatedPayment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPayment),
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de la mise à jour du paiement');
      }
      
      // Mettre à jour la liste des paiements
      const updatedPayments = payments.map(payment => 
        payment.id === updatedPayment.id ? result.data : payment
      );
      
      setPayments(updatedPayments);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du paiement:', err);
      alert('Une erreur est survenue lors de la mise à jour du paiement');
    }
  };

  // Fonction pour créer un nouveau paiement
  const handleCreatePayment = async (newPayment) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPayment,
          assigned_user: parseInt(userId),
          date: new Date().toISOString().split('T')[0],
          status: 'pending'
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de la création du paiement');
      }
      
      // Ajouter le nouveau paiement à la liste
      setPayments([...payments, result.data]);
      
    } catch (err) {
      console.error('Erreur lors de la création du paiement:', err);
      alert('Une erreur est survenue lors de la création du paiement');
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