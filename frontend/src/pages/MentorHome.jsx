import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Calendar, MessageSquare, ArrowRight, UserPlus, Clock } from 'lucide-react';
import { bookingService } from '../api/services';

const MentorHome = () => {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [stats, setStats] = useState({ requests: 0, active: 0 });

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const bookingsRes = await bookingService.getMentorBookings();
        const allBookings = bookingsRes.data.appointments || bookingsRes.data.data || bookingsRes.data || [];
        
        // Filter for upcoming (confirmed/accepted)
        const upcoming = allBookings
           .filter(b => b.status === 'confirmed' || b.status === 'accepted')
           .slice(0, 3)
           .map(b => ({
              id: b.id,
              mentee: { 
                 name: b.mentee?.user?.name || b.mentee?.User?.name || `${b.mentee?.user?.firstName || ''} ${b.mentee?.user?.lastName || ''}`.trim() || 'Mentee', 
                 picture: b.mentee?.user?.picture || b.mentee?.User?.picture || null
              },
              date: b.date,
              time: b.startTime || b.time,
              topic: b.topic || b.notes || 'Mentorship Session'
           }));
           
        setUpcomingSessions(upcoming);

        // Quick Stats Approximation
        setStats({
           requests: allBookings.filter(b => b.status === 'pending').length,
           active: allBookings.filter(b => b.status === 'accepted' || b.status === 'confirmed').length
        });
      } catch (err) {
        console.error("Failed to fetch mentor home data", err);
      }
    };
    fetchMentorData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Welcome Banner - Mentee Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || user?.name || 'Mentor'}! 👋</h1>
           <p className="text-primary-light max-w-xl text-lg">
             Ready to impact lives? Review your incoming requests, open your availability, or prepare for upcoming sessions.
           </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 transform scale-150"></div>
        <div className="absolute -bottom-8 right-32 w-32 h-32 rounded-full bg-black opacity-10 blur-2xl"></div>
      </motion.div>

      {/* Quick Actions (Matching Mentee Home Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Link to="/mentor/bookings" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors relative">
                  <UserPlus size={24} />
                  {stats.requests > 0 && (
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                        {stats.requests}
                     </span>
                  )}
               </div>
               <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Session Requests</h3>
                  <p className="text-sm text-gray-500">Review pending bookings</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-blue-600 transition-colors" />
         </Link>

         <Link to="/mentor/availability" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Calendar size={24} />
               </div>
               <div>
                  <h3 className="font-semibold text-gray-900 text-lg">My Availability</h3>
                  <p className="text-sm text-gray-500">Manage your free slots</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-green-600 transition-colors" />
         </Link>

         <Link to="/mentor/messages" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Messages</h3>
                  <p className="text-sm text-gray-500">Chat with mentees</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-purple-600 transition-colors" />
         </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         {/* Main Content (Upcoming Sessions) */}
         <div className="xl:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                  <Link to="/mentor/bookings" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">View All Schedule</Link>
               </div>

               <div className="divide-y divide-gray-100">
                  {upcomingSessions.length > 0 ? upcomingSessions.map(session => (
                     <div key={session.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                           <div className="h-14 w-14 rounded-full border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                              {session.mentee.picture && session.mentee.picture !== "http://localhost:5000/uploads/default.png" ? (
                                 <img src={session.mentee.picture} alt={session.mentee.name} className="h-full w-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl uppercase">
                                    {session.mentee.name?.charAt(0) || 'M'}
                                 </div>
                              )}
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{session.mentee.name}</h4>
                              <p className="text-gray-500 text-sm font-medium mt-0.5">{session.topic}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="bg-blue-50/50 border border-blue-100 px-4 py-2.5 rounded-xl">
                              <div className="flex items-center text-sm font-bold text-blue-900 mb-1">
                                 <Calendar size={14} className="mr-1.5 text-blue-500" /> {session.date}
                              </div>
                              <div className="flex items-center text-xs font-semibold text-blue-600/80">
                                 <Clock size={12} className="mr-1.5 text-blue-400" /> {session.time}
                              </div>
                           </div>
                           
                           <button className="btn-primary py-2.5 px-6 shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 hidden sm:block">
                              Join Call
                           </button>
                        </div>
                        <button className="btn-primary w-full py-2.5 sm:hidden shadow-md mt-2">
                           Join Call
                        </button>
                     </div>
                  )) : (
                     <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                           <Calendar size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Free Schedule</h4>
                        <p className="text-gray-500 max-w-sm mx-auto">
                           You don't have any upcoming sessions. Open up your availability to let mentees book you, or check your pending requests.
                        </p>
                        <Link to="/mentor/availability" className="inline-block mt-6 px-6 py-2.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors">
                           Manage Availability
                        </Link>
                     </div>
                  )}
               </div>
            </section>
         </div>

         {/* Sidebar Area */}
         <div className="space-y-6">
            <section className="bg-gradient-to-br from-[#0A2640] to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                     <Clock size={20} className="text-blue-300"/> Time Optimization
                  </h3>
                  <p className="text-blue-100/90 text-sm leading-relaxed mb-6 font-medium">
                     Mentors who establish regular weekly availability slots receive 40% more booking requests. 
                  </p>
                  <Link to="/mentor/availability" className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white py-2.5 px-4 rounded-xl font-bold transition-colors">
                     Update Calendar
                  </Link>
               </div>
               {/* Decorative */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default MentorHome;
