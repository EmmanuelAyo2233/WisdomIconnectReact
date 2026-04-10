import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Share2, 
  Heart,
  MessageCircle,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  X,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Users
} from 'lucide-react';
import { playbookService } from '../api/services';
import { useToast } from '../context/ToastContext';
import PlaybookComments from '../components/PlaybookComments';

const Playbooks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'mine', or 'saved'
  const [viewingPlaybook, setViewingPlaybook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', category: 'Software Engineering', content: '', description: '' });

  const categories = ['All', 'Software Engineering', 'Product Management', 'Career Growth', 'Design', 'Marketing'];

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      let response;
      if (activeTab === 'mine') {
        response = await playbookService.getMentorPlaybooks();
      } else if (activeTab === 'saved') {
        response = await playbookService.getSavedPlaybooks();
      } else {
        response = await playbookService.getPlaybooks();
      }
      
      if (response.data.status === 'success') {
        setPlaybooks(response.data.data.playbooks);
      }
    } catch (error) {
      console.error("Error fetching playbooks:", error);
      addToast('Failed to load playbooks', 'error');
    } finally {
      setLoading(false);
      if (location.state?.openPlaybook && !viewingPlaybook) {
          setViewingPlaybook(location.state.openPlaybook);
          // clear state after applying
          window.history.replaceState({}, document.title);
      }
    }
  };

  useEffect(() => {
    fetchPlaybooks();
  }, [user, activeTab]);

  const filteredPlaybooks = playbooks.filter(p => {
    const term = searchTerm.toLowerCase();
    const titleMatches = p.title && p.title.toLowerCase().includes(term);
    const descMatches = p.description && p.description.toLowerCase().includes(term);
    const matchesSearch = titleMatches || descMatches;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookSession = () => {
    // Navigate using nested Mentor ID first, then fallback to User ID (mentor_id)
    const targetId = viewingPlaybook?.mentor?.mentor?.id || viewingPlaybook?.mentor_id;
    if (targetId) navigate(`/mentee/mentor/${targetId}`);
  };

  const handleDeletePlaybook = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this playbook?")) return;
    try {
      await playbookService.deletePlaybook(id);
      setPlaybooks(playbooks.filter(p => p.id !== id));
      addToast('Playbook deleted successfully', 'success');
      if (viewingPlaybook?.id === id) setViewingPlaybook(null);
    } catch (error) {
      addToast('Failed to delete playbook', 'error');
    }
  };

  const openEditExisting = (e, playbook) => {
    e.stopPropagation();
    setEditFormData({ 
       id: playbook.id, 
       title: playbook.title, 
       category: playbook.category, 
       content: playbook.content, 
       description: playbook.description 
    });
    setIsEditing(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editFormData.id) {
         const response = await playbookService.updatePlaybook(editFormData.id, editFormData);
         if (response.data.status === 'success') {
           addToast('Playbook updated!', 'success');
           setIsEditing(false);
           fetchPlaybooks();
         }
      } else {
         const response = await playbookService.createPlaybook(editFormData);
         if (response.data.status === 'success') {
           addToast('Playbook submitted for admin approval!', 'success');
           setIsEditing(false);
           fetchPlaybooks();
         }
      }
    } catch (error) {
      console.error("Error submitting playbook:", error);
      addToast(error.response?.data?.message || 'Failed to submit playbook', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditor = () => {
    setEditFormData({ title: '', category: 'Software Engineering', content: '', description: '' });
    setIsEditing(true);
  };

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await playbookService.likePlaybook(id);
      if (response.data.status === 'success') {
        const { isLiked, likes_count } = response.data.data;
        setPlaybooks(playbooks.map(p => 
          p.id === id ? { ...p, isLiked, likes_count } : p
        ));
        if (viewingPlaybook?.id === id) {
          setViewingPlaybook({ ...viewingPlaybook, isLiked, likes_count });
        }
      }
    } catch (error) {
      addToast('Error updating like', 'error');
    }
  };

  const handleSave = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await playbookService.savePlaybook(id);
      if (response.data.status === 'success') {
        const { isSaved } = response.data.data;
        setPlaybooks(playbooks.map(p => 
          p.id === id ? { ...p, isSaved } : p
        ));
        if (viewingPlaybook?.id === id) {
          setViewingPlaybook({ ...viewingPlaybook, isSaved });
        }
        addToast(isSaved ? 'Playbook saved!' : 'Playbook unsaved', 'success');
      }
    } catch (error) {
      addToast('Error saving playbook', 'error');
    }
  };

  const openPlaybookDetails = async (playbook) => {
    setViewingPlaybook(playbook);
    try {
      const response = await playbookService.getPlaybookDetails(playbook.id);
      if (response.data.status === 'success') {
        const fullData = response.data.data.playbook;
        setViewingPlaybook(fullData);
        setPlaybooks(playbooks.map(p => p.id === fullData.id ? fullData : p));
      }
    } catch (err) {
      console.error("Error fetching playbook details", err);
    }
  };

  if (viewingPlaybook && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-[120px] pt-4 px-2 sm:px-0">
        <button 
          onClick={() => setViewingPlaybook(null)}
          className="flex items-center text-gray-500 hover:text-primary transition-colors font-semibold ml-2 sm:ml-0"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Library
        </button>
        
        <article className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-12 overflow-hidden relative transition-all">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                {viewingPlaybook.category || 'General'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {viewingPlaybook.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">{viewingPlaybook.description}</p>
              
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shadow-sm">
                   {viewingPlaybook.mentor?.picture && viewingPlaybook.mentor.picture !== "http://localhost:5000/uploads/default.png" ? (
                      <img src={viewingPlaybook.mentor.picture} className="h-full w-full object-cover" alt={viewingPlaybook.mentor.name} />
                   ) : (
                      <span className="text-primary text-lg font-bold uppercase">{viewingPlaybook.mentor?.name?.charAt(0) || 'M'}</span>
                   )}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{viewingPlaybook.mentor?.name || 'Mentor'}</p>
                  <p className="text-sm text-gray-500">{new Date(viewingPlaybook.createdAt).toLocaleDateString()} • {viewingPlaybook.mentor?.mentor?.occupation || viewingPlaybook.mentor?.mentor?.role || 'Expert'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-3">
              <button 
                onClick={(e) => handleSave(viewingPlaybook.id, e)}
                className={`p-2.5 rounded-full transition-all border shadow-sm ${viewingPlaybook.isSaved ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-primary hover:bg-primary/5'}`}
                title={viewingPlaybook.isSaved ? "Unsave Playbook" : "Save Playbook"}
              >
                <Bookmark size={20} className={viewingPlaybook.isSaved ? "fill-current" : ""} />
              </button>
              <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all border border-gray-200" title="Share">
                <Share2 size={20} />
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap text-lg border-t border-gray-100 pt-8 mt-8">
            {viewingPlaybook.content}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center space-x-6">
                <button 
                  onClick={(e) => handleLike(viewingPlaybook.id, e)} 
                  className={`flex items-center space-x-2 transition-colors ${viewingPlaybook.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}>
                  <Heart size={24} className={viewingPlaybook.isLiked ? "fill-current" : ""} />
                  <span className="font-semibold">{viewingPlaybook.likes_count || 0} Likes</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Eye size={24} />
                  <span className="font-semibold">{viewingPlaybook.views_count || 0} Views</span>
                </div>
             </div>

             {/* Bottom Area Button */}
             {(user?.userType === 'mentee' || user?.role === 'mentee') && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={handleBookSession}
                    className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center text-lg">
                    <Calendar size={20} className="mr-2" />
                    Book Session with {viewingPlaybook.mentor?.name?.split(' ')[0] || 'Mentor'}
                  </button>
                </div>
             )}
          </div>

          <PlaybookComments playbookId={viewingPlaybook.id} authorId={viewingPlaybook.mentor_id} addToast={addToast} />
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              Mentorship <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Playbooks</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {user?.userType === 'mentor' 
                ? 'Share your proven frameworks, strategies, and insights to build your brand and attract driven mentees.' 
                : 'Unlock exclusive guides, career strategies, and industry secrets directly from our top 1% mentors.'}
            </p>
          </div>
          
          {(user?.userType === 'mentor' || user?.role === 'mentor') && (
            <button 
              onClick={openEditor} 
              className="bg-primary hover:bg-primary-dark text-white h-14 px-8 rounded-full font-bold shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 flex items-center whitespace-nowrap self-start lg:self-center"
            >
              <Plus size={22} className="mr-2" /> Create Playbook
            </button>
          )}
        </div>

        {/* Global Search Input Design Application */}
        <div className="mt-8 relative max-w-3xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search playbooks by title, category, or keyword..."
            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm text-lg placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-4 px-6 font-bold text-lg transition-colors relative ${activeTab === 'explore' ? 'text-primary' : 'text-gray-400 hover:text-gray-700'}`}
        >
          All Playbooks
          {activeTab === 'explore' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-lg"></div>}
        </button>
        {(user?.userType === 'mentor' || user?.role === 'mentor') && (
          <button
            onClick={() => setActiveTab('mine')}
            className={`pb-4 px-6 font-bold text-lg transition-colors relative ${activeTab === 'mine' ? 'text-primary' : 'text-gray-400 hover:text-gray-700'}`}
          >
            My Playbooks
            {activeTab === 'mine' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-lg"></div>}
          </button>
        )}
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-4 px-6 font-bold text-lg transition-colors relative ${activeTab === 'saved' ? 'text-primary' : 'text-gray-400 hover:text-gray-700'}`}
        >
          Saved Playbooks
          {activeTab === 'saved' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-lg"></div>}
        </button>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-hide px-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaybooks.length > 0 ? filteredPlaybooks.map((p, index) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              onClick={() => openPlaybookDetails(p)}
              className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex space-x-2">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {p.category || 'General'}
                    </span>
                    {activeTab === 'mine' && (
                      <span className={`text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${p.status === 'approved' ? 'text-green-600 bg-green-50' : p.status === 'rejected' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'}`}>
                        {p.status}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleSave(p.id, e)}
                    className={`p-2 rounded-full transition-all ${p.isSaved ? 'text-primary bg-primary/10' : 'text-gray-300 hover:text-primary hover:bg-primary/5'}`}
                  >
                    <Bookmark size={18} className={p.isSaved ? "fill-current" : ""} />
                  </button>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-tight">
                  {p.title}
                </h3>
                
                <p className="text-gray-500 text-base line-clamp-3 mb-6 flex-1">
                  {p.description}
                </p>
                
                <div className="flex items-center space-x-3 mt-auto">
                  <div className="h-10 w-10 rounded-full border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">
                    {p.mentor?.picture && p.mentor.picture !== "http://localhost:5000/uploads/default.png" ? (
                       <img src={p.mentor.picture} className="h-full w-full object-cover" alt={p.mentor.name} />
                    ) : (
                       <span className="text-primary font-bold">{p.mentor?.name?.charAt(0) || 'M'}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{p.mentor?.name || 'Mentor'}</span>
                    <span className="text-xs text-gray-500 font-medium">{new Date(p.createdAt).toLocaleDateString()} • {p.mentor?.mentor?.occupation || p.mentor?.mentor?.role || 'Expert'}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500 font-semibold">
                  <button className={`flex items-center transition-colors ${p.isLiked ? 'text-red-500' : 'hover:text-red-500'}`} onClick={(e) => handleLike(p.id, e)}>
                    <Heart size={16} className={`mr-1.5 ${p.isLiked ? "fill-current" : ""}`} /> 
                    {p.likes_count || 0}
                  </button>
                  <span className="flex items-center">
                    <Eye size={16} className="mr-1.5" /> 
                    {p.views_count || 0}
                  </span>
                </div>

                {activeTab === 'mine' ? (
                  <div className="flex items-center space-x-3">
                    {p.status !== 'approved' && (
                      <button onClick={(e) => openEditExisting(e, p)} className="text-gray-400 hover:text-blue-500 transition-colors bg-white border border-gray-200 p-2 rounded-full shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    )}
                    <button onClick={(e) => handleDeletePlaybook(p.id, e)} className="text-gray-400 hover:text-red-500 transition-colors bg-white border border-gray-200 p-2 rounded-full shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center text-primary font-bold text-sm">
                    Read Playbook <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <BookOpen size={40} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No playbooks found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your filters or search term to find what you're looking for.</p>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal Overlay */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsEditing(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
            >
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editFormData.id ? 'Edit Playbook' : 'Craft a New Playbook'}
                </h3>
                <button onClick={() => !isSubmitting && setIsEditing(false)} className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all border border-gray-200 shrink-0 ml-4">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleCreateSubmit} className="p-4 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Playbook Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Master React in 10 Days"
                      className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm text-base font-medium"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Category</label>
                    <select 
                      className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm text-base font-medium appearance-none"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Short Description</label>
                  <textarea 
                    required
                    placeholder="Briefly describe what readers will learn in 1-2 sentences. This appears on the playbook card..."
                    className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm text-base font-medium resize-none h-28"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">Clear descriptions lead to 3x more bookings from mentees.</p>
                </div>

                <div className="flex-1 flex flex-col pb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Full Playbook Content</label>
                  <textarea 
                    required
                    placeholder="Provide your in-depth knowledge, strategies, or step-by-step guide here..."
                    className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm text-base leading-relaxed min-h-[250px] sm:min-h-[350px] font-mono whitespace-pre-wrap"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({...editFormData, content: e.target.value})}
                  />
                </div>
              </form>
              </div>
              
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3 shrink-0 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-10">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full text-gray-600 font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateSubmit} 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div> Submitting...</span>
                  ) : (
                    editFormData.id ? 'Save Changes' : 'Publish for Review'
                  )}
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
