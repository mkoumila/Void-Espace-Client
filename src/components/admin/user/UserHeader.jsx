import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

function UserHeader({ user }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/admin" className="text-gray-500 hover:text-void">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span>{user.email}</span>
            {user.phone && (
              <>
                <span>•</span>
                <span>{user.phone}</span>
              </>
            )}
            {user.company && (
              <>
                <span>•</span>
                <span>{user.company}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {user.status && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {user.status === 'active' ? 'Actif' : 'Inactif'}
          </span>
        )}
        {user.role && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'Administrateur' ? 'bg-purple-100 text-purple-800' :
            user.role === 'Gestionnaire' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {user.role}
          </span>
        )}
      </div>
    </div>
  )
}

export default UserHeader 