import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Trophy, Star, Award, Shield, User, ChevronRight, TrendingUp, Medal } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Rankings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const res = await api.get('/mentor/explore');
                if (res.data.success || res.data.status === 'success') {
                    setMentors(res.data.data.slice(0, 50)); // Top 50
                }
            } catch (error) {
                // If it fails, maybe auth issue, but mentor explore is public
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, []);

    const getRankStyle = (index) => {
        if (index === 0) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', icon: <Trophy className="text-yellow-600" size={28} /> };
        if (index === 1) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: <Medal className="text-gray-500" size={28} /> };
        if (index === 2) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: <Medal className="text-orange-700" size={28} /> };
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', icon: <span className="font-bold text-lg text-slate-400">#{index + 1}</span> };
    };

    const getLevelBadge = (level) => {
        switch(level) {
            case 'gold': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-yellow-200"><Star size={12} className="fill-yellow-600" /> Gold Mentor</span>;
            case 'verified': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-blue-200"><Shield size={12} className="fill-blue-600 text-blue-600" /> Verified</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-gray-200"><User size={12} /> Starter</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Header */}
            <div className="bg-[#b22222] text-white pt-16 pb-24 px-4 sm:px-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
                
                <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-2xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-bold tracking-wide backdrop-blur-md">
                            <TrendingUp size={16} className="text-yellow-400" /> Platform Leaderboard
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                            Global Mentor <span className="text-yellow-400">Rankings</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-white/80 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
                            Discover top-performing mentors based on their impact, ratings, and mentorship sessions completed. Strive for greatness and climb the ranks!
                        </motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="hidden md:flex bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md items-center justify-center flex-col shadow-2xl">
                        <Trophy size={80} className="text-yellow-400 drop-shadow-2xl mb-4" />
                        <h3 className="text-xl font-bold">Top 50 Mentors</h3>
                    </motion.div>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-10 relative z-20">
                {loading ? (
                    <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#b22222] border-t-transparent"></div>
                    </div>
                ) : mentors.length > 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        
                        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/80 px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest sticky top-0 backdrop-blur-md">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-5">Mentor Profile</div>
                            <div className="col-span-2 text-center">Sessions</div>
                            <div className="col-span-2 text-center">Rating</div>
                            <div className="col-span-2 text-center">Level</div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {mentors.map((mentor, index) => {
                                const rankStyle = getRankStyle(index);
                                const isTop3 = index < 3;
                                
                                return (
                                    <div 
                                        key={mentor.id} 
                                        onClick={() => navigate(`/mentee/mentor/${mentor.id}`)}
                                        className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-6 md:px-8 transition-colors hover:bg-gray-50 cursor-pointer ${isTop3 ? 'bg-gradient-to-r from-transparent to-transparent' : ''}`}
                                    >
                                        
                                        <div className="col-span-1 flex items-center md:justify-center">
                                            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center border shadow-sm ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}>
                                                {rankStyle.icon}
                                            </div>
                                        </div>

                                        <div className="col-span-5 flex items-center gap-4">
                                            <div className="relative shrink-0">
                                                <img src={mentor.user?.picture || 'http://localhost:5000/uploads/default.png'} alt={mentor.user?.name} className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover shadow-sm ${isTop3 ? 'border-2 border-yellow-400 p-0.5' : 'border border-gray-200'}`} />
                                                {isTop3 && (
                                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-lg border-2 border-white">
                                                        <Star size={12} className="fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-gray-900 ${isTop3 ? 'text-lg' : 'text-base'}`}>{mentor.user?.name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-xs">{mentor.role}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-2 hidden md:flex flex-col items-center justify-center">
                                            <span className="text-xl font-black text-gray-900">{mentor.sessions || 0}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Completed</span>
                                        </div>

                                        <div className="col-span-2 hidden md:flex flex-col items-center justify-center relative">
                                            <div className="flex items-center justify-center relative z-10 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
                                                <Star size={18} className="fill-yellow-400 text-yellow-400 mr-1.5" />
                                                <span className="text-base font-black text-gray-900">{mentor.user?.rating ? Number(mentor.user.rating).toFixed(1) : '0.0'}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2 hidden md:flex items-center justify-center">
                                            {getLevelBadge(mentor.user?.mentorLevel)}
                                        </div>

                                        {/* Mobile Only Extras */}
                                        <div className="col-span-1 flex md:hidden items-center justify-between mt-2 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-4">
                                               <div className="flex items-center flex-col">
                                                   <span className="text-lg font-black text-gray-900">{mentor.sessions || 0}</span>
                                                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sessions</span>
                                               </div>
                                               <div className="flex items-center flex-col">
                                                   <span className="text-lg font-black text-gray-900 flex items-center"><Star size={12} className="fill-yellow-400 text-yellow-400 mr-1"/> {mentor.user?.rating ? Number(mentor.user.rating).toFixed(1) : '0.0'}</span>
                                                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</span>
                                               </div>
                                            </div>
                                            <div>
                                               {getLevelBadge(mentor.user?.mentorLevel)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-3xl p-16 shadow-xl border border-gray-100 text-center">
                        <Trophy size={64} className="mx-auto text-gray-300 mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Mentors Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">It seems the leaderboard is currently empty. Check back later to see who's at the top!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rankings;
