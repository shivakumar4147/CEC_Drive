import React from 'react';

interface CECDriveLoaderProps {
  className?: string;
}

export const CECDriveLoader: React.FC<CECDriveLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`inline-flex flex-col items-start justify-center gap-3 select-none ${className}`}>
      {/* Embedded 60fps Keyframe Wave Animation */}
      <style>{`
        @keyframes cecWave {
          0% {
            width: 10px;
            opacity: 0.6;
          }
          30% {
            width: 108px;
            opacity: 1;
          }
          60% {
            width: 10px;
            opacity: 0.6;
          }
          100% {
            width: 10px;
            opacity: 0.6;
          }
        }
        .cec-wave-line-1 {
          animation: cecWave 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 0s;
        }
        .cec-wave-line-2 {
          animation: cecWave 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 0.22s;
        }
        .cec-wave-line-3 {
          animation: cecWave 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 0.44s;
        }
      `}</style>

      {/* Container aligned with text width */}
      <div className="flex flex-col items-start gap-2.5 h-14 justify-between w-[108px]">
        {/* Row 1 (Top) */}
        <div className="h-2.5 rounded-full bg-blue-600 cec-wave-line-1" />

        {/* Row 2 (Middle) */}
        <div className="h-2.5 rounded-full bg-blue-600 cec-wave-line-2" />

        {/* Row 3 (Bottom) */}
        <div className="h-2.5 rounded-full bg-blue-600 cec-wave-line-3" />
      </div>

      {/* Brand Text */}
      <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
        CEC Drive
      </span>
    </div>
  );
};
