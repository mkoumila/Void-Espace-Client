import { useState, useEffect } from 'react'
import { 
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  KeyIcon,
  UserMinusIcon,
  DocumentCheckIcon,
  UserCircleIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import * as userService from '../../../api/userService'

function ProfileTab({ user, onResetPassword, onToggleStatus, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(user)
  const [processedUser, setProcessedUser] = useState(null)

  // Debug: Log the user object to inspect its structure
  useEffect(() => {
    console.log('ProfileTab user object:', user);
    console.log('User ID:', user.id);
    
    // Try to get the fully processed user data from userService if we have an empty lastLogin
    const fetchProcessedUserData = async () => {
      if (!user.lastLogin || user.lastLogin.trim() === '') {
        try {
          // Fetch all users to get the processed data with login history
          const allUsers = await userService.fetchUsers();
          // Find the current user in the processed data
          const processed = allUsers.find(u => u.id === user.id);
          if (processed) {
            console.log('Found processed user data:', processed);
            setProcessedUser(processed);
          }
        } catch (error) {
          console.error('Error fetching processed user data:', error);
        }
      }
    };
    
    fetchProcessedUserData();
    
    const lastLoginValue = getLastLoginTime();
    console.log('Found lastLogin value:', lastLoginValue);
    console.log('Formatted lastLogin:', formatDate(lastLoginValue));
  }, [user]);

  // Get the last login time from various possible property names
  const getLastLoginTime = () => {
    // If we have processed user data from userService, use that first
    if (processedUser && processedUser.lastLogin) {
      console.log('Using lastLogin from processed user data:', processedUser.lastLogin);
      return processedUser.lastLogin;
    }
    
    console.log('Checking user.lastLogin:', user.lastLogin);
    // Check if lastLogin exists and is not an empty string
    if (user.lastLogin && user.lastLogin.trim() !== '') return user.lastLogin;
    
    console.log('Checking user.last_login:', user.last_login);
    if (user.last_login) return user.last_login;
    
    // Check for auth.users format
    if (user.auth && user.auth.last_sign_in_at) {
      console.log('Found in auth.last_sign_in_at:', user.auth.last_sign_in_at);
      return user.auth.last_sign_in_at;
    }
    
    // Check raw DB format from user_management view
    if (user.last_sign_in_at) {
      console.log('Found in last_sign_in_at:', user.last_sign_in_at);
      return user.last_sign_in_at;
    }
    
    // Check Dashboard format which might be a string already
    if (typeof user.lastLogin === 'string' && user.lastLogin.includes('/')) {
      console.log('Found formatted date string:', user.lastLogin);
      return user.lastLogin;
    }
    
    // Check for audit log timestamps
    if (user.audit_logs && user.audit_logs.length > 0) {
      const loginLogs = user.audit_logs.filter(log => log.event_type === 'login');
      if (loginLogs.length > 0) {
        // Sort by timestamp descending and get the most recent
        const latestLogin = loginLogs.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )[0].timestamp;
        console.log('Found in audit logs:', latestLogin);
        return latestLogin;
      }
    }
    
    // Return null to match Dashboard behavior
    console.log('No login data found, returning null');
    return null;
  };

  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais connecté';
    
    // If it's already a formatted string like "14/03/2025 13:27", just return it
    if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      console.log('Already formatted date string:', dateString);
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Jamais connecté';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '/');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Jamais connecté';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleEditMode = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const getInitial = () => {
    if (user.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get formatted last login time
  const lastLoginFormatted = formatDate(getLastLoginTime());

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Modifier le profil</h3>
          </div>
          
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={editedUser.name || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={editedUser.email || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={editedUser.phone || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Entreprise
              </label>
              <input
                type="text"
                name="company"
                id="company"
                value={editedUser.company || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Département
              </label>
              <input
                type="text"
                name="department"
                id="department"
                value={editedUser.department || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Poste
              </label>
              <input
                type="text"
                name="position"
                id="position"
                value={editedUser.position || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={editedUser.address || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                Code postal
              </label>
              <input
                type="text"
                name="postal_code"
                id="postal_code"
                value={editedUser.postal_code || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Ville
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={editedUser.city || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Pays
              </label>
              <input
                type="text"
                name="country"
                id="country"
                value={editedUser.country || ''}
                onChange={handleInputChange}
                className="mt-1 focus:ring-void focus:border-void block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-void text-white flex items-center justify-center text-2xl font-medium">
              {getInitial()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name || 'Utilisateur'}</h2>
              <p className="text-sm text-gray-500">{user.company || ''}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{user.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="text-sm text-gray-900">{user.phone || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Entreprise</p>
                <p className="text-sm text-gray-900">{user.company || 'N/A'}</p>
                {(user.department || user.position) && (
                  <p className="text-xs text-gray-500">
                    {user.department && `${user.department} • `}{user.position || ''}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Dernière connexion</p>
                <p className="text-sm text-gray-900">{lastLoginFormatted}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleEditMode}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Modifier le profil
              </button>
              
              <button 
                onClick={onResetPassword}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Réinitialiser le mot de passe
              </button>
              
              <button 
                onClick={onToggleStatus}
                className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
              >
                <UserMinusIcon className="h-4 w-4 mr-2" />
                {user.status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Historique d'activité</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ClockIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Dernière connexion</p>
                <p className="text-xs text-gray-500">{lastLoginFormatted}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <DocumentCheckIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Document signé</p>
                <p className="text-xs text-gray-500">3/16/2024, 9:30:00 AM</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <UserCircleIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Compte créé</p>
                <p className="text-xs text-gray-500">{user.createdAt ? formatDate(user.createdAt) : '11/15/2023, 10:00:00 AM'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileTab 