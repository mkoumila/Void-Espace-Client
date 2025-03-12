import { useState } from 'react'
import { KeyIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

function SetupPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    // TODO: Appel API pour sauvegarder le mot de passe
    console.log('Mot de passe défini avec succès')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-void/5 flex items-center justify-center rounded-lg">
          <KeyIcon className="h-6 w-6 text-void" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Créez votre mot de passe
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Ce mot de passe vous permettra de vous connecter de manière sécurisée à votre espace client
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-void focus:ring-void sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmez le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-void focus:ring-void sm:text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
        >
          Définir le mot de passe
        </button>
      </form>
    </div>
  )
}

export default SetupPassword 