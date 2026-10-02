import React, { useState } from 'react';
import {
  Grid,
  Bookmark,
  Heart,
  Edit3,
  Plus,
  LogOut,
  Check,
  X,
  MessageCircle,
} from 'lucide-react';
import { usePulse } from '../context/PulseContext';
import { UserAvatar } from './UserAvatar';
import { VerticalImage } from './VerticalImage';
import { PostItem } from '../types/pulse';
import { PostCard } from './PostCard';

export const ProfileView: React.FC = () => {
  const {
    users,
    posts,
    currentUser,
    selectedProfileId,
    setSelectedProfileId,
    followingIds,
    toggleFollowUser,
    updateCurrentProfile,
    openEditorWithSample,
    setIsAuthModalOpen,
    signOut,
  } = usePulse();

  const [subTab, setSubTab] = useState<'posts' | 'saved' | 'liked'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null);

  const profileUser =
    users.find((u) => u.id === selectedProfileId) || currentUser || users[0];

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isFollowing = followingIds.includes(profileUser.id);

  const [editDisplayName, setEditDisplayName] = useState(profileUser.displayName);
  const [editHandle, setEditHandle] = useState(profileUser.handle);
  const [editBio, setEditBio] = useState(profileUser.bio);
  const [editLocation, setEditLocation] = useState(profileUser.location);
  const [editEquipment, setEditEquipment] = useState(profileUser.equipment);

  const userPosts = posts.filter((p) => p.userId === profileUser.id);
  const savedPosts = posts.filter((p) =>
    p.bookmarkedByUserIds.includes(profileUser.id)
  );
  const likedPosts = posts.filter((p) => p.likesUserIds.includes(profileUser.id));

  const displayedPosts: PostItem[] =
    subTab === 'posts'
      ? userPosts
      : subTab === 'saved'
      ? savedPosts
      : likedPosts;

  const totalLikesReceived = userPosts.reduce(
    (acc, p) => acc + p.likesUserIds.length,
    0
  );

  const startEditing = () => {
    setEditDisplayName(profileUser.displayName);
    setEditHandle(profileUser.handle);
    setEditBio(profileUser.bio);
    setEditLocation(profileUser.location);
    setEditEquipment(profileUser.equipment);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentProfile({
      displayName: editDisplayName.trim() || profileUser.displayName,
      handle: editHandle.trim().replace(/^@/, '') || profileUser.handle,
      bio: editBio.trim(),
      location: editLocation.trim(),
      equipment: editEquipment.trim(),
    });
    setIsEditingProfile(false);
  };

  const lightboxPost = lightboxPostId
    ? posts.find((p) => p.id === lightboxPostId)
    : null;

  return (
    <div className="pb-20">
      {/* Photographer Switcher Strip */}
      <div className="px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {users.map((u) => {
            const active = u.id === profileUser.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedProfileId(u.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                @{u.handle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Header */}
      <div className="p-4 sm:p-5 space-y-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between gap-4">
          <UserAvatar
            initials={profileUser.avatarInitials}
            color={profileUser.avatarColor}
            displayName={profileUser.displayName}
            size="xl"
            hasStoryRing
          />

          {/* Tabular-Nums Stats */}
          <div className="flex-1 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-zinc-100 font-mono tabular-nums">
                {userPosts.length}
              </p>
              <p className="text-xs text-zinc-400">9:16 Posts</p>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-100 font-mono tabular-nums">
                {profileUser.followersCount.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-400">Followers</p>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-100 font-mono tabular-nums">
                {totalLikesReceived.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-400">Pulse Likes</p>
            </div>
          </div>
        </div>

        {/* Bio & Clean Unboxed Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-100">
              {profileUser.displayName}
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              @{profileUser.handle}
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">{profileUser.bio}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-0.5">
            <span>{profileUser.location}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-zinc-400">{profileUser.equipment}</span>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="flex items-center gap-2 pt-1">
          {isOwnProfile ? (
            <>
              <button
                type="button"
                onClick={startEditing}
                className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-100 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => openEditorWithSample()}
                className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>New 9:16 Post</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Switch Account / Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => toggleFollowUser(profileUser.id)}
                className={`flex-1 min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  isFollowing
                    ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {isFollowing ? 'Following Photographer' : `Follow @${profileUser.handle}`}
              </button>
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setSelectedProfileId(currentUser.id)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors whitespace-nowrap"
                >
                  My Profile
                </button>
              )}
              {!currentUser && (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
              )}
            </>
          )}
        </div>

        {/* Inline Edit Profile Form */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 mt-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                Edit Photographer Profile
              </span>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  @Handle
                </label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Camera & Lens
                </label>
                <input
                  type="text"
                  value={editEquipment}
                  onChange={(e) => setEditEquipment(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Bio</label>
              <textarea
                rows={2}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="min-h-[38px] px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Grid Filter Tabs (9:16 Posts / Saved / Liked) */}
      <div className="grid grid-cols-3 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setSubTab('posts')}
          className={`min-h-[46px] flex items-center justify-center gap-2 text-xs font-semibold border-b-2 transition-colors ${
            subTab === 'posts'
              ? 'border-rose-500 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>9:16 Grid ({userPosts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('saved')}
          className={`min-h-[46px] flex items-center justify-center gap-2 text-xs font-semibold border-b-2 transition-colors ${
            subTab === 'saved'
              ? 'border-rose-500 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({savedPosts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('liked')}
          className={`min-h-[46px] flex items-center justify-center gap-2 text-xs font-semibold border-b-2 transition-colors ${
            subTab === 'liked'
              ? 'border-rose-500 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Liked ({likedPosts.length})</span>
        </button>
      </div>

      {/* 3-Column 9:16 Vertical Image Grid */}
      {displayedPosts.length === 0 ? (
        <div className="py-14 px-6 text-center space-y-3">
          <p className="text-sm font-semibold text-zinc-200">
            No 9:16 vertical photos in this view yet
          </p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Open the 9:16 Darkroom Editor to crop, grade exposure, and publish a vertical frame.
          </p>
          <button
            type="button"
            onClick={() => openEditorWithSample()}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create 9:16 Post</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-1">
          {displayedPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setLightboxPostId(post.id)}
              className="relative aspect-[9/16] bg-zinc-900 overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <VerticalImage
                src={post.imageUrl}
                alt={post.caption}
                fallbackTitle={post.location}
                isBlackAndWhite={post.editSettings.isBlackAndWhite}
                className="group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5 text-white text-xs font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  {post.likesUserIds.length}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  {post.comments.length}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Post Inspector Modal */}
      {lightboxPost && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setLightboxPostId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                9:16 Vertical Post Detail
              </span>
              <button
                type="button"
                onClick={() => setLightboxPostId(null)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PostCard post={lightboxPost} />
          </div>
        </div>
      )}
    </div>
  );
};
