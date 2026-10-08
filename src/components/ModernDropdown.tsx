import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: number;
  label: string;
  sub?: string;
  badgeClass?: string;
}

interface ModernDropdownProps {
  value: number;
  options: DropdownOption[];
  onChange: (value: number) => void;
  className?: string;
}

export const ModernDropdown: React.FC<ModernDropdownProps> = ({
  value,
  options,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: number) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`modern-dropdown-container ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`modern-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-left">
          <span className={`trigger-badge pill-${selectedOption?.value || value}`}>
            Φ{selectedOption?.value || value}
          </span>
          {selectedOption?.sub && (
            <span className="trigger-sub font-mono">{selectedOption.sub}</span>
          )}
        </div>

        <span className={`trigger-chevron ${isOpen ? 'open' : ''}`}>
          <ChevronDown size={14} />
        </span>
      </button>

      {/* Animated Dropdown Menu Popover */}
      {isOpen && (
        <div className="modern-dropdown-menu" role="listbox">
          <div className="dropdown-menu-header">
            <span>Chọn đường kính cốt thép</span>
          </div>

          <div className="dropdown-options-list">
            {options.map(option => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  className={`dropdown-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="option-left">
                    <span className={`option-badge pill-${option.value}`}>
                      Φ{option.value}
                    </span>
                    <span className="option-title">Thép Φ{option.value}</span>
                  </div>

                  <div className="option-right">
                    {option.sub && (
                      <span className="option-sub font-mono">{option.sub}</span>
                    )}
                    {isSelected && (
                      <span className="option-check">
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
