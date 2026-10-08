import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

interface QuantityPickerDropdownProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  presets?: number[];
  min?: number;
  label?: string;
}

const DEFAULT_BARS_PRESETS = [1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 30, 40, 60, 88, 94, 100, 120];

export const QuantityPickerDropdown: React.FC<QuantityPickerDropdownProps> = ({
  value,
  onChange,
  placeholder = '88',
  presets = DEFAULT_BARS_PRESETS,
  min = 1,
  label = 'Số thanh',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Stepper handlers
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = Number(value) || min;
    if (current > min) {
      onChange(current - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = Number(value) || 0;
    onChange(current + 1);
  };

  const handleSelectPreset = (p: number) => {
    onChange(p);
    setIsOpen(false);
  };

  return (
    <div className="quantity-picker-container" ref={containerRef}>
      <div className={`quantity-input-box ${isOpen ? 'active' : ''}`}>
        {/* Decrement Button */}
        <button
          type="button"
          className="qty-btn qty-btn-minus"
          onClick={handleDecrement}
          title="Giảm 1"
        >
          <Minus size={11} strokeWidth={2.5} />
        </button>

        {/* Number Input */}
        <input
          type="number"
          className="qty-number-input font-mono"
          value={value || ''}
          placeholder={placeholder}
          min={min}
          onChange={e => onChange(Number(e.target.value))}
          onClick={() => setIsOpen(true)}
        />

        {/* Increment Button */}
        <button
          type="button"
          className="qty-btn qty-btn-plus"
          onClick={handleIncrement}
          title="Tăng 1"
        >
          <Plus size={11} strokeWidth={2.5} />
        </button>

        {/* Dropdown Toggle Caret */}
        <button
          type="button"
          className={`qty-dropdown-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
          title="Mở bảng chọn số lượng nhanh"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Animated Preset Popover Dropdown */}
      {isOpen && (
        <div className="quantity-dropdown-popover">
          <div className="qty-popover-head">
            <span>Chọn nhanh {label}:</span>
          </div>

          <div className="qty-presets-grid">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                className={`qty-preset-btn font-mono ${value === p ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
