import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, MoreVertical, Search, CheckCircle, XCircle } from 'lucide-react';
import { bookingService } from '../api/services';
import { useToast } from '../context/ToastContext';

const Bookings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const role = user?.userType || user?.role;
        const fetchMethod = role === 'mentor' ? bookingService.getMentorBookings : bookingService.getMenteeBookings;
        const res = await fetchMethod();
        setBookings(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.userType, user?.role]);

  const handleStatusUpdate = async (id, newStatus) => {
      try {
         if (newStatus === 'cancelled') {
            await bookingService.cancelBooking(id);
         } else {
            await bookingService.updateBookingStatus(id, newStatus);
         }
         // Optimistic UI update
         setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
         addToast(`Booking status updated to ${newStatus}`, 'success');
      } catch (err) {
         console.error("Error updating booking status", err);
         addToast("Failed to update booking status.", 'error');
      }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getFilteredBookings = () => {
    if (activeTab === 'upcoming') {
       return bookings.filter(b => b.status === 'accepted' || (b.status === 'pending' && b.date >= todayStr) || b.status === 'confirmed');
    }
    if (activeTab === 'pending') {
       return bookings.filter(b => b.status === 'pending');
    }
    if (activeTab === 'past') {
       return bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status) || (b.date < todayStr && b.status !== 'accepted'));
    }
    return bookings;
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'past', label: 'Past & Cancelled' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
           <p className="text-gray-500 text-sm mt-1">View and manage your mentorship sessions.</p>
        </div>
        
        <div className="flex-1 max-w-sm relative">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-5 w-5 text-gray-400" />
           </div>
           <input
             type="text"
             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
             placeholder="Search bookings..."
           />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id 
                     ? 'border-primary text-primary outline-none' 
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 outline-none'
               }`}
            >
               {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Booking List */}
      <div className="space-y-4">
         {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">Loading bookings...</div>
         ) : getFilteredBookings().length > 0 ? (
            getFilteredBookings().map((booking, index) => {
               const role = user?.userType || user?.role;
               const otherPerson = role === 'mentor' ? booking.mentee : booking.mentor;
               // Extract real names from populated backend models if available
               const otherName = otherPerson?.user?.name || otherPerson?.firstName || 'User';
               
               return (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3, delay: index * 0.05 }}
                     key={booking.id} 
                     className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                  >
                     <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-[#0A2640]/10 flex items-center justify-center text-[#0A2640] font-bold shrink-0 uppercase overflow-hidden">
                           {otherPerson?.user?.picture ? (
                              <img src={otherPerson.user.picture} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                              otherName.charAt(0)
                           )}
                        </div>
                        <div>
                           <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-bold text-gray-900">{booking.topic || 'Mentorship Session'}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                 ['confirmed', 'accepted'].includes(booking.status) ? 'bg-green-100 text-green-800' :
                                 booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                 ['cancelled', 'rejected'].includes(booking.status) ? 'bg-red-100 text-red-800' :
                                 'bg-gray-100 text-gray-800'
                              }`}>
                                 {booking.status}
                              </span>
                           </div>
                           <p className="text-gray-600 text-sm mt-1">
                              With {otherName} {(user?.userType || user?.role) === 'mentee' ? `(${otherPerson?.expertise ? JSON.parse(otherPerson.expertise)[0] : 'Mentor'})` : ''}
                           </p>
                           
                           <div className="flex flex-wrap items-center text-sm font-medium text-gray-500 mt-4 gap-4">
                              <div className="flex items-center">
                                 <Calendar size={16} className="mr-1.5 text-gray-400" />
                                 {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="flex items-center">
                                 <Clock size={16} className="mr-1.5 text-gray-400" />
                                 {booking.startTime}
                              </div>
                           </div>
                           {booking.goals && (
                              <p className="text-sm text-gray-500 italic mt-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                "{booking.goals}"
                              </p>
                           )}
                        </div>
                     </div>
                     
                     <div className="flex items-center space-x-3 pt-4 lg:pt-0 border-t border-gray-100 lg:border-t-0">
                        {['confirmed', 'accepted'].includes(booking.status) && (
                           <>
                              <button className="btn-secondary py-2 px-4 text-sm bg-white border border-[#b22222] text-[#b22222] hover:bg-red-50">Reschedule</button>
                              <button className="btn-primary py-2 px-6 text-sm bg-[#555a64] hover:bg-[#3f434a]">Join Call</button>
                           </>
                        )}
                        
                        {booking.status === 'pending' && (user?.userType || user?.role) === 'mentor' && (
                           <>
                              <button onClick={() => handleStatusUpdate(booking.id, 'reject')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors" title="Decline">
                                 <XCircle size={20} />
                              </button>
                              <button onClick={() => handleStatusUpdate(booking.id, 'accept')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors" title="Accept">
                                 <CheckCircle size={20} />
                              </button>
                           </>
                        )}

                        {booking.status === 'pending' && (user?.userType || user?.role) === 'mentee' && (
                           <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="btn-secondary py-2 px-4 text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50">Cancel Request</button>
                        )}

                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                           <MoreVertical size={20} />
                        </button>
                     </div>
                  </motion.div>
               )
            })
         ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
               <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
               <h3 className="text-lg font-medium text-gray-900">No {activeTab} bookings found</h3>
               <p className="text-gray-500 mt-1">
                  {(user?.userType || user?.role) === 'mentee' ? "Ready to learn? Explore our mentors and book a session." : "You have no appointments in this category."}
               </p>
            </div>
         )}
      </div>
    </div>
  );
};

export default Bookings;
