import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathRoundedSquareIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  fetchUserPVs,
  updatePV,
  uploadSignedPVFile,
  fetchPVFollowups,
} from "../api/pvService";
import { useAuth } from "../api/AuthContext";
import supabaseClient from "../api/supabaseClient";

function SignaturePV() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const pvIdFromUrl = searchParams.get("pvId");

  const [pvs, setPVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPvId, setUploadingPvId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [followups, setFollowups] = useState({});

  useEffect(() => {
    if (currentUser?.id) {
      loadPVs(currentUser.id);
      migrateLocalStorageFilesToSupabase();
    }
  }, [currentUser]);

  // Load followups for each PV
  useEffect(() => {
    const loadFollowups = async () => {
      for (const pv of pvs) {
        try {
          const data = await fetchPVFollowups(pv.id);

          setFollowups((prev) => ({
            ...prev,
            [pv.id]: data,
          }));
        } catch (err) {
          console.error("Error loading followups for PV:", pv.id, err);
        }
      }
    };

    if (pvs.length > 0) {
      loadFollowups();
    }
  }, [pvs]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => {
        setUploadError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  const loadPVs = async (userId) => {
    try {
      setLoading(true);

      if (!userId) {
        setError("Vous devez être connecté pour accéder à cette page.");
        setLoading(false);
        return;
      }

      const data = await fetchUserPVs(userId);

      // Map data to ensure consistent field names
      const processedData = data.map((pv) => {
        // If we have signed_at but not signedAt, copy the value
        if (pv.signed_at && !pv.signedAt) {
          pv.signedAt = pv.signed_at;
        }
        // If we have signedAt but not signed_at, copy the value
        if (pv.signedAt && !pv.signed_at) {
          pv.signed_at = pv.signedAt;
        }
        return pv;
      });

      setPVs(processedData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(
        err.message ||
          "Une erreur est survenue lors du chargement des documents"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e, pvId) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingPvId(pvId);
      setUploadError(null);
      setUploadSuccess(null);

      try {
        // Check if we're replacing an existing signed file
        const currentPV = pvs.find((pv) => pv.id === pvId);
        const oldFilePath = currentPV?.signed_file_path;
        const isReplacing = oldFilePath ? true : false;

        // If replacing, and it's a localStorage file, remove the old one
        if (isReplacing && oldFilePath.startsWith("local_signed_")) {
          localStorage.removeItem(`signed_pv_${oldFilePath}`);
        }

        // Upload the signed file
        const result = await uploadSignedPVFile(file, pvId);

        if (!result.success) {
          throw new Error("Upload failed");
        }

        // Reload PVs to update the UI
        await loadPVs(currentUser.id);

        // Show success message
        if (isReplacing) {
          setUploadSuccess(
            `Le document signé a été remplacé avec succès par "${file.name}"`
          );
        } else {
          setUploadSuccess(
            `Document "${file.name}" marqué comme signé avec succès`
          );
        }
      } catch (err) {
        setUploadError(
          err.message ||
            "Une erreur est survenue lors du téléversement du fichier"
        );
      } finally {
        setUploadingPvId(null);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("fr-FR")} à ${date.getHours()}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  // Check if PV is overdue
  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== "Signé";
  };

  // Function to download files from Supabase storage
  const downloadFile = async (filePath) => {
    try {
      if (!filePath) {
        alert("Aucun fichier n'est disponible");
        return;
      }

      // Check if this is a legacy localStorage path (from older implementation)
      if (filePath.startsWith("local_signed_")) {
        alert(
          "Ce fichier doit être téléversé à nouveau car il était stocké dans une ancienne version du système. Veuillez le téléverser à nouveau."
        );
        return;
      }

      // Try to download from Supabase storage
      const tryBuckets = ["pv_files", "public", "files"];
      let downloadUrl = null;

      // Try each bucket until we get a successful signed URL
      for (const bucket of tryBuckets) {
        try {
          const { data, error: bucketError } = await supabaseClient.storage
            .from(bucket)
            .createSignedUrl(filePath, 60);

          if (!bucketError && data) {
            downloadUrl = data.signedUrl;
            break;
          }
        } catch (err) {
          // Continue to the next bucket
        }
      }

      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        throw new Error("Impossible de générer un lien de téléchargement");
      }
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      alert("Erreur lors du téléchargement du fichier: " + error.message);
    }
  };

  // Function to migrate any existing localStorage files to Supabase
  const migrateLocalStorageFilesToSupabase = async () => {
    try {
      // Check for localStorage items that need migration
      const allKeys = Object.keys(localStorage);
      const signedPvKeys = allKeys.filter((key) =>
        key.startsWith("signed_pv_local_signed_")
      );

      if (signedPvKeys.length === 0) {
        return;
      }

      // For each localStorage item, extract PV ID and migrate to Supabase
      for (const key of signedPvKeys) {
        try {
          // Extract PV ID from localStorage key
          const localPathKey = key.replace("signed_pv_", "");
          const pvIdMatch = localPathKey.match(/local_signed_([^_]+)_/);

          if (!pvIdMatch || !pvIdMatch[1]) {
            continue;
          }

          const pvId = pvIdMatch[1];
          const base64Data = localStorage.getItem(key);

          if (!base64Data) {
            continue;
          }

          // Convert base64 to file
          const base64Response = await fetch(base64Data);
          const blob = await base64Response.blob();
          const file = new File([blob], `migrated_${pvId}.pdf`, {
            type: "application/pdf",
          });

          // Upload to Supabase
          await uploadSignedPVFile(file, pvId);

          // Remove from localStorage after successful migration
          localStorage.removeItem(key);
        } catch (err) {
          console.error("Error migrating file:", err);
          // Continue with next file even if one fails
        }
      }
    } catch (err) {
      console.error("Error in migration:", err);
    }
  };

  useEffect(() => {
    // Clear any remaining localStorage/sessionStorage entries
    const cleanupStorage = () => {
      // Get all localStorage keys
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);

      // Remove any PV-related entries from localStorage
      localStorageKeys.forEach((key) => {
        if (
          key.includes("local_signed_") ||
          key.includes("pv_") ||
          key.includes("signed_")
        ) {
          localStorage.removeItem(key);
        }
      });

      // Remove any PV-related entries from sessionStorage
      sessionStorageKeys.forEach((key) => {
        if (
          key.includes("local_signed_") ||
          key.includes("pv_") ||
          key.includes("signed_")
        ) {
          sessionStorage.removeItem(key);
        }
      });
    };

    cleanupStorage();
    loadPVs(currentUser.id);
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Erreur</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Mock data for reminders
  const reminders = {
    // Sample reminders for demo purposes
    "reminder-1": [
      {
        id: 1,
        type: "email",
        sender: "John Doe",
        senderRole: "Chef de projet",
        recipient: "Marie Dupont",
        recipientEmail: "marie.dupont@client.fr",
        date: "2024-03-18T10:30:00",
        message:
          "Bonjour Marie, Pourriez-vous nous retourner le PV signé ? Cordialement",
      },
      {
        id: 2,
        type: "phone",
        sender: "John Doe",
        senderRole: "Chef de projet",
        recipient: "Marie Dupont",
        recipientPhone: "+33 6 12 34 56 78",
        date: "2024-03-15T14:45:00",
        message: "Appel pour rappeler la signature du PV en attente",
      },
    ],
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Documents à signer
      </h1>

      {/* Success message */}
      {uploadSuccess && (
        <div className="mb-4 bg-green-50 border border-green-100 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800">{uploadSuccess}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{uploadError}</span>
          </div>
        </div>
      )}

      <div className="rounded-lg shadow overflow-hidden">
        {pvs.length === 0 ? (
          <div className="bg-white p-10 flex flex-col items-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="mt-2 text-gray-500">
              Aucun document à signer pour le moment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pvs.map((pv) => (
              <div
                key={pv.id}
                className="bg-white p-6 border-b last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{pv.title}</h3>
                    <p
                      className={`text-sm ${
                        isOverdue(pv.due_date, pv.status)
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      Date limite : {formatDate(pv.due_date)}
                      {isOverdue(pv.due_date, pv.status) && (
                        <span className="ml-2 text-red-500">(En retard)</span>
                      )}
                    </p>
                    {/* Display signed status indicator if signed */}
                    {pv.status === "Signé" && (
                      <p className="text-sm text-green-600 mt-1">
                        <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                        Document signé le{" "}
                        {formatDate(pv.signed_at || pv.signedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Download PV button - ALWAYS downloads original PV from file_path */}
                    <button
                      onClick={() => {
                        if (pv.file_path) {
                          downloadFile(pv.file_path);
                        } else if (pv.file_url) {
                          window.open(pv.file_url, "_blank");
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Télécharger le PV
                    </button>

                    {/* Upload signed PV button - ALWAYS show it */}
                    <div className="relative">
                      <input
                        id={`signed-doc-${pv.id}`}
                        className="sr-only"
                        accept=".pdf"
                        type="file"
                        onChange={(e) => handleFileChange(e, pv.id)}
                        disabled={uploadingPvId === pv.id}
                      />
                      <label
                        htmlFor={`signed-doc-${pv.id}`}
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                        border-void text-void bg-white hover:bg-gray-50 ${
                          uploadingPvId === pv.id
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                      >
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        {uploadingPvId === pv.id
                          ? "Chargement..."
                          : "Déposer le PV signé"}
                      </label>
                    </div>

                    {/* Transfer button */}
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void">
                      <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2" />
                      Transférer à un collaborateur
                    </button>
                  </div>
                </div>

                {/* Display a link to view the signed file if it exists */}
                {pv.signed_file_path && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Version signée disponible. </span>
                    <button
                      onClick={() => downloadFile(pv.signed_file_path)}
                      className="ml-1 text-void hover:text-void-dark underline"
                    >
                      Voir le document signé
                    </button>
                  </div>
                )}

                {/* Reminders history section - always show it */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Historique des relances
                  </h4>
                  <div className="space-y-4">
                    {followups[pv.id] && followups[pv.id].length > 0 ? (
                      followups[pv.id].map((followup) => (
                        <div
                          key={followup.id}
                          className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {followup.type === "email" ? (
                              <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                            ) : (
                              <PhoneIcon className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {followup.user?.first_name}{" "}
                                  {followup.user?.last_name}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  {followup.user?.first_name &&
                                  followup.user?.last_name
                                    ? `${followup.user.first_name} ${followup.user.last_name}`
                                    : "Utilisateur"}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {new Date(
                                  followup.created_at
                                ).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "long",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            <div className="mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <UserIcon className="h-4 w-4 mr-1" />
                                <span>À : {pv.client?.name || "Client"}</span>
                                <span className="ml-2">
                                  {followup.type === "email"
                                    ? `(${
                                        pv.client?.email ||
                                        "Email non renseigné"
                                      })`
                                    : `(${
                                        pv.client?.phone ||
                                        "Téléphone non renseigné"
                                      })`}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-700">
                                {followup.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Aucun historique de relance pour ce document
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SignaturePV;
