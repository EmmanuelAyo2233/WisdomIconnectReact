import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Search, Users } from 'lucide-react';
// import api from '../api/axios'; // Uncomment when backend is ready

const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Data for Connections
    setTimeout(() => {
      setConnections([
        {
           id: 1,
           userId: 101,
           firstName: 'Sarah',
           lastName: 'Williams',
           role: 'mentor',
           expertise: 'Product Management',
           lastSession: 'Oct 15, 2023'
        },
        {
           id: 2,
           userId: 102,
           firstName: 'Michael',
           lastName: 'Chen',
           role: 'mentee',
           expertise: 'Looking for Data Science mentorship',
           lastSession: 'Nov 02, 2023'
        }
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">My Connections</h1>
            <p className="text-gray-500 text-sm mt-1">People you have had mentorship sessions with.</p>
         </div>
         <div className="flex-1 max-w-sm relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 h-10 py-0"
              placeholder="Search connections..."
            />
         </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
               <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-40 animate-pulse">
                  <div className="flex items-center space-x-4">
                     <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                     <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      ) : connections.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map(conn => (
               <div key={conn.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
                  <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mb-4">
                     {conn.firstName.charAt(0)}{conn.lastName.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                     {conn.firstName} {conn.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mt-1 mb-2">
                     {conn.role}
                  </p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">{conn.expertise}</p>
                  
                  <div className="text-xs text-gray-400 mb-6 flex items-center">
                     <Calendar size={12} className="mr-1" /> Last session: {conn.lastSession}
                  </div>

                  <div className="flex space-x-3 w-full border-t border-gray-100 pt-4">
                     <Link to={`/${user.role}/messages?user=${conn.userId}`} className="btn-secondary flex-1 py-1.5 px-3 text-sm flex items-center justify-center">
                        <MessageSquare size={16} className="mr-2" /> Message
                     </Link>
                     {conn.role === 'mentor' && user.role === 'mentee' && (
                        <Link to={`/mentee/mentor/${conn.userId}`} className="btn-primary flex-1 py-1.5 px-3 text-sm flex items-center justify-center">
                           Book Again
                        </Link>
                     )}
                  </div>
               </div>
            ))}
         </div>
      ) : (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Connections are automatically created when you complete a mentorship session with someone.</p>
            {user.role === 'mentee' ? (
               <Link to="/mentee/explore" className="btn-primary inline-flex text-sm">Find a Mentor</Link>
            ) : (
               <Link to="/mentor/availability" className="btn-primary inline-flex text-sm">Update Availability</Link>
            )}
         </div>
      )}

    </div>
  );
};

export default Connections;
