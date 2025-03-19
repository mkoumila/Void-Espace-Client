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
import PVDetails from "./PVDetails";

function PVTab({ user, pvs, onCreatePV, onUpdatePV }) {
  const [pvsPage, setPvsPage] = useState(1);
  const [pvsPerPage] = useState(3);
  const [pvSearchQuery, setPvSearchQuery] = useState("");
  const [pvStatusFilter, setPvStatusFilter] = useState("all");
  const [pvProjectFilter, setPvProjectFilter] = useState("all");
  const [selectedPV, setSelectedPV] = useState(null);

  // Filtrage des PVs
  const filteredPVs = pvs.filter((pv) => {
    const matchesSearch =
      pv.title.toLowerCase().includes(pvSearchQuery.toLowerCase()) ||
      pv.project.toLowerCase().includes(pvSearchQuery.toLowerCase());
    const matchesStatus =
      pvStatusFilter === "all" ||
      (pvStatusFilter === "signed" && pv.status === "Signé") ||
      (pvStatusFilter === "pending" && pv.status === "En attente de signature");
    const matchesProject =
      pvProjectFilter === "all" || pv.project === pvProjectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  // Pagination des PVs
  const indexOfLastPV = pvsPage * pvsPerPage;
  const indexOfFirstPV = indexOfLastPV - pvsPerPage;
  const currentPVs = filteredPVs.slice(indexOfFirstPV, indexOfLastPV);
  const totalPVsPages = Math.ceil(filteredPVs.length / pvsPerPage);

  // Liste des projets uniques pour le filtre
  const uniqueProjects = [...new Set(pvs.map((pv) => pv.project))];

  // Fonction pour gérer la mise à jour d'un PV
  const handlePVUpdate = (updatedPV) => {
    // Mettre à jour le PV sélectionné localement
    setSelectedPV(updatedPV);
    // Propager la mise à jour au composant parent
    if (onUpdatePV) {
      onUpdatePV(updatedPV);
    }
  };

  const handleDownload = async (filePath) => {
    try {
      console.log("Downloading file from Supabase storage:", filePath);

      // Check if this is a legacy localStorage path (from older implementation)
      if (filePath.startsWith("local_signed_")) {
        alert(
          "Ce fichier doit être téléversé à nouveau car il était stocké dans une ancienne version du système. Veuillez le téléverser à nouveau."
        );
        return;
      }

      // Download from Supabase storage
      const { data, error } = await downloadPVFile(filePath);

      if (error) {
        console.error("Storage download error:", error);
        throw error;
      }

      // Create a blob from the file data
      const blob = new Blob([data], { type: "application/pdf" });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = filePath.split("/").pop(); // Extract filename from path

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Erreur lors du téléchargement du fichier: " + error.message);
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
              value={pvSearchQuery}
              onChange={(e) => setPvSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              placeholder="Rechercher par titre ou projet..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={pvStatusFilter}
              onChange={(e) => setPvStatusFilter(e.target.value)}
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
              value={pvProjectFilter}
              onChange={(e) => setPvProjectFilter(e.target.value)}
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

      {/* Liste des PVs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {currentPVs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentPVs.map((pv) => (
              <div
                key={pv.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-start space-x-3">
                  <DocumentCheckIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{pv.title}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-500">
                        Projet : {pv.project}
                      </p>
                      <p className="text-sm text-gray-500">
                        Créé le {new Date(pv.date).toLocaleDateString()}
                      </p>
                    </div>
                    {pv.status === "Signé" && (pv.signedAt || pv.signed_at) && (
                      <p className="text-sm text-green-600 mt-1">
                        Signé le{" "}
                        {new Date(
                          pv.signedAt || pv.signed_at
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPV(pv)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Détails
                  </button>
                  <button
                    onClick={() => handleDownload(pv.file_path)}
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
        {filteredPVs.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPvsPage(Math.max(1, pvsPage - 1))}
                disabled={pvsPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPvsPage(Math.min(totalPVsPages, pvsPage + 1))}
                disabled={pvsPage === totalPVsPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{" "}
                  <span className="font-medium">{indexOfFirstPV + 1}</span> à{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastPV, filteredPVs.length)}
                  </span>{" "}
                  sur <span className="font-medium">{filteredPVs.length}</span>{" "}
                  documents
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPvsPage(Math.max(1, pvsPage - 1))}
                    disabled={pvsPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {[...Array(totalPVsPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPvsPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pvsPage === i + 1
                          ? "z-10 bg-void border-void text-white"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setPvsPage(Math.min(totalPVsPages, pvsPage + 1))
                    }
                    disabled={pvsPage === totalPVsPages}
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
      {selectedPV && (
        <PVDetails
          document={selectedPV}
          onClose={() => setSelectedPV(null)}
          onUpdateDocument={handlePVUpdate}
        />
      )}
    </div>
  );
}

export default PVTab;
