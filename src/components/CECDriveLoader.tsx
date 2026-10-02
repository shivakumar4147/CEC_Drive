import React, { useState, useEffect } from 'react';

interface CECDriveLoaderProps {
  className?: string;
}

export const CECDriveLoader: React.FC<CECDriveLoaderProps> = ({ className = '' }) => {
  // Step sequence: 0 = 3 dots, 1 = top bar, 2 = middle bar, 3 = bottom bar
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 320); // 320ms per transition step for smooth butter feel

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-start justify-center gap-3 select-none ${className}`}>
      {/* 3 Stacked Rows (Dots morphing into horizontal bars) */}
      <div className="flex flex-col items-start gap-2 h-14 justify-between">
        {/* Row 1 (Top) */}
        <div
          className={`h-2.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out ${
            step === 1 ? 'w-14 bg-blue-600' : 'w-2.5 bg-blue-600/90'
          }`}
        />

        {/* Row 2 (Middle) */}
        <div
          className={`h-2.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out ${
            step === 2 ? 'w-14 bg-blue-600' : 'w-2.5 bg-blue-600/90'
          }`}
        />

        {/* Row 3 (Bottom) */}
        <div
          className={`h-2.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out ${
            step === 3 ? 'w-14 bg-blue-600' : 'w-2.5 bg-blue-600/90'
          }`}
        />
      </div>

      {/* Brand Text */}
      <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
        CEC Drive
      </span>
    </div>
  );
};
