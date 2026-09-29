import React from 'react';

interface SynapseLogoProps {
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SynapseLogo: React.FC<SynapseLogoProps> = ({
  showText = true,
  className = '',
  size = 'md',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3 blue pill horizontal bars icon */}
      <div
        className="flex flex-col justify-center gap-1 w-6 h-6 shrink-0"
        aria-hidden="true"
      >
        <span className="h-[3px] w-4.5 bg-blue-600 rounded-full transition-all duration-300" />
        <span className="h-[3px] w-6 bg-blue-600 rounded-full transition-all duration-300" />
        <span className="h-[3px] w-3.5 bg-blue-600 rounded-full transition-all duration-300" />
      </div>

      {showText && (
        <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          CEC Drive
        </span>
      )}
    </div>
  );
};
