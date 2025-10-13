"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiChevronDown } from "react-icons/hi2";

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface CustomSelectProps {
  name: string;
  id: string;
  placeholder: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const CustomSelect = ({
  name,
  id,
  placeholder,
  options,
  value,
  onChange,
  className = "",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selectedValue} />

      {/* Custom Select Button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1 cursor-pointer text-left flex items-center justify-between ${
          isOpen ? "border-secondary" : ""
        }`}
      >
        <span className={selectedValue ? "text-foreground" : "text-foreground/50"}>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="mr-2">{selectedOption.icon}</span>}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <HiChevronDown
          className={`w-5 h-5 text-secondary transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed md:absolute left-4 right-4 md:left-auto md:right-auto z-[9999] w-auto md:w-full mt-2 bg-zinc-900/95 backdrop-blur-xl border border-secondary/20 rounded-2xl shadow-[0_8px_30px_rgba(168,171,243,0.2)] overflow-hidden"
            style={{
              top: containerRef.current?.getBoundingClientRect().bottom
                ? `${containerRef.current.getBoundingClientRect().bottom + 8}px`
                : 'auto'
            }}
          >
            <div className="max-h-64 overflow-y-auto py-2">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-3 transition-all duration-200 active:bg-secondary/20 md:hover:bg-secondary/10 md:hover:pl-5 ${
                    selectedValue === option.value
                      ? "bg-secondary/10 text-secondary font-medium"
                      : "text-foreground"
                  } ${index !== options.length - 1 ? "border-b border-foreground/5" : ""}`}
                >
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;

