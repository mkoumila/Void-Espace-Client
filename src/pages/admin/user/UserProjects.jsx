import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'

import UserHeader from '../../../components/admin/user/UserHeader'
import UserTabs from '../../../components/admin/user/UserTabs'
import ProjectsTab from '../../../components/admin/user/ProjectsTab'

function UserProjects() {
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
    company: 'Attijari CIB',
    status: 'active',
    role: 'Client',
    projects: [
      {
        id: 1,
        name: 'Refonte E-commerce',
        description: 'Refonte complète du site e-commerce avec intégration de nouvelles fonctionnalités',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        status: 'in_progress',
        progress: 45,
        budget: 25000,
        manager: 'Sophie Leclerc'
      },
      {
        id: 2,
        name: 'Application Mobile',
        description: 'Développement d\'une application mobile iOS et Android pour la gestion des commandes',
        startDate: '2024-03-01',
        endDate: '2024-08-15',
        status: 'planning',
        progress: 10,
        budget: 18000,
        manager: 'Thomas Martin'
      },
      {
        id: 3,
        name: 'Refonte Intranet',
        description: 'Modernisation de l\'intranet d\'entreprise',
        startDate: '2023-09-10',
        endDate: '2023-12-20',
        status: 'completed',
        progress: 100,
        budget: 12000,
        manager: 'Sophie Leclerc'
      }
    ]
  })

  // Fonction pour mettre à jour un projet
  const handleUpdateProject = (updatedProject) => {
    const updatedProjects = user.projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    );
    
    setUser({
      ...user,
      projects: updatedProjects
    });
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <UserHeader user={user} />

      {/* Onglets de navigation */}
      <UserTabs userId={userId} activeTab={activeTab} />

      {/* Contenu des projets */}
      <div className="mt-6">
        <ProjectsTab 
          user={user} 
          projects={user.projects} 
          onUpdateProject={handleUpdateProject}
        />
      </div>
    </div>
  )
}

export default UserProjects 