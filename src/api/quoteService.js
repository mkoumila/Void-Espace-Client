import supabaseClient from './supabaseClient';

// Fetch quotes with automatic expiration check
export const fetchQuotes = async (filter = 'all') => {
  try {
    // First, update any expired quotes in the database
    await updateExpiredQuotes();
    
    // Get the current user's ID and role
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    
    // Get the client ID for this user
    const { data: clientData, error: clientError } = await supabaseClient
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (clientError) throw clientError;
    
    // Build the query
    let query = supabaseClient
      .from('quotes')
      .select(`
        id,
        reference,
        title,
        description,
        amount,
        issue_date,
        valid_until,
        status,
        file_path,
        client_id,
        clients (name)
      `)
      .eq('client_id', clientData.id) // Only show quotes for the current user's client
      .order('issue_date', { ascending: false });
    
    // Apply filter if needed
    if (filter === 'pending') {
      query = query.eq('status', 'En attente de validation');
    } else if (filter === 'validated') {
      query = query.eq('status', 'Validé');
    } else if (filter === 'expired') {
      query = query.eq('status', 'Expiré');
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
};

// Update expired quotes in the database
export const updateExpiredQuotes = async () => {
  try {
    // Call the stored procedure to update expired quotes
    const { data, error } = await supabaseClient.rpc('update_expired_quotes');
    
    if (error) {
      console.warn('Error updating expired quotes:', error);
    } else if (data > 0) {
      console.log(`${data} quotes marked as expired`);
    }
    
    return { updatedCount: data || 0 };
  } catch (error) {
    console.warn('Exception when updating expired quotes:', error);
    // Gracefully continue even if this fails
    return { updatedCount: 0 };
  }
};

// Fetch a single quote by ID
export const fetchQuoteById = async (quoteId) => {
  try {
    // Update expired quotes first
    await updateExpiredQuotes();
    
    const { data, error } = await supabaseClient
      .from('quotes')
      .select(`
        id,
        reference,
        title,
        description,
        amount,
        issue_date,
        valid_until,
        status,
        file_path,
        client_id,
        clients (name)
      `)
      .eq('id', quoteId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching quote with ID ${quoteId}:`, error);
    throw error;
  }
};

// Create a new quote
export const createQuote = async (quoteData) => {
  try {
    // Auto-check expiration based on valid_until date
    if (quoteData.valid_until && new Date(quoteData.valid_until) < new Date()) {
      quoteData.status = 'Expiré';
    }
    
    const { data, error } = await supabaseClient
      .from('quotes')
      .insert(quoteData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
};

// Update an existing quote
export const updateQuote = async (quoteId, quoteData) => {
  try {
    // Auto-check expiration based on valid_until date
    if (quoteData.valid_until && new Date(quoteData.valid_until) < new Date()) {
      quoteData.status = 'Expiré';
    }
    
    const { data, error } = await supabaseClient
      .from('quotes')
      .update(quoteData)
      .eq('id', quoteId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating quote with ID ${quoteId}:`, error);
    throw error;
  }
};

// Validate a quote (client action)
export const validateQuote = async (quoteId) => {
  try {
    console.log(`Attempting to validate quote with ID: ${quoteId}`);
    
    // First check if user is authenticated
    const { data: authData, error: authError } = await supabaseClient.auth.getSession();
    
    if (authError || !authData.session) {
      console.error('Authentication error:', authError || 'No active session');
      throw new Error('Vous devez être connecté pour valider un devis');
    }
    
    console.log('Current authentication:', {
      user: authData.session.user.id,
      email: authData.session.user.email
    });
    
    // Try to check auth status first
    try {
      const { data: authCheck } = await supabaseClient.rpc('check_auth');
      console.log('Auth check:', authCheck);
    } catch (authCheckError) {
      console.log('Auth check error:', authCheckError);
    }
    
    // Call the RPC function to validate the quote
    const { data, error } = await supabaseClient.rpc('validate_quote', { quote_id: quoteId });
    
    if (error) {
      console.error('Validation error:', error);
      
      // If validation fails with the normal function, try the manual function as fallback
      console.log('Trying manual validation as fallback...');
      const { data: manualData, error: manualError } = await supabaseClient.rpc(
        'manual_validate_quote',
        { 
          quote_id: quoteId,
          user_email: authData.session.user.email
        }
      );
      
      if (manualError) {
        console.error('Manual validation error:', manualError);
        throw manualError;
      }
      
      console.log('Manual validation result:', manualData);
      return { success: manualData };
    }
    
    // Log the result (success or failure)
    console.log(`Quote validation result: ${data ? 'Success' : 'Failed'}`);
    
    if (!data) {
      console.log('Validation failed, trying manual method...');
      
      // Try manual validation as a fallback
      const { data: manualData, error: manualError } = await supabaseClient.rpc(
        'manual_validate_quote',
        { 
          quote_id: quoteId,
          user_email: authData.session.user.email
        }
      );
      
      if (manualError) {
        console.error('Manual validation error:', manualError);
      } else {
        console.log('Manual validation result:', manualData);
        return { success: manualData };
      }
      
      // If the normal validation failed, do some diagnostics
      try {
        // Get quote details
        const { data: quoteData } = await supabaseClient
          .from('quotes')
          .select('id, status, client_id')
          .eq('id', quoteId)
          .single();
          
        if (quoteData) {
          // Get client details
          const { data: clientData } = await supabaseClient
            .from('clients')
            .select('id, user_id, email')
            .eq('id', quoteData.client_id)
            .single();
            
          console.log('Validation context:', {
            quote: quoteData,
            client: clientData,
            currentUserId: authData.session.user.id,
            isOwner: clientData?.user_id === authData.session.user.id
          });
        }
      } catch (debugError) {
        console.log('Error fetching debug data:', debugError);
      }
    }
    
    return { success: data };
  } catch (error) {
    console.error(`Error validating quote with ID ${quoteId}:`, error);
    throw error;
  }
};

// Delete a quote
export const deleteQuote = async (quoteId) => {
  try {
    const { error } = await supabaseClient
      .from('quotes')
      .delete()
      .eq('id', quoteId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error deleting quote with ID ${quoteId}:`, error);
    throw error;
  }
};

// Download a quote file
export const downloadQuoteFile = async (filePath, quoteReference) => {
  try {
    // If no file path, throw error
    if (!filePath) {
      throw new Error('Aucun fichier associé à ce devis');
    }
    
    // Get the bucket and filename from the path
    let bucket = 'quote_files';
    let fileName = filePath;
    
    // If the path includes the bucket name, extract it
    if (filePath.includes('/')) {
      const parts = filePath.split('/');
      if (parts.length > 1) {
        // The path might be like "quote_files/filename.pdf" or just "filename.pdf"
        fileName = parts[parts.length - 1];
        if (parts.length > 2) {
          bucket = parts[parts.length - 2];
        }
      }
    }
    
    // Get the file from Supabase Storage
    const { data, error } = await supabaseClient
      .storage
      .from(bucket)
      .download(fileName);
      
    if (error) {
      throw new Error(`Erreur lors du téléchargement: ${error.message}`);
    }
    
    // Create a URL for the blob
    const url = URL.createObjectURL(data);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `devis-${quoteReference || fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading quote file:', error);
    throw error;
  }
};

// Debug function to check validation permission
export const debugQuoteValidationPermission = async (quoteId) => {
  try {
    console.log(`Checking validation permission for quote ID: ${quoteId}`);
    
    const { data, error } = await supabaseClient.rpc(
      'debug_quote_validation_permission', 
      { quote_id: quoteId }
    );
    
    if (error) {
      console.error('Error checking validation permission:', error);
      throw error;
    }
    
    console.log('Validation permission check result:', data);
    return data;
  } catch (error) {
    console.error(`Error checking quote validation permission:`, error);
    throw error;
  }
}; 