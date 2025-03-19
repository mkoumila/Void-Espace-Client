import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import supabaseClient from '../../../api/supabaseClient'
import * as pvService from '../../../api/pvService'

import DocumentsTab from '../../../components/admin/user/DocumentsTab'
import CreatePVModal from '../../../components/admin/user/CreatePVModal'
import UserTabs from '../../../components/admin/user/UserTabs'
import UserHeader from '../../../components/admin/user/UserHeader'

function UserDocuments() {
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
  
  const [documents, setDocuments] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les données de l'utilisateur et les PVs
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data from Supabase
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        setUser(userData);

        // Fetch client data to get client_id
        const { data: clientData, error: clientError } = await supabaseClient
          .from('clients')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (clientError) throw clientError;

        // Fetch projects for this client
        const { data: projectsData, error: projectsError } = await supabaseClient
          .from('projects')
          .select('id, name')
          .eq('client_id', clientData.id)
          .order('name');

        if (projectsError) throw projectsError;
        setProjects(projectsData);

        // Fetch PVs for this client
        const { data: pvData, error: pvError } = await supabaseClient
          .from('pv')
          .select(`
            *,
            projects:project_id (
              id,
              name
            )
          `)
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false });

        if (pvError) throw pvError;

        // Format PVs for display
        const formattedPVs = pvData.map(pv => ({
          id: pv.id,
          title: pv.title,
          type: 'pv',
          status: pv.status,
          date: pv.created_at,
          project: pv.projects?.name || 'N/A',
          project_id: pv.project_id,
          file_path: pv.file_path,
          description: pv.description
        }));

        setDocuments(formattedPVs);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  // État pour le modal de création de PV
  const [showCreatePVModal, setShowCreatePVModal] = useState(false)
  const [newPV, setNewPV] = useState({
    title: '',
    project_id: '',  // Changed from project to project_id
    description: '',
    file: null
  })

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewPV({...newPV, file: e.target.files[0]});
    }
  }

  const handleCreatePV = async (e) => {
    e.preventDefault()
    
    // Vérifier que le fichier est bien présent
    if (!newPV.file) {
      alert('Veuillez sélectionner un fichier PV');
      return;
    }
    
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
      
      // Générer un nom de fichier unique
      const fileExt = newPV.file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Uploader le fichier dans le bucket de stockage
      const { error: uploadError } = await supabaseClient
        .storage
        .from('pv_files')
        .upload(filePath, newPV.file);
        
      if (uploadError) {
        throw new Error(`Erreur lors de l'upload du fichier: ${uploadError.message}`);
      }
      
      // Calculer la date d'échéance (30 jours à partir d'aujourd'hui)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      // Créer l'entrée PV dans la base de données
      const { data: pvData, error: pvError } = await supabaseClient
        .from('pv')
        .insert([
          {
            title: newPV.title,
            description: newPV.description,
            status: 'En attente de signature',
            file_path: filePath,
            client_id: clientData.id,
            project_id: newPV.project_id,  // Using project_id directly
            due_date: dueDate.toISOString()
          }
        ])
        .select()
        .single();
        
      if (pvError) {
        throw new Error(`Erreur lors de la création du PV: ${pvError.message}`);
      }
      
      // Formater le PV pour l'ajouter à la liste
      const formattedPV = {
        id: pvData.id,
        title: pvData.title,
        type: 'pv',
        status: pvData.status,
        date: pvData.created_at,
        project: projects.find(p => p.id === pvData.project_id)?.name || 'N/A',  // Get project name from projects list
        project_id: pvData.project_id,
        file_path: pvData.file_path
      };
      
      // Ajouter le nouveau PV à la liste
      setDocuments([formattedPV, ...documents]);
      
      // Réinitialiser le formulaire
      setNewPV({
        title: '',
        project_id: '',  // Reset project_id instead of project
        description: '',
        file: null
      });
      
      setShowCreatePVModal(false);
      
    } catch (err) {
      console.error('Erreur lors de la création du PV:', err);
      alert(`Une erreur est survenue: ${err.message}`);
    }
  }

  // Fonction pour mettre à jour un document
  const handleUpdateDocument = async (updatedDocument) => {
    try {
      // Pour l'instant, seuls les PV sont gérés
      if (updatedDocument.type === 'pv') {
        const { error } = await supabaseClient
          .from('pv')
          .update({
            title: updatedDocument.title,
            description: updatedDocument.description,
            status: updatedDocument.status,
            // Autres champs à mettre à jour si nécessaire
          })
          .eq('id', updatedDocument.id);
          
        if (error) {
          throw new Error(`Erreur lors de la mise à jour du PV: ${error.message}`);
        }
        
        // Mettre à jour la liste des documents
        const updatedDocuments = documents.map(doc => 
          doc.id === updatedDocument.id ? updatedDocument : doc
        );
        
        setDocuments(updatedDocuments);
      } else {
        throw new Error('Type de document non pris en charge pour la mise à jour');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du document:', err);
      alert(`Une erreur est survenue: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    );
  }

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

      {/* Contenu des documents */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
          </div>
        ) : (
          <DocumentsTab 
            user={user} 
            documents={documents} 
            onCreatePV={() => setShowCreatePVModal(true)} 
            onUpdateDocument={handleUpdateDocument}
          />
        )}
      </div>

      {/* Modal de création de PV */}
      {showCreatePVModal && (
        <CreatePVModal 
          newPV={newPV}
          onChangeNewPV={setNewPV}
          onFileChange={handleFileChange}
          onSubmit={handleCreatePV}
          onCancel={() => setShowCreatePVModal(false)}
          projects={projects}
        />
      )}
    </div>
  )
}

export default UserDocuments 