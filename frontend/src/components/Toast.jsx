import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type, duration, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [duration]);

  const icons = {
    success: <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />,
    error: <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="text-yellow-500 w-5 h-5 flex-shrink-0" />,
    info: <Info className="text-blue-500 w-5 h-5 flex-shrink-0" />,
  };

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50',
  };

  const barColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`relative flex items-center p-4 rounded-xl shadow-lg border border-gray-100 min-w-[300px] max-w-sm bg-white overflow-hidden`}
    >
      <div className="flex items-center gap-3 w-full relative z-10">
         <div className={`p-1.5 rounded-full ${bgColors[type] || bgColors.info}`}>
            {icons[type] || icons.info}
         </div>
         <p className="text-sm font-medium text-gray-800 flex-1 pr-6">{message}</p>
         <button onClick={onClose} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X size={16} />
         </button>
      </div>
      {/* Countdown Line */}
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gray-100 z-10">
        <motion.div
          className={`h-full ${barColors[type] || barColors.info}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.05 }}
        />
      </div>
    </motion.div>
  );
};

export default Toast;
