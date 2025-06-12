import React, { useState, useEffect } from 'react';
import { Play, Code, Terminal, CheckCircle, XCircle, GitBranch, Database, Layers, Award, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

export default function CodeEditor({ testResults, isRunning, setTestResults, setIsRunning, user }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [setupQuery, setSetupQuery] = useState('');
  const [dbName, setDbName] = useState('test');
  const [collectionName, setCollectionName] = useState('test');
  const [operation, setOperation] = useState('find');
  const [dbType, setDbType] = useState('sqlite');
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Load challenge from localStorage if available
  useEffect(() => {
    const savedChallenge = localStorage.getItem('currentChallenge');
    if (savedChallenge) {
      try {
        const challenge = JSON.parse(savedChallenge);
        setCurrentChallenge(challenge);
        setCode(challenge.template || '');
        setLanguage(challenge.language || 'python');
        setExpectedOutput(challenge.expectedOutput || '');
      } catch (error) {
        console.error('Error parsing saved challenge:', error);
      }
    }
  }, []);

  const handleRunCode = async () => {
    setIsRunning(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      let additionalParams = {};
      
      if (language === 'neo4j') {
        additionalParams = { setupQuery };
      } else if (language === 'mongodb') {
        additionalParams = { dbName, collectionName, operation };
      } else if (language === 'sql') {
        additionalParams = { dbType, setupQuery };
      }
      
      // If we're working on a challenge, use the challenge submission API
      if (currentChallenge && currentChallenge.id) {
        const result = await apiService.submitChallenge(
          currentChallenge.id,
          code,
          language
        );
        
        // Format the results for display
        const formattedResult = {
          success: result.success,
          output: result.testResults?.map(t => `Input: ${t.input}\nExpected: ${t.expected}\nActual: ${t.actual}\nPassed: ${t.passed}`).join('\n\n') || '',
          executionTime: result.executionTime || 0,
          memoryUsage: 0, // Not provided by our API
          testsPassed: result.testResults?.filter(t => t.passed).length || 0,
          totalTests: result.testResults?.length || 0,
          details: result.testResults?.map((t, i) => ({
            name: `Test Case ${i+1}`,
            passed: t.passed,
            time: 'N/A'
          })) || []
        };
        
        setTestResults(formattedResult);
      } else {
        // Regular code execution for non-challenge code
        const result = await apiService.runCode(
          code,
          language,
          expectedOutput,
          additionalParams
        );
        
        setTestResults(result);
      }
    } catch (error) {
      console.error('Error running code:', error);
      setTestResults({
        success: false,
        output: error.response?.data?.message || 'An error occurred while running the code',
        executionTime: 0,
        memoryUsage: 0,
        testsPassed: 0,
        totalTests: 1,
        details: []
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  const saveProgress = async () => {
    if (!currentChallenge || !user) return;
    
    try {
      setIsSaving(true);
      // Kullanıcının kodunu localStorage'a kaydet
      localStorage.setItem(`userCode_${currentChallenge.id}`, code);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setSaveError('Kod kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleBackToChallenges = () => {
    navigate('/challenges');
  };

  const getLanguageIcon = (lang) => {
    switch(lang) {
      case 'python': return <Code className="w-5 h-5" />;
      case 'neo4j': return <GitBranch className="w-5 h-5" />;
      case 'mongodb': return <Database className="w-5 h-5" />;
      case 'sql': return <Layers className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Challenge Info Header */}
      {currentChallenge && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBackToChallenges}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-bold text-white">{currentChallenge.title}</h2>
              <span 
                className={`px-2 py-1 text-xs rounded-full ${
                  currentChallenge.difficulty === 'Easy' ? 'bg-green-900 text-green-300' : 
                  currentChallenge.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' : 
                  'bg-red-900 text-red-300'}`}
              >
                {currentChallenge.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Award className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-300">{currentChallenge.points} points</span>
              </div>
              {saveSuccess && (
                <div className="flex items-center text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Progress saved!</span>
                </div>
              )}
              {saveError && (
                <div className="flex items-center text-red-400 text-sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>{saveError}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-400 text-sm">{currentChallenge.description}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            disabled={currentChallenge !== null}
          >
            <option value="python">Python</option>
            <option value="neo4j">Neo4j</option>
            <option value="mongodb">MongoDB</option>
            <option value="sql">SQL</option>
          </select>
          
          <div className="flex items-center gap-2 text-gray-400">
            {getLanguageIcon(language)}
            <span className="capitalize">{language}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user && currentChallenge && (
            <button
              onClick={saveProgress}
              disabled={isSaving || isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Progress
                </>
              )}
            </button>
          )}
          
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <div className="bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
              <span className="text-gray-400 text-sm">Code Editor</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Write your ${language} code here...`}
              className="w-full h-64 bg-gray-900 text-white font-mono text-sm p-4 rounded-b-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
          
          {language === 'python' && (
            <div>
              <div className="bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
                <span className="text-gray-400 text-sm">Expected Output (Optional)</span>
              </div>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="Write the expected output here..."
                className="w-full h-24 bg-gray-900 text-white font-mono text-sm p-4 rounded-b-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          )}
          
          {language === 'neo4j' && (
            <div>
              <div className="bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
                <span className="text-gray-400 text-sm">Setup Query (Optional)</span>
              </div>
              <textarea
                value={setupQuery}
                onChange={(e) => setSetupQuery(e.target.value)}
                placeholder="Write your data preparation queries here..."
                className="w-full h-24 bg-gray-900 text-white font-mono text-sm p-4 rounded-b-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          )}
          
          {language === 'mongodb' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Database Name</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="w-full bg-gray-900 text-white font-mono text-sm p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Collection Name</label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className="w-full bg-gray-900 text-white font-mono text-sm p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full bg-gray-900 text-white font-mono text-sm p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="find">Find</option>
                  <option value="insert">Insert</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="aggregate">Aggregate</option>
                </select>
              </div>
            </div>
          )}
          
          {language === 'sql' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Database Type</label>
                <select
                  value={dbType}
                  onChange={(e) => setDbType(e.target.value)}
                  className="w-full bg-gray-900 text-white font-mono text-sm p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="sqlite">SQLite</option>
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                </select>
              </div>
              <div>
                <div className="bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
                  <span className="text-gray-400 text-sm">Setup Query (Optional)</span>
                </div>
                <textarea
                  value={setupQuery}
                  onChange={(e) => setSetupQuery(e.target.value)}
                  placeholder="Write your data preparation queries here..."
                  className="w-full h-24 bg-gray-900 text-white font-mono text-sm p-4 rounded-b-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                  spellCheck={false}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Results</span>
          </div>
          <div className="h-96 bg-gray-900 text-white font-mono text-sm p-4 rounded-b-lg border border-gray-700 overflow-auto">
            {testResults ? (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 ${testResults.success ? 'text-green-400' : 'text-red-400'}`}>
                  {testResults.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="font-bold">{testResults.success ? 'SUCCESS' : 'FAILED'}</span>
                </div>

                <div className="text-gray-300">
                  <pre>{testResults.output}</pre>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Execution Time:</span>
                    <span className="text-white">{testResults.executionTime}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Memory Usage:</span>
                    <span className="text-white">{testResults.memoryUsage}MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Test Results:</span>
                    <span className={testResults.testsPassed === testResults.totalTests ? 'text-green-400' : 'text-yellow-400'}>
                      {testResults.testsPassed}/{testResults.totalTests} Passed
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Test Details:</h4>
                  <div className="space-y-1">
                    {testResults.details.map((test, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {test.passed ? 
                            <CheckCircle className="w-4 h-4 text-green-400" /> : 
                            <XCircle className="w-4 h-4 text-red-400" />
                          }
                          <span className="text-gray-300">{test.name}</span>
                        </div>
                        <span className="text-gray-500">{test.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Results will appear here when code is executed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
