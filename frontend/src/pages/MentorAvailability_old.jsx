import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, X, CheckCircle2, ChevronRight, ChevronLeft, DollarSign, Edit3, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MentorAvailability = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalStep, setModalStep] = useState(0); // 0: closed, 1: calendar, 2: slots for date
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  
  // Slot Form
  const [newSlot, setNewSlot] = useState({ title: 'Mentorship Session', price: 0, hour: '09', minute: '00', period: 'AM' });

  // Calendar logic
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

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
        const d = new Date(year, month, i); // fix max(month,11) bug resulting in december
        days.push(d);
     }
     return days;
  };

  const generateDatesArray = () => {
     const dates = [];
     const today = new Date();
     // Set to midnight local time
     today.setHours(0, 0, 0, 0);
     for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
     }
     return dates;
  };
  
  const displayDates = generateDatesArray();
  // We'll use this to control the tabs view
  const [activeTabDateStr, setActiveTabDateStr] = useState(null);

  // Initialize active tab to today's date
  useEffect(() => {
    if (!activeTabDateStr) {
       const today = new Date();
       const year = today.getFullYear();
       const month = String(today.getMonth() + 1).padStart(2, '0');
       const day = String(today.getDate()).padStart(2, '0');
       setActiveTabDateStr(`${year}-${month}-${day}`);
    }
  }, []);

  const fetchAvailabilities = async () => {
     try {
        setLoading(true);
        const response = await bookingService.getAvailability(user.id);
        const slots = response.data.data || response.data || [];
        setAvailabilities(slots);
     } catch (err) {
        console.error("Error fetching availability:", err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
    if (user?.id) fetchAvailabilities();
  }, [user]);

  const getDateStatus = (dateObj) => {
     if (!dateObj) return { hasSlots: false, isPast: true };
     
     // Format correctly to local YYYY-MM-DD
     const year = dateObj.getFullYear();
     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
     const day = String(dateObj.getDate()).padStart(2, '0');
     const dateString = `${year}-${month}-${day}`;
     
     const hasSlots = availabilities.some(s => s.date === dateString);
     
     const today = new Date();
     const todayYear = today.getFullYear();
     const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
     const todayDay = String(today.getDate()).padStart(2, '0');
     const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
     
     const isToday = todayString === dateString;
     // Only exactly past days (yesterday and older)
     const isPast = !isToday && dateObj < new Date(new Date().setHours(0, 0, 0, 0));
     
     return { dateString, hasSlots, isToday, isPast };
  };

  const getAvailableSlotsForDate = (dateStr) => {
     return availabilities.filter(slot => slot.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleDateClick = (dateStr) => {
      setSelectedDateStr(dateStr);
      setModalStep(2);
  };

  const handleAddSlot = async (e) => {
     e.preventDefault();
     
     try {
       // Convert YYYY-MM-DD string back to date to get dayOfWeek cleanly
       const [y, m, d] = selectedDateStr.split('-');
       const dateObj = new Date(y, m - 1, d);
       const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

       // Handle Time conversion
       let h = parseInt(newSlot.hour);
       if (newSlot.period === 'PM' && h !== 12) h += 12;
       if (newSlot.period === 'AM' && h === 12) h = 0;
       const formattedStartTime = `${String(h).padStart(2, '0')}:${newSlot.minute}`;

       let derivedEndTime = '10:00';
       const endHours = String((h + 1) % 24).padStart(2, '0');
       derivedEndTime = `${endHours}:${newSlot.minute}`;

       const payload = {
          date: selectedDateStr,
          day: dayOfWeek,
          title: newSlot.title || 'Mentorship Session',
          price: parseFloat(newSlot.price) || 0,
          startTime: formattedStartTime,
          endTime: derivedEndTime,
          status: 'available'
       };

       await bookingService.createAvailability(payload);
       
       addToast("Time slot added securely!", 'success');
       setNewSlot({ title: 'Mentorship Session', price: 0, hour: '09', minute: '00', period: 'AM' });
       fetchAvailabilities(); 
       setActiveTabDateStr(selectedDateStr);
       setModalStep(0);
     } catch (err) {
       console.error(err);
       addToast(err.response?.data?.message || "Failed to add time slot.", 'error');
     }
  };

  const handleDeleteSlot = async (id) => {
     try {
        await bookingService.deleteAvailability(id);
        setAvailabilities(availabilities.filter(slot => slot.id !== id));
        addToast("Time slot deleted.", "info");
     } catch (err) {
        console.error(err);
        addToast("Failed to delete time slot.", "error");
     }
  };

  // Grouping for main view
  const upcomingSlots = availabilities.filter(slot => new Date(slot.date) >= new Date(new Date().setHours(0,0,0,0)))
                                      .sort((a,b) => new Date(a.date) - new Date(b.date));
                                      
  const groupedSlots = upcomingSlots.reduce((acc, slot) => {
     if (!acc[slot.date]) acc[slot.date] = [];
     acc[slot.date].push(slot);
     return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Area */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
            <p className="text-gray-500 text-sm mt-1">Configure your open dates, session titles, and pricing options for mentees to book.</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-3">
             <button 
                className="bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 px-5 py-2.5 font-bold rounded-xl text-sm flex items-center shadow-sm relative group overflow-hidden"
                onClick={() => addToast("Calendar syncing feature is coming soon!", "info")}
             >
                 <LinkIcon size={16} className="mr-2 text-gray-400 group-hover:text-blue-500 transition-colors" /> 
                 Sync Google Calendar
                 <span className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-bl-lg font-bold">Coming Soon</span>
             </button>
             <button 
                onClick={() => { setModalStep(1); setSelectedDateStr(null); }}
                className="btn-primary px-5 py-2.5 shadow-sm text-sm flex items-center"
             >
                <CalendarIcon size={16} className="mr-2" /> Add Availability
             </button>
         </div>
      </div>

      {/* Main Page Tabs View */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-gray-100">
         <h3 className="text-lg font-bold text-[#0A2640] mb-6">Upcoming Scheduled Slots</h3>

         {loading ? (
             <div className="py-20 text-center animate-pulse text-gray-400">Loading your schedule...</div>
         ) : (
             <>
               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-1 mb-6">
                  {displayDates.map((dateObj, i) => {
                     const { dateString, hasSlots, isToday } = getDateStatus(dateObj);
                     const slotsCount = hasSlots ? getAvailableSlotsForDate(dateString).length : 0;
                     
                     let boxClasses = "shrink-0 w-[80px] h-[90px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ";
                     
                     if (hasSlots) {
                        boxClasses += activeTabDateStr === dateString 
                           ? "bg-[#b22222] text-white border-[#b22222] shadow-md ring-2 ring-[#b22222] ring-offset-2 " 
                           : "bg-red-50 text-[#0A2640] border-red-100 hover:border-red-300 ";
                     } else {
                        boxClasses += activeTabDateStr === dateString 
                           ? "bg-gray-800 text-white border-gray-800 shadow-md ring-2 ring-gray-800 ring-offset-2 "
                           : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 ";
                     }

                     return (
                        <button 
                           key={i} 
                           className={boxClasses}
                           onClick={() => setActiveTabDateStr(dateString)}
                        >
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${hasSlots && activeTabDateStr === dateString ? 'text-white/80' : hasSlots ? 'text-primary/70' : 'text-gray-400'}`}>
                              {isToday ? 'TODAY' : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                           </span>
                           <span className={`text-2xl font-black mt-1 ${hasSlots && activeTabDateStr === dateString ? 'text-white' : hasSlots ? 'text-[#0A2640]' : 'text-gray-900'}`}>
                              {dateObj.getDate()}
                           </span>
                           <span className={`text-[10px] font-bold mt-1 ${hasSlots && activeTabDateStr === dateString ? 'text-white/80' : hasSlots ? 'text-[#0A2640]' : 'text-gray-500'}`}>
                              {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                           </span>
                           {hasSlots && (
                              <div className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTabDateStr === dateString ? 'bg-white text-[#b22222]' : 'bg-[#b22222] text-white'}`}>
                                 {slotsCount} slots
                              </div>
                           )}
                        </button>
                     );
                  })}
               </div>

               {/* Slots for Selected Tab */}
               <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 min-h-[250px]">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                     <h4 className="font-bold text-gray-900 flex items-center">
                        <CalendarIcon size={18} className="text-primary mr-2" />
                        {activeTabDateStr ? new Date(`${activeTabDateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                     </h4>
                     <button onClick={() => handleDateClick(activeTabDateStr)} className="btn-primary px-4 py-2 text-xs shadow-sm flex items-center">
                        <Edit3 size={14} className="mr-1.5" /> Manage this date
                     </button>
                  </div>

                  {getAvailableSlotsForDate(activeTabDateStr).length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getAvailableSlotsForDate(activeTabDateStr).map(slot => (
                           <div key={slot.id} className="bg-white border text-left border-gray-200 rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden shadow-sm">
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                              <div className="pl-2">
                                 <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-[#0A2640] text-sm">{slot.title || 'Mentorship Session'}</h4>
                                    <button 
                                       onClick={() => handleDeleteSlot(slot.id)}
                                       className="text-gray-300 hover:text-red-500 transition-colors"
                                       title="Delete Slot"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                                 <div className="flex flex-col gap-2 mt-3 text-xs font-bold">
                                    <span className="flex items-center text-gray-700 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100 w-fit">
                                       <Clock size={14} className="mr-1.5 text-gray-500" />
                                       {slot.startTime}
                                    </span>
                                    <span className="flex items-center text-green-700 bg-green-50 px-2 py-1.5 rounded-md border border-green-100 w-fit">
                                       <DollarSign size={14} className="mr-0.5 text-green-500" />
                                       {parseFloat(slot.price) > 0 ? parseFloat(slot.price).toFixed(2) : 'Free'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-10">
                        <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-100">
                           <Clock size={20} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-4">No time slots configured on this date</p>
                        <button onClick={() => handleDateClick(activeTabDateStr)} className="text-sm font-bold text-primary hover:underline">
                           Add Available Times
                        </button>
                     </div>
                  )}
               </div>
             </>
         )}
      </div>

      {/* Central Modal Experience */}
      <AnimatePresence>
         {modalStep > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95, y: 10 }}
                   className="bg-white rounded-[24px] shadow-2xl relative w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
               >
                  {/* Close Button */}
                  <button 
                     onClick={() => setModalStep(0)} 
                     className="absolute top-4 right-4 z-20 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                  >
                     <X size={16} strokeWidth={3} />
                  </button>

                  {/* Left Sidebar Info */}
                  <div className="p-8 md:w-5/12 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                     <div>
                        <h2 className="text-2xl font-bold text-[#0A2640] mb-2">Mentorship Slots</h2>
                        <p className="text-sm font-medium text-gray-500 mb-8">
                           Define your time entries. They will instantly appear on your Mentee-facing profile.
                        </p>
                        
                        <div className="space-y-6 pt-6 border-t border-gray-200">
                           <div className="flex items-start gap-3">
                              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                 <CalendarIcon size={14} className="text-primary" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-900 text-sm">Flexible Dates</h4>
                                 <p className="text-xs text-gray-500 mt-1">Navigate across months and select precise days to open up.</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-3">
                              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                 <DollarSign size={14} className="text-green-600" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-900 text-sm">Custom Pricing</h4>
                                 <p className="text-xs text-gray-500 mt-1">Set individual pricing or offer free sessions based on the time slot.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right Content Area */}
                  <div className="p-8 md:w-7/12 flex flex-col bg-white">
                     
                     {/* Calendar View Overlay */}
                     {modalStep === 1 && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                           <div className="flex items-center justify-between mb-8">
                              <div>
                                 <h3 className="text-xl font-bold text-[#0A2640]">Select a Date</h3>
                                 <p className="text-sm font-medium text-gray-500">Pick any date to add slots</p>
                              </div>
                              <div className="bg-[#b22222] text-white opacity-20 h-10 w-10 flex items-center justify-center rounded-full">
                                 <CalendarIcon size={20} />
                              </div>
                           </div>
                           
                           <div className="flex-1">
                              <div className="flex justify-between items-center mb-6">
                                 <h3 className="text-lg font-bold text-[#0A2640]">
                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                 </h3>
                                 <div className="flex gap-2">
                                    <button 
                                       onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                       className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                                    >
                                       <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                       onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                       className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                                    >
                                       <ChevronRight size={20} />
                                    </button>
                                 </div>
                              </div>

                              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                                 {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <div key={d} className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                                 ))}
                              </div>
                              
                              <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
                                  {generateFullCalendarDays().map((dateObj, i) => {
                                    if (!dateObj) return <div key={i} className="h-10"></div>;
                                    
                                    const { dateString, hasSlots, isPast, isToday } = getDateStatus(dateObj);
                                    
                                    let btnClass = "relative h-11 w-11 mx-auto rounded-full flex items-center justify-center text-[15px] font-bold transition-all ";
                                    
                                    if (isPast) {
                                       btnClass += "text-gray-300 cursor-not-allowed ";
                                    } else if (hasSlots) {
                                       btnClass += "text-[#0A2640] bg-primary/10 hover:bg-primary hover:text-white cursor-pointer ring-1 ring-primary/20 ";
                                    } else {
                                       btnClass += "text-gray-600 hover:bg-gray-100 cursor-pointer border border-transparent hover:border-gray-200 ";
                                    }

                                    if (isToday && !isPast && !hasSlots) {
                                       btnClass += " ring-2 ring-gray-200";
                                    }

                                    return (
                                       <button
                                          key={i}
                                          disabled={isPast} 
                                          onClick={() => handleDateClick(dateString)}
                                          className={btnClass}
                                       >
                                          {dateObj.getDate()}
                                          {hasSlots && <div className="absolute bottom-1 right-1 h-2 w-2 bg-primary rounded-full border border-white"></div>}
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Configuration specific to a Date */}
                     {modalStep === 2 && selectedDateStr && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto pr-2">
                           <div className="mb-8 pb-4 border-b border-gray-100">
                              <button onClick={() => setModalStep(1)} className="text-gray-400 hover:text-gray-900 flex items-center font-bold text-sm mb-4 transition-colors">
                                 <ChevronLeft size={16} className="mr-1" /> Back to Calendar
                              </button>
                              <h3 className="text-xl font-bold text-[#0A2640]">Add Slots</h3>
                              <p className="text-sm font-medium text-gray-500">
                                 {new Date(`${selectedDateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                           </div>

                           <form onSubmit={handleAddSlot} className="bg-gray-50 rounded-2xl p-5 border border-gray-200 mb-6">
                              <div className="space-y-4">
                                 <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Session Title</label>
                                    <input 
                                       type="text" 
                                       className="input-field bg-white"
                                       placeholder="e.g. 1:1 Career Mentorship"
                                       value={newSlot.title}
                                       onChange={(e) => setNewSlot({...newSlot, title: e.target.value})}
                                       required
                                    />
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                    <div>
                                       <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Price ($)</label>
                                       <input 
                                          type="number" min="0" step="0.01"
                                          className="input-field bg-white"
                                          value={newSlot.price}
                                          onChange={(e) => setNewSlot({...newSlot, price: e.target.value})}
                                          required 
                                       />
                                    </div>
                                    <div className="col-span-2">
                                       <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Start Time</label>
                                       <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                                          <select 
                                             className="w-full bg-transparent border-none py-2.5 pl-3 pr-1 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer outline-none"
                                             value={newSlot.hour}
                                             onChange={(e) => setNewSlot({...newSlot, hour: e.target.value})}
                                          >
                                             {[...Array(12)].map((_, i) => {
                                                const val = String(i === 0 ? 12 : i).padStart(2, '0');
                                                return <option key={i} value={val}>{val}</option>;
                                             })}
                                          </select>
                                          <div className="flex items-center text-gray-400 font-bold">:</div>
                                          <select 
                                             className="w-full bg-transparent border-none py-2.5 px-1 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer outline-none"
                                             value={newSlot.minute}
                                             onChange={(e) => setNewSlot({...newSlot, minute: e.target.value})}
                                          >
                                             {['00', '15', '30', '45'].map(val => (
                                                <option key={val} value={val}>{val}</option>
                                             ))}
                                          </select>
                                          <div className="h-full w-px bg-gray-200"></div>
                                          <select 
                                             className="w-full bg-gray-50 border-none py-2.5 px-2 text-sm font-bold text-primary focus:ring-0 cursor-pointer outline-none"
                                             value={newSlot.period}
                                             onChange={(e) => setNewSlot({...newSlot, period: e.target.value})}
                                          >
                                             <option value="AM">AM</option>
                                             <option value="PM">PM</option>
                                          </select>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <button type="submit" className="btn-primary w-full mt-5 py-3 shadow-md rounded-xl">Save Slot</button>
                           </form>
                        </div>
                     )}
                     
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default MentorAvailability;
