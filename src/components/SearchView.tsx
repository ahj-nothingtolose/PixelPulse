import React, { useState } from 'react';
import { Search, Heart, Sliders, X } from 'lucide-react';
import { usePulse } from '../context/PulseContext';
import { VerticalImage } from './VerticalImage';
import { UserAvatar } from './UserAvatar';
import { PostCard } from './PostCard';

const CATEGORIES = [
  'All 9:16',
  'Street & Night',
  'Nature & Alpine',
  'Architecture',
  'Still Life',
  'Coastal',
  'Monochrome',
] as const;

export const SearchView: React.FC = () => {
  const {
    posts,
    users,
    openEditorWithSample,
    setSelectedProfileId,
    setActiveTab,
  } = usePulse();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>('All 9:16');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All 9:16'
        ? true
        : selectedCategory === 'Monochrome'
        ? post.editSettings.isBlackAndWhite
        : post.category === selectedCategory;

    if (!query.trim()) return matchesCategory;
    const q = query.toLowerCase();
    return (
      matchesCategory &&
      (post.caption.toLowerCase().includes(q) ||
        post.location.toLowerCase().includes(q) ||
        post.userHandle.toLowerCase().includes(q) ||
        post.exifSummary.toLowerCase().includes(q))
    );
  });

  const activePost = selectedPostId
    ? posts.find((p) => p.id === selectedPostId)
    : null;

  return (
    <div className="pb-20 space-y-4">
      {/* Search Input & Interactive Category Filter Bar */}
      <div className="px-4 pt-3 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 9:16 vertical studies, cities, lenses, or @handles..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Interactive Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured 9:16 Photographers Strip */}
      <div className="px-4">
        <p className="text-xs font-semibold text-zinc-400 mb-2">
          Curated 9:16 Vertical Photographers
        </p>
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setSelectedProfileId(u.id);
                setActiveTab('profile');
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 shrink-0 text-left transition-colors"
            >
              <UserAvatar
                initials={u.avatarInitials}
                color={u.avatarColor}
                displayName={u.displayName}
                size="sm"
              />
              <div>
                <p className="text-xs font-semibold text-zinc-100">@{u.handle}</p>
                <p className="text-[11px] text-zinc-400">{u.location}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column 9:16 Editorial Discovery Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-semibold text-zinc-300">
            Explore 9:16 Vertical Archive ({filteredPosts.length})
          </p>
          <span className="text-[11px] text-zinc-500 font-mono">
            Tap any frame to inspect or remix
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80"
            >
              <button
                type="button"
                onClick={() => setSelectedPostId(post.id)}
                className="w-full h-full block text-left"
              >
                <VerticalImage
                  src={post.imageUrl}
                  alt={post.caption}
                  fallbackTitle={post.location}
                  isBlackAndWhite={post.editSettings.isBlackAndWhite}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-10 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-xs text-zinc-100 font-medium">
                    <span className="truncate">@{post.userHandle}</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums text-[11px]">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      {post.likesUserIds.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {post.location} · {post.exifSummary.split('·')[0]}
                  </p>
                </div>
              </button>

              {/* Quick Remix in 9:16 Darkroom Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditorWithSample(post.imageUrl);
                }}
                className="absolute top-2.5 right-2.5 min-h-[34px] px-2.5 py-1 rounded-lg bg-black/70 hover:bg-rose-600 backdrop-blur-md text-[11px] font-medium text-zinc-100 flex items-center gap-1 transition-colors"
                title="Open this 9:16 photo in Darkroom Canvas Editor"
              >
                <Sliders className="w-3 h-3" />
                <span>Remix</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal when clicking an Explore 9:16 card */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedPostId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                Explore 9:16 Frame
              </span>
              <button
                type="button"
                onClick={() => setSelectedPostId(null)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PostCard post={activePost} />
          </div>
        </div>
      )}
    </div>
  );
};
