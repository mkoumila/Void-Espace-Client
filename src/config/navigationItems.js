import { 
  HomeIcon, 
  DocumentCheckIcon, 
  CreditCardIcon, 
  FolderIcon, 
  WrenchScrewdriverIcon, 
  CalculatorIcon, 
  UserGroupIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

// Main navigation item definitions
export const navigationItems = [
  { 
    name: 'Tableau de bord', 
    href: '/', 
    icon: HomeIcon,
    description: "Aperçu de votre espace client"
  },
  { 
    name: 'Projets en cours', 
    href: '/projects', 
    icon: FolderIcon,
    description: "Vos projets en cours et terminés"
  },
  { 
    name: 'TMA', 
    href: '/tma', 
    icon: WrenchScrewdriverIcon,
    description: "Tierce Maintenance Applicative"
  },
  { 
    name: 'Devis', 
    href: '/quotes', 
    icon: CalculatorIcon,
    description: "Vos devis en attente et validés"
  },
  { 
    name: 'Signatures PV', 
    href: '/signature-pv', 
    icon: DocumentCheckIcon,
    description: "Procès-verbaux de recette à signer"
  },
  { 
    name: 'Paiements', 
    href: '/payments', 
    icon: CreditCardIcon,
    description: "Historique de vos paiements"
  },
  { type: 'divider' },
  { 
    name: 'Administration', 
    href: '/admin', 
    icon: UserGroupIcon, 
    requireAdmin: true,
    description: "Gestion des utilisateurs et clients"
  },
  { 
    name: 'Paramètres', 
    href: '/admin/settings', 
    icon: Cog6ToothIcon, 
    requireAdmin: true,
    description: "Configuration de l'application"
  }
]

// Helper function to filter navigation items based on user permissions
export function filterNavigationByPermission(navigationItems, hasPermission) {
  return navigationItems.filter(item => 
    !item.requireAdmin || hasPermission('admin')
  )
} 