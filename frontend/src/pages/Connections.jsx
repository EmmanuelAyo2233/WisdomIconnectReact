import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Search, Users, CheckCircle, XCircle } from 'lucide-react';
import { connectionService } from '../api/services';
import { useToast } from '../context/ToastContext';

const Connections = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accepted');

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
  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  const pendingConnections = connections.filter(c => c.status === 'pending');
  const userType = user.userType || user.role;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">My Connections</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your mentorship network and messaging access.</p>
         </div>
         <div className="flex-1 max-w-sm relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 h-10 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
              placeholder="Search connections..."
            />
         </div>
      </div>

      {userType === 'mentor' && (
         <div className="flex border-b border-gray-200 space-x-6">
            <button 
               onClick={() => setActiveTab('accepted')}
               className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'accepted' ? 'border-primary text-[#0A2640]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               Active Connections ({acceptedConnections.length})
            </button>
            <button 
               onClick={() => setActiveTab('pending')}
               className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-primary text-[#0A2640]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
                  <div className="h-16 w-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl font-bold mb-4 border border-orange-100 overflow-hidden">
                     {targetUser?.picture && targetUser.picture.startsWith('http') ? (
                        <img src={targetUser.picture} alt={name} className="h-full w-full object-cover" />
                     ) : (
                        name.charAt(0)
                     )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                     {name}
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
               <div key={conn.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="h-1 bg-green-400 absolute top-0 left-0 right-0" />
                  <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden border-2 border-white shadow-sm">
                     {targetUser?.picture && targetUser.picture.startsWith('http') ? (
                        <img src={targetUser.picture} alt={name} className="h-full w-full object-cover" />
                     ) : (
                        name.charAt(0)
                     )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                     {name}
                  </h3>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mt-1 mb-4">
                     {isMentor ? 'Mentee' : 'Mentor'}
                  </p>
                  
                  <div className="flex space-x-3 w-full border-t border-gray-100 pt-4">
                     {/* The Chat link relies on query parameter `user` which maps to the other user's user_id in the DB */}
                     <Link to={`/${userType}/messages?user=${targetUser?.id}`} className="flex-1 py-2 px-3 bg-gray-50 hover:bg-primary/10 text-[#0A2640] text-sm font-bold rounded-lg flex items-center justify-center transition-colors border border-gray-200">
                        <MessageSquare size={16} className="mr-2" /> Message
                     </Link>
                     {!isMentor && (
                        <Link to={`/mentee/mentor/${targetUser?.id}`} className="bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center justify-center px-4 transition-colors">
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
