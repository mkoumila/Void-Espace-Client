import { useState, useEffect } from "react";
import { 
  PlusIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { paymentService } from "../../../api/paymentService";
import supabaseClient from "../../../api/supabaseClient";

function PaymentsTab({ user, payments, onUpdatePayment, onCreatePayment }) {
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [followups, setFollowups] = useState({});
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [phoneContent, setPhoneContent] = useState("");
  const [newPayment, setNewPayment] = useState({
    reference: "",
    amount: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    file: null,
    client_id: null,
    project_id: null,
    quote_id: null,
  });

  // Fetch client ID when component mounts
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const { data: clientData, error } = await supabaseClient
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (clientData) {
          setNewPayment((prev) => ({ ...prev, client_id: clientData.id }));
        }
      } catch (error) {
        console.error("Error fetching client ID:", error);
      }
    };

    fetchClientId();
  }, [user.id]);

  // Fetch followups when a payment is selected
  useEffect(() => {
    const fetchFollowups = async () => {
      if (selectedPayment) {
        try {
          const data = await paymentService.fetchPaymentFollowups(selectedPayment.id);
          setFollowups(prev => ({ ...prev, [selectedPayment.id]: data }));
        } catch (err) {
          console.error('Error fetching followups:', err);
        }
      }
    };

    fetchFollowups();
  }, [selectedPayment]);

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  // Format amounts
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case "Payé":
        return "bg-green-100 text-green-800";
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      case "Annulé":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "Payé":
        return "Payé";
      case "En attente":
        return "En attente";
      case "Annulé":
        return "Annulé";
      default:
        return status;
    }
  };

  // Filter payments based on search and status
  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch = payment.reference
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle showing payment details
  const handleShowDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  // Handle marking payment as completed
  const handleMarkAsCompleted = async (paymentId) => {
    try {
      await paymentService.updatePayment(paymentId, {
        status: "Payé",
      });
      onUpdatePayment(paymentId, "Payé");
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.type === "application/pdf" &&
      file.size <= 10 * 1024 * 1024
    ) {
      setNewPayment({ ...newPayment, file });
    } else {
      alert("Veuillez sélectionner un fichier PDF valide (max 10MB)");
    }
  };

  // Add new payment
  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !newPayment.reference ||
      !newPayment.amount ||
      !newPayment.issue_date ||
      !newPayment.due_date ||
      !newPayment.client_id ||
      !newPayment.file
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      let filePath = null;

      // Upload file if exists
      if (newPayment.file) {
        const fileExt = newPayment.file.name.split(".").pop();
        const fileName = `${newPayment.reference}-${Date.now()}.${fileExt}`;
        filePath = `invoices/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("payments")
          .upload(filePath, newPayment.file);

        if (uploadError) {
          throw uploadError;
        }
      }

      const paymentData = {
        reference: newPayment.reference,
        amount: parseFloat(newPayment.amount),
        payment_date: newPayment.issue_date,
        due_date: newPayment.due_date,
        payment_method: "Facture",
        description: `Facture ${newPayment.reference}`,
        status: "En attente",
        client_id: newPayment.client_id,
        project_id: newPayment.project_id,
        quote_id: newPayment.quote_id,
        file_path: filePath,
      };

      // Only call onCreatePayment, which should handle the database insertion
      await onCreatePayment(paymentData);

      // Reset form
      setNewPayment({
        reference: "",
        amount: "",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: "",
        file: null,
        client_id: newPayment.client_id,
        project_id: null,
        quote_id: null,
      });

      // Close modal
      setShowAddPaymentModal(false);
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Erreur lors de la création du paiement");
    }
  };

  // Handle email relance
  const handleEmailRelance = async () => {
    try {
      const followupData = {
        email: true, // This will set type to 'email'
        comment: emailContent,
        created_by: user.id
      };

      await paymentService.createPaymentFollowup(selectedPayment.id, followupData);
      
      // Update followups state
      const newFollowup = {
        id: Date.now(),
        type: 'email',
        comment: emailContent,
        created_at: new Date().toISOString(),
        created_by: user.id,
        auth_users: {
          email: user.email,
          phone: user.phone
        }
      };
      
      setFollowups(prev => ({
        ...prev,
        [selectedPayment.id]: [newFollowup, ...(prev[selectedPayment.id] || [])]
      }));

      setShowEmailForm(false);
      setEmailContent("");
    } catch (err) {
      console.error('Error creating email followup:', err);
    }
  };

  // Handle phone relance
  const handlePhoneRelance = async () => {
    try {
      const followupData = {
        email: false, // This will set type to 'phone'
        comment: phoneContent,
        created_by: user.id
      };

      await paymentService.createPaymentFollowup(selectedPayment.id, followupData);
      
      // Update followups state
      const newFollowup = {
        id: Date.now(),
        type: 'phone',
        comment: phoneContent,
        created_at: new Date().toISOString(),
        created_by: user.id,
        auth_users: {
          email: user.email,
          phone: user.phone
        }
      };
      
      setFollowups(prev => ({
        ...prev,
        [selectedPayment.id]: [newFollowup, ...(prev[selectedPayment.id] || [])]
      }));

      setShowPhoneForm(false);
      setPhoneContent("");
    } catch (err) {
      console.error('Error creating phone followup:', err);
    }
  };

  // Add a handleViewFile function for visualizing files
  const handleViewFile = async (filePath) => {
    try {
      if (!filePath) {
        alert("Aucun fichier n'est associé à cette facture");
        return;
      }

      const { data, error } = await supabaseClient
        .storage
        .from('payments')
        .createSignedUrl(filePath, 60);

      if (error) {
        throw error;
      }

      if (data) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Erreur lors de l'ouverture du fichier");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Paiements</h2>
        <button
          type="button"
          onClick={() => setShowAddPaymentModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Ajouter une facture
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              placeholder="Rechercher par numéro de facture..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
            >
              <option value="all">Tous les statuts</option>
              <option value="Payé">Payés</option>
              <option value="En attente">En attente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Facture
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
                    Date d'émission
                  </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                    Date d'échéance
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
            {filteredPayments?.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.reference || payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(payment.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === "Payé"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "En attente" &&
                          new Date(payment.due_date) < new Date()
                        ? "bg-red-100 text-red-800"
                        : payment.status === "En attente"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.status === "Annulé"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.status === "Payé"
                      ? "Payé"
                      : payment.status === "En attente" &&
                        new Date(payment.due_date) < new Date()
                      ? "En retard"
                      : payment.status === "En attente"
                      ? "En attente"
                      : payment.status === "Annulé"
                      ? "Annulé"
                      : payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleShowDetails(payment)}
                    className="text-void hover:text-void-light mr-3"
                  >
                    <EyeIcon className="h-5 w-5 inline" />
                    <span className="ml-1">Détails</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
              <div className="bg-white rounded-lg shadow-xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Facture {selectedPayment.reference || selectedPayment.id}
                  </h2>
                            <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                            >
                    <XMarkIcon className="h-6 w-6" />
                            </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Informations générales
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Montant :</span>{" "}
                          {formatAmount(selectedPayment.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date d'émission :</span>{" "}
                          {formatDate(selectedPayment.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date d'échéance :</span>{" "}
                          {formatDate(selectedPayment.due_date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Statut :</span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedPayment.status === "Payé"
                                ? "bg-green-100 text-green-800"
                                : selectedPayment.status === "En attente" &&
                                  new Date(selectedPayment.due_date) <
                                    new Date()
                                ? "bg-red-100 text-red-800"
                                : selectedPayment.status === "En attente"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedPayment.status === "Annulé"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedPayment.status === "Payé"
                              ? "Payé"
                              : selectedPayment.status === "En attente" &&
                                new Date(selectedPayment.due_date) < new Date()
                              ? "En retard"
                              : selectedPayment.status === "En attente"
                              ? "En attente"
                              : selectedPayment.status === "Annulé"
                              ? "Annulé"
                              : selectedPayment.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Document de facture
                      </h3>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleViewFile(selectedPayment.file_path)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
                          Visualiser
                        </button>
                        {selectedPayment.file_path &&
                          selectedPayment.file_path !== "" && (
                            <button
                              onClick={() =>
                                paymentService.downloadPaymentFile(
                                  selectedPayment.file_path,
                                  selectedPayment.reference ||
                                    selectedPayment.id
                                )
                              }
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                              Télécharger
                            </button>
                          )}
                      </div>
                    </div>

                    {selectedPayment.status !== "Payé" && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Actions
                        </h3>
                        <button
                          onClick={() =>
                            handleMarkAsCompleted(selectedPayment.id)
                          }
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Marquer comme payée
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Transfert
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Cette facture a été transférée à :</p>
                        <div className="flex items-start space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5 text-gray-400 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">Thomas Martin</p>
                            <p className="text-xs text-gray-500">Directeur Financier</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5 text-gray-400 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                          <div>
                            <p className="text-sm">thomas.martin@client.fr</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5 text-gray-400 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                          </svg>
                          <div>
                            <p className="text-sm">+33 6 98 76 54 32</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Relances
                      </h3>
                      {selectedPayment.status === "En attente" && (
                        <>
                          <div className="flex space-x-2 mb-4">
                            <button
                              onClick={() => setShowEmailForm(true)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                              </svg>
                              Relance par email
                            </button>
                            <button
                              onClick={() => setShowPhoneForm(true)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                              </svg>
                              Relance téléphonique
                            </button>
                          </div>

                          {showEmailForm && (
                            <div className="mb-4 p-3 border border-gray-200 rounded-md">
                              <h4 className="text-sm font-medium mb-2">Envoyer une relance par email</h4>
                              <textarea
                                rows="6"
                                value={emailContent}
                                onChange={(e) => setEmailContent(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                              >
                                Bonjour,

                                Nous vous rappelons que la facture "{selectedPayment.reference}" d'un montant de {formatAmount(selectedPayment.amount)} est en attente de paiement.
                                Date d'échéance : {formatDate(selectedPayment.due_date)}

                                Cordialement,
                                L'équipe VOID
                              </textarea>
                              <div className="flex justify-end space-x-2 mt-2">
                                <button
                                  onClick={() => setShowEmailForm(false)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={handleEmailRelance}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                  </svg>
                                  Envoyer
                                </button>
                              </div>
                            </div>
                          )}

                          {showPhoneForm && (
                            <div className="mb-4 p-3 border border-gray-200 rounded-md">
                              <h4 className="text-sm font-medium mb-2">Saisir une relance téléphonique</h4>
                              <textarea
                                placeholder="Saisissez les détails de votre appel..."
                                rows="3"
                                value={phoneContent}
                                onChange={(e) => setPhoneContent(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <button
                                  onClick={() => setShowPhoneForm(false)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={handlePhoneRelance}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {followups[selectedPayment.id]?.length > 0 ? (
                          followups[selectedPayment.id].map((followup) => (
                            <div key={followup.id} className="flex items-start space-x-3 p-2 border-l-2 border-void">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-void-light flex items-center justify-center">
                                {followup.type === 'email' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 text-void">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 text-void">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">
                                    {followup.type === 'email' ? 'Relance par email' : 'Relance téléphonique'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(followup.created_at).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: true
                                    })}
                                  </p>
                                </div>
                                <div className="mt-1">
                                  {/* {followup.type === 'email' && (
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                  )}
                                  {followup.type === 'phone' && (
                                    <p className="text-sm text-gray-600">{user.phone}</p>
                                  )} */}
                                  {followup.comment && (
                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{followup.comment}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Aucun relancement enregistré</p>
          </div>
        )}
      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add payment modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
              <div className="bg-white rounded-lg shadow-xl w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Ajouter une facture
                    </h3>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de facture
                            </label>
                            <input
                              type="text"
                      value={newPayment.reference}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          reference: e.target.value,
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                      placeholder="Ex: FAC-2024-005"
                              required
                            />
                          </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant (€)
                            </label>
                            <input
                              type="number"
                      value={newPayment.amount}
                      onChange={(e) =>
                        setNewPayment({ ...newPayment, amount: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                      placeholder="Ex: 5000"
                              min="0"
                              step="0.01"
                      required
                            />
                          </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'émission
                            </label>
                            <input
                              type="date"
                        value={newPayment.issue_date}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            issue_date: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                              required
                            />
                          </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'échéance
                            </label>
                            <input
                        type="date"
                        value={newPayment.due_date}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            due_date: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                              required
                            />
                          </div>
                        </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document de facture (PDF){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300">
                      <div className="space-y-1 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          data-slot="icon"
                          className="mx-auto h-12 w-12 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          ></path>
                        </svg>
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
                              required
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF jusqu'à 10MB
                        </p>
                        {newPayment.file && (
                          <p className="text-sm text-green-600">
                            Fichier sélectionné : {newPayment.file.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddPaymentModal(false)}
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
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsTab;
