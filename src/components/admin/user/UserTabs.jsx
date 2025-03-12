import { Link } from 'react-router-dom'
import { 
  UserIcon,
  DocumentTextIcon,
  CreditCardIcon,
  FolderIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline'

function UserTabs({ userId, activeTab }) {
  const tabs = [
    {
      id: 'profile',
      path: `/admin/users/${userId}`,
      icon: UserIcon,
      label: 'Profil'
    },
    {
      id: 'documents',
      path: `/admin/users/${userId}/documents`,
      icon: DocumentTextIcon,
      label: 'Documents et PVs'
    },
    {
      id: 'payments',
      path: `/admin/users/${userId}/payments`,
      icon: CreditCardIcon,
      label: 'Paiements'
    },
    {
      id: 'quotes',
      path: `/admin/users/${userId}/quotes`,
      icon: CalculatorIcon,
      label: 'Devis'
    },
    {
      id: 'projects',
      path: `/admin/users/${userId}/projects`,
      icon: FolderIcon,
      label: 'Projets'
    }
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-void text-void'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 inline mr-2" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default UserTabs 