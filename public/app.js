const { useState, useEffect, useMemo } = React;

const LinkManager = () => {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadLinks();
    loadCategories();
  }, []);

  const loadLinks = async () => {
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(['all', ...data]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const addLink = async (linkData) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      });

      if (response.ok) {
        loadLinks();
        loadCategories();
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Error adding link');
    }
  };

  const toggleStar = async (id) => {
    try {
      await fetch(`/api/links/${id}/toggle-star`, { method: 'POST' });
      loadLinks();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const deleteLink = async (id) => {
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await fetch(`/api/links/${id}`, { method: 'DELETE' });
        loadLinks();
        loadCategories();
      } catch (error) {
        console.error('Error deleting link:', error);
      }
    }
  };

  // Filter links
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = searchTerm === '' || 
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        link.domain.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
      const matchesStarred = !showStarredOnly || link.isStarred;
      
      return matchesSearch && matchesCategory && matchesStarred;
    });
  }, [links, searchTerm, selectedCategory, showStarredOnly]);

  const LinkCard = ({ link }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={link.favicon || `https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
            alt=""
            className="w-4 h-4 flex-shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{link.title}</h3>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => toggleStar(link.id)}
            className={`${link.isStarred ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}
          >
            ⭐
          </button>
          <button
            onClick={() => deleteLink(link.id)}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{link.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-blue-600 font-medium">{link.domain}</span>
        <span className="text-xs text-gray-500">{new Date(link.date_added).toLocaleDateString()}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {link.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          🔗
        </a>
      </div>
    </div>
  );

  const AddLinkForm = () => {
    const [formData, setFormData] = useState({
      url: '',
      title: '',
      description: '',
      category: '',
      tags: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addLink({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Add New Link</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Link title (optional - will be auto-detected)"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description (optional)"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Link
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Link Manager</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              ➕ Add Link
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search links, descriptions, tags, or domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${
                  showStarredOnly 
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                ⭐ Starred
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <span>{filteredLinks.length} links found</span>
            <span>•</span>
            <span>{links.filter(l => l.isStarred).length} starred</span>
            <span>•</span>
            <span>{categories.length - 1} categories</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4 text-6xl">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No links found</h3>
            <p className="text-gray-600">Try adjusting your search terms or add some links</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLinks.map(link => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && <AddLinkForm />}
    </div>
  );
};

ReactDOM.render(<LinkManager />, document.getElementById('root'));
