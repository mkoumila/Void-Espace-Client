import supabaseClient from './supabaseClient';

export const paymentService = {
  // Fetch all payments for a client
  async fetchPayments(clientId) {
    const { data, error } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  // Create a new payment
  async createPayment(payment) {
    const { data, error } = await supabaseClient
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  // Update a payment
  async updatePayment(id, updates) {
    const { data, error } = await supabaseClient
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  // Delete a payment
  async deletePayment(id) {
    const { error } = await supabaseClient
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  // Get payment by ID
  async getPayment(id) {
    const { data, error } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  // Download payment file
  async downloadPaymentFile(filePath, paymentReference) {
    try {
      if (!filePath) {
        throw new Error('No file path provided');
      }

      const { data, error } = await supabaseClient
        .storage
        .from('payments')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Create a blob from the file data
      const blob = new Blob([data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture-${paymentReference}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading payment file:', error);
      throw error;
    }
  },

  // Create a payment followup
  async createPaymentFollowup(paymentId, data) {
    try {
      const { data: followup, error } = await supabaseClient
        .from("payment_followups")
        .insert([
          {
            payment_id: paymentId,
            type: data.email ? 'email' : 'phone',
            comment: data.comment,
            created_by: data.created_by
          }
        ])
        .select(`
          id,
          type,
          comment,
          created_at,
          created_by
        `)
        .single();

      if (error) throw error;
      return followup;
    } catch (error) {
      console.error("Error creating payment followup:", error);
      throw error;
    }
  },

  // Fetch followups for a payment
  async fetchPaymentFollowups(paymentId) {
    try {
      const { data: followups, error } = await supabaseClient
        .from("payment_followups")
        .select(`
          id,
          type,
          comment,
          created_at,
          created_by
        `)
        .eq("payment_id", paymentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return followups;
    } catch (error) {
      console.error("Error fetching payment followups:", error);
      throw error;
    }
  }
}; 