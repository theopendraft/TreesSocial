import { toast } from "@/hooks/use-toast";

// API Configuration
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api").replace(/\/$/, "");

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  identifier: string; // Can be email or username
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  // Optional: auto-match the newly registered user with a target user
  autoMatchTarget?: string; // id | email | username depending on autoMatchBy
  autoMatchBy?: "id" | "email" | "username";
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  isStreamer: boolean;
  followingCount?: number;
  followerCount?: number;
  streamerProfile?: {
    category: string;
    totalViews: number;
    totalStreams: number;
    subscriptionTiers: Array<{
      tier: "gold" | "diamond" | "chrome";
      price: number;
      description: string;
      benefits: string[];
      isActive: boolean;
    }>;
  };
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images?: string[];
  videos?: string[];
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  type: "post" | "reel" | "story";
}

export interface Match {
  id: string;
  userId: string;
  name: string;
  age: number;
  avatar: string;
  bio: string;
  distance: number;
  compatibility: number;
  interests: string[];
  photos: string[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  isPinned?: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  pinnedMessages: ChatMessage[];
}

export interface Notification {
  id: string;
  type: "follow" | "like" | "comment" | "mention";
  fromUserId: string;
  fromUsername: string;
  fromUserAvatar?: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: string; // postId, commentId, etc.
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  try {
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // Non-JSON responses (CORS preflight/network error proxies)
      data = {};
    }

    if (!response.ok) {
      const msg = data?.message || `HTTP error ${response.status}`;
      // Avoid toast spam for rate-limit and CORS-like failures
      if (response.status !== 429) {
        toast({
          title: "Request failed",
          description: msg,
          variant: "destructive",
        });
      }
      return { success: false, error: msg } as ApiResponse<T>;
    }

    return {
      success: true,
      data: (data?.data ?? data) as T,
      message: data?.message,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    toast({ title: "Network error", description: msg, variant: "destructive" });
    return { success: false, error: msg } as ApiResponse<T>;
  }
};

// API Endpoints

// Authentication API
export const authAPI = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: UserProfile; token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  register: async (
    userData: RegisterData
  ): Promise<ApiResponse<{ user: UserProfile; token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  checkUsername: async (
    username: string
  ): Promise<ApiResponse<{ available: boolean; suggestions?: string[] }>> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/check-username/${username}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  checkEmail: async (
    email: string
  ): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/check-email/${encodeURIComponent(email)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  checkPhone: async (
    phone: string
  ): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/check-phone/${encodeURIComponent(phone)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  getUser: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (
    data: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const resp = await handleResponse<UserProfile>(response);
    // Normalize server field 'name' -> 'fullName' for consistency
    if (resp.success && resp.data) {
      const d: any = resp.data as any;
      if (d && d.name && !d.fullName) {
        resp.data = { ...d, fullName: d.name } as any;
      }
    }
    return resp;
  },

  uploadAvatar: async (
    file: File
  ): Promise<ApiResponse<{ avatar: string }>> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  searchUsers: async (query: string): Promise<ApiResponse<UserProfile[]>> => {
    const response = await fetch(
      `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getUserProfile: async (
    userId: string
  ): Promise<
    ApiResponse<
      UserProfile & {
        isFollowing?: boolean;
        followerCount?: number;
        followingCount?: number;
      }
    >
  > => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  followUser: async (
    userId: string
  ): Promise<
    ApiResponse<{
      following: boolean;
      requested?: boolean;
      followerCount: number;
      currentUserFollowingCount?: number;
    }>
  > => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Follow Requests (private accounts)
  requestFollow: async (userId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/request-follow`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  cancelFollowRequest: async (userId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/cancel-request`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getIncomingFollowRequests: async (): Promise<ApiResponse<UserProfile[]>> => {
    const response = await fetch(`${API_BASE_URL}/users/me/follow-requests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  acceptFollowRequest: async (requesterId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/users/requests/${requesterId}/accept`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  declineFollowRequest: async (requesterId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/users/requests/${requesterId}/decline`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Get user's followers
  getFollowers: async (userId: string): Promise<ApiResponse<UserProfile[]>> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/followers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get user's following
  getFollowing: async (userId: string): Promise<ApiResponse<UserProfile[]>> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/following`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get current user's followers
  getCurrentUserFollowers: async (): Promise<ApiResponse<UserProfile[]>> => {
    const response = await fetch(`${API_BASE_URL}/users/me/followers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get current user's following
  getCurrentUserFollowing: async (): Promise<ApiResponse<UserProfile[]>> => {
    const response = await fetch(`${API_BASE_URL}/users/me/following`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Posts API
export const postsAPI = {
  getFeed: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/posts/feed?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getReels: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ reels: any[]; hasMore: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/posts/reels?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getPost: async (postId: string): Promise<ApiResponse<Post>> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createPost: async (postData: FormData): Promise<ApiResponse<Post>> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: postData,
    });
    return handleResponse(response);
  },

  likePost: async (postId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  addComment: async (
    postId: string,
    text: string
  ): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  getComments: async (
    postId: string
  ): Promise<ApiResponse<{ comments: any[] }>> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  bookmarkPost: async (postId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/bookmark`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deletePost: async (postId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserPosts: async (
    userId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/posts/user/${userId}?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Matches API
export const matchesAPI = {
  getPotentialMatches: async (
    filters?: Partial<{
      gender: string;
      ageMin: number;
      ageMax: number;
      maxDistanceKm: number;
      interests: string[];
      verifiedOnly: boolean;
    }>
  ): Promise<ApiResponse<Match[]>> => {
    const params = new URLSearchParams();
    if (filters?.gender && filters.gender !== "all")
      params.set("gender", filters.gender);
    if (filters?.ageMin != null) params.set("ageMin", String(filters.ageMin));
    if (filters?.ageMax != null) params.set("ageMax", String(filters.ageMax));
    if (filters?.maxDistanceKm != null)
      params.set("maxDistanceKm", String(filters.maxDistanceKm));
    if (filters?.verifiedOnly) params.set("verifiedOnly", "1");
    if (Array.isArray(filters?.interests) && filters!.interests!.length > 0)
      params.set("interests", filters!.interests!.join(","));
    const qs = params.toString();
    const url = `${API_BASE_URL}/matches/potential${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMatches: async (): Promise<ApiResponse<Match[]>> => {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  swipeUser: async (
    userId: string,
    action: "like" | "pass"
  ): Promise<ApiResponse<{ matched: boolean; matchId?: string }>> => {
    const response = await fetch(`${API_BASE_URL}/matches/swipe`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId: userId, action }),
    });
    return handleResponse(response);
  },

  blockUser: async (userId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/matches/block`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  unblockUser: async (userId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/matches/unblock`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },
};

// Chat API
export const chatAPI = {
  getChats: async (chatType?: "arcade" | "trees"): Promise<ApiResponse<Chat[]>> => {
    const url = chatType 
      ? `${API_BASE_URL}/chat?chatType=${chatType}`
      : `${API_BASE_URL}/chat`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getChat: async (chatId: string): Promise<ApiResponse<Chat>> => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMessages: async (
    chatId: string,
    page = 1,
    limit = 50
  ): Promise<ApiResponse<{ messages: ChatMessage[]; hasMore: boolean }>> => {
    const response = await fetch(
      `${API_BASE_URL}/chat/${chatId}/messages?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  sendMessage: async (
    chatId: string,
    content: string,
    type: "text" | "image" | "file" = "text"
  ): Promise<ApiResponse<ChatMessage>> => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, type }),
    });
    return handleResponse(response);
  },

  createChat: async (participantIds: string[]): Promise<ApiResponse<Chat>> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ participants: participantIds }),
    });
    return handleResponse(response);
  },

  pinMessage: async (
    chatId: string,
    messageId: string
  ): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/pin`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ messageId }),
    });
    return handleResponse(response);
  },

  unpinMessage: async (
    chatId: string,
    messageId: string
  ): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/unpin`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ messageId }),
    });
    return handleResponse(response);
  },

  approveChat: async (chatId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Optional: mark a chat as read on the server (if backend supports it)
  markRead: async (chatId: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/read`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (e) {
      // Gracefully fail if endpoint not implemented
      return { success: false, error: "markRead not supported" } as ApiResponse;
    }
  },
};

// Settings API
export const settingsAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateAll: async (settings: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/settings/all`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  updateAccount: async (account: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/settings/account`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(account),
    });
    return handleResponse(response);
  },

  updatePrivacy: async (privacy: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/settings/privacy`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(privacy),
    });
    return handleResponse(response);
  },

  updateNotifications: async (
    notifications: any
  ): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(notifications),
    });
    return handleResponse(response);
  },

  updateApp: async (app: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/settings/app`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(app),
    });
    return handleResponse(response);
  },

  exportSettings: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/settings/export`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  resetSettings: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/settings/reset`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Subscriptions API
export const subscriptionAPI = {
  getSubscriptions: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStreamers: async (): Promise<ApiResponse<UserProfile[]>> => {
    const response = await fetch(`${API_BASE_URL}/subscriptions/streamers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  subscribe: async (
    streamerId: string,
    tier: string
  ): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ streamerId, tier }),
    });
    return handleResponse(response);
  },

  cancelSubscription: async (subscriptionId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  updateAutoRenew: async (
    subscriptionId: string,
    autoRenew: boolean
  ): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/subscriptions/${subscriptionId}/auto-renew`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ autoRenew }),
      }
    );
    return handleResponse(response);
  },
};

// Reports API
export const reportsAPI = {
  getUserReports: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/reports/user`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createReport: async (reportData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData),
    });
    return handleResponse(response);
  },

  updateReport: async (
    reportId: string,
    data: any
  ): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Arcade API
export const arcadeAPI = {
  getPotentialMatches: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<any[]>> => {
    const response = await fetch(
      `${API_BASE_URL}/arcade/matches/potential?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
        // Avoid 304/ETag cache issues so we always get a concrete JSON body
        cache: "no-store",
      }
    );
    return handleResponse(response);
  },
  getPreferences: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/preferences`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updatePreferences: async (preferences: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/preferences`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
    return handleResponse(response);
  },

  getMatches: async (): Promise<ApiResponse<Match[]>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/matches`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Arcade-specific swipe endpoints
  likeUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/like/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  superLikeUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(
      `${API_BASE_URL}/arcade/super-like/${userId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
  passUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/pass/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStatistics: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  resetSwipes: async (): Promise<ApiResponse<{ modified: number }>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/swipes/reset`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Dev-only helper to create a match for the logged-in user
  devCreateMatch: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/matches/dev/create`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  blockUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/block/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  unblockUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/arcade/unblock/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Relationship/block status between me and the target user (if backend supports it)
  getRelationship: async (
    userId: string
  ): Promise<
    ApiResponse<{ iBlocked: boolean; blockedByPeer: boolean; since?: string }>
  > => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/arcade/relationship/${userId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    } catch (e) {
      return {
        success: false,
        error: "relationship endpoint unavailable",
      } as any;
    }
  },

  // Remove a match/friend (requires backend support to reset chat approvals and notify peer)
  removeMatch: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(
      `${API_BASE_URL}/arcade/matches/remove/${userId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Streams API
export const streamsAPI = {
  getLiveStreams: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/streams/live`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStream: async (streamId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/streams/${streamId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createStream: async (streamData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/streams`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(streamData),
    });
    return handleResponse(response);
  },

  endStream: async (streamId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/streams/${streamId}/end`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  markAllAsRead: async (): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/mark-all-read`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  createFollowNotification: async (
    followedUserId: string
  ): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/notifications/follow`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: followedUserId }),
    });
    return handleResponse(response);
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ users: UserProfile[]; total: number }>> => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  banUser: async (userId: string, reason: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  unbanUser: async (userId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/unban`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getReports: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ reports: any[]; total: number }>> => {
    const response = await fetch(
      `${API_BASE_URL}/admin/reports?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  updateReport: async (
    reportId: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(response);
  },

  getAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default {
  auth: authAPI,
  users: usersAPI,
  posts: postsAPI,
  matches: matchesAPI,
  chat: chatAPI,
  settings: settingsAPI,
  subscriptions: subscriptionAPI,
  reports: reportsAPI,
  arcade: arcadeAPI,
  streams: streamsAPI,
  notifications: notificationsAPI,
  admin: adminAPI,
};

// Stories API
export const storiesAPI = {
  // Get all stories (for feed)
  getStories: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/stories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get user's own stories
  getUserStories: async (userId?: string): Promise<ApiResponse<any[]>> => {
    const endpoint = userId ? `/stories/user/${userId}` : "/stories/my";
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create story (upload + create)
  createStory: async (
    file: File,
    content?: string
  ): Promise<ApiResponse<any>> => {
    // Step 1: Upload file
    const uploadFormData = new FormData();
    const isVideo = file.type.startsWith("video/");
    const fieldName = isVideo ? "video" : "image";
    const endpoint = isVideo ? "/uploads/video" : "/uploads/image";

    uploadFormData.append(fieldName, file);

    const uploadResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || "Failed to upload file");
    }

    const uploadResult = await uploadResponse.json();

    // Step 2: Create story with media URL
    const storyData = {
      content: content || "",
      type: "story",
      media: [
        {
          type: isVideo ? "video" : "image",
          url: uploadResult.data.url,
          publicId: uploadResult.data.publicId,
        },
      ],
      visibility: "public",
    };

    const storyResponse = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(storyData),
    });

    return handleResponse(storyResponse);
  },

  // View story (mark as viewed)
  viewStory: async (storyId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/stories/${storyId}/view`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Like/unlike story
  likeStory: async (
    storyId: string
  ): Promise<
    ApiResponse<{
      message: string;
      isLiked: boolean;
      likes: number;
    }>
  > => {
    const response = await fetch(`${API_BASE_URL}/stories/${storyId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get viewers for a specific story (owner-only)
  getStoryViewers: async (
    storyId: string
  ): Promise<
    ApiResponse<{
      viewers: Array<{
        id?: string;
        _id?: string;
        user?: any;
        name?: string;
        username?: string;
        avatar?: string;
        viewedAt?: string | number | Date;
        isFollowing?: boolean;
      }>;
      likes?: any[];
      viewCount?: number;
      likeCount?: number;
    }>
  > => {
    const response = await fetch(`${API_BASE_URL}/stories/${storyId}/viewers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
