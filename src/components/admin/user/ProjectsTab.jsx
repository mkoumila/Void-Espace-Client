import { Link } from 'react-router-dom'

function ProjectsTab({ projects }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Projets associés</h2>
      <div className="grid grid-cols-1 gap-4">
        {projects.map(project => (
          <div 
            key={project.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
              <Link
                to={`/projects/${project.id}`}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Voir le projet
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsTab 