import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Edit2, X, Linkedin, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Plus, Trash2, Rocket, Sparkles, CalendarCheck, Info } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

const expertiseCategories = {
  "Ancient & Traditional Knowledge": ["African History", "Cultural Practices", "Storytelling", "Traditional Leadership", "Conflict Resolution", "Indigenous Knowledge", "Herbal Medicine"],
  "Agriculture & Environment": ["Crop Farming", "Livestock Farming", "Fish Farming", "Organic Farming", "Soil Management", "Irrigation Techniques", "Agro Processing"],
  "Technology & Digital Skills": ["Web Development", "Mobile App Development", "UI/UX Design", "Data Analysis", "Cybersecurity", "Artificial Intelligence", "Cloud Computing"],
  "Business & Finance": ["Entrepreneurship", "Business Strategy", "Marketing", "Sales", "Branding", "Financial Management", "Investing"],
  "Self Development & Life Skills": ["Personal Development", "Time Management", "Mental Health Awareness", "Relationship Advice", "Parenting Guidance", "Spiritual Guidance", "Discipline & Consistency"],
  "Creative & Vocational Skills": ["Graphic Design", "Video Editing", "Photography", "Content Creation", "Fashion Design", "Carpentry", "Electrical Work"]
};

const disciplinesOptions = ["Software Engineering", "Web Development", "Mobile App Development", "UI/UX Design", "Data Science", "Cybersecurity", "Artificial Intelligence", "Machine Learning", "Agronomy", "Animal Science", "Economics", "Accounting", "Marketing", "Business Administration", "Psychology", "Sociology", "History", "Political Science", "Education", "Public Health", "Architecture", "Mechanical Engineering", "Electrical Engineering", "Mass Communication", "Law"];

const industriesOptions = ["Agriculture", "Technology", "Education", "Healthcare", "Finance", "Creative Industry", "Construction", "Manufacturing", "Media & Communication", "Government & Public Service", "Retail & Commerce", "Transportation & Logistics", "Energy & Utilities", "Hospitality & Tourism", "Real Estate", "Telecommunications", "Legal Services", "Non-Profit & NGOs", "Sports & Recreation", "Entertainment", "Fashion & Beauty", "Food & Beverage", "Environmental Services", "Consulting", "E-commerce"];

const fluentInOptions = ["English", "Yoruba", "Hausa", "Igbo", "Pidgin", "French", "Arabic", "Spanish", "Swahili", "Portuguese"];

const MenteeOwnProfile = () => {
  const { user, checkAuthStatus } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeEditTab, setActiveEditTab] = useState('basic'); // 'basic', 'experience', 'social'
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
     name: '',
     email: '',
     bio: '',
     phone: '',
     linkedinUrl: '',
     occupation: '',
     expertise: [],
     fluentIn: [],
     industries: [],
     interests: [],
     disciplines: [],
     experience: '',
     education: '',
     startDate: '',
     endDate: ''
  });

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

  useEffect(() => {
     if (user) {
        setFormData({
           name: user.name || '',
           email: user.email || '',
           bio: user.bio || '',
           phone: user.phone || '',
           linkedinUrl: user.linkedinUrl || '',
           occupation: user.occupation || '',
           expertise: getArrayItems(user.expertise),
           fluentIn: getArrayItems(user.fluentIn),
           industries: getArrayItems(user.industries),
           interests: getArrayItems(user.interest || user.interests),
           disciplines: getArrayItems(user.discipline || user.disciplines),
           experience: Array.isArray(user.experience) ? user.experience : (function(){ try { return JSON.parse(user.experience || '[]'); } catch(e){ return []; } })(),
           education: Array.isArray(user.education) ? user.education : (function(){ try { return JSON.parse(user.education || '[]'); } catch(e){ return []; } })(),
        });
     }
  }, [user]);

  const handleChange = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (type, index, field, value) => {
     const newArray = [...formData[type]];
     newArray[index] = { ...newArray[index], [field]: value };
     setFormData({ ...formData, [type]: newArray });
  };

  const addArrayItem = (type) => {
     setFormData({ ...formData, [type]: [...formData[type], {}] });
  };

  const removeArrayItem = (type, index) => {
     const newArray = formData[type].filter((_, i) => i !== index);
     setFormData({ ...formData, [type]: newArray });
  };

  const handleImageUpload = async (e) => {
     const file = e.target.files[0];
     if (!file) return;

     const uploadData = new FormData();
     uploadData.append('picture', file);

     try {
       await api.patch('/user/me/picture', uploadData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
       await checkAuthStatus();
     } catch (err) {
       console.error(err);
       addToast('Failed to update profile picture.', 'error');
     }
  };

  const handleSave = async () => {
     setSaving(true);
     try {
       const payload = { ...formData };
       
       // Clean up array fields
       // Clean up array fields
       if (!Array.isArray(payload.expertise)) payload.expertise = getArrayItems(payload.expertise);
       if (!Array.isArray(payload.fluentIn)) payload.fluentIn = getArrayItems(payload.fluentIn);
       if (!Array.isArray(payload.industries)) payload.industries = getArrayItems(payload.industries);
       if (!Array.isArray(payload.interests)) payload.interests = getArrayItems(payload.interests);
       if (!Array.isArray(payload.disciplines)) payload.disciplines = getArrayItems(payload.disciplines);

       // Do not stringify arrays before sending via patch. Next.js/Axios handles this 
       // automatically and the backend stringifies it internally where needed.

       await api.patch('/user/me/update', payload);
       await checkAuthStatus();
       setIsEditing(false);
       addToast("Profile updated successfully!", "success");
     } catch (error) {
       console.error(error);
       addToast("Failed to update profile.", "error");
     } finally {
       setSaving(false);
     }
  };

  if (!user) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading profile...</div>;

  const tabs = [
     { id: 'Overview', label: 'Overview' },
     { id: 'Sessions', label: 'Mentorship History' },
     { id: 'Commendations', label: 'Commendations' },
     { id: 'Achievements', label: 'Achievements' },
  ];

  const bioText = user.bio || 'You have not provided a bio yet. Click Edit Profile to add one.';
  const shortBioLength = 250;
  const isBioLong = bioText.length > shortBioLength;
  const displayBio = isBioExpanded ? bioText : bioText.slice(0, shortBioLength);

  const experienceList = getArrayItems(user.experience);
  const educationList = getArrayItems(user.education);
  
  const displayInterests = getArrayItems(user.interest || user.interests);
  const displayExpertise = getArrayItems(user.expertise);
  const displayDisciplines = getArrayItems(user.discipline || user.disciplines);
  const displayIndustries = getArrayItems(user.industries);
  const displayLanguages = getArrayItems(user.fluentIn);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
         
       {/* Hero / Cover Photo Banner */}
       <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-700 to-indigo-900 rounded-none md:rounded-b-2xl relative overflow-hidden shadow-sm">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200" alt="Cover" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
          <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-lg font-bold backdrop-blur-md transition-colors flex items-center shadow-lg border border-white/30"
             >
                <Edit2 size={16} className="mr-2" /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
       </div>

       {/* Profile Header Block */}
       <div className="px-4 md:px-12 relative z-10 flex flex-col md:flex-row md:items-end gap-4 max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
             {/* Overlapping Avatar */}
             <div className="-mt-16 sm:-mt-20 relative group">
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-[6px] border-white bg-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                   {user.picture && user.picture !== "http://localhost:5000/uploads/default.png" ? (
                     <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                   ) : (
                     <span className="text-5xl font-bold text-primary bg-primary/10 w-full h-full flex items-center justify-center uppercase">
                        {user.name?.charAt(0) || 'M'}
                     </span>
                   )}
                </div>
                <label className="absolute inset-x-0 bottom-0 top-0 m-auto h-12 w-12 bg-black/50 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-black/70 transition-colors z-20">
                   <Camera size={20} />
                   <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
             </div>

             <div className="text-center sm:text-left pb-2 flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                   <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                   </div>
                </div>
                {user.occupation && (
                   <p className="text-sm font-semibold text-gray-700 mt-1">{user.occupation}</p>
                )}
                <p className="text-sm font-medium text-[#b22222] mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                   {user.occupation || user.role || 'Mentee'}
                </p>
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
          {activeTab === 'Overview' && !isEditing && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                   
                   {/* Bio */}
                   <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">About Me</h3>
                      <div className="text-gray-700 leading-relaxed text-base format-text">
                         <p>
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
                         {user.linkedinUrl && (
                            <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all font-bold text-sm">
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
                           )) : <span className="text-sm text-gray-400">None added</span>}
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
                           )) : <span className="text-sm text-gray-400">None added</span>}
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
                           )) : <span className="text-sm text-gray-400">None added</span>}
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
                           )) : <span className="text-sm text-gray-400">None added</span>}
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
                           )) : <span className="text-sm text-gray-400">None added</span>}
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
                            <p className="text-sm text-gray-400 italic">No experience listed.</p>
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
                            <p className="text-sm text-gray-400 italic">No education listed.</p>
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
                            <p className="text-3xl font-black mb-1">{user.impact?.minutesLearned || 0}+</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Minutes Learned</p>
                         </div>
                         <div>
                            <p className="text-3xl font-black mb-1 text-primary">{user.impact?.sessionsAttended || 0}</p>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Sessions Done</p>
                         </div>
                         <div className="col-span-2">
                            <p className="text-3xl font-black mb-1 text-green-400">{user.impact?.attendanceRate || 0}%</p>
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
                            )) : <div className="text-xs text-blue-300">New Learner</div>}
                         </div>
                      </div>
                   </div>
                   
                   {/* Personal Info Widget */}
                   <div className="border border-gray-100 rounded-2xl p-8 bg-white shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3 tracking-tight">Personal Details</h3>
                      
                      <div className="space-y-5">
                         <div>
                            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Email</p>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                         </div>
                         
                         <div className="pt-4 border-t border-gray-50">
                            {user.linkedinUrl ? (
                               <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                  <Linkedin size={16} className="mr-2" /> LinkedIn Profile
                               </a>
                            ) : (
                               <div className="flex items-center text-sm text-gray-400">
                                  <Linkedin size={16} className="mr-2" /> No LinkedIn connected
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Learning Goals Widget */}
                   <div className="border border-gray-100 bg-primary/5 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-base font-bold text-primary mb-2">Ready to level up?</h3>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">Book a session with a mentor aligned with your goals to accelerate your career.</p>
                      
                      <button onClick={() => window.location.href='/mentee/explore'} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors text-sm">
                         Find a Mentor
                      </button>
                   </div>
                   
                </div>
             </div>
          )}

          {activeTab === 'Sessions' && !isEditing && (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-xl shadow-sm">
                 <div className="inline-flex h-16 w-16 bg-blue-50 text-blue-500 rounded-full items-center justify-center mb-4 text-2xl">
                    🗓️
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Mentorship History</h3>
                 <p className="text-gray-500 max-w-md mx-auto mt-2">Your past and upcoming sessions with mentors will appear here.</p>
                 <button onClick={() => window.location.href='/mentee/bookings'} className="mt-6 font-bold text-primary hover:underline">
                    View Bookings
                 </button>
              </div>
           )}

           {activeTab === 'Commendations' && !isEditing && (
              <div className="bg-white border text-gray-500 border-gray-100 rounded-3xl shadow-sm p-8 sm:p-12 space-y-12">
                 {user.commendations && user.commendations.length > 0 ? (
                    <div className="space-y-6">
                       {user.commendations.map((comm) => {
                          const mentorDetails = comm.mentor?.user || {};
                          return (
                             <div key={comm.id} className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                                
                                <p className="text-lg text-gray-800 leading-relaxed font-medium mb-10 italic">
                                   "{comm.commendation}"
                                </p>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                   <div className="flex items-center gap-4">
                                      <div className="h-14 w-14 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-lg block hover:opacity-80 transition-opacity">
                                         <Link to={`/mentee/mentor/${comm.mentor?.id}`} className="block h-full w-full">
                                            <img src={mentorDetails.picture || "http://localhost:5000/uploads/default.png"} alt="Mentor" className="h-full w-full object-cover" />
                                         </Link>
                                      </div>
                                      <div>
                                         <Link to={`/mentee/mentor/${comm.mentor?.id}`} className="text-base font-black text-gray-900 hover:text-primary transition-colors block">
                                            {mentorDetails.name || 'Anonymous Mentor'}
                                         </Link>
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
                       <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">Feedback and praise from your mentors will be displayed here.</p>
                    </div>
                 )}
              </div>
           )}

           {activeTab === 'Achievements' && !isEditing && (
              <div className="bg-white border text-gray-500 border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm max-w-6xl mx-auto">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center">
                       <Sparkles size={24} className="fill-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Your Credentials</h3>
                 </div>

                 {user.achievements && user.achievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {user.achievements.map((ach) => (
                          <div key={ach.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:items-start text-center sm:text-left gap-4 hover:border-primary/50 hover:shadow-lg transition-all group">
                             <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform mb-2 sm:mb-0">
                                {ach.icon || '🏆'}
                             </div>
                             <div className="flex flex-col justify-center items-center sm:items-start">
                                <h4 className="font-bold text-gray-900 text-lg leading-tight">{ach.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{ach.description}</p>
                                <span className="text-[10px] font-bold text-primary mt-3 uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md w-fit">Earned {new Date(ach.earned_at).toLocaleDateString()}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                       <div className="text-5xl mx-auto mb-4 opacity-50">🏆</div>
                       <h4 className="text-lg font-bold text-gray-900 mb-2">No achievements yet</h4>
                       <p className="text-gray-500 text-sm max-w-sm mx-auto">Milestones and completed learning goals will be showcased here.</p>
                    </div>
                 )}
              </div>
           )}

          {/* Edit Form Modal */}
          {isEditing && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm pb-24 sm:pb-6">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[80vh] overflow-hidden"
               >
                  <div className="flex justify-between items-start px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b-0 bg-white shrink-0">
                     <h2 className="text-[#b22222] text-xl sm:text-[22px] font-bold tracking-tight pr-4">Update your profile details</h2>
                     <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors shrink-0">
                        <X size={18} strokeWidth={2.5} />
                     </button>
                  </div>

                  <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 bg-white px-5 sm:px-8 gap-6 sm:gap-8 shrink-0">
                     {['basic', 'experience', 'social'].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveEditTab(tab)}
                           className={`pb-3 text-[15px] font-bold relative transition-colors ${
                              activeEditTab === tab ? 'text-[#b22222]' : 'text-gray-500 hover:text-gray-700'
                           }`}
                        >
                           {tab === 'basic' ? 'Basic Info' : tab === 'experience' ? 'Experience' : 'Social Links'}
                           {activeEditTab === tab && (
                              <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#b22222] rounded-t-sm" />
                           )}
                        </button>
                     ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white space-y-6">
                     {activeEditTab === 'basic' && (
                        <div className="space-y-5">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div>
                                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">First Name & Last Name</label>
                                 <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm py-2.5 px-3 focus:ring-primary focus:border-primary" />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Role / Occupation</label>
                                 <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm py-2.5 px-3 focus:ring-primary focus:border-primary" />
                              </div>
                           </div>

                           <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Bio</label>
                              <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm py-2.5 px-3 focus:ring-primary focus:border-primary resize-none"></textarea>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <MultiSelectDropdown label="Interests" options={expertiseCategories} value={formData.interests} onChange={(v) => setFormData({...formData, interests: v})} max={5} />
                              <MultiSelectDropdown label="Disciplines" options={disciplinesOptions} value={formData.disciplines} onChange={(v) => setFormData({...formData, disciplines: v})} max={3} />
                              <MultiSelectDropdown label="Expertise Goals" options={expertiseCategories} value={formData.expertise} onChange={(v) => setFormData({...formData, expertise: v})} max={5} />
                              <MultiSelectDropdown label="Fluent Languages" options={fluentInOptions} value={formData.fluentIn} onChange={(v) => setFormData({...formData, fluentIn: v})} max={5} />
                              <MultiSelectDropdown label="Industries" options={industriesOptions} value={formData.industries} onChange={(v) => setFormData({...formData, industries: v})} max={3} />
                           </div>
                        </div>
                     )}

                     {activeEditTab === 'experience' && (
                        <div className="space-y-8">
                           {/* Experience */}
                           <div>
                              <div className="flex justify-between items-center mb-4">
                                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Work Experience</h3>
                                 <button type="button" onClick={() => addArrayItem('experience')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                    + Add Item
                                 </button>
                              </div>
                              <div className="space-y-4">
                                 {formData.experience.map((exp, index) => (
                                    <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50 relative group">
                                       <button type="button" onClick={() => removeArrayItem('experience', index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                                          <Trash2 size={16} />
                                       </button>
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                                          <div>
                                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Company</label>
                                             <input type="text" value={exp.company || ''} onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)} className="w-full text-sm rounded-md border-gray-200" />
                                          </div>
                                          <div>
                                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                                             <input type="text" value={exp.title || ''} onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)} className="w-full text-sm rounded-md border-gray-200" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 col-span-1 sm:col-span-2">
                                             <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Start Date</label>
                                                <input type="month" value={exp.startDate || ''} onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)} className="w-full text-sm rounded-md border-gray-200" />
                                             </div>
                                             <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">End Date</label>
                                                <input type="month" value={exp.endDate || ''} onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)} className="w-full text-sm rounded-md border-gray-200" placeholder="Present" />
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                                 {formData.experience.length === 0 && <p className="text-xs text-gray-400 italic">No experience added.</p>}
                              </div>
                           </div>

                           {/* Education */}
                           <div className="pt-4 border-t border-gray-100">
                              <div className="flex justify-between items-center mb-4">
                                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Education</h3>
                                 <button type="button" onClick={() => addArrayItem('education')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                    + Add Item
                                 </button>
                              </div>
                              <div className="space-y-4">
                                 {formData.education.map((edu, index) => (
                                    <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50 relative group">
                                       <button type="button" onClick={() => removeArrayItem('education', index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                                          <Trash2 size={16} />
                                       </button>
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                                          <div>
                                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Institution</label>
                                             <input type="text" value={edu.institution || ''} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} className="w-full text-sm rounded-md border-gray-200" />
                                          </div>
                                          <div>
                                             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Degree</label>
                                             <input type="text" value={edu.degree || ''} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} className="w-full text-sm rounded-md border-gray-200" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 col-span-1 sm:col-span-2">
                                              <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Start Date</label>
                                                <input type="month" value={edu.startDate || ''} onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)} className="w-full text-sm rounded-md border-gray-200" />
                                             </div>
                                             <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">End Date</label>
                                                <input type="month" value={edu.endDate || ''} onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)} className="w-full text-sm rounded-md border-gray-200" placeholder="Present" />
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                                 {formData.education.length === 0 && <p className="text-xs text-gray-400 italic">No education added.</p>}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeEditTab === 'social' && (
                        <div className="space-y-5">
                           <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">LinkedIn Profile</label>
                              <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Linkedin size={16} className="text-gray-400" />
                                 </div>
                                 <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm py-2.5 pl-9 pr-3 focus:ring-primary focus:border-primary" placeholder="https://linkedin.com/in/username" />
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Phone Number</label>
                              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm py-2.5 px-3 focus:ring-primary focus:border-primary" placeholder="+1234567890" />
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
                     <button onClick={() => setIsEditing(false)} disabled={saving} className="px-5 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm">
                        Cancel
                     </button>
                     <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#b22222] text-white rounded-lg font-bold hover:bg-[#8e1919] transition-all shadow-sm text-sm">
                        {saving ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
               </motion.div>
             </div>
          )}

       </div>
      </div>
    </div>
  );
};

export default MenteeOwnProfile;
