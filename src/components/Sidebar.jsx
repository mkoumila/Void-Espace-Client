import { Link, useLocation } from 'react-router-dom'
import UserProfile from './UserProfile'
import { useAuth } from '../api/AuthContext'
import { navigationItems, filterNavigationByPermission } from '../config/navigationItems'

// Navigation item component
const NavItem = ({ item, isActive }) => {
  const { name, href, icon: Icon } = item
  
  return (
    <Link
      to={href}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-void text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{name}</span>
    </Link>
  )
}

// Divider component
const Divider = () => <div className="border-t border-gray-200 my-4" />

function Sidebar() {
  const location = useLocation()
  const { hasPermission } = useAuth()
  
  // Filter navigation items based on user permissions
  const filteredNavigation = filterNavigationByPermission(navigationItems, hasPermission)

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavigation.map((item, index) => {
          if (item.type === 'divider') {
            return hasPermission('admin') ? <Divider key={`divider-${index}`} /> : null
          }
          
          const isActive = location.pathname === item.href
          return <NavItem key={item.name} item={item} isActive={isActive} />
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <UserProfile />
      </div>
    </div>
  )
}

export default Sidebar 