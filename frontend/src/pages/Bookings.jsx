import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, MoreVertical, Search, CheckCircle, XCircle, Star } from 'lucide-react';
import { bookingService } from '../api/services';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const Bookings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCommendOpen, setIsCommendOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isCallActive = (date, startTime) => {
    if (!date || !startTime) return false;
    const [year, month, day] = date.split('-');
    const [hrs, mins, secs] = startTime.split(':');
    const startObj = new Date(year, month - 1, day, hrs, mins, secs || 0);
    const now = new Date();
    const diffMs = startObj.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins <= 5;
  };

  const handleCompleteSession = async (id) => {
    try {
       await bookingService.completeSession(id);
       addToast("Session completion status updated", "success");
       setBookings(prev => prev.map(b => b.id === id ? { ...b, menteeConfirmed: user?.userType === 'mentee' ? true : b.menteeConfirmed, mentorConfirmed: user?.userType === 'mentor' ? true : b.mentorConfirmed } : b));
       // We can just rely on the next fetch or local state
    } catch (err) {
       addToast(err.response?.data?.message || "Error marking session complete", "error");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (user?.userType === 'mentee') {
        const res = await bookingService.submitReview(selectedBooking.id, { rating, comment: commentText });
        setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, review: res.data.data } : b));
        addToast("Review submitted successfully", "success");
        setIsReviewOpen(false);
      } else {
        const res = await bookingService.submitCommendation(selectedBooking.id, { rating, commendation: commentText });
        setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, commendation: res.data.data } : b));
        addToast("Commendation submitted successfully", "success");
        setIsCommendOpen(false);
      }
      setRating(5); setCommentText('');
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit", "error");
    } finally {
      setSubmitting(false);
    }
  };

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
    let filtered = bookings;
    if (activeTab === 'upcoming') {
       filtered = bookings.filter(b => ['accepted', 'confirmed', 'pending'].includes(b.status) && b.date >= todayStr);
    }
    else if (activeTab === 'pending') {
       filtered = bookings.filter(b => b.status === 'pending' && b.date >= todayStr);
    }
    else if (activeTab === 'past') {
       filtered = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status) || b.date < todayStr);
    }
    
    if (searchTerm.trim()) {
       filtered = filtered.filter(b => {
          const role = user?.userType || user?.role;
          const otherPerson = role === 'mentor' ? b.mentee : b.mentor;
          const otherName = otherPerson?.user?.name || otherPerson?.firstName || '';
          const topic = b.topic || '';
          return otherName.toLowerCase().includes(searchTerm.toLowerCase()) || topic.toLowerCase().includes(searchTerm.toLowerCase());
       });
    }
    
    return filtered;
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'past', label: 'Past & Cancelled' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Hero Section */}
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
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Bookings</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-lg mx-auto md:mx-0">
            View and manage your mentorship sessions effectively.
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
                placeholder="Search bookings..."
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

      {/* Tabs */}
      <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide px-2">
          {tabs.map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all transform hover:-translate-y-0.5 ${
                  activeTab === tab.id 
                     ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                     : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
               }`}
            >
               {tab.label}
            </button>
          ))}
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
                        <Link 
                           to={`/${(user?.userType || user?.role) === 'mentor' ? 'mentor/mentee' : 'mentee/mentor'}/${otherPerson?.user?.id || otherPerson?.id}`} 
                           state={{ profile: otherPerson }}
                           className="h-12 w-12 rounded-full bg-[#b22222]/10 flex items-center justify-center text-[#b22222] font-bold shrink-0 uppercase overflow-hidden hover:ring-2 ring-primary/30 transition-all focus:outline-none"
                           title={`View ${otherName}'s Profile`}
                        >
                           {otherPerson?.user?.picture ? (
                              <img src={otherPerson.user.picture} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                              otherName.charAt(0)
                           )}
                        </Link>
                        <div>
                           <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                              <h3 className="text-lg font-bold text-gray-900">Mentorship Session</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                 ['confirmed', 'accepted'].includes(booking.status) ? 'bg-green-100 text-green-800' :
                                 booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                 ['cancelled', 'rejected'].includes(booking.status) ? 'bg-red-100 text-red-800' :
                                 'bg-gray-100 text-gray-800'
                              }`}>
                                 {booking.status}
                              </span>
                              {booking.payment && (
                                 <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm ml-2">
                                   💰 Paid: ₦{(booking.payment.amount || 0).toLocaleString()}
                                 </span>
                              )}
                           </div>
                           <p className="text-gray-600 text-sm mt-1 flex items-center flex-wrap gap-1">
                              <span>With</span> 
                              <Link to={`/${(user?.userType || user?.role) === 'mentor' ? 'mentor/mentee' : 'mentee/mentor'}/${otherPerson?.user?.id || otherPerson?.id}`} state={{ profile: otherPerson }} className="font-extrabold text-primary hover:underline hover:text-primary-dark transition-colors focus:outline-none">
                                 {otherName}
                              </Link> 
                              {(user?.userType || user?.role) === 'mentee' ? (
                                 <span className="font-black text-gray-800 text-sm ml-1 px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200">
                                    {otherPerson?.role || 'Mentor'}
                                 </span>
                              ) : ''}
                           </p>
                           {booking.topic && (
                              <div className="mt-3 inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide shadow-sm">
                                 <span className="mr-1.5 opacity-70">Topic:</span> {booking.topic}
                              </div>
                           )}
                           
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
                              {(user?.userType || user?.role) === 'mentor' && (
                                 <button className="btn-secondary py-2 px-4 text-sm bg-white border border-[#b22222] text-[#b22222] hover:bg-red-50">Reschedule</button>
                              )}
                              
                              {booking.status === 'accepted' && isCallActive(booking.date, booking.startTime) ? (
                                <Link to={booking.meetingLink || `/call/${booking.meetingId}`} className="btn-primary py-2 px-6 text-sm bg-[#555a64] hover:bg-[#3f434a] text-white rounded-lg flex items-center justify-center font-semibold">Join Call</Link>
                              ) : (
                                <span className="text-gray-500 text-sm font-semibold">{booking.status === 'accepted' ? 'Call starts soon' : `Status: ${booking.status}`}</span>
                              )}
                              
                              <button 
                                 onClick={() => handleCompleteSession(booking.id)}
                                 className="py-2 px-4 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
                              >
                                {((user?.userType === 'mentor' && booking.mentorConfirmed) || (user?.userType === 'mentee' && booking.menteeConfirmed)) ? 'Completion Pending' : 'Mark as Completed'}
                              </button>
                           </>
                        )}
                        
                        {booking.status === 'completed' && (
                           <>
                             {user?.userType === 'mentee' && (
                                !booking.review ? (
                                   <button onClick={() => { setSelectedBooking(booking); setIsReviewOpen(true); }} className="py-2 px-4 text-sm border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors font-semibold">
                                     Leave Review
                                   </button>
                                ) : (
                                   <span className="py-2 px-4 text-sm font-semibold text-green-600 bg-green-50 rounded-lg border border-green-200">✅ Review Submitted</span>
                                )
                             )}
                             {user?.userType === 'mentor' && (
                                !booking.commendation ? (
                                   <button onClick={() => { setSelectedBooking(booking); setIsCommendOpen(true); }} className="py-2 px-4 text-sm border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors font-semibold">
                                     Leave Commendation
                                   </button>
                                ) : (
                                   <span className="py-2 px-4 text-sm font-semibold text-green-600 bg-green-50 rounded-lg border border-green-200">✅ Commendation Sent</span>
                                )
                             )}
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
      
      {/* Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
            <form onSubmit={submitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating ({rating}/5)</label>
                <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                      <button
                         key={star}
                         type="button"
                         onClick={() => setRating(star)}
                         onMouseEnter={() => setHoverRating(star)}
                         onMouseLeave={() => setHoverRating(0)}
                         className={`transition-all duration-200 focus:outline-none ${
                            star <= (hoverRating || rating) ? 'text-yellow-400 scale-110' : 'text-gray-300'
                         }`}
                      >
                         <Star size={32} className={`fill-current`} />
                      </button>
                   ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Comment</label>
                <textarea rows="4" value={commentText} onChange={(e) => setCommentText(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="How was your session?"></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsReviewOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors">{submitting ? 'Submitting...' : 'Submit Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commendation Modal */}
      {isCommendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Commend Mentee</h2>
            <form onSubmit={submitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating ({rating}/5) - Optional</label>
                <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                      <button
                         key={star}
                         type="button"
                         onClick={() => setRating(star)}
                         onMouseEnter={() => setHoverRating(star)}
                         onMouseLeave={() => setHoverRating(0)}
                         className={`transition-all duration-200 focus:outline-none ${
                            star <= (hoverRating || rating) ? 'text-yellow-400 scale-110' : 'text-gray-300'
                         }`}
                      >
                         <Star size={32} className={`fill-current`} />
                      </button>
                   ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Commendation</label>
                <textarea rows="4" value={commentText} onChange={(e) => setCommentText(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Share something positive about this session..."></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsCommendOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors">{submitting ? 'Submitting...' : 'Submit Commendation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bookings;
