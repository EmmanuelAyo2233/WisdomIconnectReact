import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, X, Plus } from 'lucide-react';

const MultiSelectDropdown = ({ 
  label, 
  options, 
  value = [], 
  onChange, 
  max = 5, 
  placeholder = "Select options...", 
  prefix = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [otherInput, setOtherInput] = useState("");
  const [showOther, setShowOther] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const prefixedItem = prefix ? `${prefix}${item}` : item;
    if (value.includes(prefixedItem)) {
      onChange(value.filter(i => i !== prefixedItem)); // Toggle off
    } else {
      if (value.length >= max) {
        alert(`You can only select up to ${max} options for ${label}.`);
        return;
      }
      onChange([...value, prefixedItem]);
    }
  };

  const handleRemove = (itemToRemove, e) => {
    e.stopPropagation();
    onChange(value.filter(i => i !== itemToRemove));
  };

  const toggleCategory = (cat, e) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddOther = (e) => {
    e.preventDefault();
    if (!otherInput.trim()) return;
    const customItem = prefix ? `${prefix}${otherInput.trim()}` : otherInput.trim();
    if (value.includes(customItem)) {
      setOtherInput("");
      setShowOther(false);
      return;
    }
    if (value.length >= max) {
      alert(`You can only select up to ${max} options for ${label}.`);
      return;
    }
    onChange([...value, customItem]);
    setOtherInput("");
    setShowOther(false);
  };

  const isCategoryObject = !Array.isArray(options);

  return (
    <div className="relative w-full mb-6" ref={dropdownRef}>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label} {max && <span className="text-gray-400 font-normal ml-1">({value.length}/{max})</span>}</label>
      
      {/* Trigger Button */}
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:border-primary transition-colors cursor-pointer"
      >
        <span className="text-gray-500">{placeholder}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected Tags Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          <AnimatePresence>
            {value.map((tag) => (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={tag} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm"
              >
                {tag}
                <button type="button" onClick={(e) => handleRemove(tag, e)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[350px]"
          >
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {isCategoryObject ? (
                Object.keys(options).map((cat) => (
                  <div key={cat} className="mb-1">
                    <button 
                      type="button"
                      onClick={(e) => toggleCategory(cat, e)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-gray-800 bg-gray-50/80 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {cat}
                      {expandedCategories[cat] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <AnimatePresence>
                      {expandedCategories[cat] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 py-1 flex flex-col space-y-0.5">
                            {options[cat].map(opt => {
                               const fullOpt = prefix ? `${prefix}${opt}` : opt;
                               const isSelected = value.includes(fullOpt);
                               return (
                                 <label key={opt} className="flex items-center space-x-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors">
                                   <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                      {isSelected && <CheckIcon />}
                                   </div>
                                   <span className={`text-sm ${isSelected ? 'font-bold text-primary' : 'text-gray-600'}`}>{opt}</span>
                                   <input type="checkbox" className="hidden" checked={isSelected} onChange={() => handleSelect(opt)} />
                                 </label>
                               )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <div className="flex flex-col space-y-0.5">
                  {options.map(opt => {
                     const fullOpt = prefix ? `${prefix}${opt}` : opt;
                     const isSelected = value.includes(fullOpt);
                     return (
                       <label key={opt} className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors">
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                            {isSelected && <CheckIcon />}
                         </div>
                         <span className={`text-sm ${isSelected ? 'font-bold text-primary' : 'text-gray-600'}`}>{opt}</span>
                         <input type="checkbox" className="hidden" checked={isSelected} onChange={() => handleSelect(opt)} />
                       </label>
                     )
                  })}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
               {!showOther ? (
                 <button type="button" onClick={() => setShowOther(true)} className="flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors px-2">
                    <Plus size={16} className="mr-1" /> Add "Other" Custom Value
                 </button>
               ) : (
                 <form onSubmit={handleAddOther} className="flex flex-col space-y-2">
                    <div className="flex items-center bg-white border border-primary px-3 py-2 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                      {prefix && <span className="text-gray-400 text-sm mr-1">{prefix}</span>}
                      <input 
                        type="text" 
                        value={otherInput} 
                        onChange={(e) => setOtherInput(e.target.value)} 
                        autoFocus
                        placeholder="Type custom value..." 
                        className="flex-1 text-sm text-gray-900 border-none outline-none focus:ring-0 p-0 bg-transparent"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={() => {setShowOther(false); setOtherInput("");}} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
                      <button type="submit" disabled={!otherInput.trim()} className="text-xs font-bold text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark px-4 py-1.5 rounded-lg shadow-sm transition-colors">Add</button>
                    </div>
                 </form>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default MultiSelectDropdown;
