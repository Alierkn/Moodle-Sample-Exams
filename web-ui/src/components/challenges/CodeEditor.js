import React, { useState, useEffect } from 'react';
import { runCode } from '../../services/supabaseService';
import { Play, RotateCcw, Save, Maximize2, Minimize2, Copy, CheckCircle, XCircle, Zap, Award } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

/**
 * Code Editor component
 * Provides a code editor and compiler for challenges
 */
const CodeEditor = ({ challenge }) => {
  const { showSuccess, showError } = useToast();

  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setResult(null);
    setError('');
  }, [challenge]);


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
      if (response.success) {
        showSuccess('Code ran successfully!');
      } else {
        showError(response.error || 'Code failed.');
      }
      if (!response.success && !response.error) {
        setError('Failed to run code. Please try again.');
      }
    } catch (err) {
      console.error('Error running code:', err);
      setError('An unexpected error occurred');
      showError('An unexpected error occurred while running code');
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    if (challenge && challenge.initial_code) {
      setCode(challenge.initial_code);
    } else {
      const defaultTemplates = {
        python: '# Write your Python code here\n\ndef solution():\n    # Your code here\n    pass\n\n# Example usage\nresult = solution()\nprint(result)',
        neo4j: '// Write your Neo4j Cypher query here\nMATCH (n)\nRETURN n LIMIT 10',
        mongodb: '// Write your MongoDB query here\n{\n  "find": "collection",\n  "filter": {}\n}',
        sql: '-- Write your SQL query here\nSELECT * FROM table LIMIT 10;'
      };
      setCode(defaultTemplates[challenge?.language?.toLowerCase()] || defaultTemplates.python);
    }
    setResult(null);
    setError('');
    showSuccess('Code reset to default');
  };

  const handleSave = () => {
    // Simulate save (could be extended to backend)
    showSuccess('Code saved!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    showSuccess('Code copied to clipboard');
  };

  const toggleFullscreen = () => setFullscreen((f) => !f);
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
    <div className={`relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md transition-all duration-300 ${fullscreen ? 'fixed inset-0 z-50 flex flex-col justify-center items-center w-screen h-screen max-w-full max-h-full overflow-auto' : ''}`}>
      {/* Fullscreen Toggle */}
      <button
        className="absolute top-4 right-4 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        onClick={toggleFullscreen}
        title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold" htmlFor="code-editor">
            {getLanguageLabel()}
          </label>
          <div className="flex gap-2">
            <button onClick={handleReset} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Reset Code"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={handleSave} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Save Code"><Save className="w-4 h-4" /></button>
            <button onClick={handleCopy} className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${copied ? 'text-green-600' : ''}`} title="Copy Code"><Copy className="w-4 h-4" /></button>
          </div>
        </div>
        <textarea
          id="code-editor"
          className="font-mono w-full h-64 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-green-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          style={{ fontFamily: 'Fira Code, Monaco, Consolas, monospace' }}
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
