import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DocumentCheckIcon,
  DocumentPlusIcon,
  FunnelIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import supabaseClient from "../../../api/supabaseClient";
import { downloadPVFile } from "../../../api/pvService";
import DocumentDetails from "./DocumentDetails";

function DocumentsTab({ user, documents, onCreatePV, onUpdateDocument }) {
  const [documentsPage, setDocumentsPage] = useState(1);
  const [documentsPerPage] = useState(3);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [documentStatusFilter, setDocumentStatusFilter] = useState("all");
  const [documentProjectFilter, setDocumentProjectFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Filtrage des documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
      doc.project.toLowerCase().includes(documentSearchQuery.toLowerCase());
    const matchesStatus =
      documentStatusFilter === "all" ||
      (documentStatusFilter === "signed" && doc.status === "Signé") ||
      (documentStatusFilter === "pending" && doc.status === "En attente de signature");
    const matchesProject =
      documentProjectFilter === "all" || doc.project === documentProjectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  // Pagination des documents
  const indexOfLastDocument = documentsPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );
  const totalDocumentsPages = Math.ceil(
    filteredDocuments.length / documentsPerPage
  );

  // Liste des projets uniques pour le filtre
  const uniqueProjects = [...new Set(documents.map((doc) => doc.project))];

  // Fonction pour gérer la mise à jour d'un document
  const handleDocumentUpdate = (updatedDocument) => {
    // Mettre à jour le document sélectionné localement
    setSelectedDocument(updatedDocument);
    // Propager la mise à jour au composant parent
    if (onUpdateDocument) {
      onUpdateDocument(updatedDocument);
    }
  };

  const handleDownload = async (filePath) => {
    try {
      const { data, error } = await downloadPVFile(filePath);
      
      if (error) throw error;

      // Create a blob from the file data
      const blob = new Blob([data], { type: "application/pdf" });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = filePath; // Use the original filename

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Erreur lors du téléchargement du fichier");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Documents et PVs</h2>
        <button
          onClick={onCreatePV}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
        >
          <DocumentPlusIcon className="h-5 w-5 mr-2" />
          Créer un PV
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={documentSearchQuery}
              onChange={(e) => setDocumentSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              placeholder="Rechercher par titre ou projet..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={documentStatusFilter}
              onChange={(e) => setDocumentStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
            >
              <option value="all">Tous les status</option>
              <option value="signed">Signés</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <FolderIcon className="h-5 w-5 text-gray-400" />
            <select
              value={documentProjectFilter}
              onChange={(e) => setDocumentProjectFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
            >
              <option value="all">Tous les projets</option>
              {uniqueProjects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {currentDocuments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-start space-x-3">
                  <DocumentCheckIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-500">
                        Projet : {doc.project}
                      </p>
                      <p className="text-sm text-gray-500">
                        Créé le {new Date(doc.date).toLocaleDateString()}
                      </p>
                    </div>
                    {doc.signedAt && (
                      <p className="text-sm text-green-600 mt-1">
                        Signé le {new Date(doc.signedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Détails
                  </button>
                  <button
                    onClick={() => handleDownload(doc.file_path)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Aucun document trouvé
          </div>
        )}

        {/* Pagination */}
        {filteredDocuments.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setDocumentsPage(Math.max(1, documentsPage - 1))}
                disabled={documentsPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() =>
                  setDocumentsPage(
                    Math.min(totalDocumentsPages, documentsPage + 1)
                  )
                }
                disabled={documentsPage === totalDocumentsPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{" "}
                  <span className="font-medium">
                    {indexOfFirstDocument + 1}
                  </span>{" "}
                  à{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastDocument, filteredDocuments.length)}
                  </span>{" "}
                  sur{" "}
                  <span className="font-medium">
                    {filteredDocuments.length}
                  </span>{" "}
                  documents
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setDocumentsPage(Math.max(1, documentsPage - 1))
                    }
                    disabled={documentsPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {[...Array(totalDocumentsPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setDocumentsPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        documentsPage === i + 1
                          ? "z-10 bg-void border-void text-white"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setDocumentsPage(
                        Math.min(totalDocumentsPages, documentsPage + 1)
                      )
                    }
                    disabled={documentsPage === totalDocumentsPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails du document */}
      {selectedDocument && (
        <DocumentDetails
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onUpdateDocument={handleDocumentUpdate}
        />
      )}
    </div>
  );
}

export default DocumentsTab;
