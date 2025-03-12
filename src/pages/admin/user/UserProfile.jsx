import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'

import UserHeader from '../../../components/admin/user/UserHeader'
import UserTabs from '../../../components/admin/user/UserTabs'
import ProfileTab from '../../../components/admin/user/ProfileTab'

function UserProfile() {
  const { userId } = useParams()
  const location = useLocation()
  
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
    name: 'Marie Dupont',
    email: 'marie.dupont@client.fr',
    phone: '+33 6 12 34 56 78',
    role: 'Client',
    company: 'Attijari CIB',
    department: 'Direction Marketing',
    position: 'Responsable Digital',
    lastLogin: '2024-03-20T14:30:00',
    status: 'active',
    createdAt: '2023-11-15T10:00:00',
    address: {
      street: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    }
  })

  // Fonction pour mettre à jour les informations de l'utilisateur
  const handleUpdateUser = (updatedUserData) => {
    setUser({
      ...user,
      ...updatedUserData
    })
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <UserHeader user={user} />

      {/* Onglets de navigation */}
      <UserTabs userId={userId} activeTab={activeTab} />

      {/* Contenu du profil */}
      <div className="mt-6">
        <ProfileTab 
          user={user} 
          onUpdateUser={handleUpdateUser} 
        />
      </div>
    </div>
  )
}

export default UserProfile 