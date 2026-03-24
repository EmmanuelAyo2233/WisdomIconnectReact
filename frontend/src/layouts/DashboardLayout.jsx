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
  Star,
  UserX,
  UserMinus
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const SidebarItem = ({ icon: Icon, label, description, path, active, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex flex-row lg:flex-col items-center lg:justify-center py-3 lg:py-2 px-4 lg:px-1 w-full rounded-2xl transition-all duration-200 group relative ${
      active 
        ? 'text-[#0A2640] bg-gray-50 lg:bg-transparent pointer-events-none' 
        : 'text-gray-500 hover:text-[#0A2640] hover:bg-gray-50'
    }`}
  >
    {/* Background Highlight for Active State (Desktop) */}
    {active && (
      <div className="hidden lg:block absolute inset-0 bg-[#e0f2f1] rounded-2xl -z-10"></div>
    )}
    
    <div className={`p-2 lg:p-1.5 rounded-full mr-3 lg:mr-0 lg:mb-0.5 transition-colors ${active ? 'bg-transparent text-[#0A2640]' : 'group-hover:bg-gray-50 text-gray-500 group-hover:text-[#0A2640]'}`}>
      <Icon size={22} className="lg:w-[20px] lg:h-[20px]" strokeWidth={active ? 2.5 : 2} />
    </div>
    
    <div className="flex flex-col">
       <span className={`text-sm lg:text-[10px] font-bold tracking-tight ${active ? 'text-[#0A2640]' : 'text-gray-500 group-hover:text-[#0A2640]'}`}>
         {label}
       </span>
       {/* Mobile/Tablet explicit description */}
       {description && (
          <span className="text-xs text-gray-400 font-medium lg:hidden">{description}</span>
       )}
    </div>
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
    
    if (role === 'mentor') {
       return [
         { path: `${basePath}/dashboard`, label: 'Home', icon: Home, description: "Keep track of your connections" },
         { path: `${basePath}/availability`, label: 'Availability', icon: Calendar, description: "Manage your schedule" },
         { path: `${basePath}/messages`, label: 'Messages', icon: MessageSquare, description: "Chat with mentors/mentees" },
         { path: `${basePath}/bookings`, label: 'Bookings', icon: Calendar, description: "Manage your sessions" },
         { path: `${basePath}/connections`, label: 'Connections', icon: Users, description: "View your network" },
       ];
    } else if (role === 'mentee') {
       return [
         { path: `${basePath}/dashboard`, label: 'Home', icon: Home, description: "Keep track of your connections" },
         { path: `${basePath}/explore`, label: 'Explore', icon: Search, description: "Find available mentors" },
         { path: `${basePath}/messages`, label: 'Messages', icon: MessageSquare, description: "Chat with mentors/mentees" },
         { path: `${basePath}/connections`, label: 'Connections', icon: Users, description: "View your network" },
         { path: `${basePath}/bookings`, label: 'Bookings', icon: Calendar, description: "Manage your sessions" },
       ];
    }
    // Admin
    return [
       { path: `/admin/dashboard`, label: 'Home', icon: Home },
       { path: `/admin/users`, label: 'Users', icon: Users },
       { path: `/admin/mentors`, label: 'Mentors', icon: Star },
       { path: `/admin/approvals`, label: 'Approvals', icon: User },
       { path: `/admin/mentees`, label: 'Mentees', icon: Users },
       { path: `/admin/rejected`, label: 'Rejected', icon: UserX },
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
          <Link to={`/${user.userType || user.role}/notifications`} className="p-2 text-gray-400 hover:text-[#0A2640] transition-colors relative">
             <Bell size={20} />
             <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </Link>
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

        {/* Sidebar Navigation - Responsive Slim/Wide */}
        <aside className={`absolute lg:static inset-y-0 left-0 z-40 bg-white/95 backdrop-blur-md border-r border-gray-100 transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col pt-6 pb-20 sm:pb-6 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] overflow-y-auto lg:overflow-visible w-[280px] lg:w-24 lg:items-center ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* TOP Profile Area (MOBILE ONLY) - "Top by the left, following same row with text in front" */}
          <div className="w-full flex justify-start mb-6 px-4 lg:hidden">
            <Link 
              to={`/${user.userType || user.role}/profile`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex flex-row items-center justify-start py-2 px-1 w-full rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div className="relative mr-3 transition-transform duration-200 group-hover:scale-105">
                 <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#0A2640] flex items-center justify-center text-white font-bold overflow-hidden shadow-md border-2 border-white">
                   {user.picture ? (
                     <img src={user.picture} alt="Profile" className="h-full w-full object-cover" />
                   ) : (
                     (user.firstName ? user.firstName.charAt(0) : '') + (user.lastName ? user.lastName.charAt(0) : '') || (user.name ? user.name.charAt(0) : '') || 'U'
                   )}
                 </div>
                 <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col text-left">
                 <span className="text-sm font-bold text-[#0A2640] truncate max-w-full group-hover:text-primary">
                    {user.firstName || user.name?.split(' ')[0] || 'Profile'}
                 </span>
                 <span className="text-[10px] text-gray-500 font-bold capitalize mt-0.5">{user.userType || user.role}</span>
                 <span className="text-xs text-gray-400 capitalize hover:text-[#0a2640] font-medium hidden sm:block">View my profile</span>
              </div>
            </Link>
          </div>

          {/* Main Nav Links Container */}
          <div className="flex-1 w-full px-4 lg:px-2 space-y-1 flex flex-col lg:items-center">
            {navLinks.map((link) => (
              <SidebarItem
                key={link.path}
                {...link}
                active={location.pathname === link.path || location.pathname.startsWith(link.path + '/')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
            
            {/* Playbooks & Achievements (MOBILE ONLY - Direct Links) */}
            {(user.userType || user.role) !== 'admin' && (
              <div className="lg:hidden w-full flex flex-col space-y-1">
                <SidebarItem 
                  icon={BookOpen} 
                  label="Playbooks" 
                  description="Access shared materials" 
                  path={`/${user.userType || user.role}/playbooks`} 
                  active={location.pathname.includes('/playbooks')} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                />
                <SidebarItem 
                  icon={Star} 
                  label="Rankings" 
                  description="View Achievements" 
                  path={`/${user.userType || user.role}/achievements`} 
                  active={location.pathname.includes('/achievements')} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                />
              </div>
            )}
            
            {/* Playbooks & Achievements (DESKTOP ONLY - More Menu) */}
            {(user.userType || user.role) !== 'admin' && (
              <div className="hidden lg:block w-full relative group">
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
            )}
          </div>

          {/* Bottom Settings & Logout (MOBILE ONLY) */}
          <div className="lg:hidden mt-auto px-4 w-full pt-4 space-y-1 relative flex flex-col">
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              description="Manage your account" 
              path={`/${user.userType || user.role}/settings`} 
              active={location.pathname.includes('/settings')} 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            
            <button
               onClick={logout}
               className={`flex flex-row items-center justify-start py-3 px-4 w-full rounded-2xl transition-all duration-200 group relative text-red-500 hover:bg-red-50`}
            >
               <div className={`p-2 rounded-full mr-3 transition-colors group-hover:bg-red-100 bg-transparent text-red-500`}>
                 <LogOut size={22} strokeWidth={2} />
               </div>
               <div className="flex flex-col text-left">
                  <span className={`text-sm font-bold tracking-tight text-red-500`}>
                    Logout
                  </span>
                  <span className="text-xs text-red-300 font-medium sm:block hidden">Sign out of your account</span>
               </div>
            </button>
          </div>

          {/* Bottom Profile Tooltip (DESKTOP ONLY) */}
          <div className="hidden lg:flex mt-auto px-2 w-full pt-4 relative flex flex-col items-center" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex flex-col items-center justify-center w-full focus:outline-none group"
            >
              <div className="relative mb-1 transition-transform duration-200 group-hover:scale-105">
                 <div className="h-12 w-12 rounded-full bg-[#0A2640] flex items-center justify-center text-white font-bold overflow-hidden shadow-md border-2 border-white">
                   {user.picture ? (
                     <img src={user.picture} alt="Profile" className="h-full w-full object-cover" />
                   ) : (
                     (user.firstName ? user.firstName.charAt(0) : '') + (user.lastName ? user.lastName.charAt(0) : '') || (user.name ? user.name.charAt(0) : '') || 'U'
                   )}
                 </div>
                 {/* Online indicator dot */}
                 <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-[10px] font-bold text-[#0A2640] truncate max-w-full px-1 group-hover:text-primary">
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
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8 w-full z-0 relative pb-20 sm:pb-8">
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
             className="max-w-[1600px] mx-auto"
           >
             <Outlet />
           </motion.div>
        </main>

        {/* Bottom Navigation (Mobile & Tablet) */}
        {(user.userType || user.role) !== 'admin' && (
           <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-16 lg:hidden z-50 px-2 pb-safe shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.1)]">
              {navLinks.map((link) => {
                 const active = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                 return (
                   <Link 
                     key={link.path} 
                     to={link.path} 
                     className={`flex flex-col items-center justify-center w-full h-full relative group transition-colors ${active ? 'text-[#0A2640]' : 'text-gray-400 hover:text-[#0A2640]'}`}
                   >
                     {active && <span className="absolute top-0 w-8 h-1 bg-[#0A2640] rounded-b-md"></span>}
                     <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary' : 'bg-transparent text-gray-500 group-hover:bg-gray-50'}`}>
                        <link.icon size={22} strokeWidth={active ? 2.5 : 2} />
                     </div>
                   </Link>
                 );
              })}
           </nav>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
