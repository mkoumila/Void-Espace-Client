import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-void to-void-light h-16 fixed w-full top-0 z-50 shadow-md">
      <div className="max-w-[1920px] h-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo et nom */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="VOID Logo" 
                className="w-32 h-8 brightness-0 invert transition-all duration-200 hover:scale-105" 
              />
              <div className="h-8 w-px bg-gray-200/20"></div>
              <span className="text-white font-medium tracking-wide">
                Espace Client
              </span>
            </Link>

            {/* Environnement */}
            <div className="hidden md:flex items-center">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                Production
              </span>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="hidden md:flex items-center space-x-6 text-gray-200 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Tous les services opérationnels</span>
            </div>
            <div className="h-4 w-px bg-gray-200/20"></div>
            <div className="flex items-center space-x-1">
              <span>Dernière connexion :</span>
              <span className="text-white">
                {new Date().toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression subtile en bas de la navbar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/5">
        <div className="h-full w-1/3 bg-gradient-to-r from-white/20 to-white/10 rounded-full"></div>
      </div>
    </nav>
  )
}

export default Navbar 