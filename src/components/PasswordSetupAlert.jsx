import { Fragment, useState } from 'react'
import { Transition } from '@headlessui/react'
import { KeyIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

function PasswordSetupAlert() {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Transition
        as={Fragment}
        show={show}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <KeyIcon className="h-6 w-6 text-void" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Sécurisez votre compte
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Pour votre sécurité, veuillez définir votre mot de passe personnel.
                </p>
                <div className="mt-4 flex">
                  <Link
                    to="/setup-password"
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                  >
                    Créer mon mot de passe
                  </Link>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShow(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default PasswordSetupAlert 