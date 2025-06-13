/**
 * Data service for managing user-entered content
 * This replaces mock data with user-editable data stored in localStorage
 */

// Default challenges and resources to initialize the system
const defaultChallenges = [
  {
    id: 'ch1',
    title: 'Python List Comprehension',
    description: 'Create a function that uses list comprehension to return all numbers divisible by 3 from a given list.',
    difficulty: 'Easy',
    language: 'Python',
    timeLimit: 30,
    points: 100,
    attempts: 0,
    completed: false,
    bestScore: 0,
    example: 'Input: [1, 2, 3, 4, 5, 6, 9, 10, 12]\nOutput: [3, 6, 9, 12]',
    initialCode: '# Python 3\n\ndef divisible_by_three(numbers):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(divisible_by_three([1, 2, 3, 4, 5, 6, 9, 10, 12]))'
  },
  {
    id: 'ch2',
    title: 'SQL Database Query',
    description: 'Write a SQL query to fetch all employees who earn more than the average salary.',
    difficulty: 'Medium',
    language: 'SQL',
    timeLimit: 45,
    points: 200,
    attempts: 0,
    completed: false,
    bestScore: 0,
    example: 'Table: employees(id, name, salary)\nExpected: Return name and salary of employees with salary > average',
    initialCode: '-- Write your SQL query here\n\nSELECT name, salary\nFROM employees\nWHERE salary > (\n  -- Complete this query\n);'
  }
];

const defaultResources = [
  {
    id: 1,
    title: 'Python Programming Guide',
    description: 'Comprehensive guide to Python programming with examples',
    type: 'pdf',
    category: 'python',
    url: 'https://example.com/python-guide.pdf',
    created_at: '2025-05-01T10:30:00Z',
    size: '2.4 MB'
  },
  {
    id: 2,
    title: 'SQL Cheat Sheet',
    description: 'Quick reference for common SQL commands and syntax',
    type: 'pdf',
    category: 'sql',
    url: 'https://example.com/sql-cheatsheet.pdf',
    created_at: '2025-05-05T14:20:00Z',
    size: '1.1 MB'
  }
];

/**
 * Data service for managing challenges and resources
 */
const dataService = {
  /**
   * Initialize data storage if it doesn't exist
   */
  initializeData: () => {
    // Check if challenges exist in localStorage
    if (!localStorage.getItem('userChallenges')) {
      localStorage.setItem('userChallenges', JSON.stringify(defaultChallenges));
    }
    
    // Check if resources exist in localStorage
    if (!localStorage.getItem('userResources')) {
      localStorage.setItem('userResources', JSON.stringify(defaultResources));
    }
  },
  
  /**
   * Get all challenges
   * @returns {Array} - All challenges
   */
  getChallenges: () => {
    dataService.initializeData();
    return JSON.parse(localStorage.getItem('userChallenges') || '[]');
  },
  
  /**
   * Get a challenge by ID
   * @param {string} id - Challenge ID
   * @returns {Object|null} - Challenge object or null if not found
   */
  getChallenge: (id) => {
    const challenges = dataService.getChallenges();
    return challenges.find(challenge => challenge.id === id) || null;
  },
  
  /**
   * Add a new challenge
   * @param {Object} challenge - Challenge object
   * @returns {Object} - Added challenge with generated ID
   */
  addChallenge: (challenge) => {
    const challenges = dataService.getChallenges();
    
    // Generate a unique ID
    const newId = 'ch' + (Math.max(0, ...challenges.map(c => parseInt(c.id.replace('ch', '')) || 0)) + 1);
    
    const newChallenge = {
      ...challenge,
      id: newId,
      attempts: 0,
      completed: false,
      bestScore: 0
    };
    
    challenges.push(newChallenge);
    localStorage.setItem('userChallenges', JSON.stringify(challenges));
    
    return newChallenge;
  },
  
  /**
   * Update an existing challenge
   * @param {string} id - Challenge ID
   * @param {Object} updatedData - Updated challenge data
   * @returns {Object|null} - Updated challenge or null if not found
   */
  updateChallenge: (id, updatedData) => {
    const challenges = dataService.getChallenges();
    const index = challenges.findIndex(challenge => challenge.id === id);
    
    if (index === -1) return null;
    
    challenges[index] = { ...challenges[index], ...updatedData };
    localStorage.setItem('userChallenges', JSON.stringify(challenges));
    
    return challenges[index];
  },
  
  /**
   * Delete a challenge
   * @param {string} id - Challenge ID
   * @returns {boolean} - Success status
   */
  deleteChallenge: (id) => {
    const challenges = dataService.getChallenges();
    const newChallenges = challenges.filter(challenge => challenge.id !== id);
    
    if (newChallenges.length === challenges.length) return false;
    
    localStorage.setItem('userChallenges', JSON.stringify(newChallenges));
    return true;
  },
  
  /**
   * Get all resources
   * @returns {Array} - All resources
   */
  getResources: () => {
    dataService.initializeData();
    return JSON.parse(localStorage.getItem('userResources') || '[]');
  },
  
  /**
   * Add a new resource
   * @param {Object} resource - Resource object
   * @returns {Object} - Added resource with generated ID
   */
  addResource: (resource) => {
    const resources = dataService.getResources();
    
    // Generate a unique ID
    const newId = Math.max(0, ...resources.map(r => r.id || 0)) + 1;
    
    const newResource = {
      ...resource,
      id: newId,
      created_at: new Date().toISOString()
    };
    
    resources.push(newResource);
    localStorage.setItem('userResources', JSON.stringify(resources));
    
    return newResource;
  },
  
  /**
   * Update an existing resource
   * @param {number} id - Resource ID
   * @param {Object} updatedData - Updated resource data
   * @returns {Object|null} - Updated resource or null if not found
   */
  updateResource: (id, updatedData) => {
    const resources = dataService.getResources();
    const index = resources.findIndex(resource => resource.id === id);
    
    if (index === -1) return null;
    
    resources[index] = { ...resources[index], ...updatedData };
    localStorage.setItem('userResources', JSON.stringify(resources));
    
    return resources[index];
  },
  
  /**
   * Delete a resource
   * @param {number} id - Resource ID
   * @returns {boolean} - Success status
   */
  deleteResource: (id) => {
    const resources = dataService.getResources();
    const newResources = resources.filter(resource => resource.id !== id);
    
    if (newResources.length === resources.length) return false;
    
    localStorage.setItem('userResources', JSON.stringify(newResources));
    return true;
  },
  
  /**
   * Clear all user data (for testing)
   */
  clearAllData: () => {
    localStorage.removeItem('userChallenges');
    localStorage.removeItem('userResources');
    dataService.initializeData();
  },
  
  /**
   * Reset challenges to default
   * @returns {Array} - Default challenges
   */
  resetChallenges: () => {
    localStorage.setItem('userChallenges', JSON.stringify(defaultChallenges));
    return defaultChallenges;
  },
  
  /**
   * Reset resources to default
   * @returns {Array} - Default resources
   */
  resetResources: () => {
    localStorage.setItem('userResources', JSON.stringify(defaultResources));
    return defaultResources;
  }
};

export default dataService;
