import { useState, useEffect } from 'react';
import { Search, RotateCcw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../api/services';
import { useToast } from '../context/ToastContext';

const AdminRejected = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchRejected();
  }, []);

  const fetchRejected = async () => {
    try {
      const response = await adminService.getRejectedMentors();
      setMentors(response.data || []);
    } catch (err) {
      console.error("Failed to fetch rejected mentors:", err);
      addToast("Failed to load rejected mentors", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReconsider = async (id) => {
    try {
      await adminService.reconsiderMentor(id);
      addToast("Mentor moved back to pending list", "success");
      setMentors(mentors.filter(m => m.id !== id));
    } catch (e) {
      addToast("Failed to reconsider mentor", "error");
    }
  };

  const filteredMentors = mentors.filter(u => {
    return u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           u.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rejected Mentors</h1>
          <p className="text-gray-500 text-sm mt-1">Review previously rejected applications.</p>
        </div>
        <Link to="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-primary flex items-center">
           <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
      </div>

      {/* Table Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="input-field pl-10 h-10 py-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Mentor Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Expertise</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date Rejected</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredMentors.length > 0 ? filteredMentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shadow-sm">
                        {mentor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{mentor.name}</p>
                        <p className="text-xs text-gray-500">{mentor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500">
                    {mentor.expertise || 'Not listed'}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(mentor.rejectedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleReconsider(mentor.id)} 
                      className="px-4 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors inline-flex items-center border border-primary/20"
                    >
                       <RotateCcw size={16} className="mr-2" /> Reconsider
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <ShieldAlert size={48} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-lg font-medium">No rejected mentors</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRejected;
