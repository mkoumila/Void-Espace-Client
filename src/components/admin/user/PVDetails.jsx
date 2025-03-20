import { useState, useEffect } from "react";
import {
  DocumentIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import supabaseClient from "../../../api/supabaseClient";
import {
  uploadSignedPVFile,
  downloadPVFile,
  fetchPVFollowups,
  createPVFollowup,
} from "../../../api/pvService";

function PVDetails({ document: pv, onClose, onUpdateDocument: onUpdatePV }) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [emailContent, setEmailContent] = useState(`Bonjour,

Nous vous rappelons que le document "${pv.title}" est en attente de signature.
Merci de bien vouloir le signer dès que possible.

Cordialement,`);
  const [phoneContent, setPhoneContent] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [followups, setFollowups] = useState([]);
  const [editedOriginalFile, setEditedOriginalFile] = useState(null);
  const [uploadedSignedFile, setUploadedSignedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // État pour les informations de transfert
  const hasBeenTransferred = pv.transferredTo && pv.transferredTo.name;

  // Format date function to fix the error
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Clear success and error messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Fetch followups when component mounts
  useEffect(() => {
    const loadFollowups = async () => {
      try {
        const data = await fetchPVFollowups(pv.id);
        setFollowups(data);
      } catch (err) {
        console.error("Error loading followups:", err);
      }
    };
    loadFollowups();
  }, [pv.id]);

  // Handle email followup
  const handleEmailRelance = async () => {
    try {
      if (!emailContent.trim()) {
        setErrorMessage("Le contenu de la relance ne peut pas être vide.");
        return;
      }

      const followupData = {
        email: true,
        comment: emailContent,
        created_by: (await supabaseClient.auth.getUser()).data.user.id,
      };

      const newFollowup = await createPVFollowup(pv.id, followupData);

      // Update followups state
      setFollowups((prev) => [newFollowup, ...prev]);
      setShowEmailForm(false);
      setEmailContent(`Bonjour,

Nous vous rappelons que le document "${pv.title}" est en attente de signature.
Merci de bien vouloir le signer dès que possible.

Cordialement,`);
      setSuccessMessage("Relance par email enregistrée avec succès");
    } catch (err) {
      console.error("Error creating email followup:", err);
      setErrorMessage("Erreur lors de la création de la relance par email.");
    }
  };

  // Handle phone followup
  const handlePhoneRelance = async () => {
    try {
      if (!phoneContent.trim()) {
        setErrorMessage("Le résumé de l'appel ne peut pas être vide.");
        return;
      }

      const followupData = {
        email: false,
        comment: phoneContent,
        created_by: (await supabaseClient.auth.getUser()).data.user.id,
      };

      const newFollowup = await createPVFollowup(pv.id, followupData);

      // Update followups state
      setFollowups((prev) => [newFollowup, ...prev]);
      setShowPhoneForm(false);
      setPhoneContent("");
      setSuccessMessage("Relance téléphonique enregistrée avec succès");
    } catch (err) {
      console.error("Error creating phone followup:", err);
      setErrorMessage("Erreur lors de la création de la relance téléphonique.");
    }
  };

  const handleSignedFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if it's a valid file format
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      const validExtensions = [
        ".pdf",
        ".doc",
        ".docx",
        ".jpg",
        ".jpeg",
        ".png",
      ];

      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (
        validTypes.includes(file.type) ||
        validExtensions.includes(fileExtension)
      ) {
        setUploadedSignedFile(file);
        setSuccessMessage("");
      } else {
        setErrorMessage(
          "Format de fichier non valide. Veuillez sélectionner un fichier PDF, DOC, DOCX ou une image (JPG, PNG)."
        );
      }
    }
  };

  const handleOriginalFileEdit = (e) => {
    if (e.target.files[0]) {
      setEditedOriginalFile(e.target.files[0]);
    }
  };

  const displayBase64File = (base64Data) => {
    if (!base64Data) return;
    window.open(base64Data, "_blank");
  };

  const handleSaveSignedFile = async () => {
    if (uploadedSignedFile) {
      try {
        setIsUploading(true);
        setSuccessMessage("");

        // Use the pvService to upload the signed file
        const result = await uploadSignedPVFile(uploadedSignedFile, pv.id);

        if (!result.success) {
          throw new Error("L'upload a échoué");
        }

        // Update the local state with the returned data
        onUpdatePV(result.data);
        setUploadedSignedFile(null);
        setSuccessMessage("Le document signé a été enregistré avec succès.");
      } catch (error) {
        console.error("Error uploading signed file:", error);
        setErrorMessage("Une erreur est survenue: " + error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveEditedOriginalFile = async () => {
    if (editedOriginalFile) {
      try {
        setIsUploading(true);

        // Generate a unique filename
        const fileExt = editedOriginalFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload the file to storage
        const { error: uploadError } = await supabaseClient.storage
          .from("pv_files")
          .upload(filePath, editedOriginalFile);

        if (uploadError) {
          throw new Error(
            `Erreur lors de l'upload du fichier: ${uploadError.message}`
          );
        }

        // Update the PV record in the database
        const { error: updateError } = await supabaseClient
          .from("pv")
          .update({
            file_path: filePath,
          })
          .eq("id", pv.id);

        if (updateError) {
          throw new Error(
            `Erreur lors de la mise à jour du PV: ${updateError.message}`
          );
        }

        // Update the local state
        const updatedPV = {
          ...pv,
          file_path: filePath,
        };

        onUpdatePV(updatedPV);
        setEditedOriginalFile(null);
        setSuccessMessage("Le fichier a été mis à jour avec succès.");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du fichier:", error);
        setErrorMessage(`Une erreur est survenue: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDownload = async (filePath, isSigned = false) => {
    try {
      if (!filePath) {
        setErrorMessage(
          isSigned
            ? "Aucun fichier signé n'est disponible"
            : "Aucun fichier n'est disponible"
        );
        return;
      }

      

      // Check if this is a legacy localStorage path
      if (filePath.startsWith("local_signed_")) {
        setErrorMessage(
          "Ce fichier doit être téléversé à nouveau car il était stocké dans une ancienne version du système. Veuillez le téléverser à nouveau."
        );
        return;
      }

      const { data, error } = await downloadPVFile(filePath);

      if (error) {
        console.error("Download error:", error);
        throw error;
      }

      // Create a blob from the file data
      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filePath.split("/").pop(); // Extract filename from path
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      setErrorMessage("Erreur lors du téléchargement du fichier: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">{pv.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 flex items-center bg-green-50 border border-green-200 px-4 py-3 rounded-md">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 flex items-center bg-red-50 border border-red-200 px-4 py-3 rounded-md">
            <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne de gauche - Informations générales et fichiers */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Informations générales
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Projet :</span> {pv.project}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date de création :</span>{" "}
                  {new Date(pv.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Statut :</span>{" "}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pv.status === "Signé"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {pv.status === "Signé" ? "Signé" : "En attente"}
                  </span>
                </p>
                {pv.signedAt && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date de signature :</span>{" "}
                    {new Date(pv.signedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Document original
              </h3>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleDownload(pv.file_path)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentIcon className="h-5 w-5 mr-2" />
                  Visualiser
                </button>
                <div>
                  <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Éditer
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={handleOriginalFileEdit}
                    />
                  </label>
                </div>
              </div>
              {editedOriginalFile && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">
                    Nouveau fichier sélectionné : {editedOriginalFile.name}
                  </p>
                  <button
                    onClick={handleSaveEditedOriginalFile}
                    disabled={isUploading}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading
                      ? "Chargement..."
                      : "Enregistrer les modifications"}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Document signé</h3>
              {pv.status === "Signé" ? (
                <div>
                  <div className="text-green-600 font-medium text-sm mb-3">
                    <CheckCircleIcon className="h-5 w-5 inline-block mr-2" />
                    Document marqué comme signé le{" "}
                    {formatDate(pv.signedAt || pv.signed_at)}
                  </div>

                  {pv.signed_file_path && (
                    <button
                      onClick={() => handleDownload(pv.signed_file_path, true)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Télécharger le PV signé
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-yellow-600 mb-2">
                    Le document n'a pas encore été signé par le client.
                  </p>
                  <div>
                    <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Uploader le document signé
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,application/pdf"
                        onChange={handleSignedFileUpload}
                      />
                    </label>
                  </div>

                  {uploadedSignedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">
                        Fichier sélectionné : {uploadedSignedFile.name}
                      </p>
                      <button
                        onClick={handleSaveSignedFile}
                        disabled={isUploading}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? "Chargement..." : "Enregistrer"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Colonne de droite - Transfert et relances */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transfert</h3>
              {hasBeenTransferred ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Ce document a été transféré à :
                  </p>
                  <div className="flex items-start space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {pv.transferredTo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pv.transferredTo.position}
                      </p>
                    </div>
                  </div>
                  {pv.transferredTo.email && (
                    <div className="flex items-start space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm">{pv.transferredTo.email}</p>
                      </div>
                    </div>
                  )}
                  {pv.transferredTo.phone && (
                    <div className="flex items-start space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm">{pv.transferredTo.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Ce document n'a pas été transféré à une autre personne.
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Relances</h3>
              {/* Followup buttons */}
              {pv.status !== "Signé" && (
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Relance par email
                  </button>
                  <button
                    onClick={() => setShowPhoneForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    Relance téléphonique
                  </button>
                </div>
              )}

              {/* Formulaire de relance par email */}
              {showEmailForm && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Nouvelle relance par email
                    </h4>
                    <button
                      onClick={() => setShowEmailForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={6}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleEmailRelance}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Envoyer
                    </button>
                  </div>
                </div>
              )}

              {/* Formulaire de relance téléphonique */}
              {showPhoneForm && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Nouvelle relance téléphonique
                    </h4>
                    <button
                      onClick={() => setShowPhoneForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    value={phoneContent}
                    onChange={(e) => setPhoneContent(e.target.value)}
                    placeholder="Résumé de l'appel..."
                    rows={4}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handlePhoneRelance}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des relances */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {followups.length > 0 ? (
                  followups.map((followup) => (
                    <div
                      key={followup.id}
                      className="flex items-start space-x-3 p-2 border-l-2 border-void"
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-void-light flex items-center justify-center">
                        {followup.type === "email" ? (
                          <EnvelopeIcon className="h-4 w-4 text-void" />
                        ) : (
                          <PhoneIcon className="h-4 w-4 text-void" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Relance{" "}
                              {followup.type === "email"
                                ? "par email"
                                : "téléphonique"}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(followup.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        {followup.comment && (
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                            {followup.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Aucune relance effectuée pour le moment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PVDetails;
