import { createClient } from '@supabase/supabase-js';

// Environment variables should be prefixed with REACT_APP_ for Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Validate Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseKey && supabaseUrl !== 'https://example.supabase.co';
if (!hasValidCredentials) {
  console.warn('Supabase credentials are not configured correctly! Falling back to mock mode.');
}

// Create a client with retry and error handling
let supabase;

if (hasValidCredentials) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        // Add fetch retry options for increased reliability
        fetch: async (url, options = {}) => {
          const MAX_RETRIES = 3;
          let error;
          
          for (let i = 0; i < MAX_RETRIES; i++) {
            try {
              return await fetch(url, options);
            } catch (err) {
              error = err;
              // Exponential backoff: 200ms, 400ms, 800ms
              await new Promise(r => setTimeout(r, 200 * Math.pow(2, i)));
            }
          }
          throw error;
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = null; // Will use mock mode
  }
}

// If no valid credentials or initialization failed, use mock mode
if (!supabase) {
  console.log('Using mock mode for data services');
  // Create a mock client that returns empty data with success
  supabase = {
    auth: {
      signUp: async () => ({ data: { user: { id: 'mock-user-1' } }, error: null }),
      signInWithPassword: async () => ({ 
        data: { user: { id: 'mock-user-1', email: 'mock@example.com' } }, 
        error: null 
      }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ 
        data: { user: { id: 'mock-user-1', email: 'mock@example.com' } }, 
        error: null 
      })
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: {}, error: null })
        }),
        order: () => ({
          limit: () => ({ data: [], error: null })
        })
      }),
      insert: async () => ({ data: {}, error: null }),
      update: async () => ({ data: {}, error: null }),
      delete: async () => ({ data: {}, error: null })
    }),
    storage: {
      from: (bucket) => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null }),
        list: async () => ({ data: [], error: null }),
        getPublicUrl: async (path) => ({ data: { publicUrl: `mock-url/${path}` }, error: null }),
        remove: async () => ({ data: {}, error: null })
      })
    }
  };
}

/**
 * Authentication service for Supabase
 */
export const authService = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Username
   * @returns {Promise} - Registration result
   */
  register: async (email, password, username) => {
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create user profile in the users table
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              username,
              email,
              created_at: new Date(),
              points: 0,
              role: 'user',
            },
          ]);

        if (profileError) throw profileError;
      }

      return { success: true, user: authData?.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Login result
   */
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile data
      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Combine auth and profile data
        return {
          success: true,
          user: {
            ...data.user,
            profile: profileData,
          },
        };
      }

      return { success: true, user: data?.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  /**
   * Logout the current user
   * @returns {Promise} - Logout result
   */
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message || 'Logout failed' };
    }
  },

  /**
   * Get the current logged in user
   * @returns {Promise} - Current user data
   */
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data?.user) {
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Combine auth and profile data
        return {
          success: true,
          user: {
            ...data.user,
            profile: profileData,
          },
        };
      }
      
      return { success: false, user: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message, user: null };
    }
  },
};

/**
 * Challenge service for Supabase
 */
export const challengeService = {
  /**
   * Get all challenges
   * @returns {Promise} - Challenges data
   */
  getChallenges: async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { success: true, challenges: data };
    } catch (error) {
      console.error('Get challenges error:', error);
      return { success: false, error: error.message, challenges: [] };
    }
  },

  /**
   * Get a challenge by ID
   * @param {string} id - Challenge ID
   * @returns {Promise} - Challenge data
   */
  getChallenge: async (id) => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return { success: true, challenge: data };
    } catch (error) {
      console.error('Get challenge error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Submit a solution for a challenge
   * @param {string} userId - User ID
   * @param {string} challengeId - Challenge ID
   * @param {string} solution - Solution code
   * @param {number} executionTime - Execution time in ms
   * @returns {Promise} - Submission result
   */
  submitSolution: async (userId, challengeId, solution, executionTime) => {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .insert([
          {
            user_id: userId,
            challenge_id: challengeId,
            solution,
            execution_time: executionTime,
            completed_at: new Date(),
          },
        ]);

      if (error) throw error;
      
      return { success: true, submission: data };
    } catch (error) {
      console.error('Submit solution error:', error);
      return { success: false, error: error.message };
    }
  },
};

/**
 * Document service for Supabase storage
 */
export const documentService = {
  /**
   * Upload a document to Supabase storage
   * @param {File} file - File to upload
   * @param {string} path - Path in the bucket to store the file
   * @returns {Promise} - Upload result
   */
  uploadDocument: async (file, path = '') => {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      const { data, error } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;
      
      return { success: true, document: data };
    } catch (error) {
      console.error('Upload document error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * List documents in Supabase storage
   * @param {string} path - Path to list documents from
   * @returns {Promise} - List result
   */
  listDocuments: async (path = '') => {
    try {
      const { data, error } = await supabase
        .storage
        .from('documents')
        .list(path);

      if (error) throw error;
      
      return { success: true, documents: data };
    } catch (error) {
      console.error('List documents error:', error);
      return { success: false, error: error.message, documents: [] };
    }
  },

  /**
   * Get a public URL for a document
   * @param {string} path - Path to the document
   * @returns {Promise} - URL result
   */
  getDocumentUrl: async (path) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('documents')
        .getPublicUrl(path);

      if (error) throw error;
      
      return { success: true, url: data.publicUrl };
    } catch (error) {
      console.error('Get document URL error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a document from Supabase storage
   * @param {string} path - Path to the document
   * @returns {Promise} - Deletion result
   */
  deleteDocument: async (path) => {
    try {
      const { error } = await supabase
        .storage
        .from('documents')
        .remove([path]);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Delete document error:', error);
      return { success: false, error: error.message };
    }
  }
};

export default supabase;
