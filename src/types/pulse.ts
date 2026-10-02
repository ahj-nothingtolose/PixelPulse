export type NavigationTab = 'home' | 'search' | 'create' | 'activity' | 'profile';

export interface PhotoEditSettings {
  exposure: number;      // -50 to +50 (brightness/contrast curve)
  contrast: number;      // -50 to +50
  saturation: number;    // -100 to +100
  temperature: number;   // -50 (cool) to +50 (warm)
  vignette: number;      // 0 to 100
  isBlackAndWhite: boolean;
  zoom: number;          // 1 to 2.5
  panX: number;          // -100 to +100
  panY: number;          // -100 to +100
  presetName: string;
}

export interface UserProfile {
  id: string;
  handle: string;
  displayName: string;
  email: string;
  avatarColor: string;
  avatarInitials: string;
  avatarSvgUrl?: string;
  bio: string;
  location: string;
  equipment: string;
  followersCount: number;
  followingCount: number;
  isGuest?: boolean;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  userHandle: string;
  userDisplayName: string;
  userAvatarColor: string;
  userAvatarInitials: string;
  text: string;
  createdAt: string;
}

export interface PostItem {
  id: string;
  userId: string;
  userHandle: string;
  userDisplayName: string;
  userAvatarColor: string;
  userAvatarInitials: string;
  imageUrl: string;
  caption: string;
  location: string;
  category: 'Street & Night' | 'Nature & Alpine' | 'Architecture' | 'Still Life' | 'Coastal';
  exifSummary: string; // e.g., "35mm · f/1.4 · 1/125s · ISO 800"
  editSettings: PhotoEditSettings;
  likesUserIds: string[];
  bookmarkedByUserIds: string[];
  comments: CommentItem[];
  createdAt: string;
  timestampLabel: string;
}

export interface ActivityNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'upload';
  actorHandle: string;
  actorDisplayName: string;
  actorAvatarColor: string;
  actorAvatarInitials: string;
  postId?: string;
  postThumbUrl?: string;
  message: string;
  timestampLabel: string;
  isRead: boolean;
}

export interface DirectMessageThread {
  id: string;
  participant: UserProfile;
  messages: {
    id: string;
    senderId: string;
    text: string;
    sharedPostId?: string;
    timestampLabel: string;
  }[];
}
