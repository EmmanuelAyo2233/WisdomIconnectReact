import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, ArrowRight, ClipboardList, CalendarCheck, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mentorService } from '../api/services';
const ExploreMentors = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const scrollRef = useRef(null);

  const scrollTabs = (direction) => {
     if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
     }
  };

  // Update search term when URL changes
  useEffect(() => {
     const newSearch = searchParams.get('search') || '';
     setSearchTerm(newSearch);
  }, [location.search]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await mentorService.getMentors();
        setMentors(response.data.data || response.data.mentors || response.data || []);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const u = mentor.user || mentor.User;
    const fullName = (u?.name || `${u?.firstName || ''} ${u?.lastName || ''}`).toLowerCase();
    
    // Helper to safely check array properties
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

    const mentorExpertise = getArray(mentor.expertise);

    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          mentorExpertise.some(e => typeof e === 'string' && e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExpertise = selectedExpertise === 'All' || mentorExpertise.includes(selectedExpertise);
    
    return matchesSearch && matchesExpertise;
  });

  // Extract all unique expertise from all mentors
  const getAllUniqueExpertise = () => {
     let allExp = new Set();
     mentors.forEach(m => {
        let expArray = [];
        const val = m.expertise;
        if (!val) return;
        if (Array.isArray(val)) expArray = val;
        else if (typeof val === 'string') {
           try { 
              const parsed = JSON.parse(val); 
              expArray = Array.isArray(parsed) ? parsed : [val];
           } catch(e) { 
              expArray = [val]; 
           }
        }
        expArray.forEach(e => { if (typeof e === 'string' && e.trim()) allExp.add(e.trim()) });
     });
     return ['All', ...Array.from(allExp).sort()];
  };

  const categories = getAllUniqueExpertise();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
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
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Perfect Guide</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-lg mx-auto md:mx-0">
            Connect with industry experts who can help accelerate your career and personal growth.
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
                placeholder="Search mentors, skills, or roles..."
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

      {/* Filters with Arrows */}
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.2 }}
         className="relative flex items-center group/nav"
      >
         <button 
            onClick={() => scrollTabs('left')} 
            className="absolute left-0 z-10 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl shadow-[4px_0_15px_rgba(0,0,0,0.1)] border border-gray-100 hidden sm:block text-gray-400 hover:text-primary transition-all opacity-0 group-hover/nav:opacity-100 -ml-4"
         >
            <ChevronLeft size={20} />
         </button>
         
         <div ref={scrollRef} className="flex items-center space-x-3 overflow-x-auto pb-4 pt-2 scrollbar-hide px-2 sm:px-4 w-full scroll-smooth">
            <div className="flex items-center text-gray-400 px-2 shrink-0">
               <Filter size={20} className="mr-2 text-gray-300" />
               <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">Filter by</span>
            </div>
            {categories.map(category => (
               <button
                 key={category}
                 onClick={() => setSelectedExpertise(category)}
                 className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all transform hover:-translate-y-0.5 shrink-0 ${
                    selectedExpertise === category 
                     ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                     : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                 }`}
               >
                  {category}
               </button>
            ))}
         </div>

         <button 
            onClick={() => scrollTabs('right')} 
            className="absolute right-0 z-10 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl shadow-[-4px_0_15px_rgba(0,0,0,0.1)] border border-gray-100 hidden sm:block text-gray-400 hover:text-primary transition-all opacity-0 group-hover/nav:opacity-100 -mr-4"
         >
            <ChevronRight size={20} />
         </button>
      </motion.div>

      {/* Mentor Network Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                   <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                   <div className="flex-1 py-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                   </div>
                </div>
                <div className="space-y-2 mb-4">
                   <div className="h-3 bg-gray-200 rounded"></div>
                   <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <motion.div 
           className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
           initial="hidden"
           animate="visible"
           variants={{
             hidden: { opacity: 0 },
             visible: {
               opacity: 1,
               transition: { staggerChildren: 0.1 }
             }
           }}
        >
           {filteredMentors.length > 0 ? filteredMentors.map((mentor, index) => {
             const isTopRanked = index < 3 && (mentor.user || mentor.User)?.mentorLevel === 'gold';
             return (
             <motion.div 
                key={mentor.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className={`bg-white rounded-xl overflow-hidden hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col relative ${isTopRanked ? 'border-2 border-yellow-400 shadow-[0_4px_15px_-4px_rgba(250,204,21,0.4)]' : 'shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100'}`}
             >
                {isTopRanked && (
                   <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-bl-xl rounded-tr-xl shadow-lg flex items-center gap-1">
                      👑 Top Mentor
                   </div>
                )}
                {/* Large Top Image */}
                <Link to={`/mentee/mentor/${mentor.id}`} className="block h-64 w-full bg-gray-50 overflow-hidden relative shrink-0">
                  {(mentor.user || mentor.User)?.picture && (mentor.user || mentor.User).picture !== "http://localhost:5000/uploads/default.png" ? (
                    <img src={(mentor.user || mentor.User).picture} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-black bg-gradient-to-br from-primary/10 to-primary/30 text-primary uppercase">
                       {((mentor.user || mentor.User)?.name || (mentor.user || mentor.User)?.firstName || 'M').charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                     <span className="text-white font-bold flex items-center gap-2">View Profile <ArrowRight size={16} /></span>
                  </div>
                </Link>
               
               <div className="p-5 flex-1 flex flex-col">
                  {/* Name and Level Badge */}
                  <div className="flex items-start justify-between space-x-2 mb-1">
                     <div className="flex items-center space-x-2 truncate">
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-2 py-0.5 rounded shrink-0">
                           {(mentor.user || mentor.User)?.countryCode || 'NG'}
                        </span>
                        <Link to={`/mentee/mentor/${mentor.id}`} className="text-lg font-bold text-gray-900 leading-tight hover:text-primary transition-colors truncate">
                           {(mentor.user || mentor.User)?.name || 'Mentor'}
                        </Link>
                     </div>
                     <span className={`text-[10px] uppercase font-black px-2 py-1 rounded border tracking-wider shrink-0
                        ${(mentor.user || mentor.User)?.mentorLevel === 'gold' ? 'bg-amber-100 text-amber-700 border-amber-300' 
                        : (mentor.user || mentor.User)?.mentorLevel === 'verified' ? 'bg-blue-100 text-blue-700 border-blue-300' 
                        : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                        {(mentor.user || mentor.User)?.mentorLevel || 'starter'}
                     </span>
                  </div>

                  {/* Mentor Role / Occupation */}
                  <div className="flex items-start space-x-2 mb-3">
                     <Briefcase className="text-primary shrink-0 mt-0.5" size={16} />
                     <div className="text-sm font-black text-primary line-clamp-1">
                        {mentor.role || (mentor.expertise && mentor.expertise.length > 0 ? mentor.expertise[0] : 'Professional Mentor')}
                     </div>
                  </div>
                  
                  {/* Expertise list */}
                  <div className="flex items-start space-x-2 mb-3">
                     <ClipboardList className="text-primary shrink-0 mt-0.5" size={16} />
                     <p className="text-sm text-gray-600 line-clamp-2">
                        {mentor.expertise?.join(', ') || 'General Mentorship'}
                     </p>
                  </div>

                  {/* Sessions and Reviews Count */}
                  <div className="flex items-center space-x-2 mb-4">
                     <CalendarCheck className="text-primary shrink-0" size={16} />
                     <span className="text-sm text-gray-600 font-bold">
                        {mentor.sessions || 0} sessions completed (reviews: {mentor.reviews || 0})
                     </span>
                  </div>

                  {/* Footer: Exp & Stars */}
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500 mt-auto pt-4 border-t border-gray-100">
                     <div className="flex items-center text-primary font-black uppercase tracking-wide">
                        {mentor.yearsOfExperience || 0} Years Experience
                     </div>
                     <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                           <Star 
                             key={i} 
                             size={14} 
                             className={`mr-0.5 ${i < Math.round((mentor.user || mentor.User)?.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}`} 
                           />
                        ))}
                     </div>
                  </div>
               </div>
             </motion.div>
          )}) : (
            <div className="col-span-full py-12 text-center">
               <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <Search size={32} className="text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No mentors found</h3>
               <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ExploreMentors;
