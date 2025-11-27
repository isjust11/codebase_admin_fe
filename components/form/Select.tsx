import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import Image from "next/image";
import { mergeImageUrl } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  avatar?: string;
  [key: string]: any;
}

interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string | string[]) => void;
  className?: string;
  defaultValue?: string | string[];
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
  value?: string | string[];
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  multiple = false,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  renderOption,
  value,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Use controlled value if provided
  const currentValues = value !== undefined 
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : selectedValues;

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      
      setSelectedValues(newValues);
      onChange(newValues);
    } else {
      setSelectedValues([optionValue]);
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  // Handle removing selected item (for multiple mode)
  const handleRemove = (valueToRemove: string) => {
    const newValues = currentValues.filter(v => v !== valueToRemove);
    setSelectedValues(newValues);
    onChange(newValues);
  };

  // Handle clearing all selections
  const handleClear = () => {
    setSelectedValues([]);
    onChange(multiple ? [] : "");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Get display text for single selection
  const getDisplayText = () => {
    if (multiple) {
      if (currentValues.length === 0) return placeholder;
      if (currentValues.length === 1) {
        const option = options.find(opt => opt.value === currentValues[0]);
        return option?.label || currentValues[0];
      }
      return `${currentValues.length} items selected`;
    } else {
      const selectedOption = options.find(opt => opt.value === currentValues[0]);
      return selectedOption?.label || placeholder;
    }
  };

  // Default option renderer
  const defaultRenderOption = (option: SelectOption) => (
    <div className="flex items-center gap-2">
      {option.avatar && (
        <Image
          width={24}
          height={24}
          src={mergeImageUrl(option.avatar || '')}
          alt={option.label}
          className="w-6 h-6 rounded-full bg-gray-200 ring-1 ring-gray-300"
        />
      )}
      <span>{option.label}</span>
    </div>
  );

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Select Trigger */}
      <div
        className={`h-10 w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
          currentValues.length > 0
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {multiple && currentValues.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {currentValues.slice(0, 3).map((value, index) => {
                  const option = options.find(opt => opt.value === value);
                  return (
                    <span
                      key={`${value ?? "option"}-${index}`}
                      className="inline-flex items-center gap-1 bg-brand-100 text-brand-800 px-2 py-1 rounded text-xs"
                    >
                      {option?.label || value}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-brand-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(value);
                        }}
                      />
                    </span>
                  );
                })}
                {currentValues.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{currentValues.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span>{getDisplayText()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentValues.length > 0 && (
              <X
                className="h-4 w-4 cursor-pointer hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = currentValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      isSelected ? "bg-brand-50 dark:bg-brand-900/20" : ""
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center gap-2">
                      {renderOption ? renderOption(option) : defaultRenderOption(option)}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-brand-600" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
