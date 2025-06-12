import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not set. Authentication will not work properly.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

export default supabase;
