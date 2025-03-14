import { useState, useEffect, useRef } from "react";
import { 
  PlusIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PhoneIcon,
  CheckIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import supabaseClient from "../../../api/supabaseClient";
import { downloadQuoteFile } from "../../../api/quoteService";

function QuotesTab({
  quotes: allQuotes,
  loading,
  error,
  onUpdateQuote,
  onCreateQuote,
  onDeleteQuote,
  userId,
}) {
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [quoteDetail, setQuoteDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formErrors, setFormErrors] = useState({
    reference: "",
    title: "",
    amount: "",
    issue_date: "",
    valid_until: "",
    file: "",
  });
  const [editFormErrors, setEditFormErrors] = useState({
    reference: "",
    title: "",
    amount: "",
    issue_date: "",
    valid_until: "",
  });
  const [newQuote, setNewQuote] = useState({
    reference: `DEV-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`,
    title: "",
    description: "",
    amount: "",
    issue_date: new Date().toISOString().split("T")[0],
    valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0],
    status: "En attente de validation",
    file: null,
  });
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [phoneNote, setPhoneNote] = useState("");

  // Filter quotes based on search query and status filter
  const filteredQuotes = allQuotes.filter((quote) => {
    const matchesSearch =
      quote.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.title &&
        quote.title.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "accepted":
          matchesStatus = quote.status === "Validé";
          break;
        case "rejected":
          matchesStatus = quote.status === "Expiré";
          break;
        case "pending":
          matchesStatus = quote.status === "En attente de validation";
          break;
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastQuote = currentPage * itemsPerPage;
  const indexOfFirstQuote = indexOfLastQuote - itemsPerPage;
  const currentQuotes = filteredQuotes.slice(
    indexOfFirstQuote,
    indexOfLastQuote
  );
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Fonction pour obtenir la classe de statut
  const getStatusClass = (status) => {
    switch (status) {
      case "Validé":
        return "bg-green-100 text-green-800";
      case "En attente de validation":
        return "bg-yellow-100 text-yellow-800";
      case "Expiré":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir le libellé de statut
  const getStatusLabel = (status) => {
    switch (status) {
      case "Validé":
        return "Accepté";
      case "En attente de validation":
        return "En attente";
      case "Expiré":
        return "Refusé";
      default:
        return status;
    }
  };

  // Handle quote submission
  const handleAddQuote = async (e) => {
    e.preventDefault();

    // Reset all form errors
    setFormErrors({
      reference: "",
      title: "",
      amount: "",
      issue_date: "",
      valid_until: "",
      file: "",
    });

    // Validate form fields
    let hasErrors = false;
    const errors = {
      reference: "",
      title: "",
      amount: "",
      issue_date: "",
      valid_until: "",
      file: "",
    };

    if (!newQuote.reference.trim()) {
      errors.reference = "La référence est requise";
      hasErrors = true;
    }

    if (!newQuote.title.trim()) {
      errors.title = "Le titre du projet est requis";
      hasErrors = true;
    }

    if (!newQuote.amount) {
      errors.amount = "Le montant est requis";
      hasErrors = true;
    } else if (parseFloat(newQuote.amount) <= 0) {
      errors.amount = "Le montant doit être supérieur à 0";
      hasErrors = true;
    }

    if (!newQuote.issue_date) {
      errors.issue_date = "La date de création est requise";
      hasErrors = true;
    }

    if (!newQuote.valid_until) {
      errors.valid_until = "La date d'expiration est requise";
      hasErrors = true;
    }

    if (!newQuote.file) {
      errors.file = "Veuillez ajouter un document pour le devis";
      hasErrors = true;
    }

    if (hasErrors) {
      setFormErrors(errors);
      return;
    }

    try {
      // Get the client ID for this user
      const { data: clientData } = await supabaseClient
        .from("clients")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!clientData) {
        setFormErrors({
          ...errors,
          general: "Client non trouvé pour cet utilisateur",
        });
        return;
      }

      // Upload the file to storage
      const fileExt = newQuote.file.name.split(".").pop().toLowerCase();
      const allowedExtensions = ["pdf"];

      if (!allowedExtensions.includes(fileExt)) {
        setFormErrors({
          ...errors,
          file: "Format de fichier non supporté. Seuls les fichiers PDF sont acceptés.",
        });
        return;
      }

      const fileName = `${Date.now()}-${newQuote.reference.replace(
        /\s+/g,
        "-"
      )}.${fileExt}`;
      const { data: fileData, error: fileError } = await supabaseClient.storage
        .from("quote_files")
        .upload(fileName, newQuote.file);

      if (fileError) {
        setFormErrors({
          ...errors,
          file: `Erreur lors de l'upload du fichier: ${fileError.message}`,
        });
        return;
      }

      // Prepare the quote data with the file path
      const quoteData = {
        ...newQuote,
        client_id: clientData.id,
        amount: parseFloat(newQuote.amount),
        file_path: fileData.path,
      };

      // Remove the file object before sending to API
      delete quoteData.file;

      const { success, data, error } = await onCreateQuote(quoteData);

      if (success) {
        setShowAddQuoteModal(false);
        // Reset form
        setNewQuote({
          reference: `DEV-${new Date().getFullYear()}-${Math.floor(
            1000 + Math.random() * 9000
          )}`,
          title: "",
          description: "",
          amount: "",
          issue_date: new Date().toISOString().split("T")[0],
          valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
          status: "En attente de validation",
          file: null,
        });
        setFormErrors({
          reference: "",
          title: "",
          amount: "",
          issue_date: "",
          valid_until: "",
          file: "",
        });
      } else {
        setFormErrors({
          ...errors,
          general: error || "Erreur lors de la création du devis",
        });
      }
    } catch (error) {
      console.error("Error adding quote:", error);
      setFormErrors({
        ...formErrors,
        general:
          error.message ||
          "Une erreur est survenue lors de la création du devis",
      });
    }
  };

  // Add a function to handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewQuote({ ...newQuote, file: e.target.files[0] });
    }
  };

  // Add a function to handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNewQuote({ ...newQuote, file: e.dataTransfer.files[0] });
    }
  };

  // Handle quote validation
  const handleValidateQuote = async (quoteId) => {
    try {
      const quoteToUpdate = allQuotes.find((q) => q.id === quoteId);
      if (!quoteToUpdate) return;

      // Only include the necessary fields for the update
      const updatedQuote = {
        id: quoteId,
        status: "Validé",
      };

      const { success, error } = await onUpdateQuote(updatedQuote);

      if (!success) {
        alert(`Erreur lors de la validation du devis: ${error}`);
      }
    } catch (err) {
      console.error("Erreur lors de la validation du devis:", err);
      alert(`Erreur: ${err.message}`);
    }
  };

  // Handle opening the edit modal for a quote
  const handleEditQuote = (quote) => {
    setEditingQuote({
      ...quote,
      amount: quote.amount.toString(),
    });
    setShowEditQuoteModal(true);
  };

  // Handle quote update submission
  const handleUpdateQuoteSubmit = async (e) => {
    e.preventDefault();
    
    // Reset edit form errors
    setEditFormErrors({
      reference: "",
      title: "",
      amount: "",
      issue_date: "",
      valid_until: "",
    });

    // Validate form fields
    let hasErrors = false;
    const errors = {
      reference: "",
      title: "",
      amount: "",
      issue_date: "",
      valid_until: "",
    };

    if (!editingQuote.reference.trim()) {
      errors.reference = "La référence est requise";
      hasErrors = true;
    }

    if (!editingQuote.title.trim()) {
      errors.title = "Le titre du projet est requis";
      hasErrors = true;
    }

    if (!editingQuote.amount) {
      errors.amount = "Le montant est requis";
      hasErrors = true;
    } else if (parseFloat(editingQuote.amount) <= 0) {
      errors.amount = "Le montant doit être supérieur à 0";
      hasErrors = true;
    }

    if (!editingQuote.issue_date) {
      errors.issue_date = "La date de création est requise";
      hasErrors = true;
    }

    if (!editingQuote.valid_until) {
      errors.valid_until = "La date d'expiration est requise";
      hasErrors = true;
    }

    if (hasErrors) {
      setEditFormErrors(errors);
      return;
    }
    
    try {
      // Only include necessary fields for the update
      const quoteData = {
        id: editingQuote.id,
        reference: editingQuote.reference,
        title: editingQuote.title,
        description: editingQuote.description,
        amount: parseFloat(editingQuote.amount),
        issue_date: editingQuote.issue_date,
        valid_until: editingQuote.valid_until,
        status: editingQuote.status,
      };

      const { success, error } = await onUpdateQuote(quoteData);

      if (success) {
        setShowEditQuoteModal(false);
        setEditingQuote(null);
        setEditFormErrors({
          reference: "",
          title: "",
          amount: "",
          issue_date: "",
          valid_until: "",
        });
      } else {
        setEditFormErrors({
          ...errors,
          general: `Erreur lors de la mise à jour du devis: ${error}`,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du devis:", err);
      setEditFormErrors({
        ...editFormErrors,
        general: `Erreur: ${err.message}`,
      });
    }
  };

  // Handle quote deletion
  const handleDeleteClick = (quote) => {
    setQuoteToDelete(quote);
    setShowDeleteConfirmModal(true);
  };

  // Confirm deletion of a quote
  const confirmDeleteQuote = async () => {
    try {
      const { success, error } = await onDeleteQuote(quoteToDelete.id);

      if (success) {
        setShowDeleteConfirmModal(false);
        setQuoteToDelete(null);
      } else {
        alert(`Erreur lors de la suppression du devis: ${error}`);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du devis:", err);
      alert(`Erreur: ${err.message}`);
    }
  };

  // Handle showing quote details
  const handleShowDetails = (quote) => {
    setQuoteDetail(quote);
    setShowDetailModal(true);
  };

  // Add handlers for accepting and rejecting quotes
  const handleAcceptQuote = async (quoteId) => {
    try {
      const quoteToUpdate = allQuotes.find((q) => q.id === quoteId);
      if (!quoteToUpdate) return;

      // Only include the necessary fields for the update
      const updatedQuote = {
        id: quoteId,
        status: "Validé",
      };

      const { success, error } = await onUpdateQuote(updatedQuote);

      if (success) {
        // Close the modal after successful update
        setShowDetailModal(false);
      } else {
        alert(`Erreur lors de l'acceptation du devis: ${error}`);
      }
    } catch (err) {
      console.error("Erreur lors de l'acceptation du devis:", err);
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleRejectQuote = async (quoteId) => {
    try {
      const quoteToUpdate = allQuotes.find((q) => q.id === quoteId);
      if (!quoteToUpdate) return;

      // Only include the necessary fields for the update
      const updatedQuote = {
        id: quoteId,
        status: "Expiré",
      };

      const { success, error } = await onUpdateQuote(updatedQuote);

      if (success) {
        // Close the modal after successful update
        setShowDetailModal(false);
      } else {
        alert(`Erreur lors du refus du devis: ${error}`);
      }
    } catch (err) {
      console.error("Erreur lors du refus du devis:", err);
      alert(`Erreur: ${err.message}`);
    }
  };

  // Update the handleEmailRelance function
  const handleEmailRelance = (quoteId) => {
    // Set the default email template when the button is clicked
    const quoteToRelance = allQuotes.find((q) => q.id === quoteId);
    if (quoteToRelance) {
      setEmailContent(`Bonjour,

Nous vous rappelons que le devis "${quoteToRelance.reference}" d'un montant de ${formatAmount(quoteToRelance.amount)} est en attente de validation.
Date d'expiration : ${formatDate(quoteToRelance.valid_until)}

Cordialement,
L'équipe VOID`);
    }
    
    // Show the email form and hide the phone form
    setShowEmailForm(true);
    setShowPhoneForm(false);
  };
  
  // Update the handlePhoneRelance function
  const handlePhoneRelance = (quoteId) => {
    // Reset phone note when the button is clicked
    setPhoneNote("");
    
    // Show the phone form and hide the email form
    setShowPhoneForm(true);
    setShowEmailForm(false);
  };
  
  // Add new handlers for form submission
  const handleSendEmailReminder = () => {
    // Implement sending the email - for now, just show a confirmation
    alert(`Email de relance envoyé: ${emailContent}`);
    
    // TODO: Actually send the email and store the reminder
    
    // Close the form
    setShowEmailForm(false);
  };
  
  const handleSavePhoneReminder = () => {
    // Check if the note is not empty
    if (!phoneNote.trim()) {
      alert("Veuillez saisir les détails de l'appel.");
      return;
    }
    
    // Implement saving the phone call note - for now, just show a confirmation
    alert(`Note d'appel enregistrée: ${phoneNote}`);
    
    // TODO: Store the phone reminder
    
    // Close the form
    setShowPhoneForm(false);
  };
  
  // Add handlers for canceling forms
  const handleCancelEmailForm = () => {
    setShowEmailForm(false);
  };
  
  const handleCancelPhoneForm = () => {
    setShowPhoneForm(false);
  };

  // If there's an error, display it
  if (error) {
  return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Erreur</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // If it's loading, show a spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Devis</h2>
        <button
          onClick={() => setShowAddQuoteModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter un devis
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              placeholder="Rechercher par référence ou projet..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="accepted">Acceptés</option>
              <option value="rejected">Refusés</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Aucun devis trouvé pour cet utilisateur.
            </p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Référence
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Projet
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Montant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date d'expiration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quote.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(quote.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quote.valid_until)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          quote.status
                        )}`}
                      >
                        {getStatusLabel(quote.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                            <button
                          onClick={() => handleShowDetails(quote)}
                          className="text-void hover:text-void-light mr-3"
                            >
                          <EyeIcon className="h-5 w-5 inline" />
                          <span className="ml-1">Détails</span>
                            </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                            <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Précédent
                            </button>
                        <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                  Suivant
                        </button>
                      </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de{" "}
                    <span className="font-medium">{indexOfFirstQuote + 1}</span>{" "}
                    à{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastQuote, filteredQuotes.length)}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium">{filteredQuotes.length}</span>{" "}
                    devis
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Précédent</span>
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                          ${
                            currentPage === i + 1
                              ? "z-10 bg-void border-void text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Suivant</span>
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
          </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal d'ajout de devis */}
      {showAddQuoteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Ajouter un devis
                    </h3>
            <form onSubmit={handleAddQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence du devis
                            </label>
                            <input
                              type="text"
                              value={newQuote.reference}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, reference: e.target.value })
                  }
                  className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                    formErrors.reference ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ex: DEV-2024-005"
                />
                {formErrors.reference && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.reference}
                  </p>
                )}
                          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projet
                </label>
                <input
                  type="text"
                  value={newQuote.title}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, title: e.target.value })
                  }
                  className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                    formErrors.title ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ex: Refonte E-commerce"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                            </label>
                            <input
                              type="number"
                              value={newQuote.amount}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, amount: e.target.value })
                  }
                              min="0"
                              step="0.01"
                  className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                    formErrors.amount ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ex: 5000"
                            />
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.amount}
                  </p>
                )}
                          </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                            </label>
                            <input
                    type="date"
                    value={newQuote.issue_date}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, issue_date: e.target.value })
                    }
                    className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                      formErrors.issue_date
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.issue_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.issue_date}
                    </p>
                  )}
                          </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                            </label>
                            <input
                              type="date"
                    value={newQuote.valid_until}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, valid_until: e.target.value })
                    }
                    className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                      formErrors.valid_until
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.valid_until && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.valid_until}
                    </p>
                  )}
                </div>
                          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document de devis (PDF)
                            </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                    formErrors.file
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-void hover:text-void-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-void"
                      >
                        <span>Téléverser un fichier</span>
                            <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                    <p className="text-sm text-green-600">
                      {newQuote.file && `Fichier sélectionné : ${newQuote.file.name}`}
                            </p>
                          </div>
                </div>
                {formErrors.file && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.file}</p>
                )}
                        </div>

              {formErrors.general && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erreur
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{formErrors.general}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddQuoteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                >
                  Annuler
                </button>
                          <button
                            type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                          >
                            Ajouter
                          </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de devis */}
      {showEditQuoteModal && editingQuote && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Modifier le devis
            </h3>
            <form onSubmit={handleUpdateQuoteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence
                </label>
                <input
                  type="text"
                  value={editingQuote.reference}
                  onChange={(e) =>
                    setEditingQuote({
                      ...editingQuote,
                      reference: e.target.value,
                    })
                  }
                  className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                    editFormErrors.reference
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {editFormErrors.reference && (
                  <p className="mt-1 text-sm text-red-600">
                    {editFormErrors.reference}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={editingQuote.title}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, title: e.target.value })
                  }
                  className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                    editFormErrors.title ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {editFormErrors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {editFormErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingQuote.description || ""}
                  onChange={(e) =>
                    setEditingQuote({
                      ...editingQuote,
                      description: e.target.value,
                    })
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                </label>
                <input
                  type="number"
                  value={editingQuote.amount}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, amount: e.target.value })
                  }
                  min="0"
                  step="0.01"
                  className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                    editFormErrors.amount ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {editFormErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {editFormErrors.amount}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'émission
                  </label>
                  <input
                    type="date"
                    value={
                      editingQuote.issue_date
                        ? editingQuote.issue_date.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingQuote({
                        ...editingQuote,
                        issue_date: e.target.value,
                      })
                    }
                    className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                      editFormErrors.issue_date
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {editFormErrors.issue_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {editFormErrors.issue_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valide jusqu'au
                  </label>
                  <input
                    type="date"
                    value={
                      editingQuote.valid_until
                        ? editingQuote.valid_until.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingQuote({
                        ...editingQuote,
                        valid_until: e.target.value,
                      })
                    }
                    className={`block w-full rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm ${
                      editFormErrors.valid_until
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {editFormErrors.valid_until && (
                    <p className="mt-1 text-sm text-red-600">
                      {editFormErrors.valid_until}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={editingQuote.status}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, status: e.target.value })
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-void focus:border-void sm:text-sm"
                >
                  <option value="En attente de validation">En attente</option>
                  <option value="Validé">Accepté</option>
                  <option value="Expiré">Refusé</option>
                </select>
              </div>

              {editFormErrors.general && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erreur
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{editFormErrors.general}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                  onClick={() => setShowEditQuoteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                >
                  Mettre à jour
                </button>
                        </div>
                      </form>
                    </div>
                  </div>
      )}

      {/* Confirmation de suppression de devis */}
      {showDeleteConfirmModal && quoteToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Êtes-vous sûr de vouloir supprimer le devis{" "}
              <span className="font-medium">{quoteToDelete.reference}</span> ?
              <br />
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuote}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </button>
                </div>
              </div>
            </div>
      )}

      {/* Modal de détails du devis */}
      {showDetailModal && quoteDetail && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Devis {quoteDetail.reference}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - General info, Document & Actions */}
              <div className="space-y-6">
                {/* General Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Informations générales
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Projet :</span>{" "}
                      {quoteDetail.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Montant :</span>{" "}
                      {formatAmount(quoteDetail.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date de création :</span>{" "}
                      {formatDate(quoteDetail.issue_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date d'expiration :</span>{" "}
                      {formatDate(quoteDetail.valid_until)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Statut :</span>{" "}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                          quoteDetail.status
                        )}`}
                      >
                        {getStatusLabel(quoteDetail.status)}
                      </span>
                    </p>
                    {quoteDetail.status === "Validé" && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          Date d'acceptation :
                        </span>{" "}
                        {formatDate(quoteDetail.updated_at)}
                      </p>
                    )}
                    {quoteDetail.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Description :</span>
                        <br />
                        {quoteDetail.description}
                      </p>
      )}
    </div>
                </div>

                {/* Document section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Document de devis
                  </h3>
                  {quoteDetail.file_path ? (
                    <div className="flex items-center justify-between">
                      <a
                        href={quoteDetail.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        Visualiser
                      </a>
                      <button
                        onClick={() =>
                          downloadQuoteFile(
                            quoteDetail.file_path,
                            quoteDetail.reference
                          )
                        }
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Télécharger
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Aucun document disponible pour ce devis.
                    </p>
                  )}
                </div>

                {/* Actions section for pending quotes */}
                {quoteDetail.status === "En attente de validation" && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptQuote(quoteDetail.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Marquer comme accepté
                      </button>
                      <button
                        onClick={() => handleRejectQuote(quoteDetail.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Marquer comme refusé
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Transfer & Reminders */}
              <div className="space-y-6">
                {/* Transfer info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Transfert</h3>
                  <p className="text-sm text-gray-600">
                    Ce devis n'a pas été transféré à une autre personne.
                  </p>
                </div>

                {/* Reminders section with relance buttons and forms */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Relances</h3>
                  
                  {/* Relance buttons for pending quotes */}
                  {quoteDetail.status === "En attente de validation" && (
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => handleEmailRelance(quoteDetail.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                      >
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        Relance par email
                      </button>
                      <button
                        onClick={() => handlePhoneRelance(quoteDetail.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        Relance téléphonique
                      </button>
                    </div>
                  )}
                  
                  {/* Email reminder form */}
                  {showEmailForm && (
                    <div className="mb-4 p-3 border border-gray-200 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Envoyer une relance par email</h4>
                      <textarea
                        rows="6"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={handleCancelEmailForm}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSendEmailReminder}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                        >
                          <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                          Envoyer
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Phone reminder form */}
                  {showPhoneForm && (
                    <div className="mb-4 p-3 border border-gray-200 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Saisir une relance téléphonique</h4>
                      <textarea
                        placeholder="Saisissez les détails de votre appel..."
                        rows="3"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                        value={phoneNote}
                        onChange={(e) => setPhoneNote(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={handleCancelPhoneForm}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSavePhoneReminder}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {/* Example reminder */}
                    {quoteDetail.status === "En attente de validation" ? (
                      <p className="text-sm text-gray-500 italic">
                        Aucune relance effectuée pour le moment.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Aucune relance effectuée pour ce devis.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuotesTab;
