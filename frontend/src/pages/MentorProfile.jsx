import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, X, Linkedin, MessageSquare, Heart, MoreHorizontal, Briefcase, GraduationCap, Calendar, Clock, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { mentorService, bookingService, connectionService } from '../api/services';
import { useToast } from '../context/ToastContext';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await mentorService.getMentorById(id);
        let mentorData = null;
        if (profileRes.status === 200) {
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
           return Array.isArray(parsed) ? parsed : [val];
        } catch(e) { 
           return [val]; 
        }
    }
    return [];
  };

  const handleBookSession = async () => {
     try {
        await bookingService.createBooking(mentor.user_id, {
            date: selectedSlot.date,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            topic: bookingTopic || 'Mentorship Session',
            goals: bookingNotes
        });
        addToast("Session booked successfully!", "success");
        setBookingStep(0);
        navigate('/mentee/bookings');
     } catch (err) {
        console.error("Booking failed", err);
        addToast(err.response?.data?.message || "Booking failed", "error");
     }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading mentor profile...</div>;
  if (!mentor) return <div className="p-8 text-center text-red-500">Mentor not found</div>;

  const tabs = [
     { id: 'Overview', label: 'Overview' },
     { id: 'Reviews', label: `Reviews ${mentor.reviews || 0}` },
     { id: 'Achievements', label: 'Achievements' },
     { id: 'GroupSessions', label: `Group Sessions ${mentor.groupSessions || 0}` }
  ];

  const generateDatesArray = () => {
     const dates = [];
     const today = new Date();
     today.setHours(0,0,0,0);
     for (let i = 0; i < 30; i++) {
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
     const isPast = !isToday && dateObj < new Date(new Date().setHours(0, 0, 0, 0));
     
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
       <div className="h-48 md:h-64 w-full bg-[#2e5d32] rounded-none md:rounded-b-2xl relative overflow-hidden shadow-sm">
          <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200" alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
       </div>

       {/* Profile Header Block */}
       <div className="px-4 md:px-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
             {/* Overlapping Avatar */}
             <div className="-mt-16 sm:-mt-20 relative">
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-[6px] border-white bg-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                   {mentor.picture && mentor.picture !== "http://localhost:5000/uploads/default.png" ? (
                     <img src={mentor.picture} alt={mentor.name} className="h-full w-full object-cover" />
                   ) : (
                     <span className="text-5xl font-bold text-primary bg-primary/10 w-full h-full flex items-center justify-center uppercase">
                        {mentor.name?.charAt(0) || 'M'}
                     </span>
                   )}
                </div>
             </div>

             <div className="text-center sm:text-left pb-2 flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                   <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mentor.name}</h1>
                      <span className="text-xs font-bold text-gray-500 uppercase">{mentor.countryCode}</span>
                   </div>
                   
                   {/* Glowing Available / Unavailable Bubble */}
                   <div className={`flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full text-white text-xs font-bold leading-tight text-center shadow-2xl transition-all ${
                      mentor.isOnline 
                         ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/50 border-2 border-white' 
                         : 'bg-gradient-to-br from-[#ff5e4d] to-[#ff3b28] shadow-red-500/50 border-2 border-white'
                   }`}>
                      {mentor.isOnline ? 'Available' : 'Unavailable'}
                   </div>
                </div>
                
                <p className="text-sm font-medium text-gray-600 mt-2 capitalize">
                   {getArray(mentor.expertise).length > 0 ? getArray(mentor.expertise).join(', ') : 'Professional Mentor'}
                </p>
             </div>

             <div className="flex items-center justify-center sm:justify-end gap-3 pb-4 w-full md:w-auto shrink-0">
                 <button onClick={() => setIsMessageModalOpen(true)} className="h-10 w-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer z-10" title="Message Request">
                    <MessageSquare size={18} />
                 </button>
                <button className="h-10 w-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors" title="Save Mentor">
                   <Heart size={18} />
                </button>
                <button className="h-10 w-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-sm transition-colors" title="More Options">
                   <MoreHorizontal size={18} />
                </button>
             </div>
          </div>
       </div>

       {/* Tabs Menu */}
       <div className="border-b border-gray-200 px-4 sm:px-8 flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-4 font-semibold text-sm border-b-2 transition-colors ${
                   activeTab === tab.id 
                      ? 'border-primary text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
             >
                {tab.label}
             </button>
          ))}
       </div>

       {/* Tab Content Area */}
       <div className="px-4 sm:px-8 pt-4">
          {activeTab === 'Overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                   
                   {/* Bio */}
                   <div className="text-gray-700 leading-relaxed text-sm format-text">
                      <p>
                         {displayBio}
                         {!isBioExpanded && isBioLong && <span>...</span>}
                      </p>
                      {isBioLong && (
                         <button 
                            className="text-red-600 font-semibold mt-1 hover:underline focus:outline-none"
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                         >
                            {isBioExpanded ? 'Read less' : 'Read more'}
                         </button>
                      )}
                      {mentor.linkedinUrl && (
                         <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center mt-4 bg-blue-50 text-blue-600 h-8 w-8 rounded-md hover:bg-blue-100 transition-colors">
                            <Linkedin size={16} />
                         </a>
                      )}
                   </div>

                   {/* Tags Block */}
                   <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] grid gap-6 grid-cols-1 sm:grid-cols-12 items-center">
                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Expertise:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {getArray(mentor.expertise).length > 0 ? getArray(mentor.expertise).map((exp, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                               {exp}
                            </span>
                         )) : <span className="text-sm text-gray-400">None added</span>}
                      </div>

                      <div className="col-span-full h-px bg-gray-100"></div>

                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Disciplines:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {getArray(mentor.discipline).length > 0 ? getArray(mentor.discipline).map((disc, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                               {disc}
                            </span>
                         )) : <span className="text-sm text-gray-400">None added</span>}
                      </div>

                      <div className="col-span-full h-px bg-gray-100"></div>

                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Fluent In:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {getArray(mentor.fluentIn).length > 0 ? getArray(mentor.fluentIn).map((lang, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                               {lang}
                            </span>
                         )) : <span className="text-sm text-gray-400">None added</span>}
                      </div>
                   </div>

                   {/* Experience Box */}
                   <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                      <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">Experience</h3>
                            <span className="bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                               {mentor.experience?.length || 0}
                            </span>
                         </div>
                         <button className="text-xs font-bold text-primary hover:underline">View All</button>
                      </div>
                      
                      <div className="space-y-6">
                         {getArray(mentor.experience).length > 0 ? getArray(mentor.experience).map((exp, i) => (
                            <div key={i} className="flex gap-4">
                               <div className="h-10 w-10 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Briefcase size={20} className="text-gray-500" />
                               </div>
                               <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                     <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{typeof exp === 'object' ? exp.title || exp.company : exp}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{typeof exp === 'object' ? exp.company : ''}</p>
                                     </div>
                                     <div className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {typeof exp === 'object' && exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Present'}` : 'Year not specified'}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )) : (
                            <p className="text-sm text-gray-500">No experience listed.</p>
                         )}
                      </div>
                   </div>

                   {/* Education Box */}
                   <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                      <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">Education</h3>
                            <span className="bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                               {mentor.education?.length || 0}
                            </span>
                         </div>
                         <button className="text-xs font-bold text-primary hover:underline">View All</button>
                      </div>
                      
                      <div className="space-y-6">
                         {getArray(mentor.education).length > 0 ? getArray(mentor.education).map((edu, i) => (
                            <div key={i} className="flex gap-4">
                               <div className="h-10 w-10 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <GraduationCap size={20} className="text-gray-500" />
                               </div>
                               <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                     <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{typeof edu === 'object' ? edu.degree || edu.institution : edu}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{typeof edu === 'object' ? edu.institution : ''}</p>
                                     </div>
                                     <div className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {typeof edu === 'object' && edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : 'Year not specified'}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )) : (
                            <p className="text-sm text-gray-500">No education listed.</p>
                         )}
                      </div>
                   </div>

                </div>

                {/* Right Column (Widgets) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                   
                   {/* Community Statistics Widget */}
                   <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] relative">
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="text-base font-bold text-gray-900">Community Statistics</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         
                         <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-red-100 text-primary flex items-center justify-center shrink-0">
                               <span className="text-sm">🚀</span>
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-900">{(mentor.sessions || 0) * 60} mins</p>
                               <p className="text-[10px] text-gray-500">Session Time</p>
                            </div>
                         </div>
                         
                         <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                               <Star size={14} className="fill-blue-500" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-900">{mentor.sessions || 0}</p>
                               <p className="text-[10px] text-gray-500">Sessions Completed</p>
                            </div>
                         </div>

                         <div className="flex items-start gap-3 mt-4">
                            <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                               <Calendar size={14} />
                            </div>
                            <div>
                               <div className="flex items-center gap-1">
                                  <p className="text-sm font-bold text-gray-900">{mentor.attendance || '0%'}</p>
                               </div>
                               <p className="text-[10px] text-gray-500">Average Attendance</p>
                            </div>
                         </div>

                         <div className="flex items-start gap-3 mt-4">
                            <div className="h-8 w-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                               <Heart size={14} className="fill-green-500" />
                            </div>
                            <div>
                               <div className="flex items-center gap-1">
                                  <p className="text-sm font-bold text-gray-900">{(mentor.rating || 0) * 10 + (mentor.reviews || 0)}</p>
                               </div>
                               <p className="text-[10px] text-gray-500">Impact Score</p>
                            </div>
                         </div>
                      </div>

                      <div className="h-px bg-gray-100 my-6"></div>

                      <h4 className="text-sm font-bold text-gray-900 mb-1">Top Areas of Impact</h4>
                      <p className="text-[10px] text-gray-500 mb-4">Highly discussed topics during sessions</p>
                      
                      <div className="flex flex-col gap-2">
                         {getArray(mentor.expertise).length > 0 ? getArray(mentor.expertise).slice(0, 3).map((exp, i) => (
                            <div key={i} className="bg-purple-50 text-purple-700 text-xs font-semibold py-2 px-3 rounded-md truncate">
                               {exp}
                            </div>
                         )) : <div className="text-xs text-gray-400">No data yet</div>}
                         {getArray(mentor.expertise).length > 3 && (
                            <div className="text-xs font-bold text-purple-700 mt-1 hover:underline cursor-pointer">
                               +{mentor.expertise.length - 3} Others
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Available Sessions Widget */}
                   <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                      <div className="mb-6">
                         <h3 className="text-xl font-bold text-[#0A2640]">Available sessions</h3>
                         <p className="text-sm font-medium text-gray-500 mt-1">Book 1:1 sessions from the options based on your needs</p>
                      </div>

                      <div className="flex items-center justify-between gap-4 mb-6">
                         <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide py-1 flex-1">
                            {displayDates.slice(0, 4).map((dateObj, i) => {
                               const { dateString, hasSlots, isPast } = getDateStatus(dateObj);
                               const slotsCount = hasSlots ? getAvailableSlotsForDate(dateString).length : 0;
                               
                               let boxClasses = "shrink-0 w-[72px] h-[76px] rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ";
                               
                               if (isPast) {
                                  boxClasses += "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed";
                               } else if (hasSlots) {
                                  boxClasses += selectedDateStr === dateString 
                                     ? "bg-white text-gray-900 border-gray-900 shadow-md ring-1 ring-gray-900" 
                                     : "bg-white text-gray-700 border-gray-200 shadow-sm hover:border-gray-400";
                               } else {
                                  boxClasses += selectedDateStr === dateString 
                                     ? "bg-gray-50 text-gray-900 border-gray-900 ring-1 ring-gray-900"
                                     : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50";
                               }

                               return (
                                  <button 
                                     key={i} 
                                     disabled={isPast}
                                     className={boxClasses}
                                     onClick={() => setSelectedDateStr(dateString)}
                                  >
                                     <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                     <span className="text-sm font-bold text-[#0A2640] mt-0.5">{dateObj.getDate()} {dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                                     {hasSlots && !isPast && <span className="text-[10px] font-bold text-green-500 mt-1">{slotsCount} slots</span>}
                                  </button>
                               );
                            })}
                         </div>
                         
                         <button 
                            className="text-sm font-bold text-[#b22222] hover:text-[#8b1a1a] transition-colors flex items-center shrink-0 whitespace-nowrap pl-2"
                            onClick={() => setBookingStep(1)}
                         >
                            View all <ChevronRight size={16} className="ml-0.5" />
                         </button>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-base font-bold text-[#0A2640]">Available sessions</h4>
                         <div className="flex gap-2 text-gray-300">
                            <ChevronLeft size={18} className="cursor-pointer hover:text-gray-900 transition-colors" />
                            <ChevronRight size={18} className="cursor-pointer hover:text-gray-900 transition-colors" />
                         </div>
                      </div>

                      <div className="space-y-3 mb-8">
                         {selectedDateStr && getAvailableSlotsForDate(selectedDateStr).length > 0 ? (
                            getAvailableSlotsForDate(selectedDateStr).map(slot => (
                               <button 
                                  key={slot.id}
                                  onClick={() => {
                                     setSelectedSlot({ ...slot, date: selectedDateStr });
                                  }}
                                  className={`w-full p-4 border rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between text-left group ${
                                     selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr
                                        ? 'bg-primary/5 border-primary shadow-md ring-1 ring-primary'
                                        : 'bg-white border-gray-200 hover:border-primary/50 shadow-sm hover:shadow-md'
                                  }`}
                               >
                                  <div>
                                     <h5 className="font-bold text-[#0A2640] text-base">{slot.title || 'Mentorship Session'}</h5>
                                     <div className="flex items-center gap-3 mt-1.5 text-xs font-bold">
                                        <span className="flex items-center text-primary bg-primary/10 px-2 py-1 rounded-md">
                                           <Clock size={14} className="mr-1.5" /> {slot.startTime} - {slot.endTime}
                                        </span>
                                        <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-md">
                                           <DollarSign size={14} className="mr-0.5" />
                                           {parseFloat(slot.price) > 0 ? parseFloat(slot.price).toFixed(2) : 'Free'}
                                        </span>
                                     </div>
                                  </div>
                                  
                                  <div className={`mt-3 sm:mt-0 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                     selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                                  }`}>
                                     {selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr ? 'Selected' : 'Select'}
                                  </div>
                               </button>
                            ))
                         ) : (
                            <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                               <p className="text-sm font-medium text-gray-500">No sessions available on this date</p>
                            </div>
                         )}
                      </div>

                      <button 
                         disabled={!selectedSlot || selectedSlot.date !== selectedDateStr}
                         className={`w-full py-4 rounded-xl text-base font-bold transition-all text-white shadow-md flex items-center justify-center ${
                            !selectedSlot || selectedSlot.date !== selectedDateStr
                               ? 'bg-red-300 cursor-not-allowed'
                               : 'bg-[#b22222] hover:bg-red-800'
                         }`}
                         onClick={() => setBookingStep(3)}
                      >
                         Continue to Book Session <ChevronRight size={18} className="ml-2" />
                      </button>
                   </div>
                </div>

             </div>
          )}

          {activeTab === 'Reviews' && (
             <div className="bg-white border text-gray-500 border-gray-200 rounded-2xl shadow-sm p-8 sm:p-12 space-y-12">
                <div className="flex flex-col sm:flex-row gap-8">
                   <div className="flex-1 space-y-6 max-w-lg">
                      <div>
                         <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>Communication</span>
                            <span>99%</span>
                         </div>
                         <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '99%' }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>Problem Solving</span>
                            <span>99%</span>
                         </div>
                         <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '99%' }}></div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex-1 space-y-6 max-w-lg">
                      <div>
                         <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>Motivational</span>
                            <span>97%</span>
                         </div>
                         <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '97%' }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>Subject Knowledge</span>
                            <span>100%</span>
                         </div>
                         <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                   <h4 className="font-bold text-gray-900 mb-6 text-lg">Real experiences with mentor</h4>
                   <div className="bg-white rounded-xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 relative mb-6">
                      <p className="text-xs text-gray-400 font-medium mb-4">March 10, 2025</p>
                      <p className="text-sm text-gray-700 leading-relaxed mb-8">
                         {mentor.name?.split(' ')[0]} was extremely helpful and provided clear, actionable steps to improve my skills. His advice on personal branding and networking was especially valuable. I left the session feeling more confident and prepared for my next career move!
                      </p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full border border-gray-200 overflow-hidden shrink-0">
                               <img src="https://i.pravatar.cc/150?img=11" alt="Mentee" className="h-full w-full object-cover" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-900">Emmanuel Ayobami <span className="text-[10px] text-gray-500 font-bold uppercase bg-gray-100 px-1 rounded ml-1">NG</span></p>
                               <p className="text-xs text-gray-500 mt-0.5">Front-End Developer | UI/UX Designer</p>
                            </div>
                         </div>
                         <div className="bg-[#b22222] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm shrink-0">
                            Mentee
                         </div>
                      </div>
                      {/* Decorative chat bubble icon like in the screenshot */}
                      <div className="absolute -bottom-5 -right-5 h-14 w-14 bg-[#8b5cf6] rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white">
                         <MessageSquare size={20} className="fill-current" />
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'Achievements' && (
             <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="inline-flex h-20 w-20 bg-blue-50 text-blue-500 rounded-full items-center justify-center mb-4">
                   🏆
                </div>
                <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Badges, certificates, and recognition earned by {mentor.name} will appear here.</p>
             </div>
          )}

          {activeTab === 'GroupSessions' && (
             <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="inline-flex h-20 w-20 bg-green-50 text-green-500 rounded-full items-center justify-center mb-4">
                   👥
                </div>
                <h3 className="text-xl font-bold text-gray-900">Group Sessions</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Upcoming live workshops and cohort-based mentorship hosted by {mentor.name}.</p>
             </div>
          )}
       </div>

       {/* Redesigned 3-Step Booking Modal */}
       <AnimatePresence>
          {bookingStep > 0 && (
             <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 pb-[100px] mt-8">
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                   onClick={() => setBookingStep(0)}
                />
                
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0, y: 20 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 0.95, opacity: 0, y: 20 }}
                   className="bg-white rounded-[24px] shadow-2xl relative z-10 w-full max-w-4xl overflow-hidden max-h-[85vh] flex flex-col md:flex-row min-h-[500px]"
                >
                   {/* Close Button top right container */}
                   <button 
                      onClick={() => setBookingStep(0)} 
                      className="absolute top-4 right-4 z-20 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                   >
                      <X size={16} strokeWidth={3} />
                   </button>

                   {/* Left Sidebar (Mentor Info) */}
                   <div className="p-8 md:w-5/12 border-b md:border-b-0 md:border-r border-gray-100 bg-white">
                      <h2 className="text-2xl font-bold text-[#0A2640] mb-2">Mentorship Session</h2>
                      <p className="text-sm font-bold text-[#0A2640]">
                         {mentor.name} <span className="text-gray-400 font-medium ml-1">• {mentor.role || 'Mentor'} at {mentor.company || 'Wisdom Connect'}</span>
                      </p>
                      
                      <div className="mt-8 pt-8 border-t border-gray-100 space-y-6 text-[#0A2640]">
                         <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Price</p>
                            <p className="text-xl font-bold">Free</p>
                         </div>
                         <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Session duration</p>
                            <p className="text-sm font-bold">60 minutes</p>
                         </div>
                         <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">About</p>
                            <p className="text-sm font-bold">Mentorship session</p>
                         </div>
                      </div>
                   </div>

                   {/* Right Content Area (Steps 1, 2, 3) */}
                   <div className="p-8 md:w-7/12 flex flex-col bg-white overflow-y-auto">
                      
                      {bookingStep === 1 && (
                         <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">STEP 1 of 3</p>
                            <h3 className="text-xl font-bold text-[#0A2640] mb-2">Select date and time</h3>
                            <p className="text-sm font-medium text-[#0A2640] mb-8">
                               In your local timezone (Africa/Lagos) <button className="text-[#b22222] hover:underline ml-1">Update</button>
                            </p>
                            
                            <div className="flex-1">
                               <div className="flex justify-between items-center mb-6">
                                  <h3 className="text-base font-bold text-[#0A2640]">
                                     {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                  </h3>
                                  <div className="flex gap-2">
                                     <button 
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                     >
                                        <ChevronLeft size={20} />
                                     </button>
                                     <button 
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                     >
                                        <ChevronRight size={20} />
                                     </button>
                                  </div>
                               </div>

                               <div className="grid grid-cols-7 gap-1 text-center mb-4">
                                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                     <div key={d} className="text-[13px] font-bold text-[#0A2640]">{d}</div>
                                  ))}
                               </div>
                               
                               <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                                   {generateFullCalendarDays().map((dateObj, i) => {
                                     if (!dateObj) return <div key={i} className="h-10"></div>;
                                     
                                     const { dateString, hasSlots, isPast } = getDateStatus(dateObj);
                                     
                                     let btnClass = "h-10 w-10 mx-auto rounded-full flex items-center justify-center text-[15px] font-bold transition-all ";
                                     
                                     if (isPast) {
                                        btnClass += "text-gray-300 cursor-not-allowed ";
                                     } else if (hasSlots) {
                                        btnClass += selectedDateStr === dateString
                                           ? "bg-[#b22222] text-white cursor-pointer shadow-md "
                                           : "text-[#0A2640] bg-red-50 hover:bg-red-100 cursor-pointer ";
                                     } else {
                                        btnClass += selectedDateStr === dateString
                                           ? "bg-gray-800 text-white cursor-pointer shadow-md "
                                           : "text-[#0A2640] hover:bg-gray-100 cursor-pointer ";
                                     }

                                     return (
                                        <button
                                           key={i}
                                           disabled={isPast} // Allow clicking any present/future date
                                           onClick={() => setSelectedDateStr(dateString)}
                                           className={btnClass}
                                        >
                                           {dateObj.getDate()}
                                        </button>
                                     );
                                  })}
                               </div>
                            </div>
                            
                            <button 
                               disabled={!selectedDateStr}
                               onClick={() => setBookingStep(2)}
                               className={`mt-8 w-full py-4 rounded-xl text-base font-bold transition-all text-white shadow-md ${
                                  !selectedDateStr ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b22222] hover:bg-red-800'
                               }`}
                            >
                               Continue
                            </button>
                         </div>
                      )}

                      {bookingStep === 2 && (
                         <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">STEP 2 of 3</p>
                            <h3 className="text-xl font-bold text-[#0A2640] mb-2">Select available time</h3>
                            <p className="text-sm font-medium text-[#0A2640] mb-4">
                               In your local timezone (Africa/Lagos)
                            </p>
                            <div className="flex items-center text-sm font-bold text-[#0A2640] mb-8">
                               Date: {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                               <button onClick={() => setBookingStep(1)} className="text-[#b22222] ml-3 hover:underline font-medium">Change</button>
                            </div>
                            
                            <div className="flex-1">
                               <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                                  <h4 className="text-sm font-bold text-[#0A2640]">Available time slots</h4>
                                  <div className="flex gap-2 text-gray-300">
                                     <ChevronLeft size={16} />
                                     <ChevronRight size={16} />
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                  {selectedDateStr && getAvailableSlotsForDate(selectedDateStr).length > 0 ? (
                                     getAvailableSlotsForDate(selectedDateStr).map(slot => (
                                        <button 
                                           key={slot.id}
                                           onClick={() => setSelectedSlot({ ...slot, date: selectedDateStr })}
                                           className={`py-3 px-2 border rounded-xl text-base font-bold transition-all flex items-center justify-center ${
                                              selectedSlot?.id === slot.id && selectedSlot?.date === selectedDateStr
                                                 ? 'bg-white text-[#0A2640] border-[#0A2640] ring-1 ring-[#0A2640]'
                                                 : 'bg-white text-[#0A2640] border-gray-200 hover:border-gray-400'
                                           }`}
                                        >
                                           {slot.startTime}
                                        </button>
                                     ))
                                  ) : (
                                     <div className="col-span-full py-8 text-center text-gray-500">
                                        No slots available on this date.
                                     </div>
                                  )}
                               </div>
                            </div>
                            
                            <button 
                               disabled={!selectedSlot || selectedSlot.date !== selectedDateStr}
                               onClick={() => setBookingStep(3)}
                               className={`mt-4 w-full py-4 rounded-xl text-base font-bold transition-all text-white shadow-md ${
                                  !selectedSlot || selectedSlot.date !== selectedDateStr ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b22222] hover:bg-red-800'
                               }`}
                            >
                               Continue
                            </button>
                         </div>
                      )}

                      {bookingStep === 3 && (
                         <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">STEP 3 of 3</p>
                            <h3 className="text-xl font-bold text-[#0A2640] mb-6">Confirm your booking</h3>
                            
                            <div className="flex items-center gap-6 mb-8 text-[#0A2640]">
                               <div className="flex items-center gap-2 font-bold text-sm">
                                  <Calendar size={18} className="text-gray-400" />
                                  {selectedSlot?.date ? new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                               </div>
                               <div className="flex items-center gap-2 font-bold text-sm">
                                  <Clock size={18} className="text-gray-400" />
                                  {selectedSlot?.startTime}
                               </div>
                               <button onClick={() => setBookingStep(2)} className="text-[#b22222] hover:underline text-sm font-medium">Change</button>
                            </div>
                            
                            <div className="flex-1 space-y-6">
                               <div>
                                  <label className="block text-sm font-bold text-[#0A2640] mb-2">Select main topic</label>
                                  <div className="relative">
                                     <select 
                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm border p-4 bg-white text-gray-700 appearance-none font-medium"
                                        value={bookingTopic}
                                        onChange={(e) => setBookingTopic(e.target.value)}
                                     >
                                        <option value="">eg. 🌱 Managing burn out</option>
                                        <option value="Career Advice">Career Advice</option>
                                        <option value="Resume Review">Resume Review</option>
                                        <option value="Technical Interview Prep">Technical Interview Prep</option>
                                        <option value="Leadership & Management">Leadership & Management</option>
                                        <option value="Other">Other</option>
                                     </select>
                                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <ChevronRight size={16} className="rotate-90" />
                                     </div>
                                  </div>
                               </div>

                               <div>
                                  <label className="block text-sm font-bold text-[#0A2640] mb-1">
                                     What are you looking to get out of this session? <br/>
                                     <span className="text-gray-400 font-medium">(Required)</span>
                                  </label>
                                  <textarea 
                                     rows={4} 
                                     className="block w-full mt-2 rounded-xl border-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm border p-4 bg-white font-medium resize-none" 
                                     placeholder="Your answer"
                                     value={bookingNotes}
                                     onChange={(e) => setBookingNotes(e.target.value)}
                                  ></textarea>
                               </div>
                            </div>
                            
                            <button 
                               onClick={handleBookSession}
                               disabled={!bookingNotes.trim() || !selectedSlot}
                               className={`mt-6 w-full py-4 rounded-xl text-base font-bold transition-all text-white shadow-md ${
                                  !bookingNotes.trim() || !selectedSlot ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b22222] hover:bg-red-800'
                               }`}
                            >
                               Confirm booking
                            </button>
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
             <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 pb-[100px]">
               <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
               >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <div>
                        <h2 className="text-xl font-bold border-gray-900 border-none">Request to Message</h2>
                        <p className="text-sm border-gray-500 border-none mt-1">Introduce yourself to {mentor?.user?.name}</p>
                     </div>
                     <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-gray-600 border-none bg-transparent">
                        <X size={24} />
                     </button>
                  </div>
                  
                  <div className="p-6">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Message</label>
                     <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Hi! I'd love to connect to discuss your expertise..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                     ></textarea>
                     <p className="text-xs text-gray-500 mt-2">Connecting with a mentor allows you to chat securely anytime.</p>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                     <button 
                        onClick={() => setIsMessageModalOpen(false)}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border-none bg-transparent"
                     >
                        Cancel
                     </button>
                     <button 
                        disabled={!messageText.trim() || isSendingMessage}
                        onClick={async () => {
                           setIsSendingMessage(true);
                           try {
                              await connectionService.requestConnection(mentor.user_id, { initialMessage: messageText });
                              addToast("Message request sent successfully!", "success");
                              setIsMessageModalOpen(false);
                              setMessageText('');
                           } catch(err) {
                              addToast(err.response?.data?.message || "Failed to send request", "error");
                           } finally {
                              setIsSendingMessage(false);
                           }
                        }}
                        className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center ${
                           !messageText.trim() || isSendingMessage ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark translate-y-[-1px]'
                        } border-none`}
                     >
                        {isSendingMessage ? (
                           <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Sending...</>
                        ) : 'Send Request'}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default MentorProfile;
