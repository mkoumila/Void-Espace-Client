import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  CheckIcon,
  TableCellsIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  ListBulletIcon,
  UserCircleIcon,
  TagIcon,
  PaintBrushIcon,
  ChartPieIcon,
  DocumentIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  KeyIcon,
  UserIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

function ProjectDetails() {
  const { projectId } = useParams()
  const [project, setProject] = useState({
    id: 1,
    name: 'Refonte site e-commerce',
    status: 'En cours',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-04-30',
    description: 'Refonte complète du site e-commerce avec nouvelle charte graphique et optimisation des performances.',
    team: [
      { name: 'John Doe', role: 'Chef de projet', email: 'john.doe@void.fr' },
      { name: 'Jane Smith', role: 'Lead Developer', email: 'jane.smith@void.fr' }
    ],
    nextMilestone: {
      title: 'Livraison Front-end',
      date: '2024-03-25',
      description: 'Livraison de l\'interface utilisateur complète'
    },
    milestones: [
      {
        id: 1,
        title: 'Spécifications validées',
        date: '2024-01-20',
        status: 'completed'
      },
      {
        id: 2,
        title: 'Maquettes validées',
        date: '2024-02-15',
        status: 'completed'
      },
      {
        id: 3,
        title: 'Livraison Front-end',
        date: '2024-03-25',
        status: 'in-progress'
      }
    ],
    documents: [
      {
        id: 1,
        title: 'Cahier des charges',
        type: 'PDF',
        date: '2024-01-10',
        fileUrl: '/docs/cdc.pdf'
      },
      {
        id: 2,
        title: 'Maquettes',
        type: 'Figma',
        date: '2024-02-10',
        fileUrl: '/docs/maquettes.pdf'
      }
    ],
    availableSlots: [
      {
        id: 1,
        date: '2024-03-25',
        time: '14:00',
        duration: 60,
        type: 'Visio',
        topic: 'Point de suivi développement'
      },
      {
        id: 2,
        date: '2024-03-27',
        time: '10:00',
        duration: 90,
        type: 'Présentiel',
        topic: 'Présentation des avancées'
      },
      {
        id: 3,
        date: '2024-03-29',
        time: '15:30',
        duration: 60,
        type: 'Visio',
        topic: 'Validation des développements'
      }
    ],
    meetingNotes: [
      {
        id: 1,
        date: '2024-03-20',
        title: 'CR - Traduction Landing Page',
        participants: [
          { name: 'Sara Martin', company: 'MDM' },
          { name: 'John Doe', company: 'VOID' }
        ],
        content: {
          summary: 'Réunion concernant la traduction de la landing page en 4 langues supplémentaires et ajouts de fonctionnalités.',
          topics: [
            {
              title: 'Traduction de la landing page',
              points: [
                {
                  text: 'Toolkit et footer : Conserver ces éléments et renvoyer les liens vers la version anglaise',
                  assignee: 'VOID',
                  status: 'pending'
                },
                {
                  text: 'Création et insertion du contenu initial avec ChatGPT',
                  assignee: 'VOID',
                  status: 'in-progress'
                },
                {
                  text: 'Envoi de la traduction finale',
                  assignee: 'MDM',
                  status: 'pending'
                },
                {
                  text: 'Revoir le mécanisme de changement de langue',
                  assignee: 'VOID & MDM',
                  status: 'pending'
                },
                {
                  text: 'Analyse du tunnel de conversion dans les nouvelles langues',
                  assignee: 'VOID',
                  status: 'pending'
                }
              ]
            },
            {
              title: 'Modifications additionnelles',
              points: [
                {
                  text: 'Ajout d\'une rubrique au menu (vérifier le spacing)',
                  assignee: 'VOID',
                  status: 'pending'
                },
                {
                  text: 'Redirection vers un bloc précis via #',
                  assignee: 'VOID',
                  status: 'pending'
                },
                {
                  text: 'Intégration du contenu Tifinagh',
                  assignee: 'MDM & VOID',
                  status: 'pending'
                }
              ]
            }
          ],
          nextSteps: [
            'Envoi du devis pour la traduction de la LP'
          ]
        }
      }
    ],
    resources: [
      {
        id: 1,
        section: 'Maquettes & Design',
        items: [
          {
            id: 'figma-1',
            title: 'Espace produits - Desktop',
            type: 'Figma',
            category: 'design',
            version: 'v1.2',
            lastUpdate: '2024-03-15',
            url: 'https://www.figma.com/file/...',
            status: 'En cours'
          },
          {
            id: 'figma-2',
            title: 'Espace produits - Mobile',
            type: 'Figma',
            category: 'design',
            version: 'v1.1',
            lastUpdate: '2024-03-14',
            url: 'https://www.figma.com/proto/...',
            status: 'En cours'
          }
        ]
      },
      {
        id: 2,
        section: 'Contenus & Données',
        items: [
          {
            id: 'content-1',
            title: 'Contenus des fiches produits',
            type: 'Google Sheets',
            category: 'content',
            version: null,
            lastUpdate: '2024-03-18',
            url: 'https://docs.google.com/spreadsheets/d/...',
            status: 'En cours',
            progress: 45
          },
          {
            id: 'content-2',
            title: 'Grille tarifaire',
            type: 'Excel',
            category: 'content',
            version: null,
            lastUpdate: '2024-03-20',
            url: '/templates/pricing.xlsx',
            status: 'Validé',
            progress: 100
          }
        ]
      },
      {
        id: 3,
        section: 'Analyses & Rapports',
        items: [
          {
            id: 'analytics-1',
            title: 'Dashboard Performance',
            type: 'Looker Studio',
            category: 'analytics',
            lastUpdate: '2024-03-21',
            url: 'https://lookerstudio.google.com/...',
            status: 'Live'
          },
          {
            id: 'analytics-2',
            title: 'Suivi SEO',
            type: 'Google Data Studio',
            category: 'analytics',
            lastUpdate: '2024-03-19',
            url: 'https://lookerstudio.google.com/...',
            status: 'Live'
          }
        ]
      }
    ],
    testInstance: {
      url: 'rapport-annuel.sooninprod.com',
      credentials: {
        username: 'user',
        password: '1234'
      },
      lastDeployment: '2024-03-20T14:30:00'
    }
  })

  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availableDays] = useState([
    {
      date: '2024-03-25',
      slots: [
        { time: '09:30', available: true },
        { time: '10:00', available: true },
        { time: '10:30', available: true },
        { time: '11:00', available: false },
        { time: '14:00', available: true },
        { time: '14:30', available: true },
        { time: '15:00', available: true },
        { time: '15:30', available: true }
      ]
    },
    {
      date: '2024-03-26',
      slots: [
        { time: '09:30', available: true },
        { time: '10:00', available: true },
        { time: '14:00', available: true },
        { time: '14:30', available: true },
        { time: '15:00', available: true }
      ]
    }
  ])

  const [credentialsCopied, setCredentialsCopied] = useState(null)

  const handleSlotSelection = (date, time) => {
    setSelectedSlot({ date, time })
    // TODO: Implémenter la logique de réservation
  }

  const getResourceIcon = (category) => {
    switch (category) {
      case 'design':
        return <PaintBrushIcon className="h-5 w-5 text-indigo-500" />
      case 'content':
        return <TableCellsIcon className="h-5 w-5 text-green-500" />
      case 'analytics':
        return <ChartPieIcon className="h-5 w-5 text-blue-500" />
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Validé':
        return 'bg-green-100 text-green-800'
      case 'En cours':
        return 'bg-blue-100 text-blue-800'
      case 'Live':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCredentialsCopied(type)
    setTimeout(() => setCredentialsCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header avec nouveau bouton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/projects" className="text-gray-500 hover:text-void">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">Projet #{projectId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium 
            ${project.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            {project.status}
          </span>
          <Link
            to={`/projects/${projectId}/audit`}
            className="inline-flex items-center px-4 py-2 border border-void rounded-md shadow-sm text-sm font-medium text-void hover:bg-void hover:text-white transition-colors"
          >
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Audit de sécurité
          </Link>
        </div>
      </div>

      {project.testInstance && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-indigo-900">
                  Instance de test
                </h2>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://${project.testInstance.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-700 hover:text-indigo-900 font-medium"
                      >
                        {project.testInstance.url}
                      </a>
                      <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                        Mis à jour le {new Date(project.testInstance.lastDeployment).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-md border border-indigo-200">
                        <UserIcon className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm text-indigo-700 font-medium">
                          {project.testInstance.credentials.username}
                        </span>
                        <button
                          onClick={() => copyToClipboard(project.testInstance.credentials.username, 'username')}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-md border border-indigo-200">
                        <KeyIcon className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm text-indigo-700 font-medium">
                          {project.testInstance.credentials.password}
                        </span>
                        <button
                          onClick={() => copyToClipboard(project.testInstance.credentials.password, 'password')}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {credentialsCopied && (
                  <div className="mt-2 text-sm text-indigo-600">
                    {credentialsCopied === 'username' ? 'Identifiant copié !' : 'Mot de passe copié !'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">À propos du projet</h2>
            <p className="text-gray-600">{project.description}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span>
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span>Progression : {project.progress}%</span>
              </div>
            </div>
          </div>

          {/* Jalons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Jalons du projet</h2>
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center">
                  <div className={`flex-shrink-0 w-4 h-4 rounded-full mr-4 
                    ${milestone.status === 'completed' ? 'bg-green-400' : 'bg-blue-400'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{milestone.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comptes-rendus de réunion */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Comptes-rendus de réunion</h2>
            
            <div className="space-y-6">
              {project.meetingNotes.map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{note.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(note.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex -space-x-2">
                        {note.participants.map((participant, index) => (
                          <div 
                            key={index}
                            className="relative group"
                          >
                            <div className="w-8 h-8 rounded-full bg-void text-white flex items-center justify-center ring-2 ring-white">
                              {participant.name.charAt(0)}
                            </div>
                            <div className="absolute bottom-full mb-2 hidden group-hover:block">
                              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                {participant.name} ({participant.company})
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-gray-600 mb-4">{note.content.summary}</p>

                    <div className="space-y-6">
                      {note.content.topics.map((topic, index) => (
                        <div key={index}>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <ListBulletIcon className="h-5 w-5 text-gray-400 mr-2" />
                            {topic.title}
                          </h4>
                          <div className="space-y-3 ml-7">
                            {topic.points.map((point, pIndex) => (
                              <div 
                                key={pIndex}
                                className="flex items-start"
                              >
                                <div className="flex-1">
                                  <p className="text-gray-600">{point.text}</p>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <span className="flex items-center text-sm text-gray-500">
                                      <UserCircleIcon className="h-4 w-4 mr-1" />
                                      {point.assignee}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                      ${point.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        point.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'}`}
                                    >
                                      {point.status === 'completed' ? 'Terminé' :
                                        point.status === 'in-progress' ? 'En cours' :
                                        'À faire'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {note.content.nextSteps.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                          Prochaines étapes
                        </h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-7">
                          {note.content.nextSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Ressources du projet</h2>

            <div className="space-y-8">
              {project.resources.map((section) => (
                <div key={section.id}>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    {section.section}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-void transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getResourceIcon(item.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item.title}
                                </h4>
                                <div className="mt-1 flex items-center space-x-2 text-sm">
                                  <span className="text-gray-500">
                                    {item.type}
                                  </span>
                                  {item.version && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                      {item.version}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>

                            {item.progress !== undefined && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Progression</span>
                                  <span>{item.progress}%</span>
                                </div>
                                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-void h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Mis à jour le {new Date(item.lastUpdate).toLocaleDateString()}
                              </span>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-void hover:text-void-light group"
                              >
                                Ouvrir
                                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Équipe */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Équipe projet</h2>
            <div className="space-y-4">
              {project.team.map((member, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-void text-white flex items-center justify-center">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                    <a href={`mailto:${member.email}`} className="text-sm text-void hover:text-void-light">
                      {member.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
            <div className="space-y-3">
              {project.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg group"
                >
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 group-hover:text-void" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Bloc des créneaux disponibles */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Réserver un créneau</h2>
              <div className="flex items-center space-x-3">
                <span className="flex items-center text-sm text-gray-500">
                  <VideoCameraIcon className="h-4 w-4 text-blue-500 mr-1" />
                  Visioconférence
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <BuildingOfficeIcon className="h-4 w-4 text-green-500 mr-1" />
                  Présentiel
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {availableDays.map((day) => (
                <div key={day.date} className="border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                    <h3 className="font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {day.slots.map((slot) => (
                      <button
                        key={`${day.date}-${slot.time}`}
                        onClick={() => handleSlotSelection(day.date, slot.time)}
                        disabled={!slot.available}
                        className={`
                          px-3 py-2 rounded-md text-sm font-medium
                          ${slot.available 
                            ? 'hover:bg-void hover:text-white border border-void text-void' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                          ${selectedSlot?.date === day.date && selectedSlot?.time === slot.time
                            ? 'bg-void text-white'
                            : ''}
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedSlot && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Créneau sélectionné : {new Date(selectedSlot.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })} à {selectedSlot.time}
                  </div>
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Confirmer le rendez-vous
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails 