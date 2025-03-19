import supabaseClient from './supabaseClient';

// Fetch PVs for a specific client
export const fetchPVs = async (clientId) => {
  const { data, error } = await supabaseClient
    .from('pv')
    .select(`
      *,
      projects!project_id (
        name
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch user information separately
  if (data && data.length > 0) {
    const userIds = [...new Set(data.map(pv => pv.created_by))];
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds);

    if (!userError && userData) {
      // Map user data to PVs
      return data.map(pv => ({
        ...pv,
        creator: userData.find(u => u.id === pv.created_by)
      }));
    }
  }

  return data;
};

// Fetch PVs for a specific user (client view)
export const fetchUserPVs = async (userId) => {
  const { data: clientData, error: clientError } = await supabaseClient
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (clientError) throw clientError;

  if (!clientData) {
    throw new Error('No client record found for user');
  }

  const { data, error } = await supabaseClient
    .from('pv')
    .select(`
      *,
      projects:project_id (
        name
      )
    `)
    .eq('client_id', clientData.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch user information separately, but only for valid user IDs
  if (data && data.length > 0) {
    // Filter out null or undefined user IDs before making the query
    const userIds = [...new Set(data.map(pv => pv.created_by).filter(id => id !== null && id !== undefined))];
    
    // Only make the user query if we actually have user IDs
    if (userIds.length > 0) {
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds);

      if (!userError && userData) {
        // Map user data to PVs
        return data.map(pv => ({
          ...pv,
          creator: pv.created_by ? userData.find(u => u.id === pv.created_by) : null
        }));
      }
    }
  }

  return data;
};

// Create a new PV
export const createPV = async (pvData) => {
  try {
    // Upload de fichier si présent
    let filePath = null;
    
    if (pvData.file) {
      const fileExt = pvData.file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      filePath = fileName;
      
      // Upload du fichier
      const { error: uploadError } = await supabaseClient
        .storage
        .from('pv_files')
        .upload(filePath, pvData.file);
        
      if (uploadError) throw uploadError;
    }
    
    // Calculer la date d'échéance (30 jours à partir d'aujourd'hui)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    // Création de l'entrée PV
    const { data, error } = await supabaseClient
      .from('pv')
      .insert([
        {
          title: pvData.title,
          description: pvData.description || null,
          status: 'En attente de signature',
          file_path: filePath,
          client_id: pvData.client_id,
          project_id: pvData.project_id,
          due_date: dueDate.toISOString()
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating PV:', error);
    return { data: null, error };
  }
};

// Update a PV
export const updatePV = async (pvId, updateData) => {
  try {
    const { data, error } = await supabaseClient
      .from('pv')
      .update(updateData)
      .eq('id', pvId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating PV:', error);
    return { data: null, error };
  }
};

// Upload PV file
export const uploadPVFile = async (file, pvId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pvId}-${Date.now()}.${fileExt}`;
  const filePath = `pv/${fileName}`;

  const { error: uploadError } = await supabaseClient.storage
    .from('pv_files')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabaseClient.storage
    .from('pv_files')
    .getPublicUrl(filePath);

  await updatePV(pvId, { file_path: filePath });

  return { filePath, publicUrl };
};

// Upload signed PV file
export const uploadSignedPVFile = async (file, pvId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pvId}-signed-${Date.now()}.${fileExt}`;
  const filePath = `pv/signed/${fileName}`;

  const { error: uploadError } = await supabaseClient.storage
    .from('pv_files')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabaseClient.storage
    .from('pv_files')
    .getPublicUrl(filePath);

  await updatePV(pvId, { 
    signed_file_path: filePath,
    status: 'Signé',
    signed_at: new Date().toISOString()
  });

  return { filePath, publicUrl };
};

// Download PV file
export const downloadPVFile = async (filePath) => {
  try {
    const { data, error } = await supabaseClient
      .storage
      .from('pv_files')
      .download(filePath);
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error downloading PV file:', error);
    return { data: null, error };
  }
};

// Delete a PV
export const deletePV = async (pvId) => {
  try {
    // D'abord, récupérer le chemin du fichier
    const { data: pvData, error: fetchError } = await supabaseClient
      .from('pv')
      .select('file_path')
      .eq('id', pvId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Supprimer le fichier si présent
    if (pvData.file_path) {
      const { error: storageError } = await supabaseClient
        .storage
        .from('pv_files')
        .remove([pvData.file_path]);
        
      if (storageError) {
        console.error('Error deleting PV file:', storageError);
        // Continue anyway to delete the record
      }
    }
    
    // Supprimer l'entrée PV
    const { error } = await supabaseClient
      .from('pv')
      .delete()
      .eq('id', pvId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting PV:', error);
    return { success: false, error };
  }
};

// Mark a PV as signed
export const markPVAsSigned = async (pvId) => {
  try {
    const signedAt = new Date().toISOString();
    
    const { data, error } = await supabaseClient
      .from('pv')
      .update({
        status: 'Signé',
        signed_at: signedAt
      })
      .eq('id', pvId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error marking PV as signed:', error);
    return { data: null, error };
  }
};

// Add the pvService object export at the end
export const pvService = {
  fetchPVs,
  fetchUserPVs,
  createPV,
  updatePV,
  uploadPVFile,
  uploadSignedPVFile,
  downloadPVFile,
  deletePV,
  markPVAsSigned
}; 