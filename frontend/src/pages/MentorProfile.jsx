import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, X, Linkedin, MessageSquare, Heart, MoreHorizontal, Briefcase, GraduationCap, Calendar, Clock, ChevronLeft, ChevronRight, DollarSign, Send, Users } from 'lucide-react';
import { mentorService, bookingService, connectionService, messageRequestService } from '../api/services';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import PaystackPop from '@paystack/inline-js';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); // 0: closed, 1: date, 2: time, 3: confirm
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [showAllExperience, setShowAllExperience] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await mentorService.getMentorById(id);
        let mentorData = null;
        if (profileRes.status === 200 || (profileRes.data && profileRes.data.status === 'success')) {
           mentorData = profileRes.data.data;
        }

        let slots = [];
        // Use mentorData.user_id to fetch availability since availability is tied to user_id
        if (mentorData && mentorData.user_id) {
           try {
              const availRes = await bookingService.getAvailability(mentorData.user_id);
              if (availRes.status === 200 && availRes.data?.data) {
                 slots = availRes.data.data;
              }
           } catch(e) {
              console.log("No availability found or error fetching.");
           }
        }

        if (mentorData) {
           setMentor({ ...mentorData, availability: slots });
           
           // Initialize first available date if slots exist
           if (slots.length > 0) {
              const uniqueDates = [...new Set(slots.map(s => s.date))].sort();
              setSelectedDateStr(uniqueDates[0]);
           }
        }
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Robust safe array getter for frontend
  const getArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try { 
           const parsed = JSON.parse(val); 
           if (typeof parsed === 'string') {
               try {
                  const dp = JSON.parse(parsed);
                  if (Array.isArray(dp)) return dp;
               } catch(e) {}
               return parsed.split(',').map(s=>s.trim()).filter(Boolean);
           }
           if (Array.isArray(parsed)) return parsed;
           return [parsed];
        } catch(e) { 
           return val.split(',').map(s=>s.trim()).filter(Boolean); 
        }
    }
    return [];
  };

  const handleBookSession = async () => {
     // Strict topic capture: 
     const isFlexible = selectedSlot?.session_type === 'topic' || selectedSlot?.title === 'Selectable Topic';
     const finalTopic = isFlexible 
         ? bookingTopic 
         : (selectedSlot?.session_title || selectedSlot?.title || 'Mentorship Session');

     if (isFlexible && (!finalTopic || finalTopic.trim() === '')) {
         addToast("Please select a topic before continuing.", "error");
         return;
     }

     if (selectedSlot.price > 0) {
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: 'pk_test_91f1bda114b1c495c81c3e08494fbac7573d3f8a',
            email: user?.email || 'test@example.com',
            amount: selectedSlot.price * 100, // convert NGN to kobo
            currency: 'NGN',
            reference: `mentx_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`,
            onSuccess: async (transaction) => {
                setIsProcessingPayment(true);
                try {
                    await bookingService.createBooking(mentor.user_id, {
                        date: selectedSlot.date,
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime,
                        topic: finalTopic,
                        goals: bookingNotes,
                        reference: transaction.reference
                    });
                    addToast("Payment successful! Session booked.", "success");
                    setBookingStep(0);
                    navigate('/mentee/bookings');
                } catch (err) {
                    console.error("Booking failed post-payment", err);
                    addToast(err.response?.data?.message || "Failed to confirm booking on our end.", "error");
                } finally {
                    setIsProcessingPayment(false);
                }
            },
            onCancel: () => {
                addToast("Payment was canceled.", "error");
            }
        });
     } else {
        setIsProcessingPayment(true);
        try {
           await bookingService.createBooking(mentor.user_id, {
               date: selectedSlot.date,
               startTime: selectedSlot.startTime,
               endTime: selectedSlot.endTime,
               topic: finalTopic,
               goals: bookingNotes
           });
           addToast("Session booked successfully!", "success");
           setBookingStep(0);
           navigate('/mentee/bookings');
        } catch (err) {
           console.error("Booking failed", err);
           addToast(err.response?.data?.message || "Booking failed", "error");
        } finally {
           setIsProcessingPayment(false);
        }
     }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading mentor profile...</div>;
  if (!mentor) return <div className="p-8 text-center text-red-500">Mentor not found</div>;

  const tabs = [
     { id: 'Overview', label: 'Overview' },
     { id: 'Reviews', label: `Reviews (${mentor.reviews ? mentor.reviews.length : 0})` },
     { id: 'Achievements', label: 'Achievements' },
     { id: 'GroupSessions', label: `Group Sessions (${mentor.groupSessions ? mentor.groupSessions.length : 0})` }
  ];

  const generateDatesArray = () => {
     const dates = [];
     const today = new Date();
     today.setHours(0,0,0,0);
     for (let i = 1; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
     }
     return dates;
  };
  
  const displayDates = generateDatesArray();

  const getDateStatus = (dateObj) => {
     if (!dateObj || !mentor?.availability) return { hasSlots: false, isPast: true };
     
     const year = dateObj.getFullYear();
     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
     const day = String(dateObj.getDate()).padStart(2, '0');
     const dateString = `${year}-${month}-${day}`;
     
     const hasSlots = mentor.availability.some(s => s.date === dateString);
     
     const today = new Date();
     const todayYear = today.getFullYear();
     const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
     const todayDay = String(today.getDate()).padStart(2, '0');
     const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
     
     const isToday = todayString === dateString;
     const isPast = isToday || dateObj < new Date(new Date().setHours(0, 0, 0, 0));
     
     return { dateString, hasSlots, isToday, isPast };
  };

  const getAvailableSlotsForDate = (dateStr) => {
     return mentor.availability.filter(slot => slot.date === dateStr);
  };

  // Logic for the full month calendar
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  const generateFullCalendarDays = () => {
     const year = currentMonth.getFullYear();
     const month = currentMonth.getMonth();
     const daysInMonth = getDaysInMonth(month, year);
     const firstDay = getFirstDayOfMonth(month, year);
     const days = [];
     for (let i = 0; i < firstDay; i++) {
        days.push(null);
     }
     for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i)); 
     }
     return days;
  };

  const bioText = mentor.bio || 'This mentor has not provided a bio yet.';
  const shortBioLength = 250;
  const isBioLong = bioText.length > shortBioLength;
  const displayBio = isBioExpanded ? bioText : bioText.slice(0, shortBioLength);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
         
         {/* Hero / Cover Photo Banner */}
       <div className="h-48 md:h-64 w-full bg-[#2e5d32] rounded-none md:rounded-b-3xl relative overflow-hidden shadow-sm">
          <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200" alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
       </div>

       {/* Profile Header Block */}
       <div className="px-4 md:px-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
             {/* Overlapping Avatar */}
             <div className="-mt-16 sm:-mt-20 relative">
                <div className="h-32 w-32 sm:h-44 sm:w-44 rounded-full border-[6px] border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                   {mentor.picture && mentor.picture !== "http://localhost:5000/uploads/default.png" ? (
                     <img src={mentor.picture} alt={mentor.name} className="h-full w-full object-cover" />
                   ) : (
                     <span className="text-5xl font-bold text-primary bg-primary/10 w-full h-full flex items-center justify-center uppercase">
                        {mentor.name?.charAt(0) || 'M'}
                     </span>
                   )}
                </div>
                {/* Status Indicator overlapping avatar */}
                <div className={`absolute bottom-3 right-3 h-6 w-6 rounded-full border-4 border-white ${mentor.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
             </div>

             <div className="text-center sm:text-left pb-2 flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                   <div className="flex flex-col sm:flex-row items-center gap-2">
                      <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{mentor.name}</h1>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase">{mentor.countryCode}</span>
                         {mentor.isOnline && <span className="flex items-center text-[10px] font-bold text-green-600 uppercase tracking-widest"><span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" /> Online Now</span>}
                      </div>
                   </div>
                </div>
                
                <p className="text-sm font-bold text-primary mt-2 flex items-center gap-2">
                   {mentor.occupation || mentor.role || 'Professional Mentor'}
                </p>
             </div>

             <div className="flex items-center justify-center sm:justify-end gap-3 pb-4 w-full md:w-auto shrink-0">
                <button 
                  onClick={() => setIsMessageModalOpen(true)}
                  className="bg-primary hover:bg-primary-dark text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 flex items-center justify-center whitespace-nowrap"
                >
                   <MessageSquare size={18} className="mr-2" /> Request to Message
                </button>
                <button className="h-12 w-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-md transition-all">
                   <Heart size={20} />
                </button>
                <button className="h-12 w-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 shadow-md transition-all">
                   <MoreHorizontal size={20} />
                </button>
             </div>
          </div>
       </div>

       {/* Tabs Menu */}
       <div className="border-b border-gray-200 px-4 sm:px-8 mt-4 flex overflow-x-auto scrollbar-hide bg-white sticky top-0 z-30">
          {tabs.map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-5 px-6 font-bold text-sm border-b-2 transition-all ${
                   activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
             >
                {tab.label}
             </button>
          ))}
       </div>

       {/* Tab Content Area */}
       <div className="px-4 sm:px-8 pt-8 pb-20 lg:pb-8">
          {activeTab === 'Overview' && (
             <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-10">
                
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                   
                   {/* Bio */}
                   <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">About Me</h3>
                      <div className="text-gray-700 leading-relaxed text-base">
                         <p>
                            {displayBio}
                            {!isBioExpanded && isBioLong && <span>...</span>}
                         </p>
                         {isBioLong && (
                            <button 
                               className="text-primary font-bold mt-3 hover:underline flex items-center gap-1"
                               onClick={() => setIsBioExpanded(!isBioExpanded)}
                            >
                               {isBioExpanded ? 'Read less' : 'Read more'}
                            </button>
                         )}
                         {mentor.linkedinUrl && (
                            <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all font-bold text-sm">
                               <Linkedin size={18} /> Connect on LinkedIn
                            </a>
                         )}
                      </div>
                   </div>

                   {/* Tags Block */}
                   <div className="border border-gray-100 rounded-2xl p-8 bg-white shadow-sm space-y-8">
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Core Expertise</h4>
                        <div className="flex flex-wrap gap-2 text-sm">
                           {getArray(mentor.expertise).length > 0 ? getArray(mentor.expertise).map((exp, i) => (
                              <span key={i} className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-100 shadow-sm">
                                 {exp}
                              </span>
                           )) : <span className="text-sm text-gray-400">None added</span>}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Disciplines</h4>
                        <div className="flex flex-wrap gap-2">
                           {getArray(mentor.discipline).length > 0 ? getArray(mentor.discipline).map((disc, i) => (
                              <span key={i} className="px-4 py-2 bg-primary/5 text-primary text-sm font-bold rounded-xl border border-primary/10">
                                 {disc}
                              </span>
                           )) : <span className="text-sm text-gray-400">None added</span>}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Industries</h4>
                        <div className="flex flex-wrap gap-2">
                           {getArray(mentor.industries).length > 0 ? getArray(mentor.industries).map((ind, i) => (
                              <span key={i} className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-bold rounded-xl border border-purple-100 shadow-sm">
                                 {ind}
                              </span>
                           )) : <span className="text-sm text-gray-400">None added</span>}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Fluent In</h4>
                        <div className="flex flex-wrap gap-2">
                           {getArray(mentor.fluentIn).length > 0 ? getArray(mentor.fluentIn).map((lang, i) => (
                              <span key={i} className="px-4 py-2 bg-green-50 text-green-700 font-bold text-sm rounded-xl border border-green-100 shadow-sm">
                                 {lang}
                              </span>
                           )) : <span className="text-sm text-gray-400">None added</span>}
                        </div>
                      </div>
                   </div>

                   {/* Experience Box */}
                   <div className="border border-gray-100 rounded-2xl p-8 bg-white shadow-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">Experience</h3>
                      <div className="space-y-6">
                         {getArray(mentor.experience).length > 0 ? (
                            (showAllExperience ? getArray(mentor.experience) : getArray(mentor.experience).slice(0, 2)).map((exp, i) => (
                               <div key={i} className="flex flex-col sm:flex-row gap-4 group">
                                  <div className="h-12 w-12 shrink-0 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                                     <Briefcase size={22} className="text-primary" />
                                  </div>
                                  <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <div>
                                           <h4 className="font-bold text-gray-900 text-lg leading-tight">{typeof exp === 'object' ? exp.title || exp.company : exp}</h4>
                                           <p className="text-sm font-bold text-primary mt-1">{typeof exp === 'object' ? exp.company : ''}</p>
                                        </div>
                                        {typeof exp === 'object' && exp.startDate && (
                                           <p className="text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg shrink-0 self-start">
                                              {exp.startDate} - {exp.endDate || 'Present'}
                                           </p>
                                        )}
                                     </div>
                                     {typeof exp === 'object' && exp.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{exp.description}</p>}
                                  </div>
                               </div>
                            ))
                         ) : (
                            <p className="text-sm text-gray-400 italic">No experience listed.</p>
                         )}
                         {getArray(mentor.experience).length > 2 && (
                            <button 
                               onClick={() => setShowAllExperience(!showAllExperience)}
                               className="w-full py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors mt-4"
                            >
                               {showAllExperience ? 'Show Less' : `View All ${getArray(mentor.experience).length} Experiences`}
                            </button>
                         )}
                      </div>
                   </div>

                   {/* Education Box */}
                   <div className="border border-gray-100 rounded-2xl p-8 bg-white shadow-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">Education</h3>
                      <div className="space-y-6">
                         {getArray(mentor.education).length > 0 ? (
                            (showAllEducation ? getArray(mentor.education) : getArray(mentor.education).slice(0, 2)).map((edu, i) => (
                               <div key={i} className="flex flex-col sm:flex-row gap-4 group">
                                  <div className="h-12 w-12 shrink-0 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                                     <GraduationCap size={22} className="text-primary" />
                                  </div>
                                  <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <div>
                                           <h4 className="font-bold text-gray-900 text-lg leading-tight">{typeof edu === 'object' ? edu.field || edu.institution : edu}</h4>
                                           <p className="text-sm font-bold text-primary mt-1">{typeof edu === 'object' ? edu.institution : ''}</p>
                                        </div>
                                        {typeof edu === 'object' && edu.startDate && (
                                           <p className="text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg shrink-0 self-start">
                                              {edu.startDate} - {edu.endDate || 'Present'}
                                           </p>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            ))
                         ) : (
                            <p className="text-sm text-gray-400 italic">No education details listed.</p>
                         )}
                         {getArray(mentor.education).length > 2 && (
                            <button 
                               onClick={() => setShowAllEducation(!showAllEducation)}
                               className="w-full py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors mt-4"
                            >
                               {showAllEducation ? 'Show Less' : `View All ${getArray(mentor.education).length} Education Details`}
                            </button>
                         )}
                      </div>
                   </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                   
                   {/* Community Statistics Widget */}
                   <div className="bg-gradient-to-br from-[#b22222] to-[#1a3a5a] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                      
                      <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                         <div className="h-2 w-2 bg-primary rounded-full" /> Mentor Impact
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-y-10">
                         <div>
                            <p className="text-3xl font-black mb-1">{mentor.minutesTrained || 0}+</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Minutes Trained</p>
                         </div>
                         <div>
                            <p className="text-3xl font-black mb-1 text-primary">{mentor.impact?.sessionsCompleted || mentor.sessionsCompleted || 0}</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Sessions Completed</p>
                         </div>
                         <div>
                            <p className="text-3xl font-black mb-1 text-green-400">{mentor.attendanceRate || '0%'}</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Attendance Rate</p>
                         </div>
                         <div>
                            <p className="text-3xl font-black mb-1 text-yellow-400">{mentor.rating || '0.0'}</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Expert Rating</p>
                         </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-white/10">
                         <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">Top Impact Areas</h4>
                         <div className="flex flex-wrap gap-2">
                            {getArray(mentor.expertise).length > 0 ? getArray(mentor.expertise).slice(0, 4).map((exp, i) => (
                               <div key={i} className="bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-bold py-2 px-3 rounded-xl border border-white/10">
                                  {exp}
                               </div>
                            )) : <div className="text-xs text-blue-300">New Expert</div>}
                         </div>
                      </div>
                   </div>

                   {/* Availability Preview Widget */}
                   <div className="border border-gray-100 rounded-3xl p-6 lg:p-8 bg-white shadow-xl relative mt-8 lg:mt-0">
                      <div className="mb-8">
                         <div className="flex justify-between items-center mb-2">
                           <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Availability</h3>
                           <button onClick={() => setBookingStep(1)} className="text-sm font-bold text-primary hover:underline">Full Calendar</button>
                         </div>
                         <p className="text-sm font-medium text-gray-500">Pick a time that works for you.</p>
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide py-1">
                        {displayDates.slice(0, 5).map((dateObj, i) => {
                           const { dateString, hasSlots, isPast } = getDateStatus(dateObj);
                           const isSelected = selectedDateStr === dateString;
                           
                           return (
                              <button 
                                 key={i} 
                                 disabled={isPast}
                                 className={`shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                                    isPast ? 'bg-gray-50 text-gray-400 border-gray-50 opacity-40' :
                                    isSelected ? 'bg-primary text-white border-primary shadow-lg scale-105' : 
                                    hasSlots ? 'bg-white text-gray-900 border-gray-200 hover:border-primary/50 hover:bg-primary/5' : 'bg-white text-gray-300 border-gray-100'
                                 }`}
                                 onClick={() => setSelectedDateStr(dateString)}
                              >
                                 <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                 <span className="text-lg font-black mt-1">{dateObj.getDate()}</span>
                                 {hasSlots && !isPast && !isSelected && <div className="h-1 w-1 bg-primary rounded-full mt-1" />}
                              </button>
                           );
                        })}
                      </div>

                      <div className="mt-8 space-y-3">
                         {selectedDateStr && getAvailableSlotsForDate(selectedDateStr).length > 0 ? (
                            getAvailableSlotsForDate(selectedDateStr).slice(0, 3).map(slot => (
                               <button 
                                  key={slot.id}
                                  onClick={() => setSelectedSlot({ ...slot, date: selectedDateStr })}
                                  className={`w-full p-5 border rounded-2xl transition-all duration-300 flex items-center justify-between group shadow-sm hover:shadow-md ${
                                     selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr
                                        ? 'bg-[#b22222]/5 border-[#b22222]'
                                        : 'bg-white border-gray-200 hover:border-[#b22222]/30'
                                  }`}
                               >
                                  <div className="flex items-center gap-4">
                                     <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${selectedSlot?.id === slot.id ? 'bg-[#b22222] text-white shadow-md' : 'bg-gray-50 text-gray-500 group-hover:bg-[#b22222]/10 group-hover:text-[#b22222]'}`}>
                                        <Clock size={20} />
                                     </div>
                                     <div className="flex flex-col items-start gap-1">
                                        <span className={`text-base font-black tracking-tight ${selectedSlot?.id === slot.id ? 'text-[#b22222]' : 'text-gray-900 group-hover:text-[#b22222]'}`}>{slot.startTime}</span>
                                        {slot.price > 0 ? (
                                           <span className="text-xs font-bold text-gray-500 uppercase px-2 py-0.5 bg-gray-100 rounded-lg group-hover:bg-[#b22222]/10 group-hover:text-[#b22222] transition-colors">₦{slot.price.toLocaleString()}</span>
                                        ) : (
                                           <span className="text-xs font-bold text-green-600 uppercase px-2 py-0.5 bg-green-50 rounded-lg">Free</span>
                                        )}
                                     </div>
                                  </div>
                                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedSlot?.id === slot.id ? 'border-[#b22222] bg-[#b22222] text-white' : 'border-gray-200 text-transparent group-hover:border-[#b22222]/30'}`}>
                                     <CheckCircle size={16} />
                                  </div>
                               </button>
                            ))
                         ) : (
                            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                               <p className="text-sm font-bold text-gray-400">No time available on this date</p>
                            </div>
                         )}
                         {selectedDateStr && getAvailableSlotsForDate(selectedDateStr).length > 3 && (
                            <button onClick={() => setBookingStep(2)} className="w-full text-center text-xs font-bold text-gray-400 hover:text-primary transition-colors py-2">
                               +{getAvailableSlotsForDate(selectedDateStr).length - 3} more slots
                            </button>
                         )}
                      </div>

                      <button 
                         disabled={!selectedSlot || selectedSlot.date !== selectedDateStr}
                         className={`w-full mt-10 py-5 rounded-2xl text-lg font-black transition-all text-white shadow-xl flex items-center justify-center ${
                            !selectedSlot || selectedSlot.date !== selectedDateStr
                               ? 'bg-gray-300 transform-none'
                               : 'bg-primary hover:bg-primary-dark transform hover:-translate-y-1 active:scale-95 shadow-primary/30'
                         }`}
                         onClick={() => setBookingStep(3)}
                      >
                         Confirm Booking <ChevronRight size={20} className="ml-2" />
                      </button>

                      {/* Message Request Option if not interested in current times */}
                      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                         <p className="text-sm font-medium text-gray-500 mb-3">Not seeing a suitable time?</p>
                         <button 
                           onClick={() => setIsMessageModalOpen(true)}
                           className="text-primary font-bold hover:underline flex items-center justify-center mx-auto gap-2"
                         >
                            <MessageSquare size={16} /> Send a Message Request
                         </button>
                      </div>
                   </div>
                </div>

             </div>
          )}

          {activeTab === 'Reviews' && (
             <div className="bg-white border text-gray-500 border-gray-100 rounded-3xl shadow-sm p-8 sm:p-12 space-y-12">
                <div className="flex flex-col lg:flex-row gap-12">
                   <div className="flex-1 space-y-8">
                      <div>
                         <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
                            <span>Communication Skills</span>
                            <span className="text-primary">99%</span>
                         </div>
                         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000" style={{ width: '99%' }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
                            <span>Problem Solving Depth</span>
                            <span className="text-primary">99%</span>
                         </div>
                         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000" style={{ width: '99%' }}></div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex-1 space-y-8">
                      <div>
                         <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
                            <span>Motivational Impact</span>
                            <span className="text-primary">97%</span>
                         </div>
                         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000" style={{ width: '97%' }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
                            <span>Industry Insight</span>
                            <span className="text-primary">100%</span>
                         </div>
                         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-12 border-t border-gray-100">
                   <h4 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Mentee Success Stories</h4>
                   
                   {mentor.reviews && mentor.reviews.length > 0 ? (
                      <div className="space-y-6">
                         {mentor.reviews.map((rev) => {
                            const menteeDetails = rev.mentee?.user || {};
                            // Map rating to stars
                            const renderStars = () => {
                               const stars = [];
                               for(let i=0; i<5; i++){
                                  stars.push(<Star key={i} className={`h-5 w-5 ${i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />);
                               }
                               return stars;
                            };
                            return (
                               <div key={rev.id} className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                                  
                                  <div className="flex mb-4 gap-1">
                                    {renderStars()}
                                  </div>
                                  
                                  <p className="text-lg text-gray-800 leading-relaxed font-medium mb-10 italic">
                                     "{rev.comment}"
                                  </p>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                     <div className="flex items-center gap-4">
                                        <div 
                                           onClick={() => navigate(`/mentor/mentee/${rev.mentee?.id}`)} 
                                           className="h-14 w-14 cursor-pointer rounded-full border-2 border-white overflow-hidden shrink-0 shadow-lg block hover:opacity-80 transition-opacity"
                                        >
                                           <img src={menteeDetails.picture || "http://localhost:5000/uploads/default.png"} alt="Mentee" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                           <div 
                                              onClick={() => navigate(`/mentor/mentee/${rev.mentee?.id}`)} 
                                              className="text-base cursor-pointer font-black text-gray-900 hover:text-primary transition-colors block"
                                           >
                                              {menteeDetails.name || 'Anonymous Mentee'}
                                           </div>
                                           <p className="text-sm font-semibold text-primary">{new Date(rev.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                     </div>
                                     <div className="bg-white px-6 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                                        <div className="h-3 w-3 bg-green-500 rounded-full" />
                                        <span className="text-sm font-bold text-gray-900">Verified Session</span>
                                     </div>
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                         <Star className="mx-auto text-yellow-300 mb-4" size={48} />
                         <p className="text-gray-500 font-bold">No reviews found yet.</p>
                      </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'Achievements' && (
             <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <div className="h-12 w-12 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center">
                      <Star size={24} className="fill-yellow-500" />
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight">Credentials & Recognition</h3>
                </div>

                {mentor.achievements && mentor.achievements.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {mentor.achievements.map((ach) => (
                         <div key={ach.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex gap-4 hover:border-yellow-400 hover:shadow-lg transition-all group flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                            <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform mb-2 sm:mb-0">
                               {ach.icon || '🏆'}
                            </div>
                            <div className="flex flex-col justify-center">
                               <h4 className="font-bold text-gray-900 text-lg leading-tight">{ach.title}</h4>
                               <p className="text-sm text-gray-500 mt-1">{ach.description}</p>
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-3">Earned {new Date(ach.earned_at).toLocaleDateString()}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Star size={24} className="fill-blue-500 opacity-50" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">No achievements yet</h4>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">This mentor has not unlocked any credentials. Sessions completed on the platform contribute to milestones.</p>
                   </div>
                )}
             </div>
          )}

          {activeTab === 'GroupSessions' && (
             <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
                <div className="h-24 w-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <Users size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Interactive Workshops</h3>
                <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed font-medium">Upcoming group mentorship circles, masterclasses, and cohort-based learning events hosted by {mentor.name}.</p>
             </div>
          )}
       </div>

       {/* Redesigned 3-Step Booking Modal */}
       <AnimatePresence>
          {bookingStep > 0 && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-hidden">
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-black/60 backdrop-blur-md"
                   onClick={() => setBookingStep(0)}
                />
                
                <motion.div 
                   initial={{ scale: 0.9, opacity: 0, y: 50 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 0.9, opacity: 0, y: 50 }}
                   className="bg-white rounded-[24px] shadow-2xl relative z-10 w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row-reverse"
                >
                   {/* Close Button */}
                   <button 
                      onClick={() => setBookingStep(0)} 
                      className="absolute top-6 right-6 z-20 h-10 w-10 bg-gray-50 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-all border border-gray-100 shadow-sm"
                   >
                      <X size={20} strokeWidth={3} />
                   </button>

                   {/* Modal Container: Flex Row (Main content left, Profile/Info Right) */}
                   <div className="hidden md:block p-8 md:w-5/12 bg-gray-50/30 overflow-y-auto relative">
                      <div className="h-20 w-20 rounded-2xl bg-white shadow-md mb-6 overflow-hidden flex items-center justify-center font-bold text-2xl text-primary uppercase border border-white">
                         {mentor.picture && mentor.picture !== "http://localhost:5000/uploads/default.png" ? (
                             <img src={mentor.picture} alt={mentor.name} className="h-full w-full object-cover" />
                         ) : mentor.name?.charAt(0)}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">Book Mentorship</h2>
                      <p className="text-sm font-bold text-primary mb-10">{mentor.name} • {mentor.role || 'Expert Mentor'}</p>
                      
                      <div className="space-y-8">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-500">
                               <span className="text-[#b22222] font-extrabold text-xl">₦</span>
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rate</p>
                               <p className="text-lg font-black text-gray-900">
                                  {selectedSlot?.price > 0 ? `₦${selectedSlot.price.toLocaleString()}` : 'Free Session'}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-500">
                               <Clock size={20} />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                               <p className="text-lg font-black text-gray-900">{selectedSlot?.custom_duration || mentor?.default_duration || 30} Minutes</p>
                            </div>
                         </div>
                      </div>
                      
                      {selectedSlot && (
                        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-3">
                           <div className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2">
                              <Calendar size={14} /> {new Date(selectedSlot.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                           </div>
                           <div className="bg-white text-primary text-xs font-bold px-4 py-2 rounded-xl border border-primary/20 shadow-sm flex items-center gap-2">
                              <Clock size={14} /> {selectedSlot.startTime}
                           </div>
                        </div>
                      )}
                   </div>

                   {/* Main Content Area (Now on the Left) */}
                   <div className="p-6 md:p-10 md:w-7/12 flex flex-col bg-white overflow-y-auto relative border-r border-gray-100">
                      
                      {bookingStep === 1 && (
                         <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-between items-center mb-10">
                               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Select a date</h3>
                               <div className="flex gap-3">
                                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="h-10 w-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 transition-colors"><ChevronLeft size={20} /></button>
                                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="h-10 w-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 transition-colors"><ChevronRight size={20} /></button>
                               </div>
                            </div>
                            
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">Local Time (Africa/Lagos)</p>

                            <div className="grid grid-cols-7 gap-2 text-center mb-4 text-[13px] font-black text-gray-400">
                               {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
                            </div>
                            
                            <div className="grid grid-cols-7 gap-3 text-center mb-8">
                                {generateFullCalendarDays().map((dateObj, i) => {
                                  if (!dateObj) return <div key={i} className="h-12 w-12" />;
                                  const { dateString, hasSlots, isPast } = getDateStatus(dateObj);
                                  const isSelected = selectedDateStr === dateString;
                                  
                                  return (
                                     <button
                                        key={i}
                                        disabled={isPast}
                                        onClick={() => setSelectedDateStr(dateString)}
                                        className={`h-12 w-12 mx-auto rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                                           isPast ? 'text-gray-200 cursor-not-allowed' :
                                           isSelected ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' :
                                           hasSlots ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer' :
                                           'text-gray-900 hover:bg-gray-100 cursor-pointer'
                                        }`}
                                     >
                                        {dateObj.getDate()}
                                     </button>
                                  );
                               })}
                            </div>
                            
                            <button 
                               disabled={!selectedDateStr}
                               onClick={() => setBookingStep(2)}
                               className={`mt-auto w-full py-5 rounded-2xl text-lg font-black transition-all text-white shadow-xl ${
                                  !selectedDateStr ? 'bg-gray-200 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-primary/30'
                               }`}
                            >
                               Continue to Time
                            </button>
                         </div>
                      )}

                      {bookingStep === 2 && (
                         <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-10">Available Time Slots</h3>
                            
                            <div className="flex-1">
                               <div className="grid grid-cols-3 gap-4">
                                  {selectedDateStr && getAvailableSlotsForDate(selectedDateStr).length > 0 ? (
                                     getAvailableSlotsForDate(selectedDateStr).map(slot => (
                                        <button 
                                           key={slot.id}
                                           onClick={() => setSelectedSlot({ ...slot, date: selectedDateStr })}
                                           className={`py-4 px-2 border-2 rounded-2xl text-lg font-black transition-all flex flex-col items-center justify-center shadow-sm hover:shadow-md ${
                                              selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr
                                                 ? 'bg-[#b22222] text-white border-[#b22222] shadow-xl shadow-[#b22222]/20 scale-105'
                                                 : 'bg-white text-gray-900 border-gray-100 hover:border-[#b22222]/50 hover:bg-[#b22222]/5'
                                           }`}
                                        >
                                           {slot.startTime}
                                           {slot.price > 0 ? (
                                               <span className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded-lg ${selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                   ₦{slot.price.toLocaleString()}
                                               </span>
                                           ) : (
                                               <span className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded-lg ${selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'}`}>
                                                   Free
                                               </span>
                                           )}
                                        </button>
                                     ))
                                  ) : (
                                     <div className="col-span-full py-10 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-3xl">
                                        No specific time slots defined for this day.
                                     </div>
                                  )}
                               </div>
                            </div>
                            
                            <div className="mt-8 flex gap-4">
                               <button onClick={() => setBookingStep(1)} className="flex-1 py-5 rounded-2xl text-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors">Back</button>
                               <button 
                                  disabled={!selectedSlot || selectedSlot.date !== selectedDateStr}
                                  onClick={() => setBookingStep(3)}
                                  className={`flex-[2] py-5 rounded-2xl text-lg font-black transition-all text-white shadow-xl ${
                                     !selectedSlot || selectedSlot.date !== selectedDateStr ? 'bg-gray-200 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-primary/30'
                                  }`}
                               >
                                  Continue
                               </button>
                            </div>
                         </div>
                      )}

                      {bookingStep === 3 && (
                         <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-10">Finalize Session</h3>
                            
                            <div className="flex-1 space-y-8">
                               <div>
                                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-widest">Session Name</label>
                                  <div className="relative">
                                     {(selectedSlot?.session_type === 'topic' || selectedSlot?.title === 'Selectable Topic') ? (
                                        <>
                                           <select 
                                              className="block w-full rounded-2xl border-gray-100 shadow-sm focus:border-primary focus:ring-primary text-sm border p-5 bg-gray-50 focus:bg-white text-gray-700 appearance-none font-bold transition-all"
                                              value={bookingTopic}
                                              onChange={(e) => setBookingTopic(e.target.value)}
                                           >
                                              <option value="">Select a topic</option>
                                              {getArray(mentor.topics).length > 0 ? (
                                                 getArray(mentor.topics).map((t, idx) => (
                                                    <option key={idx} value={t}>{t}</option>
                                                 ))
                                              ) : getArray(mentor.expertise).length > 0 ? (
                                                 getArray(mentor.expertise).map((t, idx) => (
                                                    <option key={idx} value={t}>{t}</option>
                                                 ))
                                              ) : (
                                                 <>
                                                    <option value="Career Advice">🚀 Career Advice & Growth</option>
                                                    <option value="Resume Review">📄 Resume / Portfolio Review</option>
                                                    <option value="Technical Interview Prep">💻 Technical Interview Prep</option>
                                                    <option value="Leadership & Management">👥 Leadership & Management</option>
                                                    <option value="Freelancing & Business">💰 Freelancing & Business</option>
                                                 </>
                                              )}
                                           </select>
                                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"><ChevronRight size={20} className="rotate-90" /></div>
                                        </>
                                     ) : (
                                        <div className="w-full rounded-2xl border border-gray-200 bg-gray-100 p-5 font-bold text-gray-700 flex items-center justify-between">
                                           <span>
                                              {selectedSlot?.session_title || selectedSlot?.title || 'Mentorship Session'}
                                           </span>
                                        </div>
                                     )}
                                  </div>
                               </div>

                               <div>
                                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-widest">
                                     Specific objectives
                                  </label>
                                  <textarea 
                                     rows={5} 
                                     className="block w-full mt-2 rounded-2xl border-gray-100 shadow-sm focus:border-primary focus:ring-primary text-sm border p-5 bg-gray-50 focus:bg-white font-bold resize-none transition-all" 
                                     placeholder="What do you hope to achieve? (e.g. 'I want feedback on my React portfolio...')"
                                     value={bookingNotes}
                                     onChange={(e) => setBookingNotes(e.target.value)}
                                  ></textarea>
                               </div>
                            </div>
                            
                            <div className="mt-8 flex gap-4">
                               <button onClick={() => setBookingStep(2)} className="flex-1 py-5 rounded-2xl text-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors">Back</button>
                               <button 
                                  onClick={handleBookSession}
                                  disabled={!bookingNotes.trim() || !selectedSlot || isProcessingPayment}
                                  className={`flex-[2] py-5 rounded-2xl text-lg font-black transition-all text-white shadow-xl ${
                                     !bookingNotes.trim() || !selectedSlot || isProcessingPayment ? 'bg-gray-200 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-primary/30'
                                  }`}
                               >
                                  {isProcessingPayment ? 'Processing...' : (selectedSlot?.price > 0 ? `Pay ₦${selectedSlot.price.toLocaleString()}` : 'Confirm Booking')}
                               </button>
                            </div>
                         </div>
                      )}

                   </div>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
      </div>

      {/* Message Request Modal */}
      <AnimatePresence>
         {isMessageModalOpen && (
             <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-hidden">
               <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.9 }}
                  className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[80vh] sm:max-h-[85vh] flex flex-col"
               >
                  <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 shrink-0">
                     <div className="pr-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Send Connection Request</h2>
                        <p className="text-xs sm:text-sm font-bold text-gray-400 mt-1 sm:mt-2">Briefly explain why you'd like to reach out.</p>
                     </div>
                     <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 bg-white rounded-full shadow-sm border border-gray-100 flex-shrink-0">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                     <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3 bg-primary/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
                           <MessageSquare className="text-primary flex-shrink-0" size={20} />
                           <p className="text-xs sm:text-sm font-bold text-gray-700">Connecting lets you chat anytime with {mentor.name}.</p>
                        </div>
                        <div>
                           <label className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">Introduce yourself</label>
                           <textarea
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder="Hi! I admire your work in Engineering and would love to ask a few questions about..."
                              rows={4}
                              className="w-full border border-gray-100 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-gray-700 transition-all resize-none shadow-inner text-sm"
                           ></textarea>
                        </div>
                     </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 shrink-0 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                     <button 
                        onClick={() => setIsMessageModalOpen(false)}
                        className="px-4 sm:px-8 py-2.5 sm:py-4 text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all"
                     >
                        Discard
                     </button>
                     <button 
                        disabled={!messageText.trim() || isSendingMessage}
                        onClick={async () => {
                           setIsSendingMessage(true);
                           try {
                               await messageRequestService.sendMessageRequest({ mentorId: id, initialMessage: messageText });
                               addToast("Connection request sent!", "success");
                               setIsMessageModalOpen(false);
                               setMessageText('');
                           } catch(err) {
                               addToast(err.response?.data?.message || "Failed to send request", "error");
                           } finally {
                               setIsSendingMessage(false);
                           }
                        }}
                        className={`px-5 sm:px-10 py-2.5 sm:py-4 text-xs sm:text-sm font-bold text-white rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center transition-all ${
                           !messageText.trim() || isSendingMessage ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-primary/30 transform hover:-translate-y-0.5'
                        }`}
                     >
                        {isSendingMessage ? (
                           <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                           <><Send size={16} className="mr-1.5 sm:mr-2" /> Send Request</>
                        )}
                     </button>
                  </div>
               </motion.div>
             </div>
         )}
      </AnimatePresence>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-[55] p-4 pb-safe flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Next Available</span>
             {(() => {
                let nextStr = 'Check Calendar';
                if (mentor?.availability?.length > 0) {
                    const futureSlots = mentor.availability.filter(s => new Date(s.date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0));
                    futureSlots.sort((a,b) => new Date(a.date) - new Date(b.date));
                    if (futureSlots.length > 0) {
                        const dt = new Date(futureSlots[0].date);
                        nextStr = `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${futureSlots[0].startTime}`;
                    }
                }
                return <span className="text-gray-900 font-black text-sm truncate max-w-[160px]">{nextStr}</span>;
             })()}
         </div>
         <button onClick={() => setBookingStep(1)} className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-2">
             <Calendar size={18} className="hidden sm:block" />
             Book Session
         </button>
      </div>

    </div>
  );
};

export default MentorProfile;
