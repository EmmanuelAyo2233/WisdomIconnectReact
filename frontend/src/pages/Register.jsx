import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [role, setRole] = useState('mentee'); // 'mentee' or 'mentor'
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    // Mentor specific fields
    bio: '',
    experience: '',
    expertise: '',
    certificate: null,
    // Mentee specific
    interests: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerMentee, registerMentor } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'certificate') {
      setFormData({ ...formData, certificate: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', `${formData.firstName} ${formData.lastName}`);
      formDataObj.append('firstName', formData.firstName);
      formDataObj.append('lastName', formData.lastName);
      formDataObj.append('email', formData.email);
      formDataObj.append('password', formData.password);
      formDataObj.append('confirmPassword', formData.confirmPassword);
      formDataObj.append('userType', role);

      if (role === 'mentor') {
        formDataObj.append('bio', formData.bio);
        formDataObj.append('yearsOfExperience', formData.experience);
        formDataObj.append('expertise', formData.expertise); // Send as string e.g. "React, Node"
        if (formData.certificate) formDataObj.append('certificate', formData.certificate);
        
        const response = await registerMentor(formDataObj);
        navigate(`/mentor/dashboard`); 
      } else {
        formDataObj.append('interests', formData.interests);
        const response = await registerMentee(formDataObj);
        navigate(`/mentee/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] mx-auto"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our community of knowledge sharing
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex justify-center mb-8 border-b border-gray-200">
           <button
             onClick={() => setRole('mentee')}
             className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
               role === 'mentee' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             I want to learn (Mentee)
           </button>
           <button
             onClick={() => setRole('mentor')}
             className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
               role === 'mentor' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             I want to guide (Mentor)
           </button>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input id="firstName" name="firstName" type="text" required className="input-field" value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input id="lastName" name="lastName" type="text" required className="input-field" value={formData.lastName} onChange={handleChange} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input id="email" name="email" type="email" required className="input-field" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input id="password" name="password" type="password" required className="input-field" value={formData.password} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <input id="confirmPassword" name="confirmPassword" type="password" required className="input-field" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            {/* Mentor Conditional Fields */}
            {role === 'mentor' && (
              <>
                 <div className="sm:col-span-2">
                   <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Short Bio <span className="text-red-500">*</span></label>
                   <textarea id="bio" name="bio" rows="3" required className="input-field resize-none" value={formData.bio} onChange={handleChange} placeholder="Tell us a little about your professional journey..."></textarea>
                 </div>
                 <div>
                   <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience <span className="text-red-500">*</span></label>
                   <input id="experience" name="experience" type="number" required className="input-field" value={formData.experience} onChange={handleChange} placeholder="e.g. 10" />
                 </div>
                 <div>
                   <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">Expertise (comma separated) <span className="text-red-500">*</span></label>
                   <input id="expertise" name="expertise" type="text" required className="input-field" value={formData.expertise} onChange={handleChange} placeholder="e.g. UX Design, React, Leadership" />
                 </div>
                 <div className="sm:col-span-2">
                   <label htmlFor="certificate" className="block text-sm font-medium text-gray-700 mb-1">Upload Professional Certificate / Credentials <span className="text-gray-400 font-normal">(PDF/Image)</span></label>
                   <input id="certificate" name="certificate" type="file" accept=".pdf,.png,.jpg,.jpeg" className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={handleChange} />
                 </div>
              </>
            )}

            {/* Mentee Conditional Fields */}
            {role === 'mentee' && (
              <div className="sm:col-span-2">
                 <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">Topics of Interest (comma separated) <span className="text-red-500">*</span></label>
                 <input id="interests" name="interests" type="text" required className="input-field" value={formData.interests} onChange={handleChange} placeholder="e.g. Web Development, Career Advice" />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
