import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Shield, Users, Database, FileText, RefreshCw, Trash2,
  Check, X, Edit, Plus, Save, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { documentService } from '../../services/supabase';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: null, item: null });

  // Handler for tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Fetch documents
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const docs = await documentService.listDocuments();
        setResources(docs || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, []);

  // Handle document deletion
  const handleDeleteDocument = (document) => {
    setConfirmDialog({
      show: true,
      type: 'document',
      item: document,
      message: `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await documentService.deleteDocument(document.path);
          setResources(resources.filter(d => d.id !== document.id));
          setConfirmDialog({ show: false, type: null, item: null });
        } catch (err) {
          console.error('Error deleting document:', err);
          setError('Failed to delete the document. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Confirmation Dialog Component
  const ConfirmDialog = () => {
    if (!confirmDialog.show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Confirm Action
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{confirmDialog.message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDialog({ show: false, type: null, item: null })}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-purple-600 dark:text-purple-400" />
            Admin Panel
          </h2>
        </div>
        
        <Tabs defaultValue={activeTab}>
          <TabsList>
            <TabsTrigger 
              value="resources" 
              active={activeTab === 'resources'} 
              onClick={() => handleTabChange('resources')}
            >
              <FileText className="w-4 h-4 mr-1" /> Resources
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              active={activeTab === 'users'} 
              onClick={() => handleTabChange('users')}
            >
              <Users className="w-4 h-4 mr-1" /> Users
            </TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'resources' && (
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-4">Resource Management</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Size</th>
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-left py-3 px-4">Updated</th>
                          <th className="text-center py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-500">
                              No resources available
                            </td>
                          </tr>
                        ) : (
                          resources.map((resource) => (
                            <tr key={resource.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-3 px-4">
                                <div className="font-medium">{resource.name}</div>
                              </td>
                              <td className="py-3 px-4">
                                {Math.round(resource.metadata?.size / 1024) || '?'} KB
                              </td>
                              <td className="py-3 px-4">{resource.metadata?.mimetype || 'Unknown'}</td>
                              <td className="py-3 px-4">
                                {resource.updated_at ? new Date(resource.updated_at).toLocaleDateString() : 'Unknown'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => handleDeleteDocument(resource)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
                
              {activeTab === 'users' && (
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-4">User Management</h3>
                  <p className="text-gray-500">User management functionality will be available in a future update.</p>
                </div>
              )}
            </>
          )}
        </Tabs>
      </div>
      
      <ConfirmDialog />
    </div>
  );
};

export default AdminPanel;
