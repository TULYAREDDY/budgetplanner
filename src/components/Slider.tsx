import React, { useState } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        <span className="text-sm font-medium text-gray-900">
          {valuePrefix}{value}{valueSuffix}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div 
          className="absolute h-2 bg-primary rounded-l-lg" 
          style={{ width: `${percentage}%`, top: '0px' }}
        />
        {showTooltip && (
          <div 
            className="absolute -top-8 px-2 py-1 bg-primary text-white text-xs rounded transform -translate-x-1/2"
            style={{ left: `${percentage}%` }}
          >
            {valuePrefix}{value}{valueSuffix}
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{valuePrefix}{min}{valueSuffix}</span>
        <span>{valuePrefix}{max}{valueSuffix}</span>
      </div>
    </div>
  );
};

export default Slider;