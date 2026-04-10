import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, MapPin, Briefcase, Link as LinkIcon, Edit2, CheckCircle2, User } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, checkAuthStatus } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
     firstName: user?.firstName || '',
     lastName: user?.lastName || '',
     bio: user?.bio || '',
     expertise: user?.expertise?.join(', ') || '',
     experience: user?.experience || '',
     languages: user?.languages?.join(', ') || '',
     hourlyRate: user?.hourlyRate || '',
     linkedin: ''
  });

  const handleChange = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
     setLoading(true);
     try {
       const endpoint = user.role === 'mentor' ? '/mentors/profile' : '/mentees/profile';
       // Clean up array fields
       const payload = { ...formData };
       if (payload.expertise) payload.expertise = payload.expertise.split(',').map(s => s.trim());
       if (payload.languages) payload.languages = payload.languages.split(',').map(s => s.trim());
       
       const res = await api.put(endpoint, payload);
       await checkAuthStatus(); // refresh context
       addToast("Profile updated successfully!", "success");
       setIsEditing(false);
     } catch (error) {
       console.error(error);
       addToast("Failed to update profile.", "error");
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
         <div className="h-32 bg-gradient-to-r from-primary/80 to-primary-dark"></div>
         <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
         >
            <Edit2 size={18} />
         </button>

         <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 gap-6">
               <div className="relative group">
                  <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center text-4xl font-bold text-primary bg-primary/10">
                     {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                     ) : (
                        user?.firstName?.charAt(0) + user?.lastName?.charAt(0)
                     )}
                  </div>
                  {isEditing && (
                     <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} />
                     </button>
                  )}
               </div>

               <div className="text-center sm:text-left flex-1 pb-1">
                  {isEditing ? (
                     <div className="flex space-x-3 mb-2">
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-field py-1.5 text-lg font-bold w-1/2" placeholder="First Name" />
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field py-1.5 text-lg font-bold w-1/2" placeholder="Last Name" />
                     </div>
                  ) : (
                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-start">
                        {user?.firstName} {user?.lastName}
                        {user?.role === 'mentor' && user?.isVerified && <CheckCircle2 size={20} className="text-blue-500 ml-2" />}
                     </h1>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-600">
                     <span className="flex items-center capitalize bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                        {user?.role}
                     </span>
                     {user?.role === 'mentor' && (
                        <span className={`flex items-center capitalize px-2.5 py-0.5 rounded-full font-bold shadow-sm border ${
                           user?.mentorLevel === 'gold' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                           user?.mentorLevel === 'verified' ? 'bg-green-100 text-green-800 border-green-300' :
                           'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                           ★ {user?.mentorLevel || 'Starter'} Mentor
                        </span>
                     )}
                     <span className="flex items-center"><MapPin size={16} className="mr-1 text-gray-400" /> Remote, Worldwide</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* Main Details */}
         <div className="md:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
               <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User size={20} className="mr-2 text-primary" /> About Me
               </h2>
               
               {isEditing ? (
                  <textarea 
                     name="bio"
                     rows="5" 
                     className="input-field resize-none" 
                     placeholder="Share significant milestones, what you enjoy doing, and what brings you to Wisdom Connect..."
                     value={formData.bio}
                     onChange={handleChange}
                  ></textarea>
               ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                     {user?.bio || "You haven't added a bio yet. Click the edit button to tell the community about yourself."}
                  </p>
               )}
            </section>

            {user?.role === 'mentor' && (
               <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                     <Briefcase size={20} className="mr-2 text-primary" /> Professional Details
                  </h2>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Expertise (comma separated)</label>
                        {isEditing ? (
                           <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} className="input-field" placeholder="e.g. Software Engineering, Product Management" />
                        ) : (
                           <div className="flex flex-wrap gap-2">
                              {user?.expertise?.length > 0 ? user.expertise.map((exp, i) => (
                                 <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">{exp}</span>
                              )) : <span className="text-gray-500 text-sm">Not specified</span>}
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-500 mb-1">Years of Experience</label>
                           {isEditing ? (
                              <input type="text" name="experience" value={formData.experience} onChange={handleChange} className="input-field" placeholder="e.g. 10 years" />
                           ) : (
                              <p className="text-gray-900 font-medium">{user?.experience || 'Not specified'}</p>
                           )}
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-500 mb-1">Hourly Rate ($)</label>
                           {isEditing ? (
                              <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="input-field" placeholder="50" />
                           ) : (
                              <p className="text-gray-900 font-medium">${user?.hourlyRate || '0.00'}/hr</p>
                           )}
                        </div>
                     </div>
                  </div>
               </section>
            )}
         </div>

         {/* Sidebar Stats / Info */}
         <div className="space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 className="font-bold text-gray-900 mb-4">Account Information</h3>
               
               <div className="space-y-4">
                  <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                     <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Languages</p>
                     {isEditing ? (
                        <input type="text" name="languages" value={formData.languages} onChange={handleChange} className="input-field py-1.5 text-sm" placeholder="English, French" />
                     ) : (
                        <p className="text-sm font-medium text-gray-900">{user?.languages?.join(', ') || 'English'}</p>
                     )}
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Social</p>
                     {isEditing ? (
                        <div className="flex relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LinkIcon size={14} /></span>
                           <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="input-field pl-8 py-1.5 text-sm" placeholder="linkedin.com/in/username" />
                        </div>
                     ) : (
                        <a href="#" className="flex items-center text-sm font-medium text-primary hover:underline group">
                           <LinkIcon size={14} className="mr-1.5 group-hover:text-primary-dark" /> LinkedIn Profile
                        </a>
                     )}
                  </div>
               </div>
            </section>

            {isEditing && (
               <div className="bg-white rounded-2xl shadow-lg border border-primary/20 p-6 sticky top-20">
                  <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Unsaved Changes</h3>
                  <p className="text-sm text-gray-500 mb-6">You have modified your profile information. Don't forget to save your changes.</p>
                  <div className="flex flex-col gap-3">
                     <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="btn-primary w-full"
                     >
                        {loading ? 'Saving...' : 'Save All Changes'}
                     </button>
                     <button 
                        onClick={() => setIsEditing(false)} 
                        className="btn-secondary w-full"
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default Profile;
