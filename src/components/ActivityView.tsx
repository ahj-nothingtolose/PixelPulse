import React from 'react';
import { Heart, MessageCircle, UserPlus, Camera, CheckCheck } from 'lucide-react';
import { usePulse } from '../context/PulseContext';
import { UserAvatar } from './UserAvatar';
import { VerticalImage } from './VerticalImage';

export const ActivityView: React.FC = () => {
  const {
    notifications,
    markAllNotificationsRead,
    setActiveTab,
    setActiveCommentPostId,
  } = usePulse();

  return (
    <div className="pb-20">
      <div className="px-4 py-3.5 border-b border-zinc-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-100">Activity & Pulse Log</h2>
          <p className="text-xs text-zinc-400">
            Real-time likes, critiques, and 9:16 darkroom uploads
          </p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <CheckCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>Mark Read</span>
        </button>
      </div>

      <div className="divide-y divide-zinc-900">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`px-4 py-3.5 flex items-center justify-between gap-3 transition-colors ${
              item.isRead ? 'bg-transparent' : 'bg-rose-950/10'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <UserAvatar
                  initials={item.actorAvatarInitials}
                  color={item.actorAvatarColor}
                  displayName={item.actorDisplayName}
                  size="md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  {item.type === 'like' && (
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  )}
                  {item.type === 'comment' && (
                    <MessageCircle className="w-3 h-3 text-sky-400" />
                  )}
                  {item.type === 'follow' && (
                    <UserPlus className="w-3 h-3 text-emerald-400" />
                  )}
                  {item.type === 'upload' && (
                    <Camera className="w-3 h-3 text-amber-400" />
                  )}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-xs text-zinc-200 leading-relaxed">
                  <span className="font-semibold text-zinc-100 mr-1">
                    @{item.actorHandle}
                  </span>
                  {item.message}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {item.timestampLabel}
                </p>
              </div>
            </div>

            {item.postThumbUrl && (
              <button
                type="button"
                onClick={() => {
                  if (item.postId) {
                    setActiveCommentPostId(item.postId);
                  } else {
                    setActiveTab('home');
                  }
                }}
                className="w-10 aspect-[9/16] rounded-lg overflow-hidden border border-zinc-800 shrink-0"
              >
                <VerticalImage
                  src={item.postThumbUrl}
                  alt="Post thumbnail"
                  fallbackTitle="9:16"
                />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
