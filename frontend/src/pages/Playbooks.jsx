import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Share2, 
  ChevronRight,
  Filter,
  ArrowLeft,
  X
} from 'lucide-react';
import api from '../api/axios';

const Playbooks = () => {
  const { user } = useAuth();
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewingPlaybook, setViewingPlaybook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', category: '', content: '', excerpt: '' });

  useEffect(() => {
    // Mock fetching playbooks
    setTimeout(() => {
      const mockPlaybooks = [
        {
          id: 1,
          title: 'Mastering React State',
          category: 'Software Engineering',
          excerpt: 'A comprehensive guide to complex state management in modern React applications.',
          content: 'Full content of Mastering React State...',
          author: { id: 101, firstName: 'Ade', lastName: 'Olu' },
          views: 1240,
          likes: 85,
          createdAt: '2023-11-15'
        },
        {
          id: 2,
          title: 'Product Roadmap Essentials',
          category: 'Product Management',
          excerpt: 'Learn how to build and communicate effective product roadmaps that drive results.',
          content: 'Full content of Product Roadmap Essentials...',
          author: { id: 102, firstName: 'Sarah', lastName: 'Williams' },
          views: 850,
          likes: 42,
          createdAt: '2023-11-10'
        },
        {
          id: 3,
          title: 'Interview Prep for FAANG',
          category: 'Career Growth',
          excerpt: 'Strategies and tips for acing technical and behavioral interviews at top tech companies.',
          content: 'Full content of Interview Prep...',
          author: { id: 101, firstName: 'Ade', lastName: 'Olu' },
          views: 3100,
          likes: 210,
          createdAt: '2023-10-25'
        }
      ];
      
      if (user?.role === 'mentor') {
        setPlaybooks(mockPlaybooks.filter(p => p.author.id === user.id)); // Should be dynamic in real app
      } else {
        setPlaybooks(mockPlaybooks);
      }
      setLoading(false);
    }, 600);
  }, [user]);

  const categories = ['All', 'Software Engineering', 'Product Management', 'Career Growth', 'Design', 'Marketing'];

  const filteredPlaybooks = playbooks.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (isEditing) {
      setPlaybooks(playbooks.map(p => p.id === viewingPlaybook.id ? { ...p, ...editFormData } : p));
    } else {
      const newPlaybook = {
        id: Date.now(),
        ...editFormData,
        author: { id: user.id, firstName: user.firstName, lastName: user.lastName },
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPlaybooks([newPlaybook, ...playbooks]);
    }
    setIsEditing(false);
    setViewingPlaybook(null);
  };

  const openEditor = (playbook = null) => {
    if (playbook) {
      setViewingPlaybook(playbook);
      setEditFormData({ title: playbook.title, category: playbook.category, content: playbook.content, excerpt: playbook.excerpt });
      setIsEditing(true);
    } else {
      setEditFormData({ title: '', category: 'All', content: '', excerpt: '' });
      setIsEditing(true);
    }
  };

  if (viewingPlaybook && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => setViewingPlaybook(null)}
          className="flex items-center text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Library
        </button>
        
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 overflow-hidden relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                {viewingPlaybook.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                {viewingPlaybook.title}
              </h1>
              <div className="flex items-center mt-4 space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {viewingPlaybook.author.firstName[0]}{viewingPlaybook.author.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{viewingPlaybook.author.firstName} {viewingPlaybook.author.lastName}</p>
                  <p className="text-xs text-gray-500">{viewingPlaybook.createdAt}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-gray-50 text-gray-400 hover:text-primary rounded-full transition-colors border border-gray-200">
                <Share2 size={18} />
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {viewingPlaybook.content}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Playbooks</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.role === 'mentor' ? 'Share your expertise and grow your influence.' : 'Learn from curated resources shared by world-class mentors.'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search playbooks..."
              className="input-field pl-10 h-10 py-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user.role === 'mentor' && (
            <button onClick={() => openEditor()} className="btn-primary h-10 px-6 whitespace-nowrap flex items-center">
              <Plus size={18} className="mr-2" /> Create Playbook
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaybooks.length > 0 ? filteredPlaybooks.map((p, index) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group"
            >
              <div className="p-6 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded mb-3 inline-block">
                  {p.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {p.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                  {p.excerpt}
                </p>
                
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {p.author.firstName[0]}{p.author.lastName[0]}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{p.author.firstName} {p.author.lastName}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <span className="flex items-center"><Eye size={14} className="mr-1" /> {p.views}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user.role === 'mentor' && (
                    <button onClick={() => openEditor(p)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit size={16} />
                    </button>
                  )}
                  <button onClick={() => setViewingPlaybook(p)} className="btn-secondary py-1.5 px-3 text-xs bg-white border-gray-200">
                    Read More
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No playbooks found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {viewingPlaybook ? 'Edit Playbook' : 'Create New Playbook'}
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateOrUpdate} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Master React in 10 Days"
                      className="input-field"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select 
                      className="input-field"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Short Excerpt</label>
                  <textarea 
                    required
                    placeholder="Briefly describe what readers will learn..."
                    className="input-field h-20 py-2 resize-none"
                    value={editFormData.excerpt}
                    onChange={(e) => setEditFormData({...editFormData, excerpt: e.target.value})}
                  />
                </div>

                <div className="flex-1 min-h-[300px] flex flex-col">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Content (Markdown supported)</label>
                  <textarea 
                    required
                    placeholder="Write your expert knowledge here..."
                    className="input-field flex-1 py-4 font-mono text-sm leading-relaxed"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({...editFormData, content: e.target.value})}
                  />
                </div>
              </form>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary h-11 px-8">
                  Cancel
                </button>
                <button onClick={handleCreateOrUpdate} className="btn-primary h-11 px-8 shadow-lg shadow-primary/20">
                  {viewingPlaybook ? 'Update Playbook' : 'Publish Playbook'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Playbooks;
