import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { Play, Copy, Save, CheckCircle } from 'lucide-react';

/**
 * Monaco code editor component with optimized initialization and cleanup
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.challenge - The challenge object with code details
 * @param {Function} props.onRunCode - Callback when code is executed
 * @param {Function} props.onSaveCode - Callback when code is saved
 * @returns {JSX.Element} Monaco editor component
 */
const MonacoEditor = ({ challenge, onRunCode, onSaveCode }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [code, setCode] = useState(challenge?.starterCode || '// Write your code here');
  const [language, setLanguage] = useState(challenge?.language?.toLowerCase() || 'javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Initialize editor once when component mounts
  useEffect(() => {
    // Skip initialization if editor already exists
    if (editor || !containerRef.current) return;

    // Define editor options
    const options = {
      automaticLayout: true,
      fontSize: 14,
      lineHeight: 21,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      roundedSelection: true,
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      theme: 'vs-dark',
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
      cursorBlinking: 'smooth',
      tabSize: 2,
      rulers: [80],
      renderLineHighlight: 'all',
    };

    // Initialize the editor
    const newEditor = monaco.editor.create(containerRef.current, {
      value: code,
      language: language,
      ...options,
    });

    // Save editor instance
    setEditor(newEditor);
    editorRef.current = newEditor;

    // Add key bindings for common actions
    newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSaveCode();
    });

    newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    // Return cleanup function to properly dispose of the editor
    return () => {
      if (newEditor) {
        newEditor.dispose();
      }
    };
  }, []);

  // Update editor when challenge changes
  useEffect(() => {
    if (editor && challenge) {
      // Only update if language or starter code has changed
      const newLanguage = challenge.language?.toLowerCase() || 'javascript';
      
      if (language !== newLanguage) {
        setLanguage(newLanguage);
        monaco.editor.setModelLanguage(editor.getModel(), newLanguage);
      }
      
      // If it's a new challenge (not just a language change), update code
      if (challenge.starterCode && challenge.id !== editor.challengeId) {
        editor.setValue(challenge.starterCode);
        editor.challengeId = challenge.id;
        setCode(challenge.starterCode);
      }
    }
  }, [challenge, editor]);

  // Handle running code
  const handleRunCode = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    const currentCode = editor.getValue();
    
    // Call API to run code
    if (onRunCode) {
      onRunCode(currentCode, challenge.id)
        .finally(() => {
          setIsRunning(false);
        });
    } else {
      // Mock execution if no handler provided
      setTimeout(() => {
        console.log('Code executed:', currentCode);
        setIsRunning(false);
      }, 1000);
    }
  }, [challenge?.id, editor, isRunning, onRunCode]);

  // Save code handler
  const handleSaveCode = useCallback(() => {
    if (!editor) return;
    
    const currentCode = editor.getValue();
    setCode(currentCode);
    
    if (onSaveCode) {
      onSaveCode(currentCode, challenge.id);
    }
    
    // Show saved indicator briefly
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [challenge?.id, editor, onSaveCode]);

  // Copy code to clipboard
  const handleCopyCode = useCallback(() => {
    if (!editor) return;
    
    const currentCode = editor.getValue();
    navigator.clipboard.writeText(currentCode)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy code:', err));
  }, [editor]);

  // Extract theme to make dark mode work
  const getEditorTheme = () => {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkMode ? 'vs-dark' : 'vs';
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="font-mono text-sm text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-black/30 px-3 py-1 rounded-lg">
          {language}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            title="Copy code"
          >
            {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleSaveCode}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            title="Save code"
          >
            {isSaved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          </button>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`flex items-center justify-center h-8 px-4 rounded-md ${
              isRunning
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } transition-colors`}
            title="Run code (Ctrl+Enter)"
          >
            <Play className="h-4 w-4 mr-1" /> 
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor container */}
      <div 
        ref={containerRef} 
        className="flex-grow" 
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default MonacoEditor;
