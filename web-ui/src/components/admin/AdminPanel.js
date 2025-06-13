import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Shield, Users, Database, FileText, RefreshCw, Trash2,
  Check, X, Edit, Plus, Save, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dataService from '../../services/dataService';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('challenges');
  const [resources, setResources] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: null, item: null });

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'challenges':
            const challengesData = dataService.getChallenges();
            setChallenges(challengesData);
            break;
          case 'resources':
            const resourcesData = dataService.getResources();
            setResources(resourcesData);
            break;
          case 'users':
            // In a real app, fetch from backend. Using mock data for now.
            setUsers([
              { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2025-01-01' },
              { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', createdAt: '2025-01-02' },
              { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', createdAt: '2025-01-03' }
            ]);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
        setError(`${activeTab} verileri yüklenirken bir hata oluştu.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Handle item deletion
  const handleDelete = (type, item) => {
    setConfirmDialog({
      show: true,
      type,
      item,
      message: `Bu ${type === 'challenges' ? 'meydan okuma' : 
               type === 'resources' ? 'kaynak' : 'kullanıcı'} silinecek. Bu işlem geri alınamaz.`,
      onConfirm: () => {
        try {
          if (type === 'challenges') {
            dataService.deleteChallenge(item.id);
            setChallenges(challenges.filter(c => c.id !== item.id));
          } else if (type === 'resources') {
            dataService.deleteResource(item.id);
            setResources(resources.filter(r => r.id !== item.id));
          }
          // User deletion would require backend integration
          
          setConfirmDialog({ show: false, type: null, item: null });
        } catch (err) {
          console.error(`Error deleting ${type}:`, err);
          setError(`Silme işlemi sırasında bir hata oluştu.`);
        }
      }
    });
  };

  // Handle data reset
  const handleReset = (type) => {
    setConfirmDialog({
      show: true,
      type: `reset-${type}`,
      message: `Tüm ${type === 'challenges' ? 'meydan okumalar' : 'kaynaklar'} varsayılan değerlere sıfırlanacak. Bu işlem geri alınamaz.`,
      onConfirm: () => {
        try {
          if (type === 'challenges') {
            const defaultChallenges = dataService.resetChallenges();
            setChallenges(defaultChallenges);
          } else if (type === 'resources') {
            const defaultResources = dataService.resetResources();
            setResources(defaultResources);
          }
          setConfirmDialog({ show: false, type: null, item: null });
        } catch (err) {
          console.error(`Error resetting ${type}:`, err);
          setError(`Sıfırlama işlemi sırasında bir hata oluştu.`);
        }
      }
    });
  };

  // Confirmation Dialog Component
  const ConfirmDialog = () => {
    if (!confirmDialog.show) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-amber-500 w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Onay Gerekli</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{confirmDialog.message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDialog({ show: false, type: null, item: null })}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              İptal
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Onayla
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Paneli</h2>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Meydan Okumalar</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Kaynaklar</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Kullanıcılar</span>
            </TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : (
            <>
              <TabsContent value="challenges" className="animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Meydan Okuma Yönetimi</h3>
                  <button
                    onClick={() => handleReset('challenges')}
                    className="px-3 py-1 flex items-center gap-1 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/50 rounded-md transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Varsayılanlara Sıfırla</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Başlık</th>
                        <th className="text-left py-3 px-4">Dil</th>
                        <th className="text-left py-3 px-4">Zorluk</th>
                        <th className="text-left py-3 px-4">Puan</th>
                        <th className="text-center py-3 px-4">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challenges.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Meydan okuma bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        challenges.map(challenge => (
                          <tr key={challenge.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-3 px-4">{challenge.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{challenge.title}</div>
                            </td>
                            <td className="py-3 px-4">{challenge.language}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs 
                                ${challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                              `}>
                                {challenge.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-4">{challenge.points}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleDelete('challenges', challenge)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                  title="Sil"
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
              </TabsContent>
              
              <TabsContent value="resources" className="animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Kaynak Yönetimi</h3>
                  <button
                    onClick={() => handleReset('resources')}
                    className="px-3 py-1 flex items-center gap-1 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/50 rounded-md transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Varsayılanlara Sıfırla</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Başlık</th>
                        <th className="text-left py-3 px-4">Kategori</th>
                        <th className="text-left py-3 px-4">Tür</th>
                        <th className="text-left py-3 px-4">Boyut</th>
                        <th className="text-center py-3 px-4">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Kaynak bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        resources.map(resource => (
                          <tr key={resource.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-3 px-4">{resource.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{resource.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{resource.description}</div>
                            </td>
                            <td className="py-3 px-4">{resource.category}</td>
                            <td className="py-3 px-4">{resource.type}</td>
                            <td className="py-3 px-4">{resource.size}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleDelete('resources', resource)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                  title="Sil"
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
              </TabsContent>
              
              <TabsContent value="users" className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4">Kullanıcı Yönetimi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Kullanıcı Adı</th>
                        <th className="text-left py-3 px-4">E-posta</th>
                        <th className="text-left py-3 px-4">Rol</th>
                        <th className="text-left py-3 px-4">Kayıt Tarihi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">{user.id}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{user.username}</div>
                          </td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs 
                              ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                            `}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      
      <ConfirmDialog />
    </div>
  );
};

export default AdminPanel;
