import React from 'react';

interface AdUnitProps {
  type: 'header' | 'inline' | 'sidebar' | 'footer';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ type, className = '' }) => {
  const getDimensions = () => {
    switch (type) {
      case 'header': return 'h-[90px] w-full max-w-[728px]';
      case 'inline': return 'h-[250px] w-full';
      case 'sidebar': return 'h-[600px] w-[300px]';
      case 'footer': return 'h-[90px] w-full';
      default: return 'h-[250px] w-full';
    }
  };

  return (
    <div className={`bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm font-medium mx-auto my-4 no-print ${getDimensions()} ${className}`}>
      <div className="text-center">
        <p className="uppercase tracking-wider mb-1">Advertisement</p>
        <p className="text-xs opacity-75">{type} placement</p>
      </div>
    </div>
  );
};

export default AdUnit;