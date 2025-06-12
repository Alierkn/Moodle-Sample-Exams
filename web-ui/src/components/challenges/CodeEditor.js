import React, { useState, useEffect } from 'react';
import { runCode } from '../../services/supabaseService';

/**
 * Code Editor component
 * Provides a code editor and compiler for challenges
 */
const CodeEditor = ({ challenge }) => {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set initial code from challenge if available
    if (challenge && challenge.initial_code) {
      setCode(challenge.initial_code);
    } else {
      // Default code templates based on language
      const defaultTemplates = {
        python: '# Write your Python code here\n\ndef solution():\n    # Your code here\n    pass\n\n# Example usage\nresult = solution()\nprint(result)',
        neo4j: '// Write your Neo4j Cypher query here\nMATCH (n)\nRETURN n LIMIT 10',
        mongodb: '// Write your MongoDB query here\n{\n  "find": "collection",\n  "filter": {}\n}',
        sql: '-- Write your SQL query here\nSELECT * FROM table LIMIT 10;'
      };
      
      setCode(defaultTemplates[challenge?.language?.toLowerCase()] || defaultTemplates.python);
    }
    
    // Reset results when challenge changes
    setResult(null);
    setError('');
  }, [challenge]);

  const handleRunCode = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    
    try {
      const codeData = {
        code,
        language: challenge?.language?.toLowerCase() || 'python',
        input,
        challenge_id: challenge?.id
      };
      
      const response = await runCode(codeData);
      setResult(response);
      
      if (!response.success && !response.error) {
        setError('Failed to run code. Please try again.');
      }
    } catch (err) {
      console.error('Error running code:', err);
      setError('An unexpected error occurred');
    } finally {
      setRunning(false);
    }
  };

  const getLanguageLabel = () => {
    const language = challenge?.language?.toLowerCase() || 'python';
    switch (language) {
      case 'python':
        return 'Python';
      case 'neo4j':
        return 'Neo4j Cypher';
      case 'mongodb':
        return 'MongoDB Query';
      case 'sql':
        return 'SQL';
      default:
        return 'Code';
    }
  };

  const getResultColor = () => {
    if (!result) return '';
    return result.success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {challenge && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{challenge.title}</h2>
          <p className="text-gray-700 mb-4">{challenge.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {challenge.language}
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {challenge.difficulty}
            </span>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {challenge.points} points
            </span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code-editor">
          {getLanguageLabel()}
        </label>
        <textarea
          id="code-editor"
          className="font-mono w-full h-64 p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
      </div>

      {(challenge?.language?.toLowerCase() === 'python') && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="input">
            Input (optional)
          </label>
          <textarea
            id="input"
            className="font-mono w-full h-20 p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input data here (one value per line)"
            spellCheck="false"
          />
        </div>
      )}

      <div className="mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleRunCode}
          disabled={running}
        >
          {running ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Results</h3>
          
          <div className="mb-4">
            <div className={`font-bold ${getResultColor()}`}>
              {result.success ? 'Success!' : 'Failed'}
            </div>
            
            <div className="text-sm text-gray-600 mt-1">
              Execution Time: {result.executionTime}ms
            </div>
            
            {(result.testsPassed !== undefined && result.totalTests !== undefined) && (
              <div className="text-sm mt-1">
                Tests Passed: <span className={result.testsPassed === result.totalTests ? 'text-green-600' : 'text-red-600'}>
                  {result.testsPassed}/{result.totalTests}
                </span>
              </div>
            )}
          </div>
          
          {result.output && (
            <div className="mb-4">
              <h4 className="font-bold text-gray-700 mb-1">Output:</h4>
              <pre className="font-mono bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {result.output}
              </pre>
            </div>
          )}
          
          {result.error && (
            <div className="mb-4">
              <h4 className="font-bold text-red-600 mb-1">Error:</h4>
              <pre className="font-mono bg-red-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-red-700">
                {result.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
