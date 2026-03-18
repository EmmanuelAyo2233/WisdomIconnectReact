import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Camera, Edit2, X, Linkedin, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Star, Calendar, Heart, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const MentorOwnProfile = () => {
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
     discipline: '',
     experience: '',
     education: '',
     experienceDescription: '',
     yearsOfExperience: 0,
     role: ''
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
           discipline: (user.discipline || []).join(', '),
           experience: Array.isArray(user.experience) ? user.experience : (function(){ try { return JSON.parse(user.experience || '[]'); } catch(e){ return []; } })(),
           education: Array.isArray(user.education) ? user.education : (function(){ try { return JSON.parse(user.education || '[]'); } catch(e){ return []; } })(),
           experienceDescription: user.experienceDescription || '',
           yearsOfExperience: user.yearsOfExperience || 0,
           role: user.role || ''
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

  const handleSave = async () => {
     setSaving(true);
     try {
       const payload = { ...formData };
       
       // Clean up array fields
       if (payload.expertise) payload.expertise = payload.expertise.split(',').map(s => s.trim()).filter(Boolean);
       else payload.expertise = [];
       
       if (payload.fluentIn) payload.fluentIn = payload.fluentIn.split(',').map(s => s.trim()).filter(Boolean);
       else payload.fluentIn = [];
       
       if (payload.discipline) payload.discipline = payload.discipline.split(',').map(s => s.trim()).filter(Boolean);
       else payload.discipline = [];

       // Format experience/education to stringified JSON for backend
       try { payload.experience = JSON.stringify(payload.experience); } catch (e) { payload.experience = '[]'; }
       try { payload.education = JSON.stringify(payload.education); } catch (e) { payload.education = '[]'; }

       await api.patch('/user/me/update', payload);
       await checkAuthStatus();
       addToast("Profile updated successfully!", "success");
       setIsEditing(false);
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
     { id: 'Reviews', label: `Reviews ${user.reviews || 0}` },
     { id: 'Achievements', label: 'Achievements' },
     { id: 'GroupSessions', label: `Group Sessions ${user.groupSessions || 0}` }
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
       <div className="h-48 md:h-64 w-full bg-[#2e5d32] rounded-none md:rounded-b-2xl relative overflow-hidden shadow-sm">
          <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200" alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
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
                {isEditing && (
                     <button className="absolute inset-x-0 bottom-0 top-0 m-auto h-12 w-12 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} />
                     </button>
                )}
             </div>

             <div className="text-center sm:text-left pb-2 flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                   <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                      <span className="text-xs font-bold text-gray-500 uppercase">{user.countryCode || 'NG'}</span>
                   </div>
                   
                   {/* Glowing Available / Unavailable Bubble */}
                   <div className={`flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full text-white text-xs font-bold leading-tight text-center shadow-2xl transition-all ${
                      user.isOnline !== false // Assuming default online if undefined
                         ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/50 border-2 border-white' 
                         : 'bg-gradient-to-br from-[#ff5e4d] to-[#ff3b28] shadow-red-500/50 border-2 border-white'
                   }`}>
                      {user.isOnline !== false ? 'Available' : 'Unavailable'}
                   </div>
                </div>
                
                <p className="text-sm font-medium text-gray-600 mt-2 capitalize">
                   {user.expertise && user.expertise.length > 0 ? user.expertise.join(', ') : 'Professional Mentor'}
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
                      {user.linkedinUrl && (
                         <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center mt-4 bg-blue-50 text-blue-600 h-8 w-8 rounded-md hover:bg-blue-100 transition-colors">
                            <Linkedin size={16} />
                         </a>
                      )}
                   </div>

                   {/* Tags Block */}
                   <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] grid gap-6 grid-cols-1 sm:grid-cols-12 items-center">
                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Expertise:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {user.expertise && user.expertise.length > 0 ? user.expertise.map((exp, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                               {exp}
                            </span>
                         )) : <span className="text-sm text-gray-400">None added</span>}
                      </div>

                      <div className="col-span-full h-px bg-gray-100"></div>

                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Disciplines:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {user.discipline && user.discipline.length > 0 ? user.discipline.map((disc, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                               {disc}
                            </span>
                         )) : <span className="text-sm text-gray-400">None added</span>}
                      </div>

                      <div className="col-span-full h-px bg-gray-100"></div>

                      <div className="sm:col-span-3 text-sm font-semibold text-gray-700">Fluent In:</div>
                      <div className="sm:col-span-9 flex flex-wrap gap-2">
                         {user.fluentIn && user.fluentIn.length > 0 ? user.fluentIn.map((lang, i) => (
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
                               {experienceList.length}
                            </span>
                         </div>
                      </div>
                      
                      <div className="space-y-6">
                         {experienceList.length > 0 ? experienceList.map((exp, i) => (
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
                               {educationList.length}
                            </span>
                         </div>
                      </div>
                      
                      <div className="space-y-6">
                         {educationList.length > 0 ? educationList.map((edu, i) => (
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
                <div className="lg:col-span-4 flex flex-col gap-6">
                   
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
                               <p className="text-sm font-bold text-gray-900">{(user.sessions || 0) * 60} mins</p>
                               <p className="text-[10px] text-gray-500">Session Time</p>
                            </div>
                         </div>
                         
                         <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                               <Star size={14} className="fill-blue-500" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-900">{user.sessions || 0}</p>
                               <p className="text-[10px] text-gray-500">Sessions Completed</p>
                            </div>
                         </div>

                         <div className="flex items-start gap-3 mt-4">
                            <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                               <Calendar size={14} />
                            </div>
                            <div>
                               <div className="flex items-center gap-1">
                                  <p className="text-sm font-bold text-gray-900">{user.attendance || '0%'}</p>
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
                                  <p className="text-sm font-bold text-gray-900">{(user.rating || 0) * 10 + (user.reviews || 0)}</p>
                               </div>
                               <p className="text-[10px] text-gray-500">Impact Score</p>
                            </div>
                         </div>
                      </div>

                      <div className="h-px bg-gray-100 my-6"></div>

                      <h4 className="text-sm font-bold text-gray-900 mb-1">Top Areas of Impact</h4>
                      <p className="text-[10px] text-gray-500 mb-4">Highly discussed topics during sessions</p>
                      
                      <div className="flex flex-col gap-2">
                         {user.expertise && user.expertise.length > 0 ? user.expertise.slice(0, 3).map((exp, i) => (
                            <div key={i} className="bg-purple-50 text-purple-700 text-xs font-semibold py-2 px-3 rounded-md truncate">
                               {exp}
                            </div>
                         )) : <div className="text-xs text-gray-400">No data yet</div>}
                      </div>
                   </div>
                   
                </div>
             </div>
          )}

          {activeTab === 'Reviews' && !isEditing && (
             <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="inline-flex h-20 w-20 bg-blue-50 text-blue-500 rounded-full items-center justify-center mb-4">
                   ⭐️
                </div>
                <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Mentee reviews will appear here once you've completed sessions.</p>
             </div>
          )}

          {activeTab === 'Achievements' && !isEditing && (
             <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="inline-flex h-20 w-20 bg-blue-50 text-blue-500 rounded-full items-center justify-center mb-4">
                   🏆
                </div>
                <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Badges, certificates, and recognition you have earned will appear here.</p>
             </div>
          )}

          {activeTab === 'GroupSessions' && !isEditing && (
             <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="inline-flex h-20 w-20 bg-green-50 text-green-500 rounded-full items-center justify-center mb-4">
                   👥
                </div>
                <h3 className="text-xl font-bold text-gray-900">Group Sessions</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Upcoming live workshops and cohort-based mentorship you host will appear here.</p>
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
                         <textarea name="bio" rows={5} value={formData.bio} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200 resize-none py-3" placeholder="Tell us about yourself, your background, and what you mentor on..."></textarea>
                      </div>

                      <div className="flex gap-4">
                         <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Years of Exp</label>
                            <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. 5" />
                         </div>
                         <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Role/Title</label>
                            <input type="text" name="role" value={formData.role} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. Senior Software Engineer" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Mentorship Tags (Comma separated)</h3>
                      
                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Expertise Fields</label>
                         <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. Frontend Dev, System Design" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Disciplines</label>
                         <input type="text" name="discipline" value={formData.discipline} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. Computer Science, Mentorship" />
                      </div>
                      
                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Fluent In (Languages)</label>
                         <input type="text" name="fluentIn" value={formData.fluentIn} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200" placeholder="e.g. English, French, Yoruba" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Experience Summary</label>
                         <textarea name="experienceDescription" rows={3} value={formData.experienceDescription} onChange={handleChange} className="input-field w-full bg-gray-50 border-gray-200 resize-none py-3" placeholder="Briefly describe your overall career journey..."></textarea>
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

export default MentorOwnProfile;
