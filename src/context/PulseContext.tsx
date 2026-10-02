import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  PostItem,
  ActivityNotification,
  DirectMessageThread,
  PhotoEditSettings,
  NavigationTab,
} from '../types/pulse';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DM_THREADS,
} from '../data/initialData';

interface PulseContextValue {
  currentUser: UserProfile | null;
  users: UserProfile[];
  posts: PostItem[];
  notifications: ActivityNotification[];
  dmThreads: DirectMessageThread[];
  followingIds: string[];
  activeTab: NavigationTab;
  selectedProfileId: string;
  activeCommentPostId: string | null;
  isAuthModalOpen: boolean;
  isEditorModalOpen: boolean;
  isDmDrawerOpen: boolean;
  isArchitectureModalOpen: boolean;
  toastMessage: string | null;
  initialEditorSampleUrl: string | null;
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedProfileId: (userId: string) => void;
  setActiveCommentPostId: (postId: string | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsEditorModalOpen: (open: boolean) => void;
  setIsDmDrawerOpen: (open: boolean) => void;
  setIsArchitectureModalOpen: (open: boolean) => void;
  openEditorWithSample: (sampleUrl?: string) => void;
  showToast: (msg: string) => void;
  signInWithEmail: (email: string, password?: string) => void;
  signUpNewUser: (data: {
    email: string;
    handle: string;
    displayName: string;
    bio: string;
    location: string;
    equipment: string;
  }) => void;
  signInAsGuest: () => void;
  switchDemoUser: (userId: string) => void;
  signOut: () => void;
  updateCurrentProfile: (updates: Partial<UserProfile>) => void;
  toggleLikePost: (postId: string, forceLikeOnly?: boolean) => void;
  toggleBookmarkPost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  createNewPost: (data: {
    imageUrl: string;
    caption: string;
    location: string;
    category: PostItem['category'];
    exifSummary: string;
    editSettings: PhotoEditSettings;
  }) => void;
  deletePost: (postId: string) => void;
  toggleFollowUser: (targetUserId: string) => void;
  sendDirectMessage: (participantId: string, text: string, sharedPostId?: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoDatabase: () => void;
}

const STORAGE_KEYS = {
  USERS: 'pixelpulse_users_v1',
  POSTS: 'pixelpulse_posts_v1',
  CURRENT_USER: 'pixelpulse_current_user_v1',
  NOTIFICATIONS: 'pixelpulse_notifications_v1',
  FOLLOWING: 'pixelpulse_following_v1',
  DMS: 'pixelpulse_dms_v1',
};

const PulseContext = createContext<PulseContextValue | undefined>(undefined);

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [followingIds, setFollowingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLLOWING);
      return saved ? JSON.parse(saved) : ['user-clara-voss', 'user-mateo-silva'];
    } catch {
      return ['user-clara-voss', 'user-mateo-silva'];
    }
  });

  const [dmThreads, setDmThreads] = useState<DirectMessageThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DMS);
      return saved ? JSON.parse(saved) : INITIAL_DM_THREADS;
    } catch {
      return INITIAL_DM_THREADS;
    }
  });

  const [activeTab, setActiveTabState] = useState<NavigationTab>('home');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    currentUser?.id || INITIAL_USERS[0].id
  );
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isDmDrawerOpen, setIsDmDrawerOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [initialEditorSampleUrl, setInitialEditorSampleUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {
      // Handle quota gracefully
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch {
      // Handle quota gracefully
    }
  }, [posts]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch {
      // Ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {
      // Ignore
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(followingIds));
    } catch {
      // Ignore
    }
  }, [followingIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DMS, JSON.stringify(dmThreads));
    } catch {
      // Ignore
    }
  }, [dmThreads]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const setActiveTab = (tab: NavigationTab) => {
    if (tab === 'create') {
      if (!currentUser) {
        setIsAuthModalOpen(true);
        showToast('Sign in or continue as Guest to open the 9:16 Darkroom Editor');
        return;
      }
      setInitialEditorSampleUrl(null);
      setIsEditorModalOpen(true);
      return;
    }
    if (tab === 'profile' && currentUser) {
      setSelectedProfileId(currentUser.id);
    }
    setActiveTabState(tab);
  };

  const openEditorWithSample = (sampleUrl?: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setInitialEditorSampleUrl(sampleUrl || null);
    setIsEditorModalOpen(true);
  };

  const signInWithEmail = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.handle.toLowerCase() === cleanEmail
    );
    if (existing) {
      setCurrentUser(existing);
      setSelectedProfileId(existing.id);
      setIsAuthModalOpen(false);
      showToast(`Signed in as @${existing.handle}`);
    } else {
      const handleBase = cleanEmail.split('@')[0].replace(/[^a-z0-9._]/g, '') || 'photographer';
      const initials = handleBase.slice(0, 2).toUpperCase();
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        handle: handleBase,
        displayName: handleBase.charAt(0).toUpperCase() + handleBase.slice(1),
        email: cleanEmail,
        avatarColor: '#E11D48',
        avatarInitials: initials,
        bio: '9:16 vertical photographer on PixelPulse.',
        location: 'Global Studio',
        equipment: '35mm Full-Frame · f/1.8',
        followersCount: 1,
        followingCount: 2,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      setSelectedProfileId(newUser.id);
      setIsAuthModalOpen(false);
      showToast(`Welcome to PixelPulse, @${newUser.handle}`);
    }
  };

  const signUpNewUser = (data: {
    email: string;
    handle: string;
    displayName: string;
    bio: string;
    location: string;
    equipment: string;
  }) => {
    const cleanHandle = data.handle
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9._]/g, '');
    const initials = (data.displayName || cleanHandle)
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const palette = ['#E11D48', '#0284C7', '#D97706', '#059669', '#7C3AED'];
    const avatarColor = palette[users.length % palette.length];

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      handle: cleanHandle || `pulse.${Date.now().toString().slice(-4)}`,
      displayName: data.displayName.trim() || 'Vertical Photographer',
      email: data.email.trim() || `${cleanHandle}@pixelpulse.social`,
      avatarColor,
      avatarInitials: initials || 'PP',
      bio: data.bio.trim() || 'Capturing the world in strict 9:16 vertical frames.',
      location: data.location.trim() || 'Studio',
      equipment: data.equipment.trim() || 'Digital 35mm · 9:16',
      followersCount: 12,
      followingCount: 4,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setSelectedProfileId(newUser.id);
    setIsAuthModalOpen(false);
    showToast(`Created account @${newUser.handle}`);
  };

  const signInAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'user-guest-photographer',
      handle: 'guest.lens',
      displayName: 'Guest Photographer',
      email: 'guest@pixelpulse.social',
      avatarColor: '#52525B',
      avatarInitials: 'GL',
      bio: 'Exploring 9:16 vertical photography via Anonymous Guest Session.',
      location: 'Mobile Darkroom',
      equipment: 'HTML5 9:16 Canvas Lens',
      followersCount: 5,
      followingCount: 3,
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) =>
      prev.some((u) => u.id === guestUser.id) ? prev : [guestUser, ...prev]
    );
    setCurrentUser(guestUser);
    setSelectedProfileId(guestUser.id);
    setIsAuthModalOpen(false);
    showToast('Signed in via Anonymous Guest Session');
  };

  const switchDemoUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setSelectedProfileId(found.id);
      showToast(`Switched active profile to @${found.handle}`);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    showToast('Signed out of PixelPulse');
  };

  const updateCurrentProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setPosts((prev) =>
      prev.map((p) =>
        p.userId === updatedUser.id
          ? {
              ...p,
              userHandle: updatedUser.handle,
              userDisplayName: updatedUser.displayName,
              userAvatarColor: updatedUser.avatarColor,
              userAvatarInitials: updatedUser.avatarInitials,
            }
          : p
      )
    );
    showToast('Updated profile details');
  };

  const toggleLikePost = (postId: string, forceLikeOnly = false) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Sign in to like 9:16 photographs');
      return;
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const alreadyLiked = post.likesUserIds.includes(currentUser.id);
        if (forceLikeOnly && alreadyLiked) {
          return post;
        }
        const nextLikes = alreadyLiked
          ? post.likesUserIds.filter((id) => id !== currentUser.id)
          : [...post.likesUserIds, currentUser.id];

        if (!alreadyLiked && post.userId !== currentUser.id) {
          const newNotif: ActivityNotification = {
            id: `notif-${Date.now()}`,
            type: 'like',
            actorHandle: currentUser.handle,
            actorDisplayName: currentUser.displayName,
            actorAvatarColor: currentUser.avatarColor,
            actorAvatarInitials: currentUser.avatarInitials,
            postId: post.id,
            postThumbUrl: post.imageUrl,
            message: `liked @${post.userHandle}'s 9:16 photograph in ${post.location}.`,
            timestampLabel: 'Just now',
            isRead: false,
          };
          setNotifications((curr) => [newNotif, ...curr]);
        }

        return {
          ...post,
          likesUserIds: nextLikes,
        };
      })
    );
  };

  const toggleBookmarkPost = (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const alreadySaved = post.bookmarkedByUserIds.includes(currentUser.id);
        showToast(alreadySaved ? 'Removed from saved 9:16 collection' : 'Saved to 9:16 bookmarks');
        return {
          ...post,
          bookmarkedByUserIds: alreadySaved
            ? post.bookmarkedByUserIds.filter((id) => id !== currentUser.id)
            : [...post.bookmarkedByUserIds, currentUser.id],
        };
      })
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      userId: currentUser.id,
      userHandle: currentUser.handle,
      userDisplayName: currentUser.displayName,
      userAvatarColor: currentUser.avatarColor,
      userAvatarInitials: currentUser.avatarInitials,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const notif: ActivityNotification = {
          id: `notif-${Date.now()}`,
          type: 'comment',
          actorHandle: currentUser.handle,
          actorDisplayName: currentUser.displayName,
          actorAvatarColor: currentUser.avatarColor,
          actorAvatarInitials: currentUser.avatarInitials,
          postId: post.id,
          postThumbUrl: post.imageUrl,
          message: `commented on @${post.userHandle}'s post: "${trimmed.slice(0, 48)}"`,
          timestampLabel: 'Just now',
          isRead: false,
        };
        setNotifications((curr) => [notif, ...curr]);
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      })
    );
  };

  const deleteComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter((c) => c.id !== commentId),
            }
          : post
      )
    );
  };

  const createNewPost = (data: {
    imageUrl: string;
    caption: string;
    location: string;
    category: PostItem['category'];
    exifSummary: string;
    editSettings: PhotoEditSettings;
  }) => {
    if (!currentUser) return;

    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userHandle: currentUser.handle,
      userDisplayName: currentUser.displayName,
      userAvatarColor: currentUser.avatarColor,
      userAvatarInitials: currentUser.avatarInitials,
      imageUrl: data.imageUrl,
      caption: data.caption.trim() || '9:16 vertical study captured for PixelPulse.',
      location: data.location.trim() || currentUser.location || 'Studio',
      category: data.category,
      exifSummary: data.exifSummary.trim() || '35mm · f/1.8 · 1/250s · ISO 200',
      editSettings: data.editSettings,
      likesUserIds: [],
      bookmarkedByUserIds: [],
      comments: [],
      createdAt: new Date().toISOString(),
      timestampLabel: 'Just now',
    };

    setPosts((prev) => [newPost, ...prev]);
    const notif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'upload',
      actorHandle: currentUser.handle,
      actorDisplayName: currentUser.displayName,
      actorAvatarColor: currentUser.avatarColor,
      actorAvatarInitials: currentUser.avatarInitials,
      postId: newPost.id,
      postThumbUrl: newPost.imageUrl,
      message: `published a new 9:16 vertical frame (${data.editSettings.presetName}).`,
      timestampLabel: 'Just now',
      isRead: false,
    };
    setNotifications((curr) => [notif, ...curr]);
    setIsEditorModalOpen(false);
    setActiveTabState('home');
    showToast('Published 9:16 vertical photograph to feed');
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Deleted 9:16 post');
  };

  const toggleFollowUser = (targetUserId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const isFollowing = followingIds.includes(targetUserId);
    const targetUser = users.find((u) => u.id === targetUserId);
    setFollowingIds((prev) =>
      isFollowing ? prev.filter((id) => id !== targetUserId) : [...prev, targetUserId]
    );
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetUserId) {
          return {
            ...u,
            followersCount: Math.max(0, u.followersCount + (isFollowing ? -1 : 1)),
          };
        }
        if (u.id === currentUser.id) {
          return {
            ...u,
            followingCount: Math.max(0, u.followingCount + (isFollowing ? -1 : 1)),
          };
        }
        return u;
      })
    );
    if (targetUser) {
      showToast(
        isFollowing ? `Unfollowed @${targetUser.handle}` : `Following @${targetUser.handle}`
      );
    }
  };

  const sendDirectMessage = (participantId: string, text: string, sharedPostId?: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const participant = users.find((u) => u.id === participantId);
    if (!participant) return;

    setDmThreads((prev) => {
      const existing = prev.find((t) => t.participant.id === participantId);
      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        text,
        sharedPostId,
        timestampLabel: 'Just now',
      };
      if (existing) {
        return prev.map((t) =>
          t.participant.id === participantId
            ? { ...t, messages: [...t.messages, newMsg] }
            : t
        );
      }
      return [
        {
          id: `dm-${Date.now()}`,
          participant,
          messages: [newMsg],
        },
        ...prev,
      ];
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const resetDemoDatabase = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOWING);
    localStorage.removeItem(STORAGE_KEYS.DMS);
    setUsers(INITIAL_USERS);
    setPosts(INITIAL_POSTS);
    setCurrentUser(INITIAL_USERS[0]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setFollowingIds(['user-clara-voss', 'user-mateo-silva']);
    setDmThreads(INITIAL_DM_THREADS);
    showToast('Reset local database to initial 9:16 photography seed');
  };

  return (
    <PulseContext.Provider
      value={{
        currentUser,
        users,
        posts,
        notifications,
        dmThreads,
        followingIds,
        activeTab,
        selectedProfileId,
        activeCommentPostId,
        isAuthModalOpen,
        isEditorModalOpen,
        isDmDrawerOpen,
        isArchitectureModalOpen,
        toastMessage,
        initialEditorSampleUrl,
        setActiveTab,
        setSelectedProfileId,
        setActiveCommentPostId,
        setIsAuthModalOpen,
        setIsEditorModalOpen,
        setIsDmDrawerOpen,
        setIsArchitectureModalOpen,
        openEditorWithSample,
        showToast,
        signInWithEmail,
        signUpNewUser,
        signInAsGuest,
        switchDemoUser,
        signOut,
        updateCurrentProfile,
        toggleLikePost,
        toggleBookmarkPost,
        addComment,
        deleteComment,
        createNewPost,
        deletePost,
        toggleFollowUser,
        sendDirectMessage,
        markAllNotificationsRead,
        resetDemoDatabase,
      }}
    >
      {children}
    </PulseContext.Provider>
  );
};

export const usePulse = () => {
  const ctx = useContext(PulseContext);
  if (!ctx) throw new Error('usePulse must be used within a PulseProvider');
  return ctx;
};
