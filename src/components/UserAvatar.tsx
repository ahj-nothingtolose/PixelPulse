import React from 'react';

interface UserAvatarProps {
  initials: string;
  color: string;
  displayName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasStoryRing?: boolean;
  onClick?: () => void;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  initials,
  color,
  displayName,
  size = 'md',
  hasStoryRing = false,
  onClick,
}) => {
  const inner = (
    <div
      style={{ backgroundColor: color }}
      className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center font-semibold tracking-tight text-white select-none shrink-0 shadow-inner ring-1 ring-white/15`}
      aria-label={displayName}
      title={displayName}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );

  if (hasStoryRing) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="p-[2px] rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-400 inline-flex items-center justify-center transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        <div className="p-[2px] rounded-full bg-zinc-950">{inner}</div>
      </button>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center rounded-full transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        {inner}
      </button>
    );
  }

  return inner;
};
