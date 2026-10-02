import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Trash2,
  Sliders,
  Check,
  Copy,
} from 'lucide-react';
import { PostItem } from '../types/pulse';
import { usePulse } from '../context/PulseContext';
import { UserAvatar } from './UserAvatar';
import { VerticalImage } from './VerticalImage';

interface PostCardProps {
  post: PostItem;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    followingIds,
    toggleLikePost,
    toggleBookmarkPost,
    setActiveCommentPostId,
    setSelectedProfileId,
    setActiveTab,
    toggleFollowUser,
    deletePost,
    addComment,
    sendDirectMessage,
    users,
    showToast,
  } = usePulse();

  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [inspectDarkroom, setInspectDarkroom] = useState(false);
  const lastTapRef = useRef<number>(0);

  const isLiked = currentUser ? post.likesUserIds.includes(currentUser.id) : false;
  const isBookmarked = currentUser
    ? post.bookmarkedByUserIds.includes(currentUser.id)
    : false;
  const isOwnPost = currentUser?.id === post.userId;
  const isFollowing = followingIds.includes(post.userId);

  const triggerDoubleTapLike = () => {
    setShowHeartBurst(true);
    toggleLikePost(post.id, true);
    setTimeout(() => {
      setShowHeartBurst(false);
    }, 850);
  };

  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      triggerDoubleTapLike();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleNavigateToAuthor = () => {
    setSelectedProfileId(post.userId);
    setActiveTab('profile');
  };

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    addComment(post.id, quickComment);
    setQuickComment('');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`).catch(() => {});
    }
    setShowShareMenu(false);
    showToast(`Copied link to @${post.userHandle}'s 9:16 post`);
  };

  const handleShareToUser = (targetUserId: string, handle: string) => {
    sendDirectMessage(
      targetUserId,
      `Shared @${post.userHandle}'s 9:16 vertical frame from ${post.location}`,
      post.id
    );
    setShowShareMenu(false);
    showToast(`Sent post to @${handle}`);
  };

  // Compute CSS filter for posts that weren't already baked onto an uploaded canvas dataURL
  const isUploadedDataUrl = post.imageUrl.startsWith('data:image');
  const { exposure, contrast, saturation, temperature, isBlackAndWhite } = post.editSettings;
  const computedFilter = isUploadedDataUrl
    ? undefined
    : `brightness(${100 + exposure}%) contrast(${100 + contrast}%) saturate(${
        isBlackAndWhite ? 0 : 100 + saturation
      }%) sepia(${temperature > 0 ? Math.round(temperature * 0.4) : 0}%) hue-rotate(${
        temperature < 0 ? Math.round(temperature * 0.35) : 0
      }deg)`;

  return (
    <article
      id={`post-${post.id}`}
      className="border-b border-zinc-800/80 pb-5 mb-6 last:border-b-0"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            initials={post.userAvatarInitials}
            color={post.userAvatarColor}
            displayName={post.userDisplayName}
            size="md"
            hasStoryRing
            onClick={handleNavigateToAuthor}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNavigateToAuthor}
                className="text-sm font-semibold text-zinc-100 hover:text-rose-400 transition-colors truncate"
              >
                {post.userHandle}
              </button>
              <span aria-hidden="true" className="text-zinc-600 text-xs">
                ·
              </span>
              <span className="text-xs text-zinc-400 whitespace-nowrap">
                {post.timestampLabel}
              </span>
            </div>
            {/* Unboxed Metadata: Location & Category */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate mt-0.5">
              <span className="truncate">{post.location}</span>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-500 whitespace-nowrap">{post.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isOwnPost && (
            <button
              type="button"
              onClick={() => toggleFollowUser(post.userId)}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                isFollowing
                  ? 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/80'
                  : 'text-rose-400 hover:text-rose-300 bg-rose-500/10'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setInspectDarkroom((prev) => !prev)}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
              inspectDarkroom
                ? 'text-rose-400 bg-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Inspect 9:16 Darkroom Settings & EXIF"
            aria-label="Inspect Darkroom Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
          {isOwnPost && (
            <button
              type="button"
              onClick={() => deletePost(post.id)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-rose-500 transition-colors"
              title="Delete 9:16 Post"
              aria-label="Delete Post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Fixed 9:16 Portrait Aspect Ratio Media Frame */}
      <div
        onClick={handleImageTap}
        onDoubleClick={triggerDoubleTapLike}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') triggerDoubleTapLike();
        }}
        aria-label={`9:16 vertical photo by ${post.userDisplayName}. Double tap to like.`}
        className="relative w-full aspect-[9/16] bg-zinc-950 overflow-hidden select-none cursor-pointer group border-y border-zinc-900"
      >
        <div
          className="w-full h-full transition-transform duration-300"
          style={computedFilter ? { filter: computedFilter } : undefined}
        >
          <VerticalImage
            src={post.imageUrl}
            alt={post.caption}
            fallbackTitle={post.location}
            fallbackSubtitle={post.exifSummary}
            isBlackAndWhite={!computedFilter && isBlackAndWhite}
          />
        </div>

        {/* Subtle bottom scrim with EXIF & 9:16 ratio readout */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pt-12 pb-3.5 px-4 flex items-end justify-between pointer-events-none">
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-300/90 tabular-nums">
            <span>{post.exifSummary}</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
            9:16 · {post.editSettings.isBlackAndWhite ? 'B&W' : post.editSettings.presetName}
          </span>
        </div>

        {/* Optional Darkroom Recipe Inspector Overlay */}
        {inspectDarkroom && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-4 top-4 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 shadow-xl"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
              <span className="font-semibold text-zinc-100">
                9:16 Darkroom Grading Recipe
              </span>
              <span className="font-mono text-zinc-400">
                {post.editSettings.presetName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 font-mono text-[11px] tabular-nums text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Exposure</span>
                <span>
                  {exposure > 0 ? `+${exposure}` : exposure}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Contrast</span>
                <span>
                  {contrast > 0 ? `+${contrast}` : contrast}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Saturation</span>
                <span>
                  {isBlackAndWhite ? 'Mono (-100)' : saturation > 0 ? `+${saturation}` : saturation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Temp (K)</span>
                <span>
                  {temperature > 0 ? `+${temperature} Warm` : temperature < 0 ? `${temperature} Cool` : '0 Neutral'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Double-Tap Heart Burst Animation Overlay */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_8px_24px_rgba(225,29,72,0.65)] animate-heart-burst" />
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="px-3 pt-2 flex items-center justify-between relative">
        <div className="flex items-center gap-1">
          {/* Heart / Like Button */}
          <button
            type="button"
            onClick={() => toggleLikePost(post.id)}
            className="min-h-[44px] px-2.5 flex items-center gap-2 rounded-xl hover:bg-zinc-900/70 active:scale-95 transition-all"
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart
              className={`w-6 h-6 transition-transform duration-150 ${
                isLiked
                  ? 'text-rose-500 fill-rose-500 scale-105'
                  : 'text-zinc-100 hover:text-zinc-300'
              }`}
            />
            <span className="text-sm font-semibold text-zinc-100 font-mono tabular-nums">
              {post.likesUserIds.length}
            </span>
          </button>

          {/* Comment Drawer Trigger */}
          <button
            type="button"
            onClick={() => setActiveCommentPostId(post.id)}
            className="min-h-[44px] px-2.5 flex items-center gap-2 rounded-xl hover:bg-zinc-900/70 active:scale-95 transition-all"
            aria-label="Open comments"
          >
            <MessageCircle className="w-6 h-6 text-zinc-100 hover:text-zinc-300" />
            <span className="text-sm font-semibold text-zinc-100 font-mono tabular-nums">
              {post.comments.length}
            </span>
          </button>

          {/* Share Trigger */}
          <button
            type="button"
            onClick={() => setShowShareMenu((prev) => !prev)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-zinc-900/70 active:scale-95 transition-all"
            aria-label="Share post"
          >
            <Send className="w-5 h-5 text-zinc-100 hover:text-zinc-300" />
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={() => toggleBookmarkPost(post.id)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-zinc-900/70 active:scale-95 transition-all"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Bookmark
            className={`w-6 h-6 transition-colors ${
              isBookmarked
                ? 'text-amber-400 fill-amber-400'
                : 'text-zinc-100 hover:text-zinc-300'
            }`}
          />
        </button>

        {/* Quick Share Popover */}
        {showShareMenu && (
          <div className="absolute left-4 top-13 z-30 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-2xl">
            <p className="text-xs font-semibold text-zinc-300 mb-2">
              Share 9:16 Vertical Frame
            </p>
            <div className="space-y-1 mb-2">
              {users
                .filter((u) => u.id !== currentUser?.id)
                .slice(0, 3)
                .map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleShareToUser(u.id, u.handle)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar
                        initials={u.avatarInitials}
                        color={u.avatarColor}
                        displayName={u.displayName}
                        size="xs"
                      />
                      <span className="text-xs text-zinc-200 truncate">@{u.handle}</span>
                    </div>
                    <span className="text-[11px] text-rose-400 font-medium">Send</span>
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Direct Post Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Caption & Comment Preview */}
      <div className="px-4 pt-1.5 space-y-2">
        <p className="text-sm text-zinc-200 leading-relaxed">
          <button
            type="button"
            onClick={handleNavigateToAuthor}
            className="font-semibold text-zinc-100 hover:underline mr-2"
          >
            {post.userHandle}
          </button>
          {post.caption}
        </p>

        {/* Preview of comments */}
        {post.comments.length > 0 && (
          <div className="space-y-1 pt-0.5">
            {post.comments.length > 2 && (
              <button
                type="button"
                onClick={() => setActiveCommentPostId(post.id)}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                View all {post.comments.length} comments
              </button>
            )}
            {post.comments.slice(-2).map((comment) => (
              <div key={comment.id} className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-semibold text-zinc-100 mr-1.5">
                  {comment.userHandle}
                </span>
                <span>{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Inline Comment Input */}
        <form
          onSubmit={handleQuickCommentSubmit}
          className="flex items-center gap-2 pt-2 border-t border-zinc-900/90"
        >
          <input
            type="text"
            value={quickComment}
            onChange={(e) => setQuickComment(e.target.value)}
            placeholder="Add a comment on this 9:16 frame..."
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none min-h-[36px]"
          />
          {quickComment.trim().length > 0 && (
            <button
              type="submit"
              className="text-xs font-semibold text-rose-500 hover:text-rose-400 px-2 py-1 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          )}
        </form>
      </div>
    </article>
  );
};
