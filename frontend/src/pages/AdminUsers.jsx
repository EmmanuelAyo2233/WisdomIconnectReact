import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users as UsersIcon, 
  Search, 
  MoreVertical, 
  Filter, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  Edit2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../api/services';
import { useToast } from '../context/ToastContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getUsers();
        // Assuming response.data.users contains the array
        const fetchedUsers = response.data.users || response.data || [];
        // Map backend fields to the components expected fields if necessary, or just use them
        setUsers(fetchedUsers.map(u => ({
           id: u.id,
           name: `${u.firstName} ${u.lastName}`,
           email: u.email,
           role: u.role,
           status: u.isVerified ? 'Approved' : 'Pending',
           joinedDate: new Date(u.createdAt).toLocaleDateString()
        })));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id, roleName) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      if (roleName.toLowerCase() === 'mentee') {
        await adminService.deleteMentee(id);
      } else {
        await adminService.deleteUser(id); // Handles mentor & others
      }
      addToast("User deleted successfully", "success");
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      addToast("Failed to delete user", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and audit all platform accounts.</p>
        </div>
        <Link to="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-primary flex items-center">
           <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
      </div>

      {/* Table Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            className="input-field pl-10 h-10 py-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm font-medium text-gray-500 mr-2">
            <Filter size={16} className="mr-2" /> Role:
          </div>
          <select 
            className="input-field h-10 py-0 w-32"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {['All', 'Mentee', 'Mentor', 'Admin'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn-primary h-10 px-6 flex items-center whitespace-nowrap">
            <UserPlus size={18} className="mr-2" /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date Joined</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-10 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.role === 'Admin' ? 'bg-purple-50 text-purple-700' : 
                      user.role === 'Mentor' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        user.status === 'Approved' ? 'bg-green-500' : 
                        user.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs font-medium text-gray-700">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {user.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit/Email Functionality relies on client implementations"><Mail size={16} /></button>
                       <button onClick={() => handleDelete(user.id, user.role)} className="p-1.5 text-gray-400 lg:group-hover:text-red-600 transition-colors" title="Delete User"><Trash2 size={16} /></button>
                    </div>
                    <button className="md:hidden p-2 text-gray-400"><MoreVertical size={20} /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <UsersIcon size={48} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
           <p className="text-xs text-gray-500">Showing {filteredUsers.length} users</p>
           <div className="flex space-x-1">
              <button disabled className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-300">Previous</button>
              <button className="px-3 py-1 bg-primary text-white border border-primary rounded text-xs font-bold">1</button>
              <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-500 hover:bg-gray-100">Next</button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default AdminUsers;
