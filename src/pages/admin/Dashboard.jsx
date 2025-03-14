import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UserIcon,
  BuildingOfficeIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../api/AuthContext'
import * as userService from '../../api/userService'

function Admin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { hasPermission } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('Tous les rôles')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Client',
    company: '',
    status: 'active'
  })

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Jamais connecté';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Date invalide';
      
      // Format date: DD/MM/YYYY à HH:MM
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Format de date invalide';
    }
  };

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const formattedUsers = await userService.fetchUsers()
        setUsers(formattedUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load users. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'Tous les rôles' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'Tous les statuts' || 
      (statusFilter === 'Actifs' && user.status === 'active') ||
      (statusFilter === 'Inactifs' && user.status === 'inactive');
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const newUserData = await userService.createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company: newUser.company
      })
      
      // Add the new user to the list
      setUsers([...users, newUserData])
      
      // Reset the form
      setNewUser({
        name: '',
        email: '',
        role: 'Client',
        company: '',
        status: 'active'
      })
      
      setShowAddUserModal(false)
    } catch (error) {
      console.error('Error creating user:', error)
      alert(`Failed to create user: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleResendInvitation = async (userId) => {
    try {
      setLoading(true)
      
      // Get the user's email
      const user = users.find(u => u.id === userId)
      if (!user) throw new Error('User not found')
      
      // Resend invitation
      await userService.resendInvitation(user.email)
      
      alert(`Invitation sent to ${user.email}`)
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert(`Failed to send invitation: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      setLoading(true)
      
      // Find the user
      const user = users.find(u => u.id === userId)
      if (!user) throw new Error('User not found')
      
      // Toggle status
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      
      // Update status in backend
      await userService.updateUserStatus(userId, newStatus)
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus }
          : u
      ))
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert(`Failed to update user status: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrateur':
        return <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
      case 'Gestionnaire':
        return <BuildingOfficeIcon className="h-4 w-4 text-blue-500" />
      case 'Client':
        return <UserIcon className="h-4 w-4 text-green-500" />
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrateur':
        return 'bg-purple-100 text-purple-800'
      case 'Gestionnaire':
        return 'bg-blue-100 text-blue-800'
      case 'Client':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              placeholder="Rechercher par nom, email ou entreprise..."
            />
          </div>
          <select 
            className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Tous les statuts</option>
            <option>Actifs</option>
            <option>Inactifs</option>
          </select>
          <select 
            className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>Tous les rôles</option>
            <option>Client</option>
            <option>Gestionnaire</option>
            <option>Administrateur</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Chargement des utilisateurs...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-void hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-void text-white flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleResendInvitation(user.id)}
                          className="text-gray-400 hover:text-void"
                          title="Renvoyer l'invitation"
                          disabled={loading}
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="text-gray-400 hover:text-void"
                        title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                        disabled={loading}
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-gray-400 hover:text-void"
                        title="Voir détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        className="text-gray-400 hover:text-void"
                        title="Modifier"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ajouter un utilisateur
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={newUser.company}
                  onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                >
                  <option>Client</option>
                  <option>Gestionnaire</option>
                  <option>Administrateur</option>
                </select>
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions par rôle</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-green-500" />
                    <p><strong>Client</strong> : Accès aux projets, signatures, devis et paiements</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-blue-500" />
                    <p><strong>Gestionnaire</strong> : Accès client + gestion des projets et TMA</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
                    <p><strong>Administrateur</strong> : Accès complet + gestion des utilisateurs</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                  disabled={loading}
                >
                  {loading ? 'Ajout en cours...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin 