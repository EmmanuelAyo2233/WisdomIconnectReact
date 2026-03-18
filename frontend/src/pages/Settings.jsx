import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Key } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
         <p className="text-gray-500 text-sm mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* Sidebar Navigation */}
         <div className="md:col-span-1 space-y-2">
            <button 
               onClick={() => setActiveTab('account')}
               className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'account' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
               }`}
            >
               <User size={18} className="mr-3" /> Account
            </button>
            <button 
               onClick={() => setActiveTab('notifications')}
               className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
               }`}
            >
               <Bell size={18} className="mr-3" /> Notifications
            </button>
            <button 
               onClick={() => setActiveTab('security')}
               className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
               }`}
            >
               <Shield size={18} className="mr-3" /> Security
            </button>
         </div>

         {/* Content Area */}
         <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
               
               {activeTab === 'account' && (
                  <div className="space-y-6">
                     <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Personal Information</h3>
                     
                     <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase">
                           {(user?.name || user?.firstName || 'U').charAt(0)}
                        </div>
                        <div>
                           <button className="btn-secondary py-2 px-4 text-sm mb-2">Change Avatar</button>
                           <p className="text-xs text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                           <input type="text" className="input-field" defaultValue={user?.firstName} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                           <input type="text" className="input-field" defaultValue={user?.lastName} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" className="input-field bg-gray-50 text-gray-500" defaultValue={user?.email} disabled />
                        <p className="text-xs text-gray-500 mt-1">Contact support to change your email address.</p>
                     </div>

                     <div className="pt-4 flex justify-end">
                        <button className="btn-primary">Save Changes</button>
                     </div>
                  </div>
               )}

               {activeTab === 'notifications' && (
                  <div className="space-y-6">
                     <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Email Notifications</h3>
                     
                     <div className="space-y-4">
                        {[
                           { title: 'Session Reminders', desc: 'Receive emails 24h and 1h before a mentor session.' },
                           { title: 'New Messages', desc: 'Receive emails when you get a new chat message.' },
                           { title: 'Platform Updates', desc: 'Get updates on new features and product changes.' }
                        ].map((item, i) => (
                           <div key={i} className="flex items-start justify-between">
                              <div>
                                 <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                 <p className="text-xs text-gray-500">{item.desc}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                           </div>
                        ))}
                     </div>
                     <div className="pt-4 flex justify-end">
                        <button className="btn-primary">Save Preferences</button>
                     </div>
                  </div>
               )}

               {activeTab === 'security' && (
                  <div className="space-y-6">
                     <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Password Security</h3>
                     
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                           <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                           <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                           <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                     </div>
                     <div className="pt-4 flex justify-end">
                        <button className="btn-primary flex items-center"><Key size={16} className="mr-2" /> Update Password</button>
                     </div>
                  </div>
               )}

            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
