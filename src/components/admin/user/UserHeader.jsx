import { Link } from 'react-router-dom'
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { ShieldCheckIcon, UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'

function UserHeader({ user, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-80 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Format user name correctly regardless of data format
  const userName = user.name || 
    (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 
    (user.first_name || user.last_name || 'Utilisateur'));
    
  // Default status to 'active' if not provided
  const userStatus = user.status || 'active';

  // Helper function to render role badge with icon
  const renderRoleBadge = (role) => {
    // Default to client role
    let badgeClass = "px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800";
    let iconClass = "h-4 w-4 text-green-500";
    let icon = <UserIcon className={iconClass} />;
    let label = "Client";

    if (role === 'Administrateur' || role === 'admin') {
      badgeClass = "px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800";
      iconClass = "h-4 w-4 text-purple-500";
      icon = <ShieldCheckIcon className={iconClass} />;
      label = "Administrateur";
    } else if (role === 'gestionnaire' || role === 'manager') {
      badgeClass = "px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800";
      iconClass = "h-4 w-4 text-blue-500";
      icon = <BuildingOffice2Icon className={iconClass} />;
      label = "Gestionnaire";
    }

    return (
      <span className={badgeClass}>
        {icon}
        <span className="ml-1">{label}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="text-gray-500 hover:text-void">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.company && (
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  <span>{user.company}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Always show status badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            userStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {userStatus === 'active' ? 'Actif' : 'Inactif'}
          </span>
          {user.role && renderRoleBadge(user.role)}
        </div>
      </div>
      
      {/* Address information - only show if at least one address field exists */}
      {(user.address || user.city || user.postal_code) && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-start">
            <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              {user.address && <p>{user.address}</p>}
              {(user.postal_code || user.city) && (
                <p>{[user.postal_code, user.city].filter(Boolean).join(' ')}</p>
              )}
              {user.country && user.country !== 'France' && <p>{user.country}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserHeader 