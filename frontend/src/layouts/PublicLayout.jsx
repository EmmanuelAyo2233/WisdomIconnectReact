import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const PublicLayout = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary">WisdomIconnect</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/#about" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 text-sm font-medium">
                  About Us
                </Link>
                <Link to="/#features" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 text-sm font-medium">
                  Features
                </Link>
                <Link to="/#blog" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 text-sm font-medium">
                  Our Blog
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <button onClick={logout} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Logout
                  </button>
                  <Link to={`/${user.userType || user.role}/dashboard`} className="btn-primary">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
          className={`sm:hidden overflow-hidden bg-white border-b border-gray-200 shadow-lg`}
        >
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/#about" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out">
              About Us
            </Link>
            <Link to="/#features" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out">
              Features
            </Link>
            <Link to="/#blog" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out">
              Our Blog
            </Link>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
               {user ? (
                <>
                  <Link to={`/${user.userType || user.role}/dashboard`} className="block pl-3 pr-4 py-2 text-base font-medium text-primary hover:text-primary-dark transition duration-150 ease-in-out">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50 transition duration-150 ease-in-out">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition duration-150 ease-in-out">
                    Login
                  </Link>
                  <Link to="/signup" className="block pl-3 pr-4 py-2 text-base font-medium text-primary hover:text-primary-dark hover:bg-gray-50 transition duration-150 ease-in-out">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold text-white mb-4 block">WisdomIconnect</span>
              <p className="text-gray-400 mt-2 max-w-sm">
                Connecting generations through wisdom. Empowering individuals to reach their full potential through expert mentorship.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/#about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                <li><Link to="/#features" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link to="/mentors" className="text-gray-400 hover:text-white transition">Find a Mentor</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} WisdomIconnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
