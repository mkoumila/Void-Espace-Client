import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import supabaseClient from '../../../api/supabaseClient'

import UserHeader from '../../../components/admin/user/UserHeader'
import UserTabs from '../../../components/admin/user/UserTabs'
import ProjectsTab from '../../../components/admin/user/ProjectsTab'

function UserProjects() {
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
    status: 'active',
    role: '',
    projects: []
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les données de l'utilisateur et ses projets
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
        
        // Si un client est trouvé, récupérer ses projets
        let projects = [];
        if (clientData) {
          const { data: projectsData, error: projectsError } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('client_id', clientData.id)
            .order('start_date', { ascending: false });
            
          if (projectsError) {
            throw new Error(projectsError.message || 'Erreur lors du chargement des projets');
          }
          
          // Formater les projets pour l'affichage
          projects = projectsData.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description || '',
            startDate: project.start_date,
            endDate: project.end_date,
            status: project.status === 'En cours' ? 'in_progress' : 
                   project.status === 'Terminé' ? 'completed' : 'planning',
            progress: calculateProgress(project.start_date, project.end_date),
            budget: 0, // Pas de champ budget dans le schéma actuel
            manager: '' // Pas de champ manager dans le schéma actuel
          }));
        }
        
        // Formater les données utilisateur
        setUser({
          id: userData.id,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
          email: userData.email,
          phone: userData.phone || '',
          company: userData.company || '',
          status: userData.status || 'active',
          role: userData.role,
          projects: projects
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
    
    // Fonction utilitaire pour calculer la progression d'un projet en fonction des dates
    const calculateProgress = (startDate, endDate) => {
      if (!startDate || !endDate) return 0;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      
      // Si le projet est terminé
      if (today > end) return 100;
      
      // Si le projet n'a pas encore commencé
      if (today < start) return 0;
      
      // Calculer la progression
      const totalDuration = end - start;
      const elapsed = today - start;
      const progress = Math.round((elapsed / totalDuration) * 100);
      
      return Math.min(progress, 100);
    };
    
    if (userId) {
      fetchData()
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      dataFetchedRef.current = false
    }
  }, [userId])

  // Fonction pour mettre à jour un projet
  const handleUpdateProject = async (updatedProject) => {
    try {
      // Convertir le statut pour correspondre à l'enum dans la base de données
      const dbStatus = updatedProject.status === 'in_progress' ? 'En cours' : 
                     updatedProject.status === 'completed' ? 'Terminé' : 'En pause';
      
      // Mise à jour du projet dans Supabase
      const { error } = await supabaseClient
        .from('projects')
        .update({
          name: updatedProject.name,
          description: updatedProject.description,
          status: dbStatus,
          start_date: updatedProject.startDate,
          end_date: updatedProject.endDate
        })
        .eq('id', updatedProject.id);
        
      if (error) {
        throw new Error(`Erreur lors de la mise à jour du projet: ${error.message}`);
      }
      
      // Mettre à jour l'état local
      const updatedProjects = user.projects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      );
      
      setUser({
        ...user,
        projects: updatedProjects
      });
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du projet:', err);
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

      {/* Contenu des projets */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
          </div>
        ) : (
          <ProjectsTab 
            user={user} 
            projects={user.projects} 
            onUpdateProject={handleUpdateProject}
          />
        )}
      </div>
    </div>
  )
}

export default UserProjects 