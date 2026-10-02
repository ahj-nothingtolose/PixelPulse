import React, { useState } from 'react';
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  Send,
  Database,
  Camera,
  Sliders,
  UserCheck,
  Code2,
} from 'lucide-react';
import { PulseProvider, usePulse } from './context/PulseContext';
import { PostCard } from './components/PostCard';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { AuthModal } from './components/AuthModal';
import { CommentDrawer } from './components/CommentDrawer';
import { DirectMessagesDrawer } from './components/DirectMessagesDrawer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ProfileView } from './components/ProfileView';
import { SearchView } from './components/SearchView';
import { ActivityView } from './components/ActivityView';
import { UserAvatar } from './components/UserAvatar';
import { STUDIO_SAMPLE_PHOTOS } from './data/initialData';

const MainShell: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    notifications,
    followingIds,
    activeTab,
    setActiveTab,
    setSelectedProfileId,
    setIsAuthModalOpen,
    setIsDmDrawerOpen,
    setIsArchitectureModalOpen,
    openEditorWithSample,
    toggleFollowUser,
    toastMessage,
  } = usePulse();

  const [feedFilter, setFeedFilter] = useState<
    'all' | 'following' | 'monochrome' | 'saved'
  >('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredFeedPosts = posts.filter((post) => {
    if (feedFilter === 'following') {
      return (
        followingIds.includes(post.userId) || post.userId === currentUser?.id
      );
    }
    if (feedFilter === 'monochrome') {
      return post.editSettings.isBlackAndWhite;
    }
    if (feedFilter === 'saved') {
      return currentUser
        ? post.bookmarkedByUserIds.includes(currentUser.id)
        : false;
    }
    return true;
  });

  const totalLikesCount = posts.reduce(
    (sum, post) => sum + post.likesUserIds.length,
    0
  );
  const totalCommentsCount = posts.reduce(
    (sum, post) => sum + post.comments.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col">
      {/* Top Header Bar — Strict 3-Zone Contract & Compact 48px Mobile Height */}
      <header className="sticky top-0 z-30 h-12 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 flex items-center justify-between">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('home');
          }}
          className="text-lg font-extrabold tracking-tight text-zinc-100 font-display whitespace-nowrap"
        >
          PixelPulse
        </a>

        {/* Zone 2: Clean Text Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap py-1 ${
              activeTab === 'home'
                ? 'text-zinc-100 underline underline-offset-4 decoration-rose-500'
                : ''
            }`}
          >
            9:16 Feed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap py-1 ${
              activeTab === 'search'
                ? 'text-zinc-100 underline underline-offset-4 decoration-rose-500'
                : ''
            }`}
          >
            Explore
          </button>
          <button
            type="button"
            onClick={() => openEditorWithSample()}
            className="hover:text-zinc-100 transition-colors whitespace-nowrap py-1"
          >
            Darkroom Canvas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap py-1 ${
              activeTab === 'activity'
                ? 'text-zinc-100 underline underline-offset-4 decoration-rose-500'
                : ''
            }`}
          >
            Activity
          </button>
          <button
            type="button"
            onClick={() => setIsArchitectureModalOpen(true)}
            className="hover:text-zinc-100 transition-colors whitespace-nowrap py-1"
          >
            Supabase Schema
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Contextual Actions (Notifications, DMs, Auth) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsArchitectureModalOpen(true)}
            className="min-h-[44px] px-2.5 flex items-center gap-1.5 rounded-xl text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors text-xs font-medium whitespace-nowrap"
            title="Supabase Architecture & SQL Setup Blueprint"
          >
            <Database className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Supabase Docs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-200 hover:bg-zinc-900 transition-colors"
            aria-label="Notifications and Activity"
          >
            <Heart className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2.5 right-2.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDmDrawerOpen(true)}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-200 hover:bg-zinc-900 transition-colors"
            aria-label="Direct Messages"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main 1440px Responsive Workspace Container */}
      <div className="flex-1 w-full max-w-[1380px] mx-auto flex justify-center lg:justify-between gap-6 px-0 sm:px-4 lg:px-8 pt-0 lg:pt-6">
        {/* LEFT DESKTOP RAIL: Photographer Session, Feed Filter & Quick Darkroom Roll */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 space-y-5 pb-24">
          {/* Current Photographer Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3.5">
            {currentUser ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      initials={currentUser.avatarInitials}
                      color={currentUser.avatarColor}
                      displayName={currentUser.displayName}
                      size="md"
                      hasStoryRing
                      onClick={() => {
                        setSelectedProfileId(currentUser.id);
                        setActiveTab('profile');
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-100 truncate">
                        {currentUser.displayName}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        @{currentUser.handle}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-xs font-medium text-rose-400 hover:text-rose-300 whitespace-nowrap"
                  >
                    Switch
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {currentUser.bio}
                </p>

                <button
                  type="button"
                  onClick={() => openEditorWithSample()}
                  className="w-full min-h-[42px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Open 9:16 Darkroom Editor</span>
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-zinc-200">
                  Join the 9:16 Vertical Network
                </p>
                <p className="text-xs text-zinc-400">
                  Sign in with email or launch an anonymous guest session to grade and publish 9:16 frames.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full min-h-[42px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                >
                  Sign In / Guest Access
                </button>
              </div>
            )}
          </div>

          {/* Interactive Feed Curation Controls */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-2.5">
            <p className="text-xs font-semibold text-zinc-300">
              Feed Stream Filter
            </p>
            <div className="space-y-1">
              {(
                [
                  { id: 'all', label: 'All 9:16 Vertical Posts' },
                  { id: 'following', label: 'Following Photographers' },
                  { id: 'monochrome', label: 'Black & White Studies' },
                  { id: 'saved', label: 'Saved Bookmarks' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab('home');
                    setFeedFilter(item.id);
                  }}
                  className={`w-full min-h-[38px] px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    feedFilter === item.id && activeTab === 'home'
                      ? 'bg-zinc-900 text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {feedFilter === item.id && activeTab === 'home' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Studio Camera Roll Quick-Edit Presets */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-200">
                Test 9:16 Canvas Editor
              </p>
              <Camera className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Load a raw sample photograph directly into the HTML5 Canvas editor to test Exposure, Saturation, Kelvin, and B&W sliders:
            </p>
            <div className="space-y-1.5">
              {STUDIO_SAMPLE_PHOTOS.slice(0, 4).map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => openEditorWithSample(sample.url)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  <span className="truncate">{sample.label}</span>
                  <span className="text-[11px] text-rose-400 font-mono">
                    Edit 9:16
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Mobile-First 9:16 Instagram-Style Viewport */}
        <main className="w-full max-w-[470px] bg-zinc-950 sm:border-x border-zinc-900 min-h-[calc(100vh-3rem)] pb-16">
          {activeTab === 'home' && (
            <div>
              {/* Resident Photographers Story / Profile Strip */}
              <div className="px-4 py-3 border-b border-zinc-900 flex items-center gap-4 overflow-x-auto no-scrollbar">
                {/* Quick Create 9:16 Story/Post Button */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditorWithSample()}
                    className="w-14 h-14 rounded-full bg-zinc-900 border border-dashed border-rose-500/70 flex items-center justify-center text-rose-500 hover:bg-zinc-800 transition-colors"
                    aria-label="Upload new 9:16 photo"
                  >
                    <PlusSquare className="w-6 h-6" />
                  </button>
                  <span className="text-[11px] text-zinc-300 font-medium">
                    New 9:16
                  </span>
                </div>

                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col items-center gap-1 shrink-0 max-w-[68px]"
                  >
                    <UserAvatar
                      initials={user.avatarInitials}
                      color={user.avatarColor}
                      displayName={user.displayName}
                      size="lg"
                      hasStoryRing
                      onClick={() => {
                        setSelectedProfileId(user.id);
                        setActiveTab('profile');
                      }}
                    />
                    <span className="text-[11px] text-zinc-300 truncate w-full text-center">
                      {user.handle.split('.')[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feed Stream Filter Tabs (Visible on Mobile & Desktop) */}
              <div className="px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800/80">
                  {(
                    [
                      { id: 'all', label: 'All 9:16' },
                      { id: 'following', label: 'Following' },
                      { id: 'monochrome', label: 'B&W' },
                      { id: 'saved', label: 'Saved' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFeedFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        feedFilter === tab.id
                          ? 'bg-zinc-100 text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] font-mono text-zinc-500 tabular-nums whitespace-nowrap">
                  {filteredFeedPosts.length} frames
                </span>
              </div>

              {/* Scrollable 9:16 Feed Posts */}
              {filteredFeedPosts.length === 0 ? (
                <div className="py-16 px-6 text-center space-y-3">
                  <p className="text-sm font-semibold text-zinc-200">
                    No 9:16 posts match this filter
                  </p>
                  <p className="text-xs text-zinc-400">
                    Switch back to All 9:16 or publish a new vertical study from the Darkroom Editor.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedFilter('all')}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200"
                  >
                    Show All 9:16 Posts
                  </button>
                </div>
              ) : (
                <div>
                  {filteredFeedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && <SearchView />}
          {activeTab === 'activity' && <ActivityView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* RIGHT DESKTOP RAIL: Live Supabase Schema Blueprint & Suggested Photographers */}
        <aside className="hidden xl:flex flex-col w-[340px] shrink-0 space-y-5 pb-24">
          {/* Supabase Architecture & Live Tables Blueprint Card */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-500" />
                <h2 className="text-xs font-bold text-zinc-100">
                  Supabase Backend Architecture
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                PostgreSQL + Storage
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Every 9:16 canvas edit, like, comment, and profile update maps directly to the relational schema below:
            </p>

            {/* Live Table Row Counts (Tabular Numerals) */}
            <div className="divide-y divide-zinc-900 border border-zinc-800/80 rounded-xl bg-zinc-900/40 text-xs font-mono tabular-nums">
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-zinc-300">public.profiles</span>
                <span className="text-zinc-400">{users.length} rows</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-zinc-300">public.posts (9:16)</span>
                <span className="text-zinc-400">{posts.length} rows</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-zinc-300">public.likes</span>
                <span className="text-zinc-400">{totalLikesCount} rows</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-zinc-300">public.comments</span>
                <span className="text-zinc-400">{totalCommentsCount} rows</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-rose-400">storage.pixelpulse-media</span>
                <span className="text-zinc-400">9:16 JPEG</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsArchitectureModalOpen(true)}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-100 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Code2 className="w-4 h-4 text-rose-400" />
              <span>View SQL Schema & Setup Guide</span>
            </button>
          </div>

          {/* Suggested 9:16 Photographers Roster */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-200">
                Featured 9:16 Photographers
              </h3>
              <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {users
                .filter((u) => u.id !== currentUser?.id)
                .slice(0, 4)
                .map((u) => {
                  const isFollowing = followingIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProfileId(u.id);
                          setActiveTab('profile');
                        }}
                        className="flex items-center gap-2.5 min-w-0 text-left"
                      >
                        <UserAvatar
                          initials={u.avatarInitials}
                          color={u.avatarColor}
                          displayName={u.displayName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-100 truncate hover:text-rose-400 transition-colors">
                            @{u.handle}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {u.location} · {u.equipment.split('·')[0]}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleFollowUser(u.id)}
                        className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          isFollowing
                            ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                            : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky Bottom Navigation Bar — 5 Core Destinations (Home, Search, Create +, Activity Heart, Profile) */}
      <nav
        aria-label="Primary bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/90 flex items-center justify-center"
      >
        <div className="w-full max-w-[470px] grid grid-cols-5 items-center h-full px-2">
          {/* 1. Home (Feed) */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl transition-colors ${
              activeTab === 'home'
                ? 'text-rose-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Home Feed"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Home</span>
          </button>

          {/* 2. Search */}
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl transition-colors ${
              activeTab === 'search'
                ? 'text-rose-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Search and Explore"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Search</span>
          </button>

          {/* 3. Create (+) */}
          <button
            type="button"
            onClick={() => openEditorWithSample()}
            className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl text-zinc-100 hover:text-rose-400 transition-transform active:scale-95"
            aria-label="Create 9:16 Post"
          >
            <div className="w-9 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <PlusSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium mt-0.5 text-zinc-300">
              Create
            </span>
          </button>

          {/* 4. Activity (Heart) */}
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`relative min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl transition-colors ${
              activeTab === 'activity'
                ? 'text-rose-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Activity"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Activity</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-6" />
            )}
          </button>

          {/* 5. Profile */}
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                setSelectedProfileId(currentUser.id);
              }
              setActiveTab('profile');
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl transition-colors ${
              activeTab === 'profile'
                ? 'text-rose-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Profile"
          >
            {currentUser ? (
              <div
                className={`rounded-full p-[1.5px] ${
                  activeTab === 'profile' ? 'bg-rose-500' : 'bg-transparent'
                }`}
              >
                <UserAvatar
                  initials={currentUser.avatarInitials}
                  color={currentUser.avatarColor}
                  displayName={currentUser.displayName}
                  size="xs"
                />
              </div>
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium mt-0.5">Profile</span>
          </button>
        </div>
      </nav>

      {/* Modals & Slide-Over Drawers */}
      <PhotoEditorModal />
      <AuthModal />
      <CommentDrawer />
      <DirectMessagesDrawer />
      <ArchitectureModal />

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-100 text-zinc-950 text-xs font-semibold shadow-2xl border border-white/20 whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <PulseProvider>
      <MainShell />
    </PulseProvider>
  );
}

export default App;
