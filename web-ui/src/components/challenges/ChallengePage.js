import React, { useState } from 'react';
import ChallengeList from './ChallengeList';
import CodeEditor from './CodeEditor';

/**
 * Challenge page component
 * Combines challenge list and code editor
 */
const ChallengePage = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Moodle Exam Practice</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChallengeList onSelectChallenge={handleSelectChallenge} />
        </div>
        
        <div className="lg:col-span-2">
          {selectedChallenge ? (
            <CodeEditor challenge={selectedChallenge} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Select a Challenge</h2>
                <p className="text-gray-600">
                  Choose a challenge from the list to start coding and test your skills.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
