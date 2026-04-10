import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { Camera, Edit2, X, Linkedin, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Plus, Trash2, Rocket, Sparkles, CalendarCheck, Info, User } from 'lucide-react';
import { menteeService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const MenteeProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fallback to location state immediately while loading
        const profileState = location.state?.profile || location.state?.targetUser;
        if (profileState) {
          const userLevel = profileState.user || profileState.User || profileState;
          setTargetUser(prev => prev || {
             ...userLevel,
             ...profileState,
             name: userLevel.name || userLevel.firstName,
             picture: userLevel.picture
          });
        }
        
        // Fetch accurate data from API
        if (id) {
           const res = await menteeService.getMenteeById(id);
           if (res.data?.data) {
              setTargetUser(res.data.data);
           }
        }
      } catch (err) {
        console.error("Error fetching mentee profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, location.state]);

  const getArrayItems = (items) => {
     if (!items) return [];
     if (Array.isArray(items)) return items;
     if (typeof items === 'string') {
        try { 
           const parsed = JSON.parse(items);
           if (typeof parsed === 'string') {
               try {
                   const dp = JSON.parse(parsed);
                   if (Array.isArray(dp)) return dp;
               } catch(e) {}
               return parsed.split(',').map(s=>s.trim()).filter(Boolean);
           }
           if (Array.isArray(parsed)) return parsed;
           return [parsed];
        } catch (e) { 
           return items.split(',').map(s=>s.trim()).filter(Boolean); 
        }
     }
     return [];
  };

  if (loading && !targetUser) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading profile...</div>;
  if (!targetUser) return <div className="p-8 text-center text-red-500">Mentee not found</div>;

  const tabs = [
     { id: 'Overview', label: 'Overview' },
     { id: 'Sessions', label: 'Mentorship History' },
     { id: 'Commendations', label: `Mentor Commendations ${targetUser.commendations ? '('+targetUser.commendations.length+')' : ''}` },
     { id: 'Achievements', label: 'Achievements' },
  ];

  const bioText = targetUser.bio || 'Not yet added.';
  const shortBioLength = 250;
  const isBioLong = bioText.length > shortBioLength;
  const displayBio = isBioExpanded ? bioText : bioText.slice(0, shortBioLength);

  const experienceList = getArrayItems(targetUser.experience);
  const educationList = getArrayItems(targetUser.education);
  
  const displayInterests = getArrayItems(targetUser.interest || targetUser.interests);
  const displayExpertise = getArrayItems(targetUser.expertise);
  const displayDisciplines = getArrayItems(targetUser.discipline || targetUser.disciplines);
  const displayIndustries = getArrayItems(targetUser.industries);
  const displayLanguages = getArrayItems(targetUser.fluentIn);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
         
       {/* Hero / Cover Photo Banner */}
       <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-700 to-indigo-900 rounded-none md:rounded-b-2xl relative overflow-hidden shadow-sm">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200" alt="Cover" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
       </div>

       {/* Profile Header Block */}
       <div className="px-4 md:px-12 relative z-10 flex flex-col md:flex-row md:items-end gap-4 max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
             {/* Overlapping Avatar */}
             <div className="-mt-16 sm:-mt-20 relative group">
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-[6px] border-white bg-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                   {targetUser.picture && targetUser.picture !== "http://localhost:5000/uploads/default.png" ? (
                     <img src={targetUser.picture} alt={targetUser.name} className="h-full w-full object-cover" />
                   ) : (
                     <span className="text-5xl font-bold text-primary bg-primary/10 w-full h-full flex items-center justify-center uppercase">
                        {targetUser.name?.charAt(0) || 'M'}
                     </span>
                   )}
                </div>
             </div>

             <div className="text-center sm:text-left pb-2 flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                   <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{targetUser.name}</h1>
                   </div>
                </div>
                {targetUser.occupation && (
                   <p className="text-sm font-semibold text-gray-700 mt-1">{targetUser.occupation}</p>
                )}
                <p className="text-sm font-medium text-[#b22222] mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                   {targetUser.occupation || targetUser.role || 'Mentee'}
                </p>
                {targetUser.role === 'mentor' && (
                   <div className="mt-2 text-center sm:text-left">
                      <span className={`inline-flex items-center capitalize px-2.5 py-0.5 rounded-full font-bold shadow-sm border ${
                         targetUser.mentorLevel === 'gold' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                         targetUser.mentorLevel === 'verified' ? 'bg-green-100 text-green-800 border-green-300' :
                         'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                         ★ {targetUser.mentorLevel || 'Starter'} Mentor
                      </span>
                   </div>
                )}
             </div>
          </div>
       </div>

       {/* Tabs Menu */}
       <div className="border-b border-gray-200 px-4 sm:px-8 flex overflow-x-auto scrollbar-hide max-w-6xl mx-auto">
          {tabs.map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-6 font-semibold text-sm border-b-2 transition-colors ${
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
       <div className="px-4 sm:px-8 pt-4 max-w-6xl mx-auto">
          {activeTab === 'Overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                   
                   {/* Bio */}
                   <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">About Me</h3>
                      <div className="text-gray-700 leading-relaxed text-base format-text">
                         <p className={!targetUser.bio ? "italic text-gray-400" : ""}>
                            {displayBio}
                            {!isBioExpanded && isBioLong && <span>...</span>}
                         </p>
                         {isBioLong && (
                            <button 
                               className="text-primary font-bold mt-3 hover:underline flex items-center gap-1 focus:outline-none"
                               onClick={() => setIsBioExpanded(!isBioExpanded)}
                            >
                               {isBioExpanded ? 'Read less' : 'Read more'}
                            </button>
                         )}
                         {targetUser.linkedinUrl && (
                            <a href={targetUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all font-bold text-sm">
                               <Linkedin size={18} /> Connect on LinkedIn
                            </a>
                         )}
                      </div>
                   </div>

                   {/* Tags Block */}
                   <div className="border border-gray-100 rounded-2xl p-8 bg-white shadow-sm space-y-8">
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Expertise Goals</h4>
                        <div className="flex flex-wrap gap-2 text-sm">
                           {displayExpertise.length > 0 ? displayExpertise.map((exp, i) => (
                              <span key={i} className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-100 shadow-sm">
                                 {exp}
                              </span>
                           )) : <span className="text-sm text-gray-400 italic">Not yet added.</span>}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Industries</h4>
                        <div className="flex flex-wrap gap-2">
                           {displayIndustries.length > 0 ? displayIndustries.map((ind, i) => (
                              <span key={i} className="px-4 py-2 bg-primary/5 text-primary text-sm font-bold rounded-xl border border-primary/10">
                                 {ind}
                              </span>
                           )) : <span className="text-sm text-gray-400 italic">Not yet added.</span>}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                           {displayInterests.length > 0 ? displayInterests.map((item, i) => (
                              <span key={i} className="px-4 py-2 bg-white text-gray-700 text-sm font-bold rounded-xl border border-gray-100 shadow-sm">
                                 {item}
                              </span>
                           )) : <span className="text-sm text-gray-400 italic">Not yet added.</span>}
                        </div>
                      </div>
                      
                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Fluent In</h4>
                        <div className="flex flex-wrap gap-2">
                           {displayLanguages.length > 0 ? displayLanguages.map((lang, i) => (
                              <span key={i} className="px-4 py-2 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-100 shadow-sm">
                                 {lang}
                              </span>
                           )) : <span className="text-sm text-gray-400 italic">Not yet added.</span>}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Disciplines</h4>
                        <div className="flex flex-wrap gap-2">
                           {displayDisciplines.length > 0 ? displayDisciplines.map((item, i) => (
                              <span key={i} className="px-4 py-2 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-100 shadow-sm">
                                 {item}
                              </span>
                           )) : <span className="text-sm text-gray-400 italic">Not yet added.</span>}
                        </div>
                      </div>
                   </div>

                   {/* Experience Box */}
                   <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Experience</h3>
                            <span className="bg-primary/10 text-primary h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
                               {experienceList.length}
                            </span>
                         </div>
                      </div>
                      
                      <div className="space-y-6">
                         {experienceList.length > 0 ? experienceList.map((exp, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-4 group">
                               <div className="h-10 w-10 shrink-0 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                                  <Briefcase size={20} className="text-primary group-hover:text-primary transition-colors" />
                               </div>
                               <div className="flex-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start gap-2">
                                  <div className="flex flex-col gap-1">
                                     <h4 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-[#b22222] transition-colors">{typeof exp === 'object' ? exp.title || exp.company : exp}</h4>
                                     <p className="text-sm text-gray-700">{typeof exp === 'object' ? exp.company : ''}</p>
                                  </div>
                                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg shrink-0">
                                     {typeof exp === 'object' && exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Present'}` : 'Duration not specified'}
                                  </div>
                               </div>
                            </div>
                         )) : (
                            <p className="text-sm text-gray-400 italic">Not yet added.</p>
                         )}
                      </div>
                   </div>

                   {/* Education Box */}
                   <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Education</h3>
                            <span className="bg-primary/10 text-primary h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
                               {educationList.length}
                            </span>
                         </div>
                      </div>
                      
                      <div className="space-y-6">
                         {educationList.length > 0 ? educationList.map((edu, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-4 group">
                               <div className="h-10 w-10 shrink-0 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10 transition-colors">
                                  <GraduationCap size={20} className="text-primary transition-colors" />
                               </div>
                               <div className="flex-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start gap-2">
                                  <div className="flex flex-col gap-1">
                                     <h4 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-[#b22222] transition-colors">{typeof edu === 'object' ? edu.field || edu.degree || edu.institution : edu}</h4>
                                     <p className="text-sm text-gray-700">{typeof edu === 'object' ? edu.institution : ''}</p>
                                  </div>
                                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg shrink-0">
                                     {typeof edu === 'object' && edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : 'Year not specified'}
                                  </div>
                               </div>
                            </div>
                         )) : (
                            <p className="text-sm text-gray-400 italic">Not yet added.</p>
                         )}
                      </div>
                   </div>

                </div>

                {/* Right Column (Widgets) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                   {/* Community Statistics Widget */}
                   <div className="bg-gradient-to-br from-[#b22222] to-[#1a3a5a] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                      
                      <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                         <div className="h-2 w-2 bg-primary rounded-full" /> Mentee Journey
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                         <div>
                            <p className="text-3xl font-black mb-1">{targetUser.impact?.minutesLearned || 0}+</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Minutes Learned</p>
                         </div>
                         <div>
                            <p className="text-3xl font-black mb-1 text-primary">{targetUser.impact?.sessionsAttended || 0}</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Sessions Done</p>
                         </div>
                         <div className="col-span-2">
                            <p className="text-3xl font-black mb-1 text-green-400">{targetUser.impact?.attendanceRate || 0}%</p>
                            <div className="flex items-center gap-2">
                               <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Attendance Rate</p>
                               <Info size={12} className="text-white/40 cursor-help" />
                            </div>
                         </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-white/10">
                         <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">Top Focus Areas</h4>
                         <div className="flex flex-wrap gap-2">
                            {displayExpertise.length > 0 ? displayExpertise.slice(0, 4).map((exp, i) => (
                               <div key={i} className="bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-bold py-2 px-3 rounded-xl border border-white/10">
                                  {exp}
                               </div>
                            )) : <div className="text-xs text-blue-300">Not yet added.</div>}
                         </div>
                      </div>
                   </div>


                </div>
             </div>
          )}

          {activeTab === 'Sessions' && (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-xl shadow-sm">
                 <div className="inline-flex h-16 w-16 bg-blue-50 text-blue-500 rounded-full items-center justify-center mb-4 text-2xl">
                    🗓️
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Mentorship History</h3>
                 <p className="text-gray-500 max-w-md mx-auto mt-2">Shared sessions with this mentee will appear here soon.</p>
              </div>
           )}

           {activeTab === 'Commendations' && (
              <div className="bg-white border text-gray-500 border-gray-100 rounded-3xl shadow-sm p-8 sm:p-12 space-y-12">
                 <div className="pt-4">
                    <h4 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Mentor Commendations</h4>

                    {targetUser.commendations && targetUser.commendations.length > 0 ? (
                       <div className="space-y-6">
                          {targetUser.commendations.map((comm) => {
                             const mentorDetails = comm.mentor?.user || {};
                             const isMentee = user?.userType === 'mentee' || user?.role === 'mentee';
                             return (
                               <div key={comm.id} className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                                  
                                  <p className="text-lg text-gray-800 leading-relaxed font-medium mb-10 italic">
                                     "{comm.commendation}"
                                  </p>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                     <div className="flex items-center gap-4">
                                        {isMentee ? (
                                           <Link to={`/mentee/mentor/${comm.mentor?.id}`} className="h-14 w-14 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-lg block hover:opacity-80 transition-opacity">
                                              <img src={mentorDetails.picture || "http://localhost:5000/uploads/default.png"} alt="Mentor" className="h-full w-full object-cover" />
                                           </Link>
                                        ) : (
                                           <div className="h-14 w-14 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-lg block">
                                              <img src={mentorDetails.picture || "http://localhost:5000/uploads/default.png"} alt="Mentor" className="h-full w-full object-cover" />
                                           </div>
                                        )}
                                        <div>
                                           {isMentee ? (
                                              <Link to={`/mentee/mentor/${comm.mentor?.id}`} className="text-base font-black text-gray-900 hover:text-primary transition-colors block">
                                                 {mentorDetails.name || 'Anonymous Mentor'}
                                              </Link>
                                           ) : (
                                              <div className="text-base font-black text-gray-900 block">
                                                 {mentorDetails.name || 'Anonymous Mentor'}
                                              </div>
                                           )}
                                           <p className="text-sm font-semibold text-primary">{new Date(comm.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
                           <div className="inline-flex h-16 w-16 bg-yellow-50 text-yellow-500 rounded-full items-center justify-center mb-4 text-2xl">⭐</div>
                           <h3 className="text-xl font-bold text-gray-900">No Commendations</h3>
                           <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">Feedback and praise for {targetUser.name} will be displayed here once a mentor writes a commendation after a session.</p>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeTab === 'Achievements' && (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-xl shadow-sm">
                 <div className="inline-flex h-16 w-16 bg-purple-50 text-purple-500 rounded-full items-center justify-center mb-4 text-2xl">
                    🏆
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                 <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">Milestones and completed learning goals will be showcased here.</p>
              </div>
           )}

       </div>
      </div>
    </div>
  );
};

export default MenteeProfile;
