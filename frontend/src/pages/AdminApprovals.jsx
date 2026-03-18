import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, ShieldClose, Clock, Check, X, Shield, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../api/services';
import { useToast } from '../context/ToastContext';

const AdminApprovals = () => {
  const [pendingMentors, setPendingMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPendingMentors = async () => {
      try {
        const response = await adminService.getUsers();
        const allUsers = response.data.users || response.data || [];
        // Extract pending mentors from the User models
        const pending = allUsers.filter(u => u.role === 'mentor' && !u.isVerified).map(u => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          expertise: u.Mentor?.expertise?.[0] || 'Unspecified',
          experience: u.Mentor?.experience || 'Not listed',
          bio: u.Mentor?.bio || u.bio || 'No bio provided.',
          certificateUrl: '#',
          linkedin: '#',
          appliedAt: new Date(u.createdAt).toLocaleDateString()
        }));
        setPendingMentors(pending);
      } catch (err) {
        console.error("Failed to fetch pending mentors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingMentors();
  }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
         await adminService.approveUser(id);
         addToast('Approved mentor successfully', 'success');
      } else {
         await adminService.deleteUser(id);
         addToast('Rejected mentor successfully', 'success');
      }
      setPendingMentors(pendingMentors.filter(m => m.id !== id));
      setSelectedMentor(null);
    } catch (err) {
      console.error(err);
      addToast('Action failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Verification</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve new mentor applications.</p>
        </div>
        <Link to="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-primary flex items-center">
           <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List of Applications */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
             <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search applications..." className="input-field pl-9 h-9 py-0 text-sm" />
             </div>
             
             <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {loading ? [1,2].map(i => <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />) : 
                 pendingMentors.length > 0 ? pendingMentors.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setSelectedMentor(m)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedMentor?.id === m.id 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <h4 className="font-bold text-gray-900 text-sm">{m.firstName} {m.lastName}</h4>
                    <p className="text-xs text-primary font-medium mt-1">{m.expertise}</p>
                    <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400 uppercase tracking-widest">
                       <span>{m.appliedAt}</span>
                       <Clock size={10} />
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-8">
                     <UserCheck size={32} className="mx-auto text-gray-200 mb-2" />
                     <p className="text-sm text-gray-400">No pending applications</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          {selectedMentor ? (
            <motion.div 
              key={selectedMentor.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col"
            >
              <div className="p-8 flex-1 overflow-y-auto space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                       <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-extrabold border-2 border-white shadow-sm">
                          {selectedMentor.firstName[0]}{selectedMentor.lastName[0]}
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedMentor.firstName} {selectedMentor.lastName}</h2>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                             <span className="flex items-center"><Mail size={14} className="mr-1" /> {selectedMentor.email}</span>
                             <span>•</span>
                             <span>{selectedMentor.experience} Exp.</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 text-left">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">About the Applicant</h3>
                       <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                          {selectedMentor.bio}
                       </p>
                    </div>
                    <div className="space-y-4 text-left">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Verification Documents</h3>
                       <div className="space-y-3">
                          <a href="#" className="flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-primary transition-colors">
                             <Shield size={18} className="text-primary mr-3" />
                             <div>
                                <p className="text-xs font-bold text-gray-900">Professional Certificate</p>
                                <p className="text-[10px] text-gray-400">PDF Document • 2.4 MB</p>
                             </div>
                             <div className="ml-auto text-primary font-bold text-xs uppercase tracking-widest">View</div>
                          </a>
                          <a href={selectedMentor.linkedin} target="_blank" rel="noreferrer" className="flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-primary transition-colors">
                             <Shield size={18} className="text-blue-600 mr-3" />
                             <div>
                                <p className="text-xs font-bold text-gray-900">LinkedIn Profile</p>
                                <p className="text-[10px] text-gray-400">{selectedMentor.linkedin}</p>
                             </div>
                             <div className="ml-auto text-primary font-bold text-xs uppercase tracking-widest">Open</div>
                          </a>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                 <button 
                  onClick={() => handleAction(selectedMentor.id, 'reject')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors flex items-center"
                 >
                    <X size={18} className="mr-2" /> Reject Application
                 </button>
                 <button 
                  onClick={() => handleAction(selectedMentor.id, 'approve')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center"
                 >
                    <Check size={18} className="mr-2" /> Approve Mentor
                 </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-white rounded-2xl border border-gray-100 border-dashed flex flex-col items-center justify-center p-12 text-center">
               <Shield size={64} className="text-gray-100 mb-6" />
               <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">Select an application to review</h3>
               <p className="text-sm text-gray-400 mt-2 max-w-xs">Review the applicant's credentials and documents before granting platform access.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminApprovals;
