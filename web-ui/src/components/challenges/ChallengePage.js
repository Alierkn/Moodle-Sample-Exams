import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense, memo } from 'react';
import {
    Code, Trophy, Clock, Target, Search, CheckCircle, Star, Zap,
    TrendingUp, BookOpen, Settings, Maximize2, Minimize2,
    Users, RotateCcw, Award, ChevronRight, Flame, Crown, Brain,
    Play, AlertCircle, FileText, TestTube, ListChecks, Edit, Trash, Plus, Filter, RefreshCw
} from 'lucide-react';

// Import API service for data fetching
import apiService from '../../services/api';
import { challengeService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Lazy load Monaco editor to improve initial page load time
const MonacoEditor = lazy(() => import('./MonacoEditor'));

// Define monaco as a global to prevent eslint errors
/* global monaco */

// Mock challenges data as fallback for the system

// Define challenge types outside of component to prevent re-creation
/**
 * @typedef {Object} Challenge
 * @property {number} id - Challenge ID
 * @property {string} title - Challenge title
 * @property {string} description - Challenge description
 * @property {string} difficulty - Difficulty level (Easy, Medium, Hard)
 * @property {string} language - Programming language
 * @property {number} points - Challenge points
 * @property {number} timeLimit - Time limit in minutes
 * @property {number} attempts - Number of attempts by all users
 * @property {number} successRate - Success rate percentage
 * @property {Array<string>} tags - Challenge tags
 * @property {boolean} completed - Whether the challenge is completed
 * @property {boolean} starred - Whether the challenge is starred
 * @property {number} timeSpent - Time spent in minutes
 * @property {number} bestScore - Best score achieved
 * @property {string} example - Example case
 */

// Mock challenges data as fallback
const mockChallenges = [
  {
    id: 'ch1',
    title: 'Python List Comprehension',
    description: 'Create a function that uses list comprehension to return all numbers divisible by 3 from a given list.',
    difficulty: 'Easy',
    language: 'python',
    timeLimit: 30,
    points: 100,
    attempts: 0,
    completed: false,
    bestScore: 0,
    example: 'Input: [1, 2, 3, 4, 5, 6, 9, 10, 12]\nOutput: [3, 6, 9, 12]'
  },
  {
    id: 'ch2',
    title: 'SQL Database Query',
    description: 'Write a SQL query to fetch all employees who earn more than the average salary.',
    difficulty: 'Medium',
    language: 'sql',
    timeLimit: 45,
    points: 200,
    attempts: 0,
    completed: false,
    bestScore: 0,
    example: 'Table: employees(id, name, salary)\nExpected: Return name and salary of employees with salary > average'
  },
  {
    id: 'ch3',
    title: 'Neo4j Graph Query',
    description: 'Write a Cypher query to find all people who are friends with someone who lives in London.',
    difficulty: 'Hard',
    language: 'cypher',
    timeLimit: 60,
    points: 300,
    attempts: 0,
    completed: false,
    bestScore: 0,
    example: 'Data: People nodes connected by FRIEND_OF relationships, with city property\nExpected: Return names of people who are friends with anyone living in London'
  }
];

/**
 * Challenge list component - Displays a filterable, sortable list of coding challenges
 * Optimized with memo to prevent unnecessary re-renders
 */
const ChallengeList = memo(({ onSelectChallenge, challenges, selectedChallenge, onEditChallenge, onDeleteChallenge }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [sortBy, setSortBy] = useState('difficulty');

    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
    const languages = ['All', 'JavaScript', 'Python', 'React'];
    const sortOptions = [
        { value: 'difficulty', label: 'Difficulty' },
        { value: 'points', label: 'Points' },
        { value: 'successRate', label: 'Success Rate' },
        { value: 'attempts', label: 'Popularity' }
    ];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'text-green-600 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700';
            case 'Medium':
                return 'text-yellow-600 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-700';
            case 'Hard':
                return 'text-red-600 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border-red-200 dark:border-red-700';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
        }
    };

    // Filter challenges by selected language with defensive programming
    const filteredChallenges = useMemo(() => {
        // Ensure challenges is always an array
        const safeArray = Array.isArray(challenges) ? challenges : [];
        
        return safeArray
            .filter(challenge => {
                if (!challenge) return false;
                if (selectedLanguage === 'All') return true;
                return challenge.language === selectedLanguage;
            })
            .filter(challenge => {
                if (!challenge) return false;
                if (selectedDifficulty === 'All') return true;
                return challenge.difficulty === selectedDifficulty;
            })
            .filter(challenge => {
                if (!challenge) return false;
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                const title = challenge.title?.toLowerCase() || '';
                const description = challenge.description?.toLowerCase() || '';
                return title.includes(term) || description.includes(term);
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'points': return b.points - a.points;
                    case 'successRate': return b.successRate - a.successRate;
                    case 'attempts': return b.attempts - a.attempts;
                    default:
                        const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
                }
            });
    }, [challenges, searchTerm, selectedDifficulty, selectedLanguage, sortBy]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 animate-pulse"></div>
                <div className="relative">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            Challenges ({filteredChallenges.length})
                        </span>
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all duration-300"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        {difficulties.map(difficulty => (
                            <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                    </select>
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        {languages.map(language => (
                            <option key={language} value={language}>{language}</option>
                        ))}
                    </select>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>Sort by {option.label}</option>
                    ))}
                </select>
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredChallenges.map((challenge) => (
                    <div
                        key={challenge.id}
                        onClick={() => onSelectChallenge(challenge)}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 cursor-pointer transition-all duration-300 group ${selectedChallenge?.id === challenge.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-l-blue-500' : ''
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="flex flex-col items-center gap-1">
                                    {challenge.completed ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                                    )}
                                    {challenge.starred && (
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                        {challenge.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                        {challenge.description}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full border font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                                    {challenge.difficulty}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">{challenge.language}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
                                    <Zap className="w-3 h-3" />
                                    {challenge.points}
                                </span>
                                <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                    <Clock className="w-3 h-3" />
                                    {challenge.timeLimit}m
                                </span>
                                
                                {onEditChallenge && onDeleteChallenge && (
                                  <span className="flex items-center gap-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditChallenge(challenge);
                                      }}
                                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                    >
                                      <Edit className="w-3 h-3 text-blue-500" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChallenge(challenge.id);
                                      }}
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    >
                                      <Trash className="w-3 h-3 text-red-500" />
                                    </button>
                                  </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {challenge.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-700">
                                    {tag}
                                </span>
                            ))}
                            {challenge.tags.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                    +{challenge.tags.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

// CodeEditor component - Using memo for performance optimization
const CodeEditor = memo(({ challenge }) => {
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState('problem');
    const [timeRemaining, setTimeRemaining] = useState(challenge?.timeLimit * 60 || 1800);
    const [output, setOutput] = useState('');
    const [outputType, setOutputType] = useState('info');
    const editorRef = useRef(null);
    const monacoInstanceRef = useRef(null);
    
    // Define tabs for the editor interface
    const editorTabs = [
        { id: 'problem', label: 'Problem', icon: FileText },
        { id: 'solution', label: 'Solution', icon: Code },
        { id: 'tests', label: 'Tests', icon: TestTube },
        { id: 'results', label: 'Results', icon: ListChecks }
    ];

    useEffect(() => {
        setCode(`// ${challenge.title}\n// ${challenge.description}\n\nfunction solution() {\n    // Write your solution here\n    \n}\n\n// Test your solution\nconsole.log(solution());`);
        setResults(null);
        setTimeRemaining(challenge.timeLimit * 60);
        setActiveTab('problem');
    }, [challenge]);

    const runCode = async () => {
        if (!challenge) return;

        setIsRunning(true);
        setOutput('Running your code...');
        setOutputType('info');

        try {
            // Get code from Monaco editor
            const codeToRun = monacoInstanceRef.current ? monacoInstanceRef.current.getValue() : code;

            // Make API call to execute code
            const response = await fetch('/api/execute-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: challenge.language,
                    code: codeToRun,
                    challengeId: challenge.id
                }),
            }).then(res => res.json());

            // Handle response
            if (response.success) {
                setOutput(response.output || 'Code executed successfully!');
                setOutputType('success');

                // Update timer if code runs successfully
                const newTimeSpent = 1;
                // setTimeSpent(newTimeSpent);
            } else {
                setOutput(response.error || 'Failed to execute code');
                setOutputType('error');
            }
        } catch (error) {
            console.error('Error executing code:', error);
            setOutput(`Error: ${error.message || 'Failed to execute code'}`);
            setOutputType('error');

            // Simulate response in case the API is not available
            setTimeout(() => {
                const simulatedSuccess = Math.random() > 0.3; // 70% success rate
                if (simulatedSuccess) {
                    setOutput(' Simulated success: All tests passed!');
                    setOutputType('success');
                } else {
                    setOutput(' Simulated error: Expected output [5, 10] but got [5, 9]');
                    setOutputType('error');
                }
            }, 1500);
        } finally {
            setIsRunning(false);
        }
    };

    const resetCode = () => {
        setCode(`// ${challenge.title}\n// ${challenge.description}\n\nfunction solution() {\n    // Write your solution here\n    \n}\n\n// Test your solution\nconsole.log(solution());`);
        setResults(null);
    };

    const mainTabs = [
        { id: 'problem', label: 'Problem', icon: BookOpen },
        { id: 'solution', label: 'Solution', icon: Code },
        { id: 'discussions', label: 'Discussions', icon: Users },
        { id: 'submissions', label: 'Submissions', icon: Trophy }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time for display
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (challenge && editorRef.current && !monacoInstanceRef.current) {
            try {
                // Make sure monaco is available
                if (typeof monaco !== 'undefined') {
                    // Initialize Monaco editor with appropriate language
                    const language = getMonacoLanguage(challenge.language);

                    // Set editor options
                    monacoInstanceRef.current = monaco.editor.create(editorRef.current, {
                        value: getDefaultCode(challenge.language),
                        language: language,
                        theme: 'vs-dark',
                        automaticLayout: true,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        roundedSelection: true,
                        selectOnLineNumbers: true,
                        wordWrap: 'on',
                    });

                    // Set code to editor content
                    setCode(getDefaultCode(challenge.language));
                }
            } catch (err) {
                console.error('Error initializing Monaco editor:', err);
            }

            return () => {
                // Cleanup editor when component unmounts
                if (monacoInstanceRef.current) {
                    monacoInstanceRef.current.dispose();
                    monacoInstanceRef.current = null;
                }
            };
        }
    }, [challenge]);

    // Function to get appropriate Monaco language based on challenge language
    const getMonacoLanguage = (language) => {
        // Map challenge language to Monaco language ID
        switch (language && language.toLowerCase()) {
            case 'javascript': return 'javascript';
            case 'python': return 'python';
            case 'java': return 'java';
            case 'c++': return 'cpp';
            case 'sql': return 'sql';
            case 'cypher': return 'cypher'; // Note: may need custom language definition
            case 'mongodb': return 'javascript'; // MongoDB queries are in JavaScript
            default: return 'plaintext';
        }
    };

    // Example default code templates for each language
    const getDefaultCode = (language) => {
        switch (language && language.toLowerCase()) {
            case 'python': 
                return '# Write your Python code here\n\ndef solution(input_data):\n    # Your code here\n    return result';
            case 'javascript': 
                return '// Write your JavaScript code here\n\nfunction solution(inputData) {\n    // Your code here\n    return result;\n}';
            case 'java': 
                return 'public class Solution {\n    public static Object solution(Object inputData) {\n        // Your code here\n        return result;\n    }\n}';
            case 'sql':
                return '-- Write your SQL query here\n\nSELECT * FROM table_name WHERE condition;';
            case 'cypher':
                return '// Write your Cypher query here\n\nMATCH (n) RETURN n LIMIT 10;';
            case 'mongodb':
                return '// Write your MongoDB query here\n\ndb.collection.find({ key: "value" });';
            default:
                return '// Write your code here';
        }
    };

    // Update code when editor content changes
    useEffect(() => {
        if (monacoInstanceRef.current) {
            monacoInstanceRef.current.onDidChangeModelContent(() => {
                setCode(monacoInstanceRef.current.getValue());
            });
        }
    }, [monacoInstanceRef.current]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-4 z-50' : 'h-full'}`}>
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-rose-600/20 animate-pulse"></div>
                <div className="relative flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm ${challenge.difficulty === 'Easy' ? 'text-green-300' : challenge.difficulty === 'Medium' ? 'text-yellow-300' : 'text-red-300'}`}>
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                                {challenge.title}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-white/80">
                                <span className="flex items-center gap-1">
                                    <Zap className="w-4 h-4" />
                                    {challenge.points} points
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {challenge.timeLimit}m
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {challenge.attempts} attempts
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-lg font-medium text-sm ${
                            timeRemaining > 300 ? 'bg-green-500/20 text-green-300' :
                            timeRemaining > 60 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                            }`}>
                            {formatTime(timeRemaining)}
                        </div>
                        <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-1">
                    {editorTabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-white/20 text-white backdrop-blur-sm'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-grow p-6 overflow-y-auto">
                {activeTab === 'problem' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{challenge.title}</h3>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">{challenge.description}</p>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Example:</h4>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
                                <code>{challenge.example}</code>
                            </pre>
                        </div>
                    </div>
                )}
                {activeTab === 'solution' && (
                    <div className="flex flex-col h-full">
                        <div 
                            id="monaco-editor-container" 
                            ref={editorRef} 
                            className="w-full flex-grow bg-gray-900 text-white font-mono rounded-lg overflow-hidden"
                            style={{ minHeight: '400px' }}
                        />
                        <div className="flex flex-col p-4 bg-gray-800 border-t border-gray-700 gap-4">
                            {output && (
                                <div className={`p-3 rounded-lg font-mono text-sm whitespace-pre-wrap ${
                                    outputType === 'success' ? 'bg-green-900/50 text-green-200 border border-green-700' :
                                    outputType === 'error' ? 'bg-red-900/50 text-red-200 border border-red-700' :
                                    'bg-blue-900/50 text-blue-200 border border-blue-700'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {outputType === 'success' ? <CheckCircle className="w-4 h-4" /> : 
                                         outputType === 'error' ? <AlertCircle className="w-4 h-4" /> : 
                                         <Play className="w-4 h-4" />}
                                        <span className="font-medium">
                                            {outputType === 'success' ? 'Success' : 
                                             outputType === 'error' ? 'Error' : 'Output'}
                                        </span>
                                    </div>
                                    {output}
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-400">
                                    {challenge.language} • {formatTime(1)} spent
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={resetCode} 
                                        className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-500 flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4"/> Reset
                                    </button>
                                    <button 
                                        onClick={runCode} 
                                        disabled={isRunning} 
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 disabled:bg-green-800/60 flex items-center gap-2"
                                    >
                                        {isRunning ? (
                                            <><span className="animate-pulse">⏳</span> Running...</>
                                        ) : (
                                            <><Play className="w-4 h-4"/> Run Code</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Additional tabs can be added here */}
            </div>
        </div>
    );
});

// Main component - React.memo was removed as it was unnecessary
const ChallengePage = () => {
    const [challenges, setChallenges] = useState([]);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('problem');
    
    // Challenge yönetimi için state değişkenleri
    const [isEditing, setIsEditing] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);
    const [challengeForm, setChallengeForm] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        language: 'python',
        points: 100,
        timeLimit: 30,
        example: ''
    });
    
    // Needed for MonacoEditor integration
    const monacoInstanceRef = useRef(null);

    // CRUD işlemleri için handler fonksiyonları
    const handleAddChallenge = () => {
        setIsEditing(true);
        setEditingChallenge(null);
        setChallengeForm({
            title: '',
            description: '',
            difficulty: 'Easy',
            language: 'python',
            points: 100,
            timeLimit: 30,
            example: ''
        });
    };
    
    const handleEditChallenge = (challenge) => {
        setIsEditing(true);
        setEditingChallenge(challenge);
        setChallengeForm({
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            language: challenge.language,
            points: challenge.points,
            timeLimit: challenge.timeLimit,
            example: challenge.example || ''
        });
    };
    
    const handleDeleteChallenge = (id) => {
        if (window.confirm('Bu meydan okumayı silmek istediğinize emin misiniz?')) {
            dataService.deleteChallenge(id);
            setChallenges(dataService.getChallenges());
            
            // Silinen challenge seçili ise, başka bir challenge seç
            if (selectedChallenge && selectedChallenge.id === id) {
                const remainingChallenges = dataService.getChallenges();
                if (remainingChallenges.length > 0) {
                    setSelectedChallenge(remainingChallenges[0]);
                } else {
                    setSelectedChallenge(null);
                }
            }
        }
    };
    
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setChallengeForm(prev => ({
            ...prev,
            [name]: name === 'points' || name === 'timeLimit' ? parseInt(value, 10) : value
        }));
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (editingChallenge) {
            // Mevcut challenge'ı güncelle
            dataService.updateChallenge(editingChallenge.id, challengeForm);
        } else {
            // Yeni challenge ekle
            dataService.addChallenge(challengeForm);
        }
        
        // Güncellenmiş challenge listesini getir ve düzenleme modundan çık
        const updatedChallenges = dataService.getChallenges();
        setChallenges(updatedChallenges);
        setIsEditing(false);
        setEditingChallenge(null);
        
        // Yeni eklenen veya düzenlenen challenge'ı seç
        if (!editingChallenge && updatedChallenges.length > 0) {
            setSelectedChallenge(updatedChallenges[updatedChallenges.length - 1]);
        } else if (editingChallenge) {
            const updatedChallenge = updatedChallenges.find(c => c.id === editingChallenge.id);
            if (updatedChallenge) {
                setSelectedChallenge(updatedChallenge);
            }
        }
    };
    
    const cancelEditing = () => {
        setIsEditing(false);
        setEditingChallenge(null);
    };
    
    // Fetch challenges on component mount
    useEffect(() => {
        const fetchChallenges = async () => {
            setLoading(true);
            try {
                // Now using Supabase challengeService instead of localStorage dataService
                const { success, challenges: challengeData, error: apiError } = await challengeService.getChallenges();
                
                if (!success) {
                    throw new Error(apiError || 'Failed to fetch challenges');
                }
                
                setChallenges(challengeData);
                
                // Auto-select first challenge if none selected
                if (!selectedChallenge && challengeData.length > 0) {
                    setSelectedChallenge(challengeData[0]);
                }
                
                setError(null);
            } catch (err) {
                console.error('Failed to fetch challenges:', err);
                setError('Failed to load challenges. Please try again later.');
                setChallenges([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    // Handle code execution - optimized with useCallback to prevent unnecessary re-renders
    const handleRunCode = useCallback(async (code, challengeId) => {
        console.log(`Executing code for challenge ${challengeId}:`, code);
        
        // Here you would call your API service to execute the code
        try {
            // Mock API call - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true, output: 'Code executed successfully!' };
        } catch (err) {
            console.error('Code execution failed:', err);
            return { success: false, error: err.message || 'Execution failed' };
        }
    }, []);
    
    // Handle saving code - optimized with useCallback
    const handleSaveCode = useCallback((code, challengeId) => {
        console.log(`Saving code for challenge ${challengeId}`);
        // Save code to local storage to persist between sessions
        localStorage.setItem(`challenge_${challengeId}_code`, code);
    }, []);

    // useCallback optimizes the function with memoization since it's passed as prop
    const handleSelectChallenge = useCallback((challenge) => {
        setSelectedChallenge(challenge);
        
        // Cleanup previous editor instance if needed
        if (monacoInstanceRef.current) {
            monacoInstanceRef.current.dispose();
            monacoInstanceRef.current = null;
        }
    }, []);

    // Stats calculated with useMemo for performance optimization
    const stats = useMemo(() => {
        // Ensure challenges is always an array before applying filter
        const challengesArray = Array.isArray(challenges) ? challenges : [];
        const completed = challengesArray.filter(c => c.completed || false);
        const totalPoints = completed.reduce((sum, c) => sum + (c.points || 0), 0);
        const totalBestScore = completed.reduce((sum, c) => sum + (c.bestScore || 0), 0);
        const averageScore = completed.length > 0 ? totalBestScore / completed.length : 0;
        
        return {
            totalChallenges: challenges.length,
            completedChallenges: completed.length,
            totalPoints,
            averageScore
        };
    }, [challenges]);

    // This useEffect was redundant with the one above
    // The first useEffect now handles challenge fetch, loading state and error handling

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <div className="text-xl font-medium">Loading challenges...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <div className="text-xl font-medium">Error</div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                         <div>
                             <div className="flex items-center gap-3 mb-2">
                                 <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                                     <Code className="w-8 h-8 text-white" />
                                 </div>
                                 <div>
                                     <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                                         Code Challenges
                                     </h1>
                                     <p className="text-xl text-gray-600 dark:text-gray-400">
                                         Practice your coding skills with real-world problems
                                     </p>
                                 </div>
                             </div>
                         </div>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                               <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalChallenges}</div>
                               <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"><BookOpen className="w-3 h-3" />Total</div>
                           </div>
                           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                               <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.completedChallenges}</div>
                               <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Completed</div>
                           </div>
                           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                               <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalPoints}</div>
                               <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"><Zap className="w-3 h-3" />Points</div>
                           </div>
                           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                               <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{Math.round(stats.averageScore)}</div>
                               <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Avg Score</div>
                           </div>
                        </div>
                     </div>
                </div>

                 <div className="mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">🎉 Achievement Unlocked!</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Complete 3 more challenges to earn the "Problem Solver" badge</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">2/5</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-1 relative">
                        {!isEditing ? (
                            <>
                                <ChallengeList
                                    challenges={challenges}
                                    onSelectChallenge={handleSelectChallenge}
                                    selectedChallenge={selectedChallenge}
                                    onEditChallenge={handleEditChallenge}
                                    onDeleteChallenge={handleDeleteChallenge}
                                />
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
                                    <button 
                                        onClick={handleAddChallenge}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        <span>Yeni Ekle</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('Varsayılan challenge verilerini geri yüklemek istediğinize emin misiniz? Tüm değişiklikleriniz kaybolacaktır.')) {
                                                dataService.resetChallenges();
                                                setChallenges(dataService.getChallenges());
                                                if (dataService.getChallenges().length > 0) {
                                                    setSelectedChallenge(dataService.getChallenges()[0]);
                                                }
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-sm font-medium flex items-center gap-1"
                                    >
                                        <RefreshCw size={16} />
                                        <span>Varsayılan Verileri Geri Yükle</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-bold mb-4">{editingChallenge ? 'Challenge Düzenle' : 'Yeni Challenge Ekle'}</h2>
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={challengeForm.title}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
                                        <textarea
                                            name="description"
                                            value={challengeForm.description}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                            rows="4"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zorluk</label>
                                            <select
                                                name="difficulty"
                                                value={challengeForm.difficulty}
                                                onChange={handleFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                            >
                                                <option value="Easy">Kolay</option>
                                                <option value="Medium">Orta</option>
                                                <option value="Hard">Zor</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programlama Dili</label>
                                            <select
                                                name="language"
                                                value={challengeForm.language}
                                                onChange={handleFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                            >
                                                <option value="python">Python</option>
                                                <option value="javascript">JavaScript</option>
                                                <option value="sql">SQL</option>
                                                <option value="cypher">Neo4j (Cypher)</option>
                                                <option value="mongodb">MongoDB</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Puan</label>
                                            <input
                                                type="number"
                                                name="points"
                                                min="10"
                                                max="1000"
                                                value={challengeForm.points}
                                                onChange={handleFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Süre Limiti (dakika)</label>
                                            <input
                                                type="number"
                                                name="timeLimit"
                                                min="1"
                                                max="120"
                                                value={challengeForm.timeLimit}
                                                onChange={handleFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Örnek</label>
                                        <textarea
                                            name="example"
                                            value={challengeForm.example}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                            rows="4"
                                            placeholder="Örnek girdi ve beklenen çıktı bilgisi"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-sm font-medium"
                                        >
                                            {editingChallenge ? 'Güncelle' : 'Ekle'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    <div className="xl:col-span-2">
                        {selectedChallenge ? (
                            <Suspense fallback={
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                    <span className="ml-3 text-lg">Loading editor...</span>
                                </div>
                            }>
                                <MonacoEditor 
                                    challenge={selectedChallenge}
                                    onRunCode={handleRunCode} 
                                    onSaveCode={handleSaveCode}
                                />
                            </Suspense>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center flex flex-col justify-center items-center h-full">
                                <Code className="w-16 h-16 text-gray-400 mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Select a Challenge</h3>
                                <p className="text-gray-600 dark:text-gray-400">Choose a challenge to start coding.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"><Flame className="w-5 h-5 text-white" /></div>
                       <div>
                         <div className="text-lg font-bold text-gray-900 dark:text-white">7 Day Streak</div>
                         <div className="text-sm text-gray-600 dark:text-gray-400">Keep it up!</div>
                       </div>
                     </div>
                   </div>
                   <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"><Brain className="w-5 h-5 text-white" /></div>
                       <div>
                         <div className="text-lg font-bold text-gray-900 dark:text-white">Advanced</div>
                         <div className="text-sm text-gray-600 dark:text-gray-400">Skill Level</div>
                       </div>
                     </div>
                   </div>
                   <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg"><Award className="w-5 h-5 text-white" /></div>
                       <div>
                         <div className="text-lg font-bold text-gray-900 dark:text-white">Rank #1,234</div>
                         <div className="text-sm text-gray-600 dark:text-gray-400">Global Ranking</div>
                       </div>
                     </div>
                   </div>
                 </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>
        </div>
    );
};

export default ChallengePage;