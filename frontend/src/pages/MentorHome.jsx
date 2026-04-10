import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Calendar, MessageSquare, ArrowRight, UserPlus, Clock, CheckCircle, XCircle, Star } from 'lucide-react';
import { bookingService, messageRequestService, connectionService } from '../api/services';
import { useToast } from '../context/ToastContext';

const MentorHome = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);
  const [stats, setStats] = useState({ bookingRequests: 0, messageRequests: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  const fetchMentorData = async () => {
    try {
      const bookingsRes = await bookingService.getMentorBookings();
      const allBookings = bookingsRes.data.appointments || bookingsRes.data.data || bookingsRes.data || [];
      
      // Filter for upcoming sessions
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = allBookings
         .filter(b => (b.status === 'confirmed' || b.status === 'accepted') && b.date >= todayStr)
         .slice(0, 3)
         .map(b => ({
            id: b.id,
            mentee: { 
               name: b.mentee?.user?.name || b.mentee?.User?.name || 'Mentee', 
               picture: b.mentee?.user?.picture || b.mentee?.User?.picture || null
            },
            date: b.date,
            time: b.startTime || b.time,
            topic: b.topic || b.notes || 'Mentorship Session',
            payment: b.payment
         }));
         
      setUpcomingSessions(upcoming);

      // Fetch Message Requests
      const msgReqRes = await messageRequestService.getMentorMessageRequests();
      const requests = msgReqRes.data.data?.requests || [];
      setMessageRequests(requests);

      // Fetch True Connections
      const connRes = await connectionService.getConnections();
      const connectionsList = connRes.data?.data?.connections || connRes.data?.connections || connRes.data?.data || connRes.data || [];
      const activeConnections = Array.isArray(connectionsList) ? connectionsList.filter(c => c.status === 'accepted').length : 0;

      setStats({
         bookingRequests: allBookings.filter(b => b.status === 'pending').length,
         messageRequests: requests.length,
         active: activeConnections
      });
    } catch (err) {
      console.error("Failed to fetch mentor home data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  const handleRespondToRequest = async (requestId, status) => {
    try {
        await messageRequestService.respondToMessageRequest(requestId, status);
        addToast(`Request ${status} successfully!`, "success");
        fetchMentorData(); // Refresh
    } catch (err) {
        addToast("Failed to process request", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-20 pt-4 sm:pt-8">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#B22222] rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
           <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight">Welcome back, {user?.firstName || user?.name || 'Mentor'}! 👋</h1>
           <p className="text-blue-100/80 max-w-2xl text-lg font-medium">
             Your impact matters. Manage your schedule, respond to new connection requests, and guide the next generation of talent.
           </p>
        </div>
        
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-400 opacity-10 blur-3xl" />
      </motion.div>

      {/* Stats and Fast Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Link to="/mentor/bookings" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
               <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors relative">
                  <UserPlus size={24} />
               </div>
               {stats.bookingRequests > 0 && <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full">{stats.bookingRequests} New</span>}
            </div>
            <div>
               <h3 className="font-black text-gray-900 text-xl leading-tight">Session Bookings</h3>
               <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-widest">Pending: {stats.bookingRequests}</p>
            </div>
         </Link>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
               <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <MessageSquare size={24} />
               </div>
               {stats.messageRequests > 0 && <span className="bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-full">{stats.messageRequests} New</span>}
            </div>
            <div>
               <h3 className="font-black text-gray-900 text-xl leading-tight">Chat Requests</h3>
               <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-widest">Unanswered: {stats.messageRequests}</p>
            </div>
         </div>

         <Link to="/mentor/availability" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col justify-between h-40">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
               <Calendar size={24} />
            </div>
            <div>
               <h3 className="font-black text-gray-900 text-xl leading-tight">My Calendar</h3>
               <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-widest">Update Availability</p>
            </div>
         </Link>

         <div className="bg-primary p-6 rounded-2xl shadow-xl flex flex-col justify-between h-40">
            <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
               <CheckCircle size={20} />
            </div>
            <div>
               <h3 className="font-black text-white text-xl leading-tight">Active Mentees</h3>
               <p className="text-xs font-bold text-white/60 uppercase mt-1 tracking-widest">{stats.active} Total Connections</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Main Column */}
         <div className="xl:col-span-2 space-y-8">
            
            {/* New Message Requests Section */}
            {messageRequests.length > 0 && (
               <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ring-4 ring-orange-50/50">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-orange-50/30">
                     <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Message Requests</h2>
                        <p className="text-sm font-bold text-orange-600 mt-1">Accept these requests to start chatting</p>
                     </div>
                     <span className="bg-white px-4 py-1.5 rounded-full border border-orange-200 text-xs font-black text-orange-600 shadow-sm">{messageRequests.length} Pending</span>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                     {messageRequests.map(req => (
                        <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="h-12 w-12 rounded-full border border-gray-100 overflow-hidden bg-gray-50 shrink-0 shadow-sm">
                                 {req.mentee?.user?.picture ? (
                                    <img src={req.mentee.user.picture} alt="" className="h-full w-full object-cover" />
                                 ) : (
                                    <div className="h-full w-full flex items-center justify-center font-black text-primary bg-primary/10">{req.mentee?.user?.name?.charAt(0)}</div>
                                 )}
                              </div>
                              <div>
                                 <h4 className="font-black text-gray-900">{req.mentee?.user?.name}</h4>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Connection Request</p>
                              </div>
                           </div>
                           <div className="bg-gray-50 rounded-xl p-4 mb-6 relative">
                              <div className="absolute top-0 left-6 -translate-y-1/2 w-4 h-4 bg-gray-50 rotate-45 border-l border-t border-gray-100" />
                              <p className="text-sm text-gray-600 italic font-medium line-clamp-2">"{req.initial_message}"</p>
                           </div>
                           <div className="flex gap-3 mt-auto">
                              <button 
                                 onClick={() => handleRespondToRequest(req.id, 'accepted')}
                                 className="flex-1 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-md hover:bg-primary-dark transition-all transform active:scale-95"
                              >
                                 Accept
                              </button>
                              <button 
                                 onClick={() => handleRespondToRequest(req.id, 'rejected')}
                                 className="flex-1 py-2.5 bg-gray-50 text-gray-600 text-xs font-black rounded-xl border border-gray-100 hover:bg-gray-100 transition-all active:scale-95"
                              >
                                 Decline
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            )}

            {/* Upcoming Sessions Section */}
            <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
               <div className="p-4 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Upcoming Schedule</h2>
                  <Link to="/mentor/bookings" className="text-sm font-bold text-primary hover:underline">View Full Calendar</Link>
               </div>

               <div className="divide-y divide-gray-100">
                  {upcomingSessions.length > 0 ? upcomingSessions.map(session => (
                     <div key={session.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all shrink-0">
                              {session.mentee.picture ? (
                                 <img src={session.mentee.picture} alt={session.mentee.name} className="h-full w-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-lg">{session.mentee.name?.charAt(0)}</div>
                              )}
                           </div>
                            <div>
                               <div className="flex items-center gap-2 flex-wrap">
                                 <h4 className="font-extrabold text-gray-900 text-sm sm:text-base group-hover:text-primary transition-colors">{session.mentee.name}</h4>
                                 {session.payment && (
                                   <span className="px-2 border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md flex items-center">
                                     💰 ₦{(session.payment.amount || 0).toLocaleString()}
                                   </span>
                                 )}
                               </div>
                               <p className="text-gray-400 text-[10px] sm:text-xs font-bold mt-0.5 uppercase tracking-widest">{session.topic}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                           <div className="bg-blue-50/50 border border-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start text-left">
                              <div className="flex items-center text-xs font-black text-blue-900 mb-0.5">
                                 <Calendar size={12} className="mr-1.5 text-blue-500" /> {session.date}
                              </div>
                              <div className="flex items-center text-[10px] font-bold text-blue-400">
                                 <Clock size={10} className="mr-1.5 opacity-70" /> {session.time}
                              </div>
                           </div>
                           
                           <button className="bg-primary hover:bg-primary-dark text-white py-1.5 sm:py-2 px-4 sm:px-5 rounded-lg font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 text-xs sm:text-sm w-full sm:w-auto">
                              Join Call
                           </button>
                        </div>
                     </div>
                  )) : (
                     <div className="p-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 border border-white shadow-inner">
                           <Calendar size={40} />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-4">No Sessions Scheduled</h4>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                           Your calendar is clear. Share your profile or update your availability to receive more bookings.
                        </p>
                        <Link to="/mentor/availability" className="inline-block mt-10 px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1">
                           Set Available Hours
                        </Link>
                     </div>
                  )}
               </div>
            </section>
         </div>

         {/* Sidebar Area */}
         <div className="space-y-8">
            <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative z-10">
                  <div className="h-14 w-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                     <Clock size={28} />
                  </div>
                  <h3 className="font-black text-2xl text-gray-900 mb-4">Earn More Impact</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-10 text-lg">
                     Mentees who book weekly sessions are 3x more likely to reach their career goals within 6 months.
                  </p>
                  <Link to="/mentor/availability" className="block w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-center shadow-xl shadow-gray-900/10 hover:bg-black transition-all transform hover:-translate-y-1">
                     Manage Calendar
                  </Link>
               </div>
            </section>
            
            <section className="bg-gradient-to-br from-indigo-500 to-primary rounded-[32px] p-8 text-white shadow-2xl">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <Star size={24} className="text-yellow-300 fill-yellow-300" /> Pro Tips
               </h3>
               <div className="space-y-6">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                     <p className="text-sm font-bold italic">"Consistency is key. Setting slots on the same days every week builds trust."</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                     <p className="text-sm font-bold italic">"Respond to message requests within 24 hours to keep engagement high."</p>
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default MentorHome;
