import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import { Eye, EyeOff } from 'lucide-react';

const expertiseCategories = {
  "Ancient & Traditional Knowledge": ["African History", "Cultural Practices", "Storytelling", "Traditional Leadership", "Conflict Resolution", "Indigenous Knowledge", "Herbal Medicine"],
  "Agriculture & Environment": ["Crop Farming", "Livestock Farming", "Fish Farming", "Organic Farming", "Soil Management", "Irrigation Techniques", "Agro Processing"],
  "Technology & Digital Skills": ["Web Development", "Mobile App Development", "UI/UX Design", "Data Analysis", "Cybersecurity", "Artificial Intelligence", "Cloud Computing"],
  "Business & Finance": ["Entrepreneurship", "Business Strategy", "Marketing", "Sales", "Branding", "Financial Management", "Investing"],
  "Self Development & Life Skills": ["Personal Development", "Time Management", "Mental Health Awareness", "Relationship Advice", "Parenting Guidance", "Spiritual Guidance", "Discipline & Consistency"],
  "Creative & Vocational Skills": ["Graphic Design", "Video Editing", "Photography", "Content Creation", "Fashion Design", "Carpentry", "Electrical Work"]
};

const fluentInOptions = ["English", "Yoruba", "Hausa", "Igbo", "Pidgin", "French", "Arabic", "Spanish", "Swahili", "Portuguese"];

const Register = () => {
  const [role, setRole] = useState('mentee'); // 'mentee' or 'mentor'
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    occupation: '',
    // Mentor specific fields
    bio: '',
    experience: '',
    expertise: [],
    fluentIn: [],
    certificate: null,
    linkedinUrl: '',
    // Mentee specific
    interests: [],
    // Passwords at the end
    password: '', 
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      formDataObj.append('occupation', formData.occupation);

      if (role === 'mentor') {
        formDataObj.append('bio', formData.bio);
        formDataObj.append('yearsOfExperience', formData.experience);
        formDataObj.append('expertise', JSON.stringify(formData.expertise));
        formDataObj.append('fluentIn', JSON.stringify(formData.fluentIn));
        formDataObj.append('linkedinUrl', formData.linkedinUrl);
        if (formData.certificate) formDataObj.append('certificate', formData.certificate);
        
        const response = await registerMentor(formDataObj);
        navigate(`/mentor/dashboard`); 
      } else {
        formDataObj.append('interests', JSON.stringify(formData.interests));
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
        <div className="flex bg-gray-50 p-1 rounded-2xl mb-8 border border-gray-100 shadow-inner">
           <button
             type="button"
             onClick={() => setRole('mentee')}
             className={`flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all duration-300 ${
               role === 'mentee' 
                 ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200/50' 
                 : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             I want to learn (Mentee)
           </button>
           <button
             type="button"
             onClick={() => setRole('mentor')}
             className={`flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all duration-300 ${
               role === 'mentor' 
                 ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200/50' 
                 : 'text-gray-500 hover:text-gray-700'
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
              <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">First Name <span className="text-red-500">*</span></label>
              <input id="firstName" name="firstName" type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Last Name <span className="text-red-500">*</span></label>
              <input id="lastName" name="lastName" type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address <span className="text-red-500">*</span></label>
              <input id="email" name="email" type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="occupation" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Role / Occupation <span className="text-red-500">*</span></label>
              <input id="occupation" name="occupation" type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300" value={formData.occupation} onChange={handleChange} placeholder="e.g. Senior Software Engineer" />
            </div>

            {/* Mentor Conditional Fields */}
            {role === 'mentor' && (
              <>
                 <div className="sm:col-span-2">
                   <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Short Bio <span className="text-red-500">*</span></label>
                   <textarea id="bio" name="bio" rows="3" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 resize-none" value={formData.bio} onChange={handleChange} placeholder="Tell us a little about your professional journey..."></textarea>
                 </div>
                 <div className="sm:col-span-2">
                   <label htmlFor="experience" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Years of Experience <span className="text-red-500">*</span></label>
                   <input id="experience" name="experience" type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300" value={formData.experience} onChange={handleChange} placeholder="e.g. 10" />
                 </div>
                 <div className="sm:col-span-2">
                   <MultiSelectDropdown 
                     label="Expertise" 
                     options={expertiseCategories} 
                     value={formData.expertise} 
                     onChange={(v) => setFormData({...formData, expertise: v})} 
                     max={5} 
                     placeholder="Select up to 5 expertise topics..." 
                   />
                 </div>
                 <div className="sm:col-span-2">
                   <MultiSelectDropdown 
                     label="Fluent Languages" 
                     options={fluentInOptions} 
                     value={formData.fluentIn} 
                     onChange={(v) => setFormData({...formData, fluentIn: v})} 
                     max={5} 
                     placeholder="Select up to 5 languages..." 
                   />
                 </div>
                 <div className="sm:col-span-2">
                   <label htmlFor="certificate" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Upload Professional Certificate / Credentials <span className="text-gray-400 font-normal">(PDF/Image)</span></label>
                   <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-6 text-center hover:bg-gray-100 transition-colors">
                     <input id="certificate" name="certificate" type="file" accept=".pdf,.png,.jpg,.jpeg" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" onChange={handleChange} />
                   </div>
                 </div>
                 <div className="sm:col-span-2">
                   <label htmlFor="linkedinUrl" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">LinkedIn URL <span className="text-red-500">*</span></label>
                   <input id="linkedinUrl" name="linkedinUrl" type="url" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                 </div>
              </>
            )}

            {/* Mentee Conditional Fields */}
            {role === 'mentee' && (
              <>
                 <div className="sm:col-span-2">
                   <MultiSelectDropdown 
                     label="Topics of Interest" 
                     options={expertiseCategories} 
                     value={formData.interests} 
                     onChange={(v) => setFormData({...formData, interests: v})} 
                     max={5} 
                     placeholder="Select up to 5 interests..." 
                     prefix="Guidance in "
                   />
                 </div>
              </>
            )}

            {/* Always Put Password at the end */}
            <div className="sm:col-span-2 pt-4 border-t border-gray-100"></div>
            
            <div className="sm:col-span-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                 <input id="password" name="password" type={showPassword ? "text" : "password"} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 pr-12" value={formData.password} onChange={handleChange} placeholder="Create a secure password" />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
              </div>
            </div>
            
            <div className="sm:col-span-2 mb-2">
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                 <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 pr-12" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors focus:outline-none">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/30 text-base font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed transform-none hover:bg-primary' : ''}`}
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
