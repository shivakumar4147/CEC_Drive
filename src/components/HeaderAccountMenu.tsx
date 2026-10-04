import React from 'react';
import { UserProfile, UserRole } from '../types';

interface HeaderAccountMenuProps {
  user: UserProfile;
  userRole: UserRole;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export const HeaderAccountMenu: React.FC<HeaderAccountMenuProps> = ({
  user,
  onOpenProfile,
}) => {
  return (
    <button
      type="button"
      onClick={() => onOpenProfile && onOpenProfile()}
      className="shrink-0 p-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-colors active:scale-95"
      aria-label="Open Account Profile"
      title="View Account Profile"
    >
      {/* Containerless Pure Account Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
          user.bgColor || 'bg-blue-600'
        }`}
      >
        {user.initial || user.name.charAt(0).toUpperCase()}
      </div>
    </button>
  );
};
