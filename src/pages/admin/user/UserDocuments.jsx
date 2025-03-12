import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

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
    id: 1,
    name: '',
    email: '',
    phone: '',
    company: '',
    status: '',
    role: ''
  })
  
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les données de l'utilisateur et ses documents en un seul useEffect
  useEffect(() => {
    // Éviter les doubles appels en mode strict
    if (dataFetchedRef.current) return;
    
    const fetchData = async () => {
      setLoading(true)
      try {
        // Utiliser Promise.all pour exécuter les deux requêtes en parallèle
        const [userResponse, documentsResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/documents`)
        ])
        
        const userData = await userResponse.json()
        const documentsData = await documentsResponse.json()
        
        if (userData.error) {
          throw new Error(userData.error.message || 'Erreur lors du chargement des données utilisateur')
        }
        
        if (documentsData.error) {
          throw new Error(documentsData.error.message || 'Erreur lors du chargement des documents')
        }
        
        setUser(userData.data)
        setDocuments(documentsData.data)
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

  // État pour le modal de création de PV
  const [showCreatePVModal, setShowCreatePVModal] = useState(false)
  const [newPV, setNewPV] = useState({
    title: '',
    project: '',
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
      // Créer le nouveau document via l'API
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPV.title,
          project: newPV.project,
          project_id: 1, // Idéalement, cela serait dynamique
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          assigned_user: parseInt(userId),
          type: 'pv',
          fileUrl: URL.createObjectURL(newPV.file), // Simuler une URL de fichier
          reminders: []
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de la création du PV');
      }
      
      // Ajouter le nouveau document à la liste
      setDocuments([...documents, result.data]);
      
      // Réinitialiser le formulaire
      setNewPV({
        title: '',
        project: '',
        description: '',
        file: null
      });
      
      setShowCreatePVModal(false);
      
    } catch (err) {
      console.error('Erreur lors de la création du PV:', err);
      alert('Une erreur est survenue lors de la création du PV');
    }
  }

  // Fonction pour mettre à jour un document
  const handleUpdateDocument = async (updatedDocument) => {
    try {
      const response = await fetch(`/api/documents/${updatedDocument.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDocument),
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de la mise à jour du document');
      }
      
      // Mettre à jour la liste des documents
      const updatedDocuments = documents.map(doc => 
        doc.id === updatedDocument.id ? result.data : doc
      );
      
      setDocuments(updatedDocuments);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du document:', err);
      alert('Une erreur est survenue lors de la mise à jour du document');
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
        />
      )}
    </div>
  )
}

export default UserDocuments 