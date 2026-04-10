import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      name: 'Discover Mentors',
      description: 'Find experienced professionals across various fields tailored to your goals.',
      icon: Users,
    },
    {
      name: 'Book Sessions',
      description: 'Easily schedule 1-on-1 mentorship sessions at your convenience.',
      icon: Calendar,
    },
    {
      name: 'Real-time Messaging',
      description: 'Stay connected with your mentors directly through our integrated chat.',
      icon: MessageSquare,
    },
    {
      name: 'Knowledge Playbooks',
      description: 'Access curated articles and resources written by industry experts.',
      icon: BookOpen,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-50 pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
              Connecting Generations Through <span className="text-primary">Wisdom</span>
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Discover experienced professionals, book personalized mentorship sessions, and build long-lasting career relationships.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="btn-primary text-lg px-8 py-3 flex items-center justify-center group">
                Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link to="/signup" className="btn-secondary text-lg px-8 py-3 flex items-center justify-center">
                Become a Mentor
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Abstract Background pattern */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-5">
          <svg width="100%" height="100%" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                Our Mission & Purpose
              </h2>
              <p className="mt-4 text-lg text-gray-600 mb-6">
                WisdomIconnect is born out of the necessity to bridge the gap between seasoned professionals and eager learners. We draw inspiration from indigenous African wisdom models, where elders pass down critical life and career lessons to the next generation.
              </p>
              <ul className="space-y-4">
                {['Empowering Future Leaders', 'Structured Knowledge Sharing', 'Building Professional Networks'].map((item, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <CheckCircle2 className="text-primary mr-3 flex-shrink-0" size={24} />
                    <span className="text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-10 lg:mt-0 relative"
            >
              <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-2xl bg-gray-200">

                <div className="w-full h-[400px] bg-gradient-to-br from-primary/80 to-secondary flex items-center justify-center p-8">
                  <h3 className="text-white text-3xl font-bold text-center leading-tight">
                    "To go fast, go alone.<br />To go far, go together."
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div id="features" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Core Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to grow
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  className="card p-6 text-center hover:-translate-y-1 transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                    <feature.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.name}</h3>
                  <p className="text-base text-gray-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials (Stubbed) */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-12">
            What People Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-8 bg-gray-50 border border-gray-100">
                <p className="text-gray-600 italic mb-6">"WisdomIconnect completely changed my career trajectory. Finding a mentor who understood my background was invaluable."</p>
                <div className="flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">U{i}</div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">User {i}</p>
                    <p className="text-xs text-gray-500">Software Engineer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-primary-light mt-2">Start your journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
