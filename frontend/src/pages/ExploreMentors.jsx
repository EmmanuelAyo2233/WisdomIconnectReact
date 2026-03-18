import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, ArrowRight, ClipboardList, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mentorService } from '../api/services';
const ExploreMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('All');

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
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          mentor.expertise?.some(e => typeof e === 'string' && e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExpertise = selectedExpertise === 'All' || mentor.expertise.includes(selectedExpertise);
    
    return matchesSearch && matchesExpertise;
  });

  const categories = ['All', 'Software Engineering', 'Product Management', 'Data Science', 'Design', 'Marketing'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Mentors</h1>
          <p className="text-gray-500 text-sm mt-1">Find the right guide for your career journey</p>
        </div>
        
        <div className="flex-1 max-w-md relative">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-5 w-5 text-gray-400" />
           </div>
           <input
             type="text"
             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
             placeholder="Search by name, expertise, or company..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
         <div className="flex items-center text-gray-500 px-2">
            <Filter size={18} className="mr-1" />
            <span className="text-sm font-medium">Filter:</span>
         </div>
         {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedExpertise(category)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                 selectedExpertise === category 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
               {category}
            </button>
         ))}
      </div>

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
          {filteredMentors.length > 0 ? filteredMentors.map((mentor) => (
            <motion.div 
               key={mentor.id}
               variants={{
                 hidden: { opacity: 0, y: 20 },
                 visible: { opacity: 1, y: 0 }
               }}
               className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col"
            >
               {/* Large Top Image */}
               <Link to={`/mentee/mentor/${mentor.id}`} className="block h-64 w-full bg-gray-50 overflow-hidden relative shrink-0">
                 {(mentor.user || mentor.User)?.picture && (mentor.user || mentor.User).picture !== "http://localhost:5000/uploads/default.png" ? (
                   <img src={(mentor.user || mentor.User).picture} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-6xl font-bold bg-primary/10 text-primary uppercase">
                      {((mentor.user || mentor.User)?.name || (mentor.user || mentor.User)?.firstName || 'M').charAt(0)}
                   </div>
                 )}
               </Link>
               
               <div className="p-5 flex-1 flex flex-col">
                  {/* Name and Country */}
                  <div className="flex items-center space-x-2 mb-3">
                     <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-2 py-0.5 rounded">
                        {(mentor.user || mentor.User)?.countryCode || 'NG'}
                     </span>
                     <Link to={`/mentee/mentor/${mentor.id}`} className="text-lg font-bold text-gray-900 leading-tight hover:text-primary transition-colors truncate">
                        {(mentor.user || mentor.User)?.name || `${(mentor.user || mentor.User)?.firstName || ''} ${(mentor.user || mentor.User)?.lastName || ''}`.trim() || 'Mentor'}
                     </Link>
                  </div>
                  
                  {/* Expertise list */}
                  <div className="flex items-start space-x-2 mb-3">
                     <ClipboardList className="text-primary shrink-0 mt-0.5" size={16} />
                     <p className="text-sm text-gray-600 line-clamp-2">
                        {mentor.expertise?.join(', ') || 'General Mentorship'}
                     </p>
                  </div>

                  {/* Sessions and Reviews */}
                  <div className="flex items-center space-x-2 mb-4">
                     <CalendarCheck className="text-primary shrink-0" size={16} />
                     <span className="text-sm text-gray-600">
                        {mentor.sessions || 0} sessions ({mentor.reviews || 0} reviews)
                     </span>
                  </div>

                  {/* Experience & Rating */}
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500 mt-auto pt-4 border-t border-gray-100">
                     <div className="flex items-center">
                        <Clock size={14} className="mr-1.5" />
                        {mentor.yearsOfExperience || 0} Years Exp.
                     </div>
                     <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                        <Star size={14} className="mr-1 fill-current" />
                        {mentor.rating || 'New'}
                     </div>
                  </div>
               </div>
            </motion.div>
          )) : (
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
