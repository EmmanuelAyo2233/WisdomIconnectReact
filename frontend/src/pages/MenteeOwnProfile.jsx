import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Camera, Edit2, X, Linkedin, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Plus, Trash2, Rocket, Sparkles, CalendarCheck, Info } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const MenteeOwnProfile = () => {
  const { user, checkAuthStatus } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
     name: '',
     email: '',
     bio: '',
     phone: '',
     linkedinUrl: '',
     expertise: '',
     fluentIn: '',
     industries: '',
     interests: '',
     experience: '',
     education: '',
     startDate: '',
     endDate: ''
  });

  useEffect(() => {
     if (user) {
        setFormData({
           name: user.name || '',
           email: user.email || '',
           bio: user.bio || '',
           phone: user.phone || '',
           linkedinUrl: user.linkedinUrl || '',
           expertise: (user.expertise || []).join(', '),
           fluentIn: (user.fluentIn || []).join(', '),
           industries: (user.industries || []).join(', '),
           interests: (user.interest || user.interests || []).join(', '),
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
       if (payload.expertise) payload.expertise = payload.expertise.split(',').map(s => s.trim()).filter(Boolean);
       else payload.expertise = [];
       
       if (payload.fluentIn) payload.fluentIn = payload.fluentIn.split(',').map(s => s.trim()).filter(Boolean);
       else payload.fluentIn = [];
       
       if (payload.industries) payload.industries = payload.industries.split(',').map(s => s.trim()).filter(Boolean);
       else payload.industries = [];
       
       if (payload.interests) payload.interests = payload.interests.split(',').map(s => s.trim()).filter(Boolean);
       else payload.interests = [];

       try { payload.experience = JSON.stringify(payload.experience); } catch (e) { payload.experience = '[]'; }
       try { payload.education = JSON.stringify(payload.education); } catch (e) { payload.education = '[]'; }

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
  ];

  const bioText = user.bio || 'You have not provided a bio yet. Click Edit Profile to add one.';
  const shortBioLength = 250;
  const isBioLong = bioText.length > shortBioLength;
  const displayBio = isBioExpanded ? bioText : bioText.slice(0, shortBioLength);

  const getArrayItems = (items) => {
     if (Array.isArray(items)) return items;
     if (typeof items === 'string') {
        try { return JSON.parse(items); } catch (e) { return [items].filter(Boolean); }
     }
     return [];
  };

  const experienceList = getArrayItems(user.experience);
  const educationList = getArrayItems(user.education);

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
                   
                   <div className={`px-4 py-1.5 rounded-full text-white text-xs font-bold leading-tight text-center shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20 uppercase tracking-wider`}>
                      {user.userType}
                   </div>
                </div>
                
                <p className="text-sm font-medium text-gray-500 mt-2 flex items-center justify-center sm:justify-start gap-1">
                   <MapPin size={14}/> {user.countryCode || 'Earth'} • Joined {user.createdAt ? new Date(user.createdAt).getFullYear() : 'Recently'}
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
                   <div className="text-gray-700 leading-relaxed text-sm format-text bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">About Me</h3>
                      <p>
                         {displayBio}
                         {!isBioExpanded && isBioLong && <span>...</span>}
                      </p>
                      {isBioLong && (
                         <button 
                            className="text-primary font-semibold mt-2 hover:underline focus:outline-none"
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                         >
                            {isBioExpanded ? 'Read less' : 'Read more'}
                         </button>
                      )}
                   </div>

                   {/* Tags Block */}
                   <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] grid gap-6 grid-cols-1 sm:grid-cols-12 items-center">
                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Expertise Goals:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {user.expertise && user.expertise.length > 0 ? user.expertise.map((exp, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 transition-colors text-xs font-semibold rounded-full border border-blue-100">
                               {exp}
                            </span>
                         )) : <span className="text-sm text-gray-400">Not specified</span>}
                      </div>

                      <div className="col-span-full h-px bg-gray-100"></div>

                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Industries:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {user.industries && user.industries.length > 0 ? user.industries.map((ind, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 transition-colors text-xs font-semibold rounded-full border border-purple-100">
                               {ind}
                            </span>
                         )) : <span className="text-sm text-gray-400">Not specified</span>}
                      </div>

                      <div className="col-span-full h-px bg-gray-100"></div>

                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Interests:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {user.interest && user.interest.length > 0 ? user.interest.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 transition-colors text-xs font-semibold rounded-full border border-green-100">
                               {item}
                            </span>
                         )) : <span className="text-sm text-gray-400">Not specified</span>}
                      </div>
                      
                      <div className="col-span-full h-px bg-gray-100"></div>

                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Fluent In:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {user.fluentIn && user.fluentIn.length > 0 ? user.fluentIn.map((lang, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 transition-colors text-xs font-semibold rounded-full border border-gray-200">
                               {lang}
                            </span>
                         )) : <span className="text-sm text-gray-400">Not specified</span>}
                      </div>
                   </div>

                   {/* Experience Box */}
                   <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                         <h3 className="text-lg font-bold text-gray-900">Experience</h3>
                         <span className="bg-gray-100 text-gray-600 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {experienceList.length}
                         </span>
                      </div>
                      
                      <div className="space-y-6">
                         {experienceList.length > 0 ? experienceList.map((exp, i) => (
                            <div key={i} className="flex gap-4 group">
                               <div className="h-12 w-12 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                  <Briefcase size={22} className="text-gray-400 group-hover:text-primary transition-colors" />
                               </div>
                               <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                     <div>
                                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{typeof exp === 'object' ? exp.title || exp.company : exp}</h4>
                                        <p className="text-xs font-medium text-gray-500 mt-1">{typeof exp === 'object' ? exp.company : ''}</p>
                                     </div>
                                     <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                        {typeof exp === 'object' && exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Present'}` : ''}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                               <p className="text-sm text-gray-500">No experience listed.</p>
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Education Box */}
                   <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                         <h3 className="text-lg font-bold text-gray-900">Education</h3>
                         <span className="bg-gray-100 text-gray-600 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {educationList.length}
                         </span>
                      </div>
                      
                      <div className="space-y-6">
                         {educationList.length > 0 ? educationList.map((edu, i) => (
                            <div key={i} className="flex gap-4 group">
                               <div className="h-12 w-12 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                                  <GraduationCap size={22} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                               </div>
                               <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                     <div>
                                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{typeof edu === 'object' ? edu.degree || edu.institution : edu}</h4>
                                        <p className="text-xs font-medium text-gray-500 mt-1">{typeof edu === 'object' ? edu.institution : ''}</p>
                                     </div>
                                     <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                        {typeof edu === 'object' && edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : ''}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                               <p className="text-sm text-gray-500">No education listed.</p>
                            </div>
                         )}
                      </div>
                   </div>

                </div>

                {/* Right Column (Widgets) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                   {/* Community Statistics Widget */}
                   <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                      <h3 className="text-base font-bold text-[#0A2640] mb-6">Community statistics</h3>
                      
                      <div className="grid grid-cols-2 gap-y-6 gap-x-2 lg:gap-x-4">
                         {/* Total learning time */}
                         <div className="flex items-center gap-2">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#E8F8FC] flex items-center justify-center shrink-0">
                               <Rocket size={20} className="text-[#0ea5e9]" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                               <p className="font-bold text-[#0A2640] text-sm">0 mins</p>
                               <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Total learning time</p>
                            </div>
                         </div>
                         
                         {/* Sessions completed */}
                         <div className="flex items-center gap-2">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#FFF0F2] flex items-center justify-center shrink-0">
                               <Sparkles size={20} className="text-[#f43f5e]" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                               <p className="font-bold text-[#0A2640] text-sm">0</p>
                               <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Sessions completed</p>
                            </div>
                         </div>
                         
                         {/* Average attendance */}
                         <div className="flex items-center gap-2 col-span-2">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#FFF6E5] flex items-center justify-center shrink-0">
                               <CalendarCheck size={20} className="text-[#f59e0b]" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                               <p className="font-bold text-[#0A2640] text-sm">0%</p>
                               <div className="flex items-center gap-1">
                                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Average attendance</p>
                                  <Info size={12} className="text-gray-400 cursor-help" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   {/* Personal Info Widget */}
                   <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                      <h3 className="text-base font-bold text-gray-900 mb-6 border-b border-gray-50 pb-3">Personal Details</h3>
                      
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
                   <div className="border border-gray-100 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-base font-bold text-indigo-900 mb-2">Ready to level up?</h3>
                      <p className="text-xs text-indigo-700/80 mb-6 leading-relaxed">Book a session with a mentor aligned with your goals to accelerate your career.</p>
                      
                      <button onClick={() => window.location.href='/mentee/explore'} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors text-sm">
                         Find a Mentor
                      </button>
                   </div>
                   
                </div>
             </div>
          )}

          {activeTab === 'Sessions' && !isEditing && (
             <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="inline-flex h-20 w-20 bg-blue-50 text-blue-500 rounded-full items-center justify-center mb-4">
                   🗓️
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mentorship History</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Your past and upcoming sessions with mentors will appear here.</p>
                <button onClick={() => window.location.href='/mentee/bookings'} className="mt-6 font-bold text-primary hover:underline">
                   View Bookings
                </button>
             </div>
          )}

          {/* Edit Form */}
          {isEditing && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-4xl mx-auto"
             >
                <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-8">
                   <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                   <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-full transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Basic Info</h3>
                      
                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Full Name</label>
                         <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. John Doe" />
                      </div>
                      
                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Phone</label>
                         <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. +1 234 567 8900" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">LinkedIn URL</label>
                         <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="https://linkedin.com/in/username" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Bio</label>
                         <textarea name="bio" rows={5} value={formData.bio} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200 resize-none py-3" placeholder="Tell us about yourself, your goals, and what you're looking to learn..."></textarea>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Mentorship Tags (Comma separated)</h3>
                      
                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Expertise Goals</label>
                         <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. Frontend Dev, UI/UX" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Industries of Interest</label>
                         <input type="text" name="industries" value={formData.industries} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. Fintech, E-commerce, AI" />
                      </div>
                      
                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">General Interests</label>
                         <input type="text" name="interests" value={formData.interests} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. Open Source, Startups" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Fluent In</label>
                         <input type="text" name="fluentIn" value={formData.fluentIn} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. English, French, Yoruba" />
                      </div>
                   </div>

                    <div className="col-span-full space-y-8 mt-4">
                       <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Background Info</h3>
                       
                       <div className="space-y-4">
                          <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Experience</label>
                             <button type="button" onClick={() => addArrayItem('experience')} className="text-xs font-bold flex items-center text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                <Plus size={14} className="mr-1" /> Add Experience
                             </button>
                          </div>
                          
                          {formData.experience.map((exp, index) => (
                             <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl relative group">
                                <button type="button" onClick={() => removeArrayItem('experience', index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                   <Trash2 size={14} />
                                </button>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Company</label>
                                   <input type="text" value={exp.company || ''} onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" placeholder="e.g. Google" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                                   <input type="text" value={exp.title || ''} onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" placeholder="e.g. Senior Developer" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Start Date</label>
                                   <input type="month" value={exp.startDate || ''} onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">End Date</label>
                                   <input type="month" value={exp.endDate || ''} onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" placeholder="Leave blank if Present" />
                                </div>
                             </div>
                          ))}
                          {formData.experience.length === 0 && <p className="text-sm text-gray-400 italic">No experience added yet.</p>}
                       </div>

                       <div className="space-y-4 pt-4 border-t border-gray-50">
                          <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Education</label>
                             <button type="button" onClick={() => addArrayItem('education')} className="text-xs font-bold flex items-center text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                <Plus size={14} className="mr-1" /> Add Education
                             </button>
                          </div>
                          
                          {formData.education.map((edu, index) => (
                             <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl relative group">
                                <button type="button" onClick={() => removeArrayItem('education', index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                   <Trash2 size={14} />
                                </button>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Institution</label>
                                   <input type="text" value={edu.institution || ''} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" placeholder="e.g. Stanford University" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Degree</label>
                                   <input type="text" value={edu.degree || ''} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" placeholder="e.g. B.S. Computer Science" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Start Date</label>
                                   <input type="month" value={edu.startDate || ''} onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">End Date</label>
                                   <input type="month" value={edu.endDate || ''} onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)} className="input-field w-full bg-white border-gray-200 text-sm py-2" placeholder="Leave blank if Present" />
                                </div>
                             </div>
                          ))}
                          {formData.education.length === 0 && <p className="text-sm text-gray-400 italic">No education history added yet.</p>}
                       </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                   <button onClick={() => setIsEditing(false)} disabled={saving} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                      Cancel
                   </button>
                   <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 flex items-center">
                      {saving ? 'Saving...' : 'Save Profile'}
                   </button>
                </div>
             </motion.div>
          )}

       </div>
      </div>
    </div>
  );
};

export default MenteeOwnProfile;
