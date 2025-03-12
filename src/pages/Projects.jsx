import { useState } from 'react'
import { CalendarIcon, ClockIcon, UserGroupIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

function Projects() {
  const [projects] = useState([
    {
      id: 1,
      name: 'Refonte site e-commerce',
      status: 'En cours',
      progress: 65,
      startDate: '2024-01-15',
      endDate: '2024-04-30',
      team: ['John Doe', 'Jane Smith'],
      nextMilestone: 'Livraison Front-end',
      nextMilestoneDate: '2024-03-25',
    },
    {
      id: 2,
      name: 'Application mobile iOS',
      status: 'En attente validation',
      progress: 90,
      startDate: '2024-02-01',
      endDate: '2024-03-31',
      team: ['Alice Johnson'],
      nextMilestone: 'Validation client',
      nextMilestoneDate: '2024-03-20',
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projets en cours</h1>
        <div className="flex space-x-3">
          <select className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void">
            <option>Tous les projets</option>
            <option>En cours</option>
            <option>En attente</option>
            <option>Terminés</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <Link 
                  to={`/projects/${project.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-void"
                >
                  {project.name}
                </Link>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  project.status === 'En cours' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <Link
                to={`/projects/${project.id}`}
                className="text-sm text-void hover:text-void-light flex items-center"
              >
                Voir les détails
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                <span>{project.team.join(', ')}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                  <div
                    style={{ width: `${project.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-void"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <span className="text-gray-500">Prochaine étape : </span>
                  <span className="font-medium text-gray-900">{project.nextMilestone}</span>
                  <span className="text-gray-500 ml-2">
                    ({new Date(project.nextMilestoneDate).toLocaleDateString()})
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects 