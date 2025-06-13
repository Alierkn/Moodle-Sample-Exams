import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, Search, Filter, ExternalLink, Clock, AlertCircle, Plus, Edit, Trash } from 'lucide-react';
import { authService } from '../../services/supabase';
import dataService from '../../services/dataService';

const ResourcesPage = ({ user }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Kaynak ekleme/düzenleme için state değişkenleri
  const [isEditing, setIsEditing] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'pdf',
    category: 'general',
    url: '',
    size: '1 MB'
  });
  
  // dataService'den kaynakları çek
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // dataService kullanarak localStorage'dan verileri al
        const resourceData = dataService.getResources();
        
        // Daha iyi kullanıcı deneyimi için kısa bir yükleme göster
        setTimeout(() => {
          setResources(resourceData);
          setLoading(false);
        }, 300);
        
      } catch (err) {
        console.error('Kaynakları yüklerken hata:', err);
        setError('Kaynaklar yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Kaynak ekleme/düzenleme/silme işlevleri
  const handleAddResource = () => {
    setIsEditing(true);
    setEditingResource(null);
    setResourceForm({
      title: '',
      description: '',
      type: 'pdf',
      category: 'general',
      url: '',
      size: '1 MB'
    });
  };
  
  const handleEditResource = (resource) => {
    setIsEditing(true);
    setEditingResource(resource);
    setResourceForm({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      url: resource.url,
      size: resource.size
    });
  };
  
  const handleDeleteResource = (id) => {
    if (window.confirm('Bu kaynağı silmek istediğinize emin misiniz?')) {
      dataService.deleteResource(id);
      setResources(dataService.getResources());
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setResourceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (editingResource) {
      // Mevcut kaynağı güncelle
      dataService.updateResource(editingResource.id, resourceForm);
    } else {
      // Yeni kaynak ekle
      dataService.addResource(resourceForm);
    }
    
    // Güncellenmiş kaynakları getir ve düzenleme modundan çık
    setResources(dataService.getResources());
    setIsEditing(false);
    setEditingResource(null);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingResource(null);
  };

  // Filter resources based on search term and category
  const filteredResources = resources.filter(resource => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesFilter = filter === 'all' || resource.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Get icon based on resource type
  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'video':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'document':
        return <FileText className="w-6 h-6 text-blue-700" />;
      case 'presentation':
        return <FileText className="w-6 h-6 text-orange-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Kaynaklar</h2>
        </div>

        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Kaynaklarda ara..."
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          <div className="relative">
            <select
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm appearance-none focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="neo4j">Neo4j</option>
              <option value="mongodb">MongoDB</option>
              <option value="general">Genel</option>
            </select>
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
          </div>
          
          <button
            onClick={handleAddResource}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            <span>Yeni Ekle</span>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingResource ? 'Kaynağı Düzenle' : 'Yeni Kaynak Ekle'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık</label>
              <input
                type="text"
                name="title"
                value={resourceForm.title}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
              <textarea
                name="description"
                value={resourceForm.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                rows="3"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tür</label>
                <select
                  name="type"
                  value={resourceForm.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="document">Doküman</option>
                  <option value="presentation">Sunum</option>
                  <option value="link">Link</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select
                  name="category"
                  value={resourceForm.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                  <option value="neo4j">Neo4j</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="general">Genel</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  name="url"
                  value={resourceForm.url}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boyut</label>
                <input
                  type="text"
                  name="size"
                  value={resourceForm.size}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  placeholder="1.2 MB"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
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
                {editingResource ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">{error}</h3>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No resources found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredResources.map(resource => (
            <div 
              key={resource.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  {getResourceIcon(resource.type)}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{resource.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{resource.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{formatDate(resource.created_at)}</span>
                    </div>
                    <div>•</div>
                    <div>{resource.size}</div>
                    <div>•</div>
                    <div className="capitalize">{resource.type}</div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex items-start space-x-2 mt-4 md:mt-0">
                  <button
                    onClick={() => handleEditResource(resource)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit size={16} />
                    <span>Düzenle</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash size={16} />
                    <span>Sil</span>
                  </button>
                  
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <ExternalLink size={16} />
                    <span>Görüntüle</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && !loading && !error && (
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Kaynak Yönetimi</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            İstediğiniz kaynakları ekleyebilir, düzenleyebilir ve silebilirsiniz. Bu veriler tarayıcınızın yerel deposunda saklanır.
          </p>
          <div className="flex space-x-3">
            <button 
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              onClick={handleAddResource}
            >
              <Plus size={18} />
              Yeni Kaynak Ekle
            </button>
            <button 
              className="px-6 py-3 border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
              onClick={() => {
                if (window.confirm('Varsayılan kaynak verilerini geri yüklemek istediğinizden emin misiniz?')) {
                  localStorage.removeItem('userResources');
                  setResources(dataService.getResources());
                }
              }}
            >
              Varsayılan Verileri Geri Yükle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
