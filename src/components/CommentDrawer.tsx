import React, { useState } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { usePulse } from '../context/PulseContext';
import { UserAvatar } from './UserAvatar';

export const CommentDrawer: React.FC = () => {
  const {
    posts,
    activeCommentPostId,
    setActiveCommentPostId,
    addComment,
    deleteComment,
    currentUser,
  } = usePulse();

  const [commentText, setCommentText] = useState('');

  if (!activeCommentPostId) return null;

  const post = posts.find((p) => p.id === activeCommentPostId);
  if (!post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setActiveCommentPostId(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-h-[82vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Drag Handle Affordance */}
        <div className="w-10 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Comments ({post.comments.length})
            </h3>
            <p className="text-xs text-zinc-400 truncate max-w-[240px]">
              @{post.userHandle} · {post.location}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveCommentPostId(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            aria-label="Close comments drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Author Caption Pin */}
        <div className="px-5 py-3.5 bg-zinc-900/40 border-b border-zinc-900 flex items-start gap-3">
          <UserAvatar
            initials={post.userAvatarInitials}
            color={post.userAvatarColor}
            displayName={post.userDisplayName}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-100">@{post.userHandle}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-zinc-400">{post.timestampLabel}</span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{post.caption}</p>
          </div>
        </div>

        {/* Scrollable Comments List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {post.comments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-zinc-300">No comments yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                Start the conversation about @{post.userHandle}&apos;s 9:16 composition.
              </p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <UserAvatar
                    initials={comment.userAvatarInitials}
                    color={comment.userAvatarColor}
                    displayName={comment.userDisplayName}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-zinc-100">
                        @{comment.userHandle}
                      </span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="text-zinc-500">9:16 Critique</span>
                    </div>
                    <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>

                {currentUser?.id === comment.userId && (
                  <button
                    type="button"
                    onClick={() => deleteComment(post.id, comment.id)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-rose-500 transition-colors shrink-0"
                    title="Delete comment"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Comment Input Footer */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2.5"
        >
          {currentUser && (
            <UserAvatar
              initials={currentUser.avatarInitials}
              color={currentUser.avatarColor}
              displayName={currentUser.displayName}
              size="sm"
            />
          )}
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              currentUser
                ? `Comment as @${currentUser.handle}...`
                : 'Sign in to post a comment...'
            }
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </form>
      </div>
    </div>
  );
};
