import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function Dropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value || opt.id === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 shadow-xs hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
      >
        <span className={selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label || selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full bg-white border border-slate-200/80 rounded-xl shadow-lg py-1.5 max-h-60 overflow-y-auto focus:outline-none"
          >
            {options.map((option) => {
              const optVal = option.value !== undefined ? option.value : option.id;
              const isSelected = optVal === value;
              return (
                <button
                  key={optVal}
                  type="button"
                  onClick={() => {
                    onChange(optVal, option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-indigo-50/70 text-indigo-600 font-medium' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className="w-4 h-4 text-slate-500" />}
                    <span>{option.label || option.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
