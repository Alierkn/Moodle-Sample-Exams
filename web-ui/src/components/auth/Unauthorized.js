import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Yetkisiz Erişim</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
        Bu sayfaya erişim yetkiniz bulunmamaktadır. Yönetici haklarına sahip değilsiniz.
      </p>
      
      <div className="flex gap-4">
        <Link 
          to="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Home size={18} />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
