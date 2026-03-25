import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Search, Eye } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const AdminPlaybooks = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingPlaybook, setViewingPlaybook] = useState(null);

  useEffect(() => {
    fetchPendingPlaybooks();
  }, []);

  const fetchPendingPlaybooks = async () => {
    try {
      const response = await api.get('/playbooks/admin/pending');
      if (response.data.status === 'success') {
        setPlaybooks(response.data.data.playbooks);
      }
    } catch (error) {
      addToast('Failed to load pending playbooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, e) => {
    e?.stopPropagation();
    try {
      const response = await api.put(`/playbooks/${id}/approve`);
      if (response.data.status === 'success') {
        addToast('Playbook approved successfully', 'success');
        setPlaybooks(playbooks.filter(p => p.id !== id));
        if (viewingPlaybook?.id === id) setViewingPlaybook(null);
      }
    } catch (error) {
      addToast('Failed to approve playbook', 'error');
    }
  };

  const handleReject = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to reject and delete this playbook?")) return;
    try {
      const response = await api.delete(`/playbooks/${id}`);
      if (response.status === 204 || response.data?.status === 'success') {
        addToast('Playbook rejected completely', 'success');
        setPlaybooks(playbooks.filter(p => p.id !== id));
        if (viewingPlaybook?.id === id) setViewingPlaybook(null);
      }
    } catch (error) {
      addToast('Failed to reject playbook', 'error');
    }
  };

  const filteredPlaybooks = playbooks.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mentor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Playbook Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve knowledge playbooks submitted by mentors.</p>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search pending playbooks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {viewingPlaybook ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Reviewing Playbook</h2>
            <button onClick={() => setViewingPlaybook(null)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
              Back to List
            </button>
          </div>
          
          <div className="p-8">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
                {viewingPlaybook.category}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-4">{viewingPlaybook.title}</h1>
              <p className="text-gray-600 mb-6">{viewingPlaybook.description}</p>
              
              <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-gray-100">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {viewingPlaybook.mentor?.name?.[0] || 'M'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{viewingPlaybook.mentor?.name}</p>
                  <p className="text-xs text-gray-500">{new Date(viewingPlaybook.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed border p-6 rounded-lg bg-gray-50">
              {viewingPlaybook.content}
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button 
                onClick={(e) => handleReject(viewingPlaybook.id, e)}
                className="px-6 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-colors flex items-center"
              >
                <XCircle size={18} className="mr-2" /> Reject & Delete
              </button>
              <button 
                onClick={(e) => handleApprove(viewingPlaybook.id, e)}
                className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition-colors flex items-center shadow-md shadow-green-500/20"
              >
                <CheckCircle size={18} className="mr-2" /> Approve Playbook
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Mentor</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Title & Category</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Submitted</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">Loading playbooks...</td>
                </tr>
              ) : filteredPlaybooks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">No pending playbooks.</td>
                </tr>
              ) : (
                filteredPlaybooks.map(playbook => (
                  <motion.tr 
                    key={playbook.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {playbook.mentor?.name?.[0] || 'M'}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{playbook.mentor?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm truncate max-w-xs">{playbook.title}</span>
                        <span className="text-xs text-primary font-medium mt-1">{playbook.category}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(playbook.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setViewingPlaybook(playbook)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded bg-blue-50/50 transition-colors"
                          title="Review"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleApprove(playbook.id, e)}
                          className="p-1.5 text-green-500 hover:bg-green-50 rounded bg-green-50/50 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleReject(playbook.id, e)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded bg-red-50/50 transition-colors"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPlaybooks;
