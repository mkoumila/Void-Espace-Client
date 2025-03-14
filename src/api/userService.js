import supabaseClient from './supabaseClient';

// Fetch all users (for admin dashboard)
export const fetchUsers = async () => {
  try {
    // Use the view that was created in the SQL schema
    const { data, error } = await supabaseClient
      .from('user_management')
      .select('*');
    
    if (error) throw error;

    // Fetch auth audit logs for last login timestamps
    let { data: auditLogs, error: logsError } = await supabaseClient
      .from('auth_audit_log_view')
      .select('user_id, timestamp, email')
      .eq('event_type', 'login')
      .order('timestamp', { ascending: false });
    
    if (logsError) {
      console.warn("Error fetching audit logs:", logsError);
      
      // If the view doesn't exist, try to create it
      if (logsError.code === 'PGRST116') { 
        try {
          await createAuthAuditLogView();
          // Try fetching logs again after creating the view
          const { data: retryLogs, error: retryError } = await supabaseClient
            .from('auth_audit_log_view')
            .select('user_id, timestamp, email')
            .eq('event_type', 'login')
            .order('timestamp', { ascending: false });
          
          if (!retryError) {
            auditLogs = retryLogs;
          } else {
            console.warn("Error after creating view:", retryError);
          }
        } catch (viewError) {
          console.warn('Could not create auth audit log view:', viewError);
        }
      }
    }

    // Create a map of user_id to last login timestamp
    const lastLoginMap = {};
    
    // Process audit logs if available
    if (auditLogs && auditLogs.length > 0) {
      auditLogs.forEach(log => {
        // Only store the most recent login per user (we already sorted by timestamp descending)
        if (log.user_id && !lastLoginMap[log.user_id]) {
          lastLoginMap[log.user_id] = log.timestamp;
        }
      });
      
      // If few matches were found, try matching by email
      if (Object.keys(lastLoginMap).length < data.length / 2) {
        data.forEach(user => {
          // Skip users who already have a login timestamp
          if (lastLoginMap[user.id]) return;
          
          // Try to find a matching log by email
          const matchingLog = auditLogs.find(log => 
            log.email && log.email.toLowerCase() === user.email.toLowerCase()
          );
          
          if (matchingLog) {
            lastLoginMap[user.id] = matchingLog.timestamp;
          }
        });
      }
    }
    
    // If no login records found, check raw audit logs silently
    if (Object.keys(lastLoginMap).length === 0) {
      await checkRawAuditLogs();
    }

    // Transform the data to match the expected format
    return data.map(user => ({
      id: user.id,
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email.split('@')[0],
      email: user.email,
      role: formatRole(user.role),
      company: user.company || '',
      lastLogin: lastLoginMap[user.id] || null,
      status: user.has_client_record ? 'active' : 'inactive',
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// If auth_audit_log_view doesn't exist, here's a function to create it
export const createAuthAuditLogView = async () => {
  try {
    const { error } = await supabaseClient.rpc('create_auth_audit_log_view');
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating auth audit log view:', error);
    throw error;
  }
};

// Debug function to check raw audit log entries
export const checkRawAuditLogs = async () => {
  try {
    // Direct query to explore the audit log structure
    const { data, error } = await supabaseClient.rpc('debug_audit_logs');
    
    if (error) {
      console.error('Error checking raw audit logs:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Exception checking raw audit logs:', error);
    return { error };
  }
};

// Helper function to format role from database value to display value
export const formatRole = (role) => {
  switch (role) {
    case 'admin': return 'Administrateur';
    case 'gestionnaire': return 'Gestionnaire';
    case 'client': return 'Client';
    default: return 'Client';
  }
};

// Helper function to convert display role to database value
export const getDatabaseRole = (displayRole) => {
  switch (displayRole) {
    case 'Administrateur': return 'admin';
    case 'Gestionnaire': return 'gestionnaire';
    case 'Client': return 'client';
    default: return 'client';
  }
};

// Create a new user (calling to Supabase Edge Function if available)
export const createUser = async (userData) => {
  try {
    // Check if edge functions are available in the current environment
    if (typeof supabaseClient.functions !== 'undefined') {
      // Production environment - use edge function
      const { data, error } = await supabaseClient.functions.invoke('create-user', {
        body: {
          email: userData.email,
          firstName: userData.name.split(' ')[0] || '',
          lastName: userData.name.split(' ').slice(1).join(' ') || '',
          company: userData.company,
          role: getDatabaseRole(userData.role)
        }
      });
      
      if (error) throw error;
      return data;
    } else {
      // Mock environment (development without edge functions)
      console.warn('Edge functions not available, using mock implementation for createUser');
      
      // Create a mock user with a generated ID
      const mockUserId = `mock-${Date.now()}`;
      
      return {
        id: mockUserId,
        name: userData.name || userData.email.split('@')[0],
        email: userData.email,
        role: userData.role,
        company: userData.company || '',
        lastLogin: null,
        status: 'active',
        createdAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user status (calling to Supabase Edge Function if available)
export const updateUserStatus = async (userId, newStatus) => {
  try {
    // Check if edge functions are available
    if (typeof supabaseClient.functions !== 'undefined') {
      // Production environment - use edge function
      const { data, error } = await supabaseClient.functions.invoke('update-user-status', {
        body: {
          userId,
          newStatus
        }
      });
      
      if (error) throw error;
      return data;
    } else {
      // Mock environment
      console.warn('Edge functions not available, using mock implementation for updateUserStatus');
      return { success: true };
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Resend invitation to user (calling to Supabase Edge Function if available)
export const resendInvitation = async (userEmail) => {
  try {
    // Check if edge functions are available
    if (typeof supabaseClient.functions !== 'undefined') {
      // Production environment - use edge function
      const { data, error } = await supabaseClient.functions.invoke('resend-invitation', {
        body: {
          email: userEmail
        }
      });
      
      if (error) throw error;
      return data;
    } else {
      // Mock environment
      console.warn('Edge functions not available, using mock implementation for resendInvitation');
      return { success: true };
    }
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
}; 