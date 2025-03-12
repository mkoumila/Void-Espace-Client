import { useState } from 'react'
import { 
  EnvelopeIcon, 
  PencilSquareIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  BellIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

function AdminSettings() {
  // État pour les modèles d'emails
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: 'Relance PV - 1er rappel',
      subject: 'Rappel : Signature de PV en attente',
      body: `Bonjour {nom},

Nous vous rappelons que le document "{titre_document}" est en attente de votre signature depuis le {date_envoi}.

Vous pouvez accéder à ce document directement via votre espace client : {lien_document}

Cordialement,
L'équipe VOID`,
      lastUsed: '2024-03-15',
      category: 'signature'
    },
    {
      id: 2,
      name: 'Relance PV - 2ème rappel',
      subject: 'URGENT : Signature de PV en attente',
      body: `Bonjour {nom},

Nous n'avons toujours pas reçu votre signature pour le document "{titre_document}" envoyé le {date_envoi}.

Cette signature est nécessaire pour poursuivre le projet. Merci de vous connecter à votre espace client pour le signer : {lien_document}

Cordialement,
L'équipe VOID`,
      lastUsed: '2024-03-18',
      category: 'signature'
    },
    {
      id: 3,
      name: 'Relance paiement',
      subject: 'Rappel : Facture en attente de règlement',
      body: `Bonjour {nom},

Nous vous rappelons que la facture n°{numero_facture} d'un montant de {montant_facture}€ est en attente de règlement depuis le {date_echeance}.

Vous pouvez consulter cette facture dans votre espace client : {lien_facture}

Cordialement,
L'équipe VOID`,
      lastUsed: '2024-02-20',
      category: 'payment'
    }
  ])

  // État pour les paramètres de notification
  const [notificationSettings, setNotificationSettings] = useState({
    automaticReminders: true,
    reminderDelay: 7, // jours
    escalationDelay: 14, // jours
    sendCopyTo: 'admin@void.fr'
  })

  // État pour l'édition d'un modèle
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Fonction pour copier un modèle dans le presse-papier
  const copyTemplateToClipboard = (templateId) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (template) {
      navigator.clipboard.writeText(template.body)
      // TODO: Afficher une notification de succès
    }
  }

  // Fonction pour éditer un modèle
  const handleEditTemplate = (template) => {
    setEditingTemplate({...template})
    setShowTemplateModal(true)
  }

  // Fonction pour sauvegarder un modèle
  const handleSaveTemplate = (e) => {
    e.preventDefault()
    
    if (editingTemplate.id) {
      // Mise à jour d'un modèle existant
      setEmailTemplates(emailTemplates.map(template => 
        template.id === editingTemplate.id ? editingTemplate : template
      ))
    } else {
      // Création d'un nouveau modèle
      setEmailTemplates([
        ...emailTemplates, 
        {
          ...editingTemplate,
          id: emailTemplates.length + 1,
          lastUsed: null
        }
      ])
    }
    
    setShowTemplateModal(false)
    setEditingTemplate(null)
  }

  // Fonction pour supprimer un modèle
  const handleDeleteTemplate = (templateId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      setEmailTemplates(emailTemplates.filter(template => template.id !== templateId))
    }
  }

  // Fonction pour mettre à jour les paramètres de notification
  const handleNotificationSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres d'administration</h1>

      {/* Section des modèles d'emails */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-2" />
            Modèles d'emails
          </h2>
          <button
            onClick={() => {
              setEditingTemplate({
                name: '',
                subject: '',
                body: '',
                category: 'signature'
              })
              setShowTemplateModal(true)
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau modèle
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4 mb-4">
            <button className="px-4 py-2 bg-void text-white rounded-md">Tous</button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Signatures</button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Paiements</button>
          </div>

          {emailTemplates.map(template => (
            <div 
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-void transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Objet : {template.subject}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.category === 'signature' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {template.category === 'signature' ? 'Signature' : 'Paiement'}
                    </span>
                    {template.lastUsed && (
                      <span className="text-xs text-gray-500">
                        Dernière utilisation : {new Date(template.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyTemplateToClipboard(template.id)}
                    className="p-1 text-gray-400 hover:text-void"
                    title="Copier le contenu"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-1 text-gray-400 hover:text-void"
                    title="Modifier"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto whitespace-pre-line">
                {template.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section des paramètres de notification */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <BellIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Paramètres de notification</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="automaticReminders"
                name="automaticReminders"
                type="checkbox"
                checked={notificationSettings.automaticReminders}
                onChange={handleNotificationSettingsChange}
                className="focus:ring-void h-4 w-4 text-void border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="automaticReminders" className="font-medium text-gray-700">
                Activer les relances automatiques
              </label>
              <p className="text-gray-500">
                Envoie automatiquement des rappels pour les documents non signés et les factures impayées
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="reminderDelay" className="block text-sm font-medium text-gray-700">
                Délai avant première relance (jours)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  name="reminderDelay"
                  id="reminderDelay"
                  value={notificationSettings.reminderDelay}
                  onChange={handleNotificationSettingsChange}
                  min="1"
                  max="30"
                  className="shadow-sm focus:ring-void focus:border-void block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <ClockIcon className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>

            <div>
              <label htmlFor="escalationDelay" className="block text-sm font-medium text-gray-700">
                Délai avant seconde relance (jours)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  name="escalationDelay"
                  id="escalationDelay"
                  value={notificationSettings.escalationDelay}
                  onChange={handleNotificationSettingsChange}
                  min="1"
                  max="60"
                  className="shadow-sm focus:ring-void focus:border-void block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <ClockIcon className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="sendCopyTo" className="block text-sm font-medium text-gray-700">
              Envoyer une copie des relances à
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="email"
                name="sendCopyTo"
                id="sendCopyTo"
                value={notificationSettings.sendCopyTo}
                onChange={handleNotificationSettingsChange}
                className="shadow-sm focus:ring-void focus:border-void block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <EnvelopeIcon className="h-5 w-5 text-gray-400 ml-2" />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Adresse email qui recevra une copie de toutes les relances envoyées
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Enregistrer les paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Section des paramètres de documents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Paramètres des documents</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Durée de validité des PV (jours)
            </label>
            <div className="mt-1">
              <input
                type="number"
                min="1"
                max="90"
                defaultValue="30"
                className="shadow-sm focus:ring-void focus:border-void block w-48 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Nombre de jours pendant lesquels un PV peut être signé avant expiration
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Formats de fichiers acceptés pour les PV
            </label>
            <div className="mt-1 space-y-2">
              <div className="flex items-center">
                <input
                  id="pdf"
                  name="fileFormats"
                  type="checkbox"
                  defaultChecked
                  className="focus:ring-void h-4 w-4 text-void border-gray-300 rounded"
                />
                <label htmlFor="pdf" className="ml-2 text-sm text-gray-700">
                  PDF (.pdf)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="docx"
                  name="fileFormats"
                  type="checkbox"
                  defaultChecked
                  className="focus:ring-void h-4 w-4 text-void border-gray-300 rounded"
                />
                <label htmlFor="docx" className="ml-2 text-sm text-gray-700">
                  Word (.docx)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="jpg"
                  name="fileFormats"
                  type="checkbox"
                  className="focus:ring-void h-4 w-4 text-void border-gray-300 rounded"
                />
                <label htmlFor="jpg" className="ml-2 text-sm text-gray-700">
                  Image (.jpg, .png)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Enregistrer les paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'édition de modèle */}
      {showTemplateModal && editingTemplate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTemplate.id ? 'Modifier le modèle' : 'Nouveau modèle'}
            </h3>
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du modèle
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objet de l'email
                </label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                >
                  <option value="signature">Signature</option>
                  <option value="payment">Paiement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu de l'email
                </label>
                <textarea
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                  rows={10}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Variables disponibles : {'{nom}'}, {'{titre_document}'}, {'{date_envoi}'}, {'{lien_document}'}, {'{numero_facture}'}, {'{montant_facture}'}, {'{date_echeance}'}
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTemplateModal(false)
                    setEditingTemplate(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                >
                  {editingTemplate.id ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings 