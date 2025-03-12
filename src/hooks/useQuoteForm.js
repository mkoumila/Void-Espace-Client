import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabaseClient from '../api/supabaseClient';

/**
 * Custom hook to handle quote form data and submission
 * @returns {Object} Form state and handlers
 */
export function useQuoteForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState([]);
  
  // Initialize form with default values
  const [formData, setFormData] = useState({
    reference: '',
    title: '',
    description: '',
    amount: '',
    issue_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    client_id: '',
    status: 'En attente de validation',
    file: null
  });

  // Fetch clients for the dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('clients')
          .select('*')
          .order('name');
          
        if (error) {
          setError(`Erreur lors de la récupération des clients: ${error.message}`);
          return;
        }
        
        setClients(data || []);
        
        // Set default client if available
        /* if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, client_id: data[0].id }));
        } */
      } catch (err) {
        setError(`Une erreur est survenue: ${err.message}`);
      }
    };
    
    fetchClients();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.reference || !formData.title || !formData.client_id || !formData.amount || !formData.file) {
      setError('Veuillez remplir tous les champs obligatoires et ajouter un fichier');
      return false;
    }

    const fileExt = formData.file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'gif'];
    
    if (!allowedExtensions.includes(fileExt)) {
      setError('Format de fichier non supporté. Utilisez PDF, DOCX ou des images.');
      return false;
    }

    return true;
  };

  // Upload file to storage
  const uploadFile = async () => {
    const fileExt = formData.file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${formData.reference.replace(/\s+/g, '-')}.${fileExt}`;
    
    const { data, error } = await supabaseClient
      .storage
      .from('quote_files')
      .upload(fileName, formData.file);
      
    if (error) {
      throw new Error(`Erreur lors de l'upload du fichier: ${error.message}`);
    }
    
    return data.path;
  };

  // Create quote in database
  const createQuote = async (filePath) => {
    const { data, error } = await supabaseClient
      .from('quotes')
      .insert([
        {
          reference: formData.reference,
          title: formData.title,
          description: formData.description,
          amount: parseFloat(formData.amount),
          issue_date: formData.issue_date,
          valid_until: formData.valid_until,
          status: formData.status,
          client_id: formData.client_id,
          file_path: filePath,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      throw new Error(`Erreur lors de l'ajout du devis: ${error.message}`);
    }

    return data;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Upload file
      const filePath = await uploadFile();
      
      // Create quote
      await createQuote(filePath);

      // Success - immediately navigate to quotes page
      navigate('/quotes');
      
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la création du devis');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    clients,
    loading,
    error,
    success,
    handleChange,
    handleSubmit
  };
} 