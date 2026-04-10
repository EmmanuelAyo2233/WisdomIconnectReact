import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Calendar, Search, Users, CheckCircle, XCircle } from 'lucide-react';
import { connectionService } from '../api/services';
import { useToast } from '../context/ToastContext';

const Connections = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accepted');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
     const newSearch = searchParams.get('search') || '';
     setSearchTerm(newSearch);
  }, [location.search]);

  const fetchConnections = async () => {
    try {
      const res = await connectionService.getConnections();
      if (res.data?.data) {
        setConnections(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch connections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleRespond = async (connectionId, status) => {
    try {
      await connectionService.respondConnection(connectionId, status);
      addToast(`Request ${status} successfully`, "success");
      // Update local state
      setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status } : c));
    } catch (err) {
      console.error(err);
      addToast("Failed to process request", "error");
    }
  };

  // derived arrays
  const acceptedConnections = connections.filter(c => {
    if (c.status !== 'accepted') return false;
    const isMentor = (user.userType || user.role) === 'mentor';
    const targetUser = isMentor ? c.mentee?.user : c.mentor?.user;
    return (targetUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const pendingConnections = connections.filter(c => {
    if (c.status !== 'pending') return false;
    const isMentor = (user.userType || user.role) === 'mentor';
    const targetUser = isMentor ? c.mentee?.user : c.mentor?.user;
    return (targetUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });
  const userType = user.userType || user.role;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 md:w-1/2 flex flex-col gap-4 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Connections</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-lg mx-auto md:mx-0">
            Monitor and grow your mentorship network and messaging access.
          </p>
        </div>
        
        <div className="relative z-10 w-full md:w-1/2 max-w-lg mx-auto">
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
              </div>
              <input
                type="text"
                className="block w-full pl-14 pr-6 py-5 bg-white border border-white/20 rounded-3xl text-gray-900 placeholder-gray-400 text-base md:text-lg font-bold shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 placeholder:font-semibold"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                 <button className="bg-primary hover:bg-primary-dark transition-colors text-white rounded-2xl px-5 py-3 text-sm font-bold shadow-md hidden sm:block border border-white/20">
                    Search
                 </button>
              </div>
           </div>
        </div>
      </motion.div>

      {userType === 'mentor' && (
         <div className="flex border-b border-gray-200 space-x-6">
            <button 
               onClick={() => setActiveTab('accepted')}
               className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'accepted' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               Active Connections ({acceptedConnections.length})
            </button>
            <button 
               onClick={() => setActiveTab('pending')}
               className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               Pending Requests
               {pendingConnections.length > 0 && (
                  <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                     {pendingConnections.length}
                  </span>
               )}
            </button>
         </div>
      )}

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
               <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-40 animate-pulse">
                  <div className="flex items-center space-x-4">
                     <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                     <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      ) : activeTab === 'pending' && userType === 'mentor' ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingConnections.length > 0 ? pendingConnections.map(conn => {
               const targetUser = conn.mentee?.user;
               const name = targetUser?.name || "Unknown User";
               
               return (
               <div key={conn.id} className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 flex flex-col items-center text-center">
                  <Link to={`/mentor/mentee/${targetUser.id}`} state={{ profile: conn.mentee }} className="h-16 w-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl font-bold mb-4 border border-orange-100 overflow-hidden hover:ring-2 hover:ring-orange-300 transition-all focus:outline-none" title="View Profile">
                     {targetUser?.picture && targetUser.picture.startsWith('http') ? (
                        <img src={targetUser.picture} alt={name} className="h-full w-full object-cover" />
                     ) : (
                        name.charAt(0)
                     )}
                  </Link>
                  <h3 className="text-lg font-bold text-gray-900">
                     <Link to={`/mentor/mentee/${targetUser.id}`} state={{ profile: conn.mentee }} className="hover:text-primary hover:underline transition-colors focus:outline-none">{name}</Link>
                  </h3>
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mt-1 mb-2">
                     Message Request
                  </p>
                  
                  <div className="flex space-x-3 w-full border-t border-gray-100 pt-4 mt-4">
                     <button 
                        onClick={() => handleRespond(conn.id, 'accepted')}
                        className="flex-1 py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-bold rounded-lg flex items-center justify-center transition-colors border border-green-200"
                     >
                        <CheckCircle size={16} className="mr-1.5" /> Accept
                     </button>
                     <button 
                        onClick={() => handleRespond(conn.id, 'rejected')}
                        className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-lg flex items-center justify-center transition-colors border border-red-200"
                     >
                        <XCircle size={16} className="mr-1.5" /> Decline
                     </button>
                  </div>
               </div>
            )}) : (
               <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No pending message requests.</p>
               </div>
            )}
         </div>
      ) : acceptedConnections.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedConnections.map(conn => {
               const isMentor = userType === 'mentor';
               const targetUser = isMentor ? conn.mentee?.user : conn.mentor?.user;
               const name = targetUser?.name || "Unknown User";
               
               return (
               <div key={conn.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors pointer-events-none" />
                  
                  <Link to={isMentor ? `/mentor/mentee/${targetUser.id}` : `/mentee/mentor/${targetUser.id}`} state={{ profile: isMentor ? conn.mentee : conn.mentor }} className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 text-primary flex items-center justify-center text-3xl font-black mb-5 overflow-hidden shadow-sm ring-4 ring-white hover:ring-primary/30 relative z-10 transition-transform group-hover:scale-105 duration-300 focus:outline-none" title="View Profile">
                     {targetUser?.picture && targetUser.picture.startsWith('http') ? (
                        <img src={targetUser.picture} alt={name} className="h-full w-full object-cover" />
                     ) : (
                        name.charAt(0)
                     )}
                  </Link>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors relative z-10 leading-tight">
                     <Link to={isMentor ? `/mentor/mentee/${targetUser.id}` : `/mentee/mentor/${targetUser.id}`} state={{ profile: isMentor ? conn.mentee : conn.mentor }} className="focus:outline-none">{name}</Link>
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1.5 mb-5 relative z-10">
                     {isMentor ? 'Mentee Connection' : 'Mentor Connection'}
                  </p>
                  
                  <div className="flex space-x-3 w-full border-t border-gray-100 pt-5 relative z-10">
                     <Link to={`/${userType}/messages?user=${targetUser?.id}`} className="flex-1 py-2.5 px-3 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 text-sm font-bold rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary shadow-sm">
                        <MessageSquare size={16} className="mr-2" /> Message
                     </Link>
                     {!isMentor && (
                        <Link to={`/mentee/mentor/${targetUser?.id}`} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-primary rounded-xl flex items-center justify-center px-4 transition-colors shadow-sm" title="View Profile">
                           <Calendar size={18} />
                        </Link>
                     )}
                  </div>
               </div>
            )})}
         </div>
      ) : (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active connections</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Connections are automatically established when a session is booked or a message request is accepted.</p>
            {userType === 'mentee' ? (
               <Link to="/mentee/explore" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors inline-block">Find a Mentor</Link>
            ) : (
               <Link to="/mentor/availability" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors inline-block">Update Availability</Link>
            )}
         </div>
      )}
    </div>
  );
};

export default Connections;
