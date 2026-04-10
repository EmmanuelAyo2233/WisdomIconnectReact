import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Building, X, CheckCircle, Activity, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentService } from '../api/services';

export default function MentorWallet() {
  const [walletStats, setWalletStats] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await paymentService.getWallet();
      if (res.data.success) {
        setWalletStats({
          availableBalance: res.data.wallet.availableBalance || 0,
          pendingBalance: res.data.wallet.pendingBalance || 0,
          totalEarnings: res.data.wallet.totalEarned || 0,
        });

        // Combine payments (sessions) and withdrawals into one timeline
        const payments = [];
        (res.data.transactions || []).forEach(tx => {
           // Skip if awaiting acceptance (not actively locked yet)
           if (tx.status === 'awaiting_acceptance') return;

           payments.push({
             id: `p-${tx.id}-gross`,
             title: 'Mentorship Session',
             amount: tx.amount, // Gross amount paid by Mentee
             type: 'Session earning',
             status: tx.status,
             date: tx.createdAt
           });
           
           payments.push({
             id: `p-${tx.id}-fee`,
             title: 'Platform Fee (30%)',
             amount: -tx.platformShare, // Platform deduction
             type: 'Platform fee',
             status: tx.status,
             date: tx.createdAt
           });
        });

        const wds = (res.data.withdrawals || []).map(wd => ({
           id: `w-${wd.id}`,
           title: 'Withdrawal to Bank',
           amount: -wd.amount,
           type: 'Withdrawal',
           status: wd.status,
           date: wd.createdAt
        }));

        const allTx = [...payments, ...wds].sort((a,b) => new Date(b.date) - new Date(a.date));
        setTransactions(allTx);
      }
    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const bankDetails = {
    bankName: "Guaranty Trust Bank",
    accountNumber: "0123456789",
    accountName: "Mentor User",
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount)).replace('NGN', '₦');
  };

  const handleWithdrawClick = () => {
    setWithdrawError('');
    setWithdrawAmount('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setSuccessMessage('');

    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (amount > walletStats.availableBalance) {
      setWithdrawError('Cannot withdraw more than available balance.');
      return;
    }

    setIsWithdrawing(true);

    try {
      const res = await paymentService.withdrawFunds(amount);
      setSuccessMessage(res.data.message || `Successfully queued withdrawal for ${formatCurrency(amount)}`);
      fetchWalletData(); // Refresh straight from backend
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 2000);
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const StatCard = ({ title, amount, icon: Icon, colorClass, subtitle, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group ${colorClass.includes('b22222') ? 'ring-1 ring-[#b22222]/20 shadow-[0_8px_30px_rgba(178,34,34,0.1)]' : ''}`}
    >
      {colorClass.includes('b22222') && <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#b22222]/10 to-transparent rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3.5 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-500 text-sm font-semibold mb-1 tracking-wide">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(amount)}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-3 font-medium bg-gray-50 inline-flex items-center px-2.5 py-1 rounded-md"><AlertCircle size={12} className="mr-1.5"/>{subtitle}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
             <div className="p-2 bg-red-50 rounded-xl mr-3 border border-red-100">
               <Wallet className="text-[#b22222]" size={28} />
             </div>
             Mentor Earnings Wallet
           </h1>
           <p className="text-gray-500 text-sm mt-2 ml-1 font-medium">Manage your earnings, view history, and withdraw funds securely.</p>
        </div>
      </motion.div>

      {/* Top Section Constraints: Equal-width cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          delay={0.1}
          title="Available Balance" 
          amount={walletStats.availableBalance} 
          icon={CreditCard} 
          colorClass="bg-green-50 text-green-600"
        />
        <StatCard 
          delay={0.2}
          title="Pending Balance" 
          amount={walletStats.pendingBalance} 
          icon={Clock} 
          colorClass="bg-amber-50 text-amber-600"
          subtitle="Available after session completion"
        />
        <StatCard 
          delay={0.3}
          title="Total Earnings" 
          amount={walletStats.totalEarnings} 
          icon={TrendingUp} 
          colorClass="bg-red-50 text-[#b22222]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Wallet Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between min-h-[340px] border border-gray-800 group">
             {/* Abstract background shapes */}
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#b22222]/30 to-transparent rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700"></div>
             <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-[60px]"></div>
             
             <div className="relative z-10 text-white flex flex-col h-full justify-between">
                <div>
                   <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-8 bg-gray-400/20 rounded border border-gray-400/30 flex items-center justify-center">
                        <CreditCard size={18} className="text-gray-300" />
                      </div>
                      <Wallet size={24} className="text-gray-400/50" />
                   </div>
                   <p className="text-gray-400 font-bold tracking-wide text-xs mb-2 uppercase">Earnings Balance</p>
                   <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">{formatCurrency(walletStats.availableBalance)}</h2>
                </div>
                
                <div className="mt-10">
                  <button 
                    onClick={handleWithdrawClick}
                    disabled={walletStats.availableBalance <= 0}
                    className="w-full bg-white text-gray-950 hover:bg-gray-100 font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group/btn shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    Withdraw to Bank 
                    <ArrowUpRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                  {walletStats.availableBalance <= 0 && (
                    <p className="text-xs text-center text-gray-400 mt-4 font-medium">Zero balance. Earn from sessions to withdraw.</p>
                  )}
                </div>
             </div>
          </div>
        </motion.div>

        {/* Right Column: Transaction History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-extrabold text-gray-900 flex items-center tracking-tight">
                 <div className="p-2 bg-red-50 rounded-lg mr-3">
                   <Activity size={20} className="text-[#b22222]"/> 
                 </div>
                 Transaction History
               </h3>
               <button className="text-sm font-bold text-[#b22222] hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors">View All</button>
            </div>

            <div className="flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[200px]">
                   <Clock size={48} className="mb-4 opacity-20" />
                   <p className="font-semibold tracking-wide">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, idx) => (
                    <motion.div 
                      key={tx.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + (idx * 0.1) }}
                      className="flex justify-between items-center p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                          tx.type === 'Withdrawal' ? 'bg-red-50 text-red-500' :
                          tx.type === 'Session earning' ? 'bg-green-50 text-green-500' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {tx.type === 'Withdrawal' ? <ArrowUpRight size={20} className="stroke-[2.5px]" /> : <ArrowDownRight size={20} className="stroke-[2.5px]" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight">{tx.title}</p>
                          <div className="flex items-center text-xs font-medium text-gray-500 mt-1">
                            <span className="capitalize border-r border-gray-200 pr-2.5 mr-2.5">{tx.type}</span>
                            <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-black text-base tracking-tight ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </p>
                        <div className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-end space-x-1 ${
                          tx.status === 'completed' ? 'text-green-600' : 
                          tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {tx.status === 'completed' && <CheckCircle size={12} />}
                          {tx.status === 'pending' && <Clock size={12} />}
                          {tx.status === 'failed' && <X size={12} />}
                          <span className="capitalize ml-1">{tx.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative border border-gray-100"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-extrabold text-gray-900 tracking-tight text-lg">Withdraw Funds</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm">
                  <X size={20} className="stroke-[2.5px]" />
                </button>
              </div>

              <div className="p-8">
                
                {successMessage ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 relative">
                      <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                      <CheckCircle size={40} className="relative z-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Success!</h3>
                    <p className="text-gray-500 font-medium">{successMessage}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleWithdrawSubmit} className="space-y-6">
                    {/* Bank Summary Card */}
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center border border-gray-200">
                      <div className="bg-white p-3 rounded-xl shadow-sm mr-4 border border-gray-100">
                         <Building size={24} className="text-[#b22222]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Withdrawal Destination</p>
                        <p className="font-bold text-gray-900 text-sm">{bankDetails.bankName}</p>
                        <p className="text-gray-600 text-sm">{bankDetails.accountNumber} • {bankDetails.accountName}</p>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Withdraw</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg pointer-events-none group-focus-within:text-[#b22222] transition-colors">₦</span>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => {
                            setWithdrawAmount(e.target.value);
                            setWithdrawError('');
                          }}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#b22222] focus:ring-4 focus:ring-[#b22222]/10 transition-all font-bold text-gray-900 text-lg"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2 px-1">
                         <p className="text-xs text-gray-500">Available: <span className="font-bold text-gray-900">{formatCurrency(walletStats.availableBalance)}</span></p>
                         <button type="button" onClick={() => setWithdrawAmount(walletStats.availableBalance)} className="text-xs font-bold text-[#b22222] hover:text-red-800 bg-[#b22222]/10 px-2 py-1 rounded">Max</button>
                      </div>
                      {withdrawError && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-medium mt-2 flex items-center">
                          <AlertCircle size={12} className="mr-1" /> {withdrawError}
                        </motion.p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isWithdrawing}
                        className="flex-[2] py-3 px-4 bg-[#b22222] hover:bg-red-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {isWithdrawing ? "Processing..." : "Confirm Withdrawal"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 10px;
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
