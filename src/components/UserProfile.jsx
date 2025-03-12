import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { UserCircleIcon, ArrowRightOnRectangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../api/AuthContext'
import { useUserData } from '../hooks/useUserData'

// User avatar component
const UserAvatar = ({ avatarUrl, name }) => {
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={name}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }
  return <UserCircleIcon className="h-10 w-10 text-gray-400" />
}

// Error state component
const ErrorState = ({ error, onRetry, isRetrying }) => (
  <div className="flex items-center space-x-3 w-full p-2 text-red-500">
    <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
    <div className="flex-1 overflow-hidden">
      <p className="text-sm truncate" title={error}>Erreur</p>
      <div className="flex space-x-2">
        <button 
          onClick={onRetry}
          disabled={isRetrying}
          className="text-xs hover:underline flex items-center"
        >
          <span className={`mr-1 ${isRetrying ? 'animate-spin' : ''}`}>↻</span>
          Réessayer
        </button>
      </div>
    </div>
  </div>
)

// Loading state component
const LoadingState = () => (
  <div className="flex items-center space-x-3 w-full p-2">
    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
    </div>
  </div>
)

// Not logged in state component
const NotLoggedInState = () => (
  <div className="flex items-center space-x-3 w-full p-2">
    <UserCircleIcon className="h-10 w-10 text-gray-400" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">Non connecté</p>
      <div className="flex space-x-2">
        <button 
          onClick={() => window.location.href = '/login'} 
          className="text-xs text-blue-500 hover:underline"
        >
          Se connecter
        </button>
      </div>
    </div>
  </div>
)

// User dropdown menu component
const UserDropdownMenu = ({ userData, userRole, onLogout }) => {
  const formattedRole = userRole === 'admin' ? 'Administrateur' : 'Client'
  
  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-gray-100 transition-colors">
        <UserAvatar avatarUrl={userData.avatar_url} name={userData.name} />
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">{userData.name}</p>
          <p className="text-xs text-gray-500">{userData.company || formattedRole}</p>
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-full left-0 mb-2 w-full origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-4 border-b">
            <p className="text-sm font-medium text-gray-900">{userData.email}</p>
            <p className="text-xs text-gray-500 mt-1">{formattedRole}</p>
          </div>
          <div className="p-2 space-y-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5 text-gray-500" />
                  Se déconnecter
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

function UserProfile() {
  const { user, userRole, logout, authError, refreshSession } = useAuth()
  const { 
    userData, 
    loading, 
    refreshing, 
    handleRefreshSession,
    timeoutReached
  } = useUserData(user, refreshSession)

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // Silent error handling
    }
  }

  // Error state
  if (authError) {
    return <ErrorState 
      error={authError} 
      onRetry={handleRefreshSession} 
      isRetrying={refreshing} 
    />
  }

  // Loading state
  if ((loading || (user && !userData)) && !timeoutReached) {
    return <LoadingState />
  }
  
  // Not logged in state
  if (!user || (timeoutReached && !userData)) {
    return <NotLoggedInState />
  }
  
  // Timeout but has user
  if (timeoutReached && !userData && user) {
    // Attempt to load user data one more time
    const fetchUserDataAgain = async () => {
      try {
        const supabaseClient = (await import('../api/supabaseClient')).default;
        const { data } = await supabaseClient
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (data && (data.first_name || data.last_name)) {
          setUserData({
            name: [data.first_name, data.last_name].filter(Boolean).join(' '),
            email: user.email,
            company: '',
            avatar_url: null
          });
          return;
        }
      } catch (err) {
        // Silent error handling
      }
    };
    
    fetchUserDataAgain();
    
    const fallbackData = {
      name: user.email.split('@')[0],
      email: user.email,
      company: '',
      avatar_url: null
    }
    
    return <UserDropdownMenu 
      userData={fallbackData} 
      userRole={userRole} 
      onLogout={handleLogout} 
    />
  }

  // Normal logged in state
  return <UserDropdownMenu 
    userData={userData} 
    userRole={userRole} 
    onLogout={handleLogout} 
  />
}

export default UserProfile 