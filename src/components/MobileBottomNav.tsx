import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Folder,
  Pin,
  Calendar,
  Megaphone,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileBottomNavProps {
  activeNav: string;
  userRole: UserRole;
  onSelectNav: (navId: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNav,
  userRole,
  onSelectNav,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 375
  );

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(updateWidth);
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (ro) ro.disconnect();
    };
  }, []);

  // Determine Home tab target based on role
  const homeTarget =
    userRole === 'admin'
      ? 'admin-panel'
      : userRole === 'uploader'
      ? 'lecturer-panel'
      : 'dashboard';

  // Exactly 5 compact navigation items with enlarged w-5 h-5 icons
  const tabs: NavTabItem[] = [
    {
      id: homeTarget,
      label: 'Home',
      icon: <Home className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'documents',
      label: 'Files',
      icon: <Folder className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'pinned-folders',
      label: 'Pinned',
      icon: <Pin className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'announcements',
      label: 'Notices',
      icon: <Megaphone className="w-5 h-5 shrink-0" />,
    },
  ];

  // Active index calculation
  let activeIndex = tabs.findIndex((tab) => tab.id === activeNav);
  if (activeIndex === -1) {
    if (activeNav === 'documents' || activeNav === 'recent-files') {
      activeIndex = 1;
    } else {
      activeIndex = 0;
    }
  }

  // Active column center calculations
  const activeCenterPx = (containerWidth / 5) * activeIndex + (containerWidth / 5) / 2;
  const activeCenterCss = `calc(${(100 / 5) * activeIndex}% + ${(100 / 5) / 2}%)`;

  // Dynamic SVG path built with exact concentric SVG circular arcs (A)
  // Radius of U-scoop = 26px (Bubble radius = 20px -> gap = strictly 6.0px everywhere)
  // Shoulder radius = 7px (smooth 0-deg tangent entry at top edge)
  const getScoopGeometry = () => {
    const cx = activeCenterPx;
    const rScoop = 26; // concentric cutout radius (20px bubble + 6px uniform gap)
    const rShoulder = 7; // smooth shoulder fillet radius
    const totalHalfWidth = rScoop + rShoulder; // 33px opening half-width

    const x1 = cx - totalHalfWidth;
    const x2 = cx + totalHalfWidth;

    // Exact tangential contact point math between shoulder arc & concentric scoop arc
    const sinTheta = rShoulder / totalHalfWidth; // 7 / 33 = 0.21212
    const cosTheta = Math.sqrt(1 - sinTheta * sinTheta); // 0.97724

    const xLeftTan = (cx - rScoop * cosTheta).toFixed(2);
    const xRightTan = (cx + rScoop * cosTheta).toFixed(2);
    const yTan = (rScoop * sinTheta).toFixed(2);

    const x1Str = x1.toFixed(2);
    const x2Str = x2.toFixed(2);

    const borderPath = `M 0,0 L ${x1Str},0 A ${rShoulder} ${rShoulder} 0 0 1 ${xLeftTan},${yTan} A ${rScoop} ${rScoop} 0 0 0 ${xRightTan},${yTan} A ${rShoulder} ${rShoulder} 0 0 1 ${x2Str},0 L ${containerWidth.toFixed(2)},0`;
    const fullFillPath = `${borderPath} L ${containerWidth.toFixed(2)},52 L 0,52 Z`;

    return { borderPath, fullFillPath };
  };

  const { borderPath, fullFillPath } = getScoopGeometry();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden select-none pb-safe bg-transparent">
      {/* Edge-to-Edge Navigation Bar Container */}
      <div ref={containerRef} className="relative w-full h-[52px] overflow-visible">
        
        {/* Single Seamless SVG Navigation Bar Background */}
        <svg
          className="absolute inset-0 w-full h-full text-white dark:text-neutral-900 fill-current overflow-visible pointer-events-none"
          viewBox={`0 0 ${containerWidth} 52`}
          preserveAspectRatio="none"
        >
          {/* Main Solid Fill */}
          <path
            d={fullFillPath}
            className="transition-all duration-300 ease-out"
          />

          {/* Upper Edge Top Border Stroke */}
          <path
            d={borderPath}
            className="transition-all duration-300 ease-out fill-none stroke-neutral-200 dark:stroke-neutral-800"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Floating Active Blue Circle (w-10 h-10) elevated to top: -20px with clear 6px gap inside deep U-scoop */}
        <div
          className="absolute h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center transition-all duration-300 ease-out z-20 pointer-events-none shadow-md"
          style={{
            top: '-20px',
            left: `calc(${activeCenterCss} - 20px)`,
          }}
        >
          <div className="text-white scale-110">
            {tabs[activeIndex]?.icon}
          </div>
        </div>

        {/* Active Centered Label Text (Neatly centered inside bar below U-scoop curve) */}
        <div
          className="absolute bottom-1.5 w-1/5 flex items-center justify-center text-center transition-all duration-300 ease-out z-20 pointer-events-none"
          style={{
            left: `calc(${(100 / 5) * activeIndex}%)`,
          }}
        >
          <span className="text-[10px] font-sans font-bold tracking-tight text-blue-600 dark:text-blue-400 whitespace-nowrap animate-in fade-in duration-150">
            {tabs[activeIndex]?.label}
          </span>
        </div>

        {/* 5 Stationary Tab Touch Zones Row */}
        <div className="w-full flex items-center justify-between h-full relative z-30 px-1">
          {tabs.map((tab, idx) => {
            const isActive = idx === activeIndex;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectNav(tab.id)}
                className="w-1/5 flex flex-col items-center justify-center h-full focus:outline-none cursor-pointer relative"
                aria-label={tab.label}
              >
                {/* Inactive Icon (Perfectly Vertically Centered inside bar) */}
                <div
                  className={`flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'opacity-0 scale-75'
                      : 'opacity-70 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white scale-100'
                  }`}
                >
                  {tab.icon}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
