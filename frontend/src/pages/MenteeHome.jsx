import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Calendar, MessageSquare, ArrowRight, Star, Clock } from 'lucide-react';
import api from '../api/axios';
import { bookingService, mentorService } from '../api/services';
const MenteeHome = () => {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);

  useEffect(() => {
    const fetchMenteeData = async () => {
      try {
        const [bookingsRes, mentorsRes] = await Promise.all([
           bookingService.getMenteeBookings(),
           mentorService.getMentors()
        ]);
        
        const allBookings = bookingsRes.data.appointments || bookingsRes.data.data || bookingsRes.data || [];
        // Filter for upcoming
        const upcoming = allBookings.filter(b => b.status === 'confirmed' || b.status === 'accepted').slice(0, 3).map(b => ({
           id: b.id,
           mentor: { 
              name: b.mentor?.user?.name || b.mentor?.User?.name || `${b.mentor?.user?.firstName || ''} ${b.mentor?.user?.lastName || ''}`.trim() || 'Mentor', 
              expertise: b.mentor?.expertise?.[0] || 'Expert',
              picture: b.mentor?.user?.picture || b.mentor?.User?.picture || null
           },
           date: b.date,
           time: b.startTime || b.time,
           topic: b.topic || b.notes || 'Mentorship Session'
        }));
        setUpcomingSessions(upcoming);

        const allMentors = mentorsRes.data.data || mentorsRes.data.mentors || mentorsRes.data || [];
        setRecommendedMentors(allMentors.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch mentee home data", err);
      }
    };
    fetchMenteeData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || user?.name || 'User'}! 👋</h1>
           <p className="text-primary-light max-w-xl text-lg">
             Ready to continue your learning journey? Explore new mentors or prepare for your upcoming sessions.
           </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 transform scale-150"></div>
        <div className="absolute -bottom-8 right-32 w-32 h-32 rounded-full bg-black opacity-10 blur-2xl"></div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Link to="/mentee/explore" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search size={24} />
               </div>
               <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Explore Mentors</h3>
                  <p className="text-sm text-gray-500">Find your ideal guide</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-blue-600 transition-colors" />
         </Link>

         <Link to="/mentee/bookings" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Calendar size={24} />
               </div>
               <div>
                  <h3 className="font-semibold text-gray-900 text-lg">My Bookings</h3>
                  <p className="text-sm text-gray-500">View upcoming sessions</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-green-600 transition-colors" />
         </Link>

         <Link to="/mentee/messages" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Messages</h3>
                  <p className="text-sm text-gray-500">Chat with connections</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-purple-600 transition-colors" />
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Sessions */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                <Link to="/mentee/bookings" className="text-sm font-medium text-primary hover:text-primary-dark">View All</Link>
             </div>

             {upcomingSessions.length > 0 ? (
               <div className="space-y-4">
                  {upcomingSessions.map(session => (
                     <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors">
                        <div className="flex items-start space-x-4">
                           {session.mentor.picture ? (
                             <img src={session.mentor.picture} alt={session.mentor.name} className="h-12 w-12 rounded-full object-cover shrink-0 border border-gray-100" />
                           ) : (
                             <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0 uppercase">
                                {session.mentor.name ? session.mentor.name.charAt(0) : 'U'}
                             </div>
                           )}
                           <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{session.topic}</h4>
                              <p className="text-gray-600 text-sm">with {session.mentor.name} ({session.mentor.expertise})</p>
                              <div className="flex items-center text-sm text-primary mt-2 flex-wrap gap-3">
                                 <span className="flex items-center"><Calendar size={14} className="mr-1" /> {session.date}</span>
                                 <span className="flex items-center"><Clock size={14} className="mr-1" /> {session.time}</span>
                              </div>
                           </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex shrink-0 space-x-2">
                           <button className="btn-secondary py-1.5 px-3 text-sm">Reschedule</button>
                           <button className="btn-primary py-1.5 px-3 text-sm">Join</button>
                        </div>
                     </div>
                  ))}
               </div>
             ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                   <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                   <h3 className="text-lg font-medium text-gray-900">No upcoming sessions</h3>
                   <p className="text-gray-500 text-sm mt-1 mb-4">Book a mentor to get started.</p>
                   <Link to="/mentee/explore" className="btn-primary text-sm">Find a Mentor</Link>
                </div>
             )}
          </section>

          {/* Recent Playbooks Preview (Stub) */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Featured Playbooks</h2>
                <Link to="/mentee/playbooks" className="text-sm font-medium text-primary hover:text-primary-dark">Library</Link>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2].map(i => (
                  <div key={i} className="group relative rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                     <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        {/* Image Placeholder */}
                     </div>
                     <div className="p-4">
                        <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wide">Career Advice</p>
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">How to ace the System Design Interview</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">A comprehensive guide to structured thinking during technical interviews.</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>

        </div>

        {/* Sidebar Space (1 col) */}
        <div className="space-y-6">
           
           {/* Recommended Mentors */}
           <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended for You</h2>
             
             <div className="space-y-4">
               {recommendedMentors.map(mentor => (
                 <div key={mentor.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    {mentor.User?.picture || mentor.user?.picture ? (
                       <img src={mentor.User?.picture || mentor.user?.picture} alt="Mentor" className="h-10 w-10 shrink-0 rounded-full object-cover mr-3 border border-gray-100" />
                    ) : (
                       <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3 uppercase">
                          {((mentor.user || mentor.User)?.name || (mentor.user || mentor.User)?.firstName || 'M').charAt(0)}
                       </div>
                    )}
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-gray-900 truncate">{(mentor.user || mentor.User)?.name || `${(mentor.user || mentor.User)?.firstName || ''} ${(mentor.user || mentor.User)?.lastName || ''}`.trim() || 'Mentor'}</h4>
                       <p className="text-xs text-gray-500 truncate">{mentor.expertise && mentor.expertise[0]}</p>
                    </div>
                    <Link to={`/mentee/mentor/${mentor.id}`} className="ml-2 text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                       <ArrowRight size={18} />
                    </Link>
                 </div>
               ))}
             </div>
             
             <Link to="/mentee/explore" className="mt-4 block text-center text-sm font-medium text-gray-600 hover:text-primary transition-colors w-full py-2 bg-gray-50 rounded-lg">
                View more suggestions
             </Link>
           </section>

        </div>
      </div>
    </div>
  );
};

export default MenteeHome;
