import React from 'react';

interface FolderIcon3DProps {
  className?: string;
  size?: number;
}

export const FolderIcon3D: React.FC<FolderIcon3DProps> = ({
  className = 'w-24 h-20',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: (size * 96) / 120 } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* Back tab and body gradient */}
        <linearGradient id="folderBackGrad" x1="60" y1="8" x2="60" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Front flap gradient with soft depth */}
        <linearGradient id="folderFrontGrad" x1="60" y1="26" x2="60" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        {/* Top glossy rim highlight */}
        <linearGradient id="folderRimGrad" x1="20" y1="26" x2="100" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#BFDBFE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
        </linearGradient>

        {/* Soft realistic drop shadow under folder */}
        <filter id="folderShadow" x="0" y="20" width="120" height="76" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1D4ED8" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Back Plate with Tab */}
      <path
        d="M14 20C14 14.4772 18.4772 10 24 10H46C49.1826 10 52.2348 11.2643 54.4853 13.5147L60 19.0294C61.1252 20.1547 62.6513 20.7868 64.2426 20.7868H96C101.523 20.7868 106 25.264 106 30.7868V78C106 83.5228 101.523 88 96 88H24C18.4772 88 14 83.5228 14 78V20Z"
        fill="url(#folderBackGrad)"
      />

      {/* Inner subtle lighter crease */}
      <rect x="22" y="24" width="76" height="12" rx="4" fill="#60A5FA" fillOpacity="0.3" />

      {/* Front Flap */}
      <g filter="url(#folderShadow)">
        <path
          d="M10 32C10 26.4772 14.4772 22 20 22H100C105.523 22 110 26.4772 110 32V80C110 85.5228 105.523 90 100 90H20C14.4772 90 10 85.5228 10 80V32Z"
          fill="url(#folderFrontGrad)"
        />
        {/* Front flap subtle top highlight line */}
        <path
          d="M20 23.5H100C104.694 23.5 108.5 27.3056 108.5 32V34C108.5 29.3056 104.694 25.5 100 25.5H20C15.3056 25.5 11.5 29.3056 11.5 34V32C11.5 27.3056 15.3056 23.5 20 23.5Z"
          fill="url(#folderRimGrad)"
        />
      </g>
    </svg>
  );
};
