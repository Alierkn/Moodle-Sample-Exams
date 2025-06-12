import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code } from 'lucide-react';
import AccessibleButton from './common/AccessibleButton';

/**
 * Home page component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 */
const HomePage = ({ user }) => {
  return (
    <div className="text-center py-12 transition-theme">
      <h1 className="text-4xl font-bold mb-6">Welcome to Moodle Exam Simulator</h1>
      <p className="text-xl mb-8">Practice programming challenges in a Moodle-like environment</p>
      
      {user ? (
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
          <Link to="/challenges">
            <AccessibleButton 
              variant="primary" 
              size="lg"
              className="flex items-center justify-center space-x-2"
              ariaLabel="Start practicing coding challenges"
            >
              <Code size={20} />
              <span>Start Practicing</span>
            </AccessibleButton>
          </Link>
          
          <Link to="/documents">
            <AccessibleButton 
              variant="success" 
              size="lg"
              className="flex items-center justify-center space-x-2"
              ariaLabel="View documentation and learning resources"
            >
              <BookOpen size={20} />
              <span>View Documents</span>
            </AccessibleButton>
          </Link>
        </div>
      ) : (
        <Link to="/login">
          <AccessibleButton 
            variant="primary" 
            size="lg"
            ariaLabel="Login to start using the application"
          >
            Login to Start
          </AccessibleButton>
        </Link>
      )}
      
      {/* Feature highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-theme">
          <h3 className="text-xl font-semibold mb-3">Practice Coding</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Solve real programming challenges similar to those found in Moodle exams.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-theme">
          <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your performance and see how you improve over time.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-theme">
          <h3 className="text-xl font-semibold mb-3">Learn Resources</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Access helpful documentation and learning materials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
