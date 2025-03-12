import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for the entire app
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'espace-client-auth',
    storage: localStorage,
  },
  global: {
    fetch: (...args) => {
      // Create a custom fetch with timeout
      return new Promise((resolve, reject) => {
        // Set a timeout to abort fetch after 8 seconds
        const timeoutId = setTimeout(() => {
          const error = new Error('Request timed out');
          error.name = 'TimeoutError';
          reject(error);
        }, 8000);

        fetch(...args)
          .then(response => {
            clearTimeout(timeoutId);
            resolve(response);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            reject(error);
          });
      });
    }
  }
});

// Create a wrapper function for database operations with retries
const withRetry = async (operation, maxRetries = 1) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Add shorter backoff delay
        await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt - 1)));
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry certain errors
      if (error.code === 'PGRST301' || 
          error.code === 'PGRST302' || 
          error.name === 'TimeoutError') {
        break;
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
};

// Extend the supabase client with retry-wrapped methods
const originalFrom = supabaseClient.from.bind(supabaseClient);
supabaseClient.from = (table) => {
  const builder = originalFrom(table);
  
  // Wrap select method with retry logic
  const originalSelect = builder.select.bind(builder);
  builder.select = (...args) => {
    const selectBuilder = originalSelect(...args);
    
    // Store original functions
    const originalSingle = selectBuilder.single.bind(selectBuilder);
    const originalThen = selectBuilder.then.bind(selectBuilder);
    
    // Replace with retry-wrapped versions
    selectBuilder.single = function() {
      const singleBuilder = originalSingle();
      const originalThenSingle = singleBuilder.then.bind(singleBuilder);
      
      singleBuilder.then = function(onFulfilled, onRejected) {
        return withRetry(() => originalThenSingle(onFulfilled, onRejected));
      };
      
      return singleBuilder;
    };
    
    selectBuilder.then = function(onFulfilled, onRejected) {
      return withRetry(() => originalThen(onFulfilled, onRejected));
    };
    
    return selectBuilder;
  };
  
  return builder;
};

export default supabaseClient; 