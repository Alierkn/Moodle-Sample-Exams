import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

/**
 * Documents page component
 * Combines document upload and document list
 */
const DocumentsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger a refresh of the document list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Study Documents</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        
        <div className="lg:col-span-2">
          <DocumentList key={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
