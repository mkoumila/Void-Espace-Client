import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import supabaseClient from '../../../api/supabaseClient'

import UserHeader from '../../../components/admin/user/UserHeader'
import UserTabs from '../../../components/admin/user/UserTabs'
import ProfileTab from '../../../components/admin/user/ProfileTab'

function UserProfile() {
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
    role: '',
    company: '',
    department: '',
    position: '',
    lastLogin: '',
    status: 'active',
    createdAt: '',
    address: '',
    city: '',
    postal_code: '',
    country: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les données de l'utilisateur depuis Supabase
  useEffect(() => {
    // Éviter les doubles appels en mode strict
    if (dataFetchedRef.current) return;
    
    const fetchUserData = async () => {
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
        
        // Récupérer les informations client supplémentaires
        const { data: clientData, error: clientError } = await supabaseClient
          .from('clients')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (clientError && clientError.code !== 'PGRST116') { // Ignore "no rows returned" error
          throw new Error(clientError.message || 'Erreur lors du chargement des données client');
        }
        
        // Formater les données utilisateur
        setUser({
          id: userData.id,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role || 'client',
          company: userData.company || '',
          department: userData.department || '',
          position: userData.position || '',
          lastLogin: userData.last_login || '',
          status: userData.status || 'active',
          createdAt: userData.created_at || '',
          // Adresse provenant soit de l'utilisateur, soit du client
          address: clientData?.address || '',
          city: clientData?.city || '',
          postal_code: clientData?.postal_code || '',
          country: clientData?.country || 'France'
        });
        
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
      fetchUserData()
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      dataFetchedRef.current = false
    }
  }, [userId])

  // Fonction pour mettre à jour les informations de l'utilisateur
  const handleUpdateUser = async (updatedUserData) => {
    try {
      // Mise à jour des données utilisateur
      const { error: userError } = await supabaseClient
        .from('users')
        .update({
          first_name: updatedUserData.first_name || updatedUserData.name.split(' ')[0],
          last_name: updatedUserData.last_name || updatedUserData.name.split(' ').slice(1).join(' '),
          phone: updatedUserData.phone,
          company: updatedUserData.company,
          department: updatedUserData.department,
          position: updatedUserData.position
        })
        .eq('id', userId);
        
      if (userError) {
        throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${userError.message}`);
      }
      
      // Si des informations d'adresse sont présentes, mettre à jour la table client
      if (updatedUserData.address || updatedUserData.city || updatedUserData.postal_code || updatedUserData.country) {
        const { data: clientData } = await supabaseClient
          .from('clients')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (clientData) {
          const { error: clientError } = await supabaseClient
            .from('clients')
            .update({
              address: updatedUserData.address,
              city: updatedUserData.city,
              postal_code: updatedUserData.postal_code,
              country: updatedUserData.country
            })
            .eq('id', clientData.id);
            
          if (clientError) {
            throw new Error(`Erreur lors de la mise à jour de l'adresse: ${clientError.message}`);
          }
        }
      }
      
      // Mettre à jour l'état local
      setUser({
        ...user,
        ...updatedUserData
      });
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
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
      <UserHeader user={user} loading={loading} />

      {/* Onglets de navigation */}
      <UserTabs userId={userId} activeTab={activeTab} />

      {/* Contenu du profil */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
          </div>
        ) : (
          <ProfileTab 
            user={user} 
            onUpdateUser={handleUpdateUser} 
          />
        )}
      </div>
    </div>
  )
}

export default UserProfile 