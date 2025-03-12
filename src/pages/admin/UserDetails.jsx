import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  KeyIcon,
  UserIcon,
  DocumentTextIcon,
  CreditCardIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

// Import des composants d'onglets
import ProfileTab from '../../components/admin/user/ProfileTab'
import DocumentsTab from '../../components/admin/user/DocumentsTab'
import PaymentsTab from '../../components/admin/user/PaymentsTab'
import ProjectsTab from '../../components/admin/user/ProjectsTab'
import CreatePVModal from '../../components/admin/user/CreatePVModal'

function UserDetails() {
  const { userId } = useParams()
  const location = useLocation()
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
    projects: [
      { id: 1, name: 'Refonte E-commerce', status: 'En cours' },
      { id: 2, name: 'Application Mobile', status: 'En attente' }
    ],
    documents: [
      { 
        id: 1, 
        title: 'PV de réception - Projet A', 
        date: '2024-03-15',
        project: 'Refonte E-commerce',
        status: 'signed',
        signedAt: '2024-03-16T09:30:00',
        fileUrl: '/documents/pv-projet-a.pdf'
      },
      { 
        id: 2, 
        title: 'PV de livraison - Phase 1', 
        date: '2024-03-01',
        project: 'Refonte E-commerce',
        status: 'pending',
        fileUrl: '/documents/pv-phase-1.pdf'
      },
      { 
        id: 3, 
        title: 'PV de recette - Module Paiement', 
        date: '2024-02-15',
        project: 'Application Mobile',
        status: 'signed',
        signedAt: '2024-02-20T11:45:00',
        fileUrl: '/documents/pv-module-paiement.pdf'
      },
      { 
        id: 4, 
        title: 'PV de livraison - Version Beta', 
        date: '2024-01-20',
        project: 'Application Mobile',
        status: 'signed',
        signedAt: '2024-01-25T14:30:00',
        fileUrl: '/documents/pv-version-beta.pdf'
      }
    ],
    payments: [
      {
        id: 1,
        invoice: 'FAC-2024-001',
        amount: 5000,
        date: '2024-03-10',
        dueDate: '2024-04-10',
        status: 'pending'
      },
      {
        id: 2,
        invoice: 'FAC-2024-002',
        amount: 3500,
        date: '2024-02-15',
        dueDate: '2024-03-15',
        status: 'paid',
        paidDate: '2024-03-12'
      }
    ]
  })

  // Déterminer l'onglet actif en fonction de l'URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/documents')) return 'documents'
    if (path.includes('/payments')) return 'payments'
    if (path.includes('/projects')) return 'projects'
    return 'profile' // Par défaut
  }
  
  const activeTab = getActiveTab()
  
  // État pour le modal de création de PV
  const [showCreatePVModal, setShowCreatePVModal] = useState(false)
  const [newPV, setNewPV] = useState({
    title: '',
    project: '',
    description: '',
    file: null
  })
  
  // États pour la pagination et le filtrage des documents
  const [documentsPage, setDocumentsPage] = useState(1)
  const [documentsPerPage] = useState(3)
  const [documentSearchQuery, setDocumentSearchQuery] = useState('')
  const [documentStatusFilter, setDocumentStatusFilter] = useState('all')
  const [documentProjectFilter, setDocumentProjectFilter] = useState('all')
  
  // Filtrage des documents
  const filteredDocuments = user.documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
                         doc.project.toLowerCase().includes(documentSearchQuery.toLowerCase());
    const matchesStatus = documentStatusFilter === 'all' || 
                         (documentStatusFilter === 'signed' && doc.status === 'signed') ||
                         (documentStatusFilter === 'pending' && doc.status === 'pending');
    const matchesProject = documentProjectFilter === 'all' || doc.project === documentProjectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });
  
  // Pagination des documents
  const indexOfLastDocument = documentsPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalDocumentsPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewPV({...newPV, file: e.target.files[0]});
    }
  }

  const handleCreatePV = (e) => {
    e.preventDefault()
    
    // Vérifier que le fichier est bien présent
    if (!newPV.file) {
      alert('Veuillez sélectionner un fichier PV');
      return;
    }
    
    // Ajouter le nouveau PV à la liste des documents
    const newDocument = {
      id: user.documents.length + 1,
      title: newPV.title,
      project: newPV.project,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      fileUrl: URL.createObjectURL(newPV.file) // Créer une URL temporaire pour le fichier
    }
    
    setUser({
      ...user,
      documents: [...user.documents, newDocument]
    })
    
    setNewPV({
      title: '',
      project: '',
      description: '',
      file: null
    })
    
    setShowCreatePVModal(false)
  }

  const handleResetPassword = () => {
    // TODO: Implémenter la réinitialisation du mot de passe
    console.log('Réinitialisation du mot de passe pour', user.id)
  }

  const handleToggleStatus = () => {
    setUser({
      ...user,
      status: user.status === 'active' ? 'inactive' : 'active'
    })
  }

  // Liste des projets uniques pour le filtre
  const uniqueProjects = [...new Set(user.documents.map(doc => doc.project))];

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="text-gray-500 hover:text-void">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {user.status === 'active' ? 'Actif' : 'Inactif'}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'Administrateur' ? 'bg-purple-100 text-purple-800' :
            user.role === 'Gestionnaire' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            to={`/admin/users/${userId}`}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-void text-void'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserIcon className="h-5 w-5 inline mr-2" />
            Profil
          </Link>
          <Link
            to={`/admin/users/${userId}/documents`}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-void text-void'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DocumentTextIcon className="h-5 w-5 inline mr-2" />
            Documents et PVs
          </Link>
          <Link
            to={`/admin/users/${userId}/payments`}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-void text-void'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCardIcon className="h-5 w-5 inline mr-2" />
            Paiements
          </Link>
          <Link
            to={`/admin/users/${userId}/projects`}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-void text-void'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FolderIcon className="h-5 w-5 inline mr-2" />
            Projets
          </Link>
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <ProfileTab 
            user={user} 
            onResetPassword={handleResetPassword} 
            onToggleStatus={handleToggleStatus} 
          />
        )}
        
        {activeTab === 'documents' && (
          <DocumentsTab 
            user={user} 
            documents={user.documents} 
            onCreatePV={() => setShowCreatePVModal(true)} 
          />
        )}
        
        {activeTab === 'payments' && (
          <PaymentsTab payments={user.payments} />
        )}
        
        {activeTab === 'projects' && (
          <ProjectsTab projects={user.projects} />
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

export default UserDetails 
