import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Briefcase, GraduationCap, Star, User } from 'lucide-react';

const ViewProfileModal = ({ profile, isOpen, onClose }) => {
   if (!isOpen || !profile) return null;
   
   const userLevel = profile.user || profile.User || profile;
   const detailsLevel = profile;
   const name = userLevel.name || userLevel.firstName || 'User';
   const picture = userLevel.picture || null;
   const role = detailsLevel.role || detailsLevel.occupation || 'Mentee';
   const bio = detailsLevel.bio || "No bio provided yet.";
   const parseArray = (val) => {
      if (!val) return [];
      if (typeof val === 'string') {
         try { 
            const parsed = JSON.parse(val); 
            return Array.isArray(parsed) ? parsed : [parsed];
         } 
         catch (e) { return [val]; }
      }
      return Array.isArray(val) ? val : [val];
   };

   const expertise = parseArray(detailsLevel.expertise);
   const interests = parseArray(detailsLevel.interests || detailsLevel.discipline);

   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={onClose}
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
               >
                  <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 z-10 transition-colors">
                     <X size={16} />
                  </button>
                  
                  <div className="bg-primary/5 p-8 flex flex-col items-center border-b border-primary/10">
                     <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center text-3xl font-black text-primary overflow-hidden border-4 border-white mb-4">
                        {picture && picture !== "http://localhost:5000/uploads/default.png" ? (
                           <img src={picture} alt={name} className="h-full w-full object-cover" />
                        ) : name.charAt(0)}
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 text-center">{name}</h2>
                     <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">{role}</p>
                  </div>
                  
                  <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                     <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center mb-3">
                           <User size={14} className="mr-1.5" /> About
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{bio}</p>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {expertise.length > 0 && (
                           <div>
                              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center mb-3">
                                 <Star size={14} className="mr-1.5" /> Skills / Expertise
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                 {expertise.map((item, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">{item}</span>
                                 ))}
                              </div>
                           </div>
                        )}
                        
                        {interests.length > 0 && (
                           <div>
                              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center mb-3">
                                 <Briefcase size={14} className="mr-1.5" /> Interests
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                 {interests.map((item, i) => (
                                    <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-100">{item}</span>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
};

export default ViewProfileModal;
