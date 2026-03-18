import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  ArrowRight,
  Shield,
  Activity,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../api/services';

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await adminService.getUsers();
        const users = response.data.users || response.data || [];
        setStats({
          totalUsers: users.length,
          activeMentors: users.filter(u => u.role === 'mentor' && u.isVerified).length,
          pendingApprovals: users.filter(u => u.role === 'mentor' && !u.isVerified).length,
          totalSessions: 'N/A', // Endpoint doesn't provide global sessions
          platformGrowth: '+15.4%' // Mocked for now
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        // Fallback or leave empty
      }
    };
    fetchAdminData();

    setRecentActivities([
      { id: 1, type: 'system_update', user: 'System', role: 'Integration', time: 'Just now' },
      // Other activities can be fetched from a logs API if it existed
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Platform-wide statistics and management.</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary h-10 px-4 text-sm flex items-center">
            <Shield size={16} className="mr-2" /> Security Log
          </button>
          <button className="btn-primary h-10 px-4 text-sm flex items-center">
             Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <Users className="text-blue-500 mb-4" size={24} />
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalUsers}</p>
            <div className="text-xs text-green-600 font-bold mt-2">{stats.platformGrowth} this month</div>
            <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-blue-50 rounded-full opacity-50"></div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <UserCheck className="text-green-500 mb-4" size={24} />
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Mentors</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.activeMentors}</p>
            <Link to="/admin/approvals" className="text-xs text-primary font-bold hover:underline mt-2 block">View Pending Approvals</Link>
            <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-green-50 rounded-full opacity-50"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <Activity className="text-purple-500 mb-4" size={24} />
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sessions</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalSessions}</p>
            <div className="text-xs text-gray-400 mt-2">Historical data available</div>
            <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-purple-50 rounded-full opacity-50"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <AlertCircle className="text-amber-500 mb-4" size={24} />
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Tasks</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.pendingApprovals}</p>
            <div className="text-xs text-amber-600 font-bold mt-2">Requires immediate action</div>
            <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-amber-50 rounded-full opacity-50"></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Activity size={20} className="mr-2 text-primary" /> Recent Platform Activity
            </h2>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    activity.critical ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{activity.user}</h4>
                    <p className="text-xs text-gray-500">{activity.role} • {activity.time}</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                  {activity.type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Health / Shortcuts */}
        <div className="space-y-6">
           <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 gap-3">
                 <Link to="/admin/users" className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all group">
                    <Users size={18} className="text-gray-400 group-hover:text-primary mr-3" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Manage Users</span>
                 </Link>
                 <Link to="/admin/approvals" className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all group">
                    <UserPlus size={18} className="text-gray-400 group-hover:text-primary mr-3" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Mentor Verification</span>
                 </Link>
                 <Link to="/admin/reports" className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all group">
                    <TrendingUp size={18} className="text-gray-400 group-hover:text-primary mr-3" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Revenue Analytics</span>
                 </Link>
              </div>
           </section>

           <section className="bg-gradient-to-br from-secondary to-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center mb-4">
                    <Shield size={20} className="text-primary mr-2" />
                    <h3 className="font-bold">System Status</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-400">API Latency</span>
                       <span className="text-green-400 font-bold">12ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-400">Uptime (30d)</span>
                       <span className="text-green-400 font-bold">99.98%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-400">Active Sockets</span>
                       <span className="text-amber-400 font-bold">1,240</span>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 h-full w-full opacity-10 pointer-events-none">
                 <Activity size={300} className="transform translate-x-1/2 -translate-y-1/2" />
              </div>
           </section>
        </div>

      </div>

    </div>
  );
};

export default AdminHome;
