import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Users, Clock, CheckCircle, Activity, Building, BarChart2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentService } from '../api/services';

export default function AdminWallet() {
  const [adminStats, setAdminStats] = useState({
    totalRevenue: 0, 
    platformEarnings: 0,
    pendingRevenue: 0,
    totalWithdrawn: 0, 
  });

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminWalletData();
  }, []);

  const fetchAdminWalletData = async () => {
    try {
      const res = await paymentService.getAdminWallet();
      if (res.data.success) {
        let totalRev = 0;
        let totalWd = 0;
        
        // Summing up total revenue properly from payments
        (res.data.transactions || []).forEach(tx => {
           totalRev += tx.amount || 0;
        });
        
        (res.data.allWithdrawals || []).forEach(wd => {
           totalWd += wd.amount || 0;
        });

        setAdminStats({
          totalRevenue: totalRev,
          platformEarnings: res.data.wallet.availableBalance || 0,
          pendingRevenue: res.data.wallet.pendingBalance || 0,
          totalWithdrawn: totalWd
        });

        const txs = (res.data.transactions || []).map(tx => ({
           id: tx.id,
           mentorName: tx.appointment?.mentor?.user?.name || `Mentor #${tx.mentorShare}`,
           mentorPicture: tx.appointment?.mentor?.user?.picture || null,
           sessionTitle: 'Paid Mentorship Session',
           totalPayment: tx.amount,
           platformShare: tx.platformShare,
           mentorShare: tx.mentorShare,
           status: tx.status,
           date: tx.createdAt
        }));

        setTransactions(txs);
      }
    } catch (err) {
      console.error("Failed to load admin wallet data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple mock chart data
  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 85000 },
    { month: 'Jun', revenue: 110000 },
    { month: 'Jul', revenue: 105000 },
  ];
  
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount).replace('NGN', '₦');
  };

  const StatCard = ({ title, amount, icon: Icon, colorClass, subtitle, highlight, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group ${highlight ? 'ring-1 ring-[#b22222]/20 shadow-[0_8px_30px_rgba(178,34,34,0.1)]' : ''}`}
    >
      {highlight && <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#b22222]/10 to-transparent rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3.5 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-500 text-sm font-semibold mb-1 tracking-wide">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(amount)}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-3 font-medium bg-gray-50 inline-block px-2.5 py-1 rounded-md">{subtitle}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
             <div className="p-2 bg-red-50 rounded-xl mr-3 border border-red-100">
               <Building className="text-[#b22222]" size={28} />
             </div>
             Platform Financials
           </h1>
           <p className="text-gray-500 text-sm mt-2 ml-1 font-medium">Monitor revenue, platform earnings, and transaction history.</p>
        </div>
      </motion.div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0.1} title="Total Revenue" amount={adminStats.totalRevenue} icon={Activity} colorClass="bg-blue-50 text-blue-600" subtitle="Sum of all initial payments" />
        <StatCard delay={0.2} title="Platform Earnings" amount={adminStats.platformEarnings} icon={Wallet} colorClass="bg-red-50 text-[#b22222]" highlight={true} subtitle="Total available for platform (30%)" />
        <StatCard delay={0.3} title="Pending Revenue" amount={adminStats.pendingRevenue} icon={Clock} colorClass="bg-amber-50 text-amber-600" subtitle="Locked until session completes" />
        <StatCard delay={0.4} title="Total Withdrawn" amount={adminStats.totalWithdrawn} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600" subtitle="Platform funds withdrawn" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Analytics Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-lg font-bold text-gray-900 flex items-center tracking-tight">
                 <div className="p-2 bg-gray-50 rounded-lg mr-3">
                    <BarChart2 size={20} className="text-[#b22222]"/> 
                 </div>
                 Revenue Analytics
               </h3>
               <select className="bg-gray-50 border border-gray-100 text-sm rounded-xl px-4 py-2 font-bold text-gray-700 hover:bg-gray-100 transition-colors focus:ring-4 focus:ring-gray-100 outline-none cursor-pointer">
                 <option>Last 6 Months</option>
                 <option>This Year</option>
               </select>
            </div>
            
            <div className="flex items-end justify-between h-64 mt-4 px-2">
              {monthlyRevenue.map((data, index) => {
                const heightPercentage = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex flex-col items-center group w-full px-1 sm:px-2">
                    <div className="relative w-full flex justify-center h-full items-end pb-3">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-xl">
                         {formatCurrency(data.revenue)}
                      </div>
                      {/* Bar */}
                      <div 
                        className="w-full max-w-[48px] bg-gray-50 rounded-t-xl relative overflow-hidden group-hover:bg-[#b22222]/10 transition-colors duration-300"
                        style={{ height: `${heightPercentage}%`, minHeight: '10%' }}
                      >
                         <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: '100%' }}
                           transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                           className="absolute bottom-0 w-full bg-gradient-to-t from-[#b22222] to-red-500 rounded-t-xl opacity-80 group-hover:opacity-100"
                         ></motion.div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Platform Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between min-h-[340px] border border-gray-800 group">
             {/* Abstract background shapes */}
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#b22222]/30 to-transparent rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700"></div>
             <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-[60px]"></div>
             
             <div className="relative z-10 text-white flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                    <Building size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#b22222] bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">Available</span>
                </div>
                <p className="text-gray-400 font-bold tracking-wide text-xs mb-2 uppercase">Platform Earnings</p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mt-1">{formatCurrency(adminStats.platformEarnings)}</h2>
             </div>
             
             <div className="relative z-10 mt-10">
               <div className="bg-white/5 rounded-2xl p-5 backdrop-blur-xl border border-white/10 mb-6 flex items-center justify-between">
                 <div>
                   <p className="text-xs font-semibold text-gray-400 mb-1">Unreleased Pending</p>
                   <p className="text-xl font-bold text-white">{formatCurrency(adminStats.pendingRevenue)}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center pointer-events-none">
                    <Clock size={16} className="text-yellow-500" />
                 </div>
               </div>
                <button className="w-full bg-white text-gray-950 hover:bg-gray-100 font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center group/btn shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Transfer to Bank
                  <ArrowUpRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Transaction Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
           <h3 className="text-lg font-extrabold text-gray-900 flex items-center tracking-tight">
             <div className="p-2 bg-red-50 rounded-lg mr-3">
               <Activity size={20} className="text-[#b22222]"/> 
             </div>
             Global Transactions
           </h3>
           <button className="text-sm font-bold text-[#b22222] hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <th className="p-5 border-b border-gray-100 whitespace-nowrap">Mentor</th>
                <th className="p-5 border-b border-gray-100 whitespace-nowrap">Session</th>
                <th className="p-5 border-b border-gray-100 whitespace-nowrap">Total Payment</th>
                <th className="p-5 border-b border-gray-100 whitespace-nowrap bg-[#b22222]/[0.03] text-[#b22222]">Platform (30%)</th>
                <th className="p-5 border-b border-gray-100 whitespace-nowrap">Mentor (70%)</th>
                <th className="p-5 border-b border-gray-100 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">
                     <div className="flex flex-col items-center max-w-sm mx-auto">
                        <Activity size={40} className="mb-4 opacity-20" />
                        <p className="font-semibold tracking-wide">No transactions recorded yet.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-5 font-bold text-gray-900 whitespace-nowrap flex items-center">
                      {tx.mentorPicture ? (
                        <img 
                          src={tx.mentorPicture.startsWith('http') ? tx.mentorPicture : `http://localhost:5000${tx.mentorPicture}`} 
                          alt={tx.mentorName} 
                          className="w-9 h-9 rounded-full object-cover mr-3 shadow-md group-hover:scale-110 transition-transform" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b22222] to-red-600 text-white flex items-center justify-center font-bold text-xs mr-3 shadow-md group-hover:scale-110 transition-transform">
                          {tx.mentorName.charAt(0)}
                        </div>
                      )}
                      {tx.mentorName}
                    </td>
                    <td className="p-5 text-gray-500 font-medium whitespace-nowrap">
                       <span className="truncate block max-w-[200px]" title={tx.sessionTitle}>{tx.sessionTitle}</span>
                    </td>
                    <td className="p-5 font-black text-gray-900 whitespace-nowrap tracking-tight">{formatCurrency(tx.totalPayment)}</td>
                    <td className="p-5 font-black text-[#b22222] bg-[#b22222]/[0.02] whitespace-nowrap tracking-tight">
                       +{formatCurrency(tx.platformShare)}
                    </td>
                    <td className="p-5 font-bold text-gray-600 whitespace-nowrap tracking-tight">{formatCurrency(tx.mentorShare)}</td>
                    <td className="p-5 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold capitalize tracking-wide shadow-sm ${
                        tx.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-100'
                      }`}>
                        {tx.status === 'completed' ? <CheckCircle size={12} className="mr-1.5" /> : <Clock size={12} className="mr-1.5" />}
                        {tx.status}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db; 
        }
      `}</style>
    </div>
  );
}
