import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Search,
  MessageSquare,
  Calendar,
  Users,
  BookOpen,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  User,
  Star
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 px-1 w-full rounded-2xl transition-all duration-200 group relative ${
      active 
        ? 'text-[#0A2640] pointer-events-none' 
        : 'text-gray-500 hover:text-[#0A2640]'
    }`}
  >
    {/* Background Highlight for Active State */}
    {active && (
      <div className="absolute inset-0 bg-[#e0f2f1] rounded-2xl -z-10"></div>
    )}
    
    <div className={`p-1.5 rounded-full mb-0.5 transition-colors ${active ? 'bg-transparent text-[#0A2640]' : 'group-hover:bg-gray-50 text-gray-500 group-hover:text-[#0A2640]'}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    </div>
    
    <span className={`text-[10px] font-bold tracking-tight ${active ? 'text-[#0A2640]' : 'text-gray-500 group-hover:text-[#0A2640]'}`}>
      {label}
    </span>
  </Link>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null; // Protective fallback

  const getLinksForRole = () => {
    const role = user.userType || user.role;
    const basePath = `/${role}`;
    
    const commonLinks = [
      { path: `${basePath}/dashboard`, label: 'Home', icon: Home },
      { path: `${basePath}/messages`, label: 'Messages', icon: MessageSquare },
      { path: `${basePath}/bookings`, label: 'Bookings', icon: Calendar },
      { path: `${basePath}/connections`, label: 'Connections', icon: Users },
    ];

    if (role === 'mentor') {
       commonLinks.splice(1, 0, { path: `${basePath}/availability`, label: 'Availability', icon: Calendar });
       return commonLinks;
    } else if (role === 'mentee') {
       commonLinks.splice(1, 0, { path: `${basePath}/explore`, label: 'Explore', icon: Search });
       return commonLinks;
    }
    // Admin
    return [
       { path: `/admin/dashboard`, label: 'Home', icon: Home },
       { path: `/admin/users`, label: 'Users', icon: Users },
       { path: `/admin/approvals`, label: 'Approvals', icon: User },
    ];
  };

  const navLinks = getLinksForRole();

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      
      {/* Top Header - Full Width */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 relative z-50">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 mr-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="text-xl font-bold text-[#0A2640] flex items-center gap-2">
            <span className="h-8 w-8 bg-[#0A2640] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
              W
            </span>
            WisdomIconnect
          </Link>
          
          {/* Search (Hide Admin) */}
          {(user.userType || user.role) !== 'admin' && (
            <div className="hidden md:block ml-8">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search mentors..."
                    className="block w-64 lg:w-96 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150"
                  />
               </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-[#0A2640] transition-colors relative">
             <Bell size={20} />
             <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
           {(user.userType || user.role) === 'mentee' && (
             <Link to="/mentee/explore" className="btn-primary flex items-center text-sm py-1.5 hidden sm:flex shrink-0">
               <Calendar size={16} className="mr-1.5" /> Book Session
             </Link>
           )}
        </div>
      </header>

      {/* Body Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation - Slim Vertical Style */}
        <aside className={`absolute lg:static inset-y-0 left-0 z-40 w-24 bg-white/80 backdrop-blur-md border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col items-center py-6 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* Nav Links Container */}
          <div className="flex-1 w-full px-2 space-y-1 flex flex-col items-center">
            {navLinks.map((link) => (
              <SidebarItem
                key={link.path}
                {...link}
                active={location.pathname === link.path || location.pathname.startsWith(link.path + '/')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
            
            {/* More Dropdown for Playbook and Achievement */}
            <div className="w-full relative group">
               <button className={`w-full group flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 relative bg-transparent text-gray-500 hover:bg-gray-50 hover:text-primary`}>
                 <div className={`mb-0.5 p-1.5 rounded-full transition-all duration-300 bg-transparent group-hover:bg-primary/10 group-hover:scale-110 text-gray-400 group-hover:text-primary`}>
                   <Menu size={20} strokeWidth={2} />
                 </div>
                 <span className={`text-[10px] font-bold tracking-tight transition-all duration-300 group-hover:font-extrabold`}>
                   More
                 </span>
               </button>

               {/* Dropdown Options */}
               <div className="absolute left-full top-0 ml-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2 space-y-1">
                     <Link to={`/${user.userType || user.role}/playbooks`} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <BookOpen size={16} className="mr-3" /> Playbooks
                     </Link>
                     <Link to={`/${user.userType || user.role}/achievements`} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <Star size={16} className="mr-3" /> Achievements
                     </Link>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom Profile Area */}
          <div className="mt-auto px-2 w-full pt-4 relative flex flex-col items-center" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex flex-col items-center justify-center w-full focus:outline-none"
            >
              <div className="relative mb-1 hover:scale-105 transition-transform duration-200">
                 <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#0A2640] flex items-center justify-center text-white font-bold overflow-hidden shadow-md border-2 border-white">
                   {user.picture ? (
                     <img src={user.picture} alt="Profile" className="h-full w-full object-cover" />
                   ) : (
                     (user.firstName ? user.firstName.charAt(0) : '') + (user.lastName ? user.lastName.charAt(0) : '') || (user.name ? user.name.charAt(0) : '') || 'U'
                   )}
                 </div>
                 {/* Online indicator dot */}
                 <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-[10px] font-bold text-[#0A2640] truncate max-w-full px-1">
                 {user.firstName || user.name?.split(' ')[0] || 'Profile'}
              </span>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-4 left-20 mb-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[60]"
                >
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name || user.email}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize mt-0.5">{user.userType || user.role}</p>
                  </div>
                  <div className="p-1.5">
                     <Link to={`/${user.userType || user.role}/profile`} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg flex items-center transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                       <User size={16} className="mr-2 text-gray-400" /> View Profile
                     </Link>
                     <Link to={`/${user.userType || user.role}/settings`} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg flex items-center transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                       <Settings size={16} className="mr-2 text-gray-400" /> Settings
                     </Link>
                  </div>
                  <div className="p-1.5 border-t border-gray-50">
                     <button onClick={logout} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors">
                       <LogOut size={16} className="mr-2" /> Logout
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8 w-full z-0 relative">
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
             className="max-w-[1600px] mx-auto"
           >
             <Outlet />
           </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
