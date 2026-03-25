import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MenteeHome from '../pages/MenteeHome';
import ExploreMentors from '../pages/ExploreMentors';
import Bookings from '../pages/Bookings';
import Chat from '../pages/Chat';
import MentorHome from '../pages/MentorHome';
import MentorAvailability from '../pages/MentorAvailability';
import MentorProfile from '../pages/MentorProfile';
import MentorOwnProfile from '../pages/MentorOwnProfile';
import MenteeOwnProfile from '../pages/MenteeOwnProfile';
import Playbooks from '../pages/Playbooks';
import Connections from '../pages/Connections';

import AdminHome from '../pages/AdminHome';
import AdminApprovals from '../pages/AdminApprovals';
import AdminUsers from '../pages/AdminUsers';
import AdminMentees from '../pages/AdminMentees';
import AdminRejected from '../pages/AdminRejected';
import AdminMentors from '../pages/AdminMentors';
import Notifications from '../pages/Notifications';
import AdminPlaybooks from '../pages/AdminPlaybooks';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
        </Route>

        {/* Mentee Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['mentee']} />}>
          <Route path="/mentee" element={<DashboardLayout />}>
             <Route path="dashboard" element={<MenteeHome />} />
             <Route path="explore" element={<ExploreMentors />} />
             <Route path="bookings" element={<Bookings />} />
             <Route path="messages" element={<Chat />} />
             <Route path="connections" element={<Connections />} />
             <Route path="playbooks" element={<Playbooks />} />
             <Route path="notifications" element={<Notifications />} />
             <Route path="profile" element={<MenteeOwnProfile />} />
             <Route path="mentor/:id" element={<MentorProfile />} />
             <Route path="settings" element={<div>Settings</div>} />
          </Route>
        </Route>

        {/* Mentor Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
          <Route path="/mentor" element={<DashboardLayout />}>
             <Route path="dashboard" element={<MentorHome />} />
             <Route path="availability" element={<MentorAvailability />} />
             <Route path="bookings" element={<Bookings />} />
             <Route path="messages" element={<Chat />} />
             <Route path="connections" element={<Connections />} />
             <Route path="playbooks" element={<Playbooks />} />
             <Route path="notifications" element={<Notifications />} />
             <Route path="profile" element={<MentorOwnProfile />} />
             <Route path="settings" element={<div>Settings</div>} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
           <Route path="/admin" element={<DashboardLayout />}>
             <Route path="dashboard" element={<AdminHome />} />
             <Route path="users" element={<AdminUsers />} />
             <Route path="mentors" element={<AdminMentors />} />
             <Route path="approvals" element={<AdminApprovals />} />
             <Route path="playbooks" element={<AdminPlaybooks />} />
             <Route path="mentees" element={<AdminMentees />} />
             <Route path="rejected" element={<AdminRejected />} />
           </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
