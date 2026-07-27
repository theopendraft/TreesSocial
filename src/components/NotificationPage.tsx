import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Megaphone,
  Settings,
  Bell,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { notificationsAPI } from "@/services/api";
import { usersAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

type BackendNotification = {
  _id: string;
  type: "follow" | "like" | "comment" | "mention" | "psa";
  sender?: { _id: string; username?: string; profileImage?: string } | string;
  recipient: string;
  title?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
};

export const NotificationPage = () => {
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [followingBack, setFollowingBack] = useState<string[]>([]); // Track follow back progress
  const [followedBack, setFollowedBack] = useState<string[]>([]); // Track who we've followed back
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await notificationsAPI.getNotifications();
      if (res.success) {
        const data = (res.data as any) || {};
        const list: BackendNotification[] = data.notifications || [];
        setNotifications(list);
        const newUnread =
          data.unreadCount ?? list.filter((n) => !n.isRead).length;
        setUnreadCount(newUnread);
        
        // Check follow relationships for follow notifications
        const followNotifications = list.filter(n => n.type === "follow" && n.sender && typeof n.sender === "object");
        const alreadyFollowing: string[] = [];
        
        for (const notification of followNotifications) {
          const sender = notification.sender as any;
          if (sender?._id) {
            try {
              // Check if we're already following this user
              const userRes = await usersAPI.getUserProfile(sender._id);
              if (userRes.success && userRes.data?.isFollowing) {
                alreadyFollowing.push(sender._id);
              }
            } catch (error) {
              console.log("Error checking follow status:", error);
            }
          }
        }
        
        setFollowedBack(alreadyFollowing);
        
        // Sync header badge with initial unread count
        window.dispatchEvent(
          new CustomEvent("treesh:notifications-set", {
            detail: { count: newUnread },
          })
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    // Load incoming follow requests
    const loadRequests = async () => {
      setLoadingRequests(true);
      const res = await usersAPI.getIncomingFollowRequests();
      if (res.success) {
        setFollowRequests(res.data || []);
      }
      setLoadingRequests(false);
    };
    loadRequests();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "match":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "psa":
        return <Megaphone className="w-4 h-4 text-orange-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const markAsRead = async (id: string) => {
    const res = await notificationsAPI.markAsRead(id);
    if (res.success) {
      const wasUnread =
        notifications.find((n) => n._id === id)?.isRead === false;
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? ({ ...n, isRead: true } as BackendNotification) : n
        )
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // Inform app shell to decrement the global unread badge
        window.dispatchEvent(
          new CustomEvent("treesh:notifications-decrement", {
            detail: { by: 1 },
          })
        );
      }
    }
  };

  const markAllAsRead = async () => {
    const res = await notificationsAPI.markAllAsRead();
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      // Inform app shell to reset the global unread badge
      window.dispatchEvent(
        new CustomEvent("treesh:notifications-set", { detail: { count: 0 } })
      );
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const acceptRequest = async (requesterId: string) => {
    const res = await usersAPI.acceptFollowRequest(requesterId);
    if (res.success) {
      toast({
        title: "Request accepted",
        description: "You're now followed by this user.",
      });
      setFollowRequests((prev) => prev.filter((u) => u._id !== requesterId));
    }
  };

  const declineRequest = async (requesterId: string) => {
    const res = await usersAPI.declineFollowRequest(requesterId);
    if (res.success) {
      toast({ title: "Request declined" });
      setFollowRequests((prev) => prev.filter((u) => u._id !== requesterId));
    }
  };

  const handleFollowBack = async (senderId: string, senderName: string) => {
    if (!senderId) return;
    
    setFollowingBack((prev) => [...prev, senderId]);
    
    try {
      const res = await usersAPI.followUser(senderId);
      if (res.success) {
        toast({
          title: "Following back",
          description: `You are now following ${senderName}`,
        });
        
        // Add to followed back list
        setFollowedBack((prev) => [...prev, senderId]);
        
        // Mark the notification as read since user interacted with it
        const followNotification = notifications.find(
          (n) => n.type === "follow" && 
          typeof n.sender === "object" && 
          n.sender?._id === senderId
        );
        if (followNotification) {
          await markAsRead(followNotification._id);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to follow back",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow back",
        variant: "destructive",
      });
    } finally {
      setFollowingBack((prev) => prev.filter((id) => id !== senderId));
    }
  };

  const handleUnfollowClick = (senderId: string, senderName: string) => {
    setUserToUnfollow({ id: senderId, name: senderName });
    setShowUnfollowConfirm(true);
  };

  const handleUnfollowConfirm = async () => {
    if (!userToUnfollow) return;
    
    setFollowingBack((prev) => [...prev, userToUnfollow.id]);
    
    try {
      const res = await usersAPI.followUser(userToUnfollow.id); // This will unfollow since they're already following
      if (res.success) {
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${userToUnfollow.name}`,
        });
        
        // Remove from followed back list
        setFollowedBack((prev) => prev.filter(id => id !== userToUnfollow.id));
      } else {
        toast({
          title: "Error",
          description: "Failed to unfollow",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow",
        variant: "destructive",
      });
    } finally {
      setFollowingBack((prev) => prev.filter((id) => id !== userToUnfollow.id));
      setShowUnfollowConfirm(false);
      setUserToUnfollow(null);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-10 bg-offwhite border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              Notifications
            </h1>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 font-treesh">
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              Stay updated with what's happening
            </p>
          </div>
        )}

        {/* Notification Settings */}
        <div className="mb-6 p-4 bg-offwhite border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Notification Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Push Notifications</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">SMS Notifications</span>
              <Switch />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="requests">
              Follow Requests
              {followRequests.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5">
                  {followRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {/* Notifications List */}
            <div className="space-y-3">
              {loading && (
                <div className="text-sm text-gray-500">
                  Loading notifications...
                </div>
              )}
              {!loading &&
                notifications.length > 0 &&
                notifications.map((n) => {
                  const sender =
                    typeof n.sender === "object" && n.sender !== null
                      ? n.sender
                      : undefined;
                  const senderName = sender?.username || "Someone";
                  const avatar = sender?.profileImage || "/placeholder.svg";
                  const time = new Date(n.createdAt).toLocaleString();
                  const content = n.message || "";
                  return (
                    <Card
                      key={n._id}
                      className={`transition-colors duration-200 ${
                        n.isRead
                          ? "bg-offwhite border-gray-200"
                          : "bg-white border-primary/20 shadow-sm"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={avatar} />
                              <AvatarFallback>
                                {senderName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {senderName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {getNotificationIcon(n.type)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {content}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {time}
                              </span>
                              <div className="flex items-center gap-2">
                                {/* Follow Back Button for follow notifications */}
                                {n.type === "follow" && sender?._id && (
                                  <Button
                                    size="sm"
                                    variant={followedBack.includes(sender._id) ? "default" : "outline"}
                                    className="h-7 px-3 text-xs"
                                    onClick={() => 
                                      followedBack.includes(sender._id) 
                                        ? handleUnfollowClick(sender._id, senderName)
                                        : handleFollowBack(sender._id, senderName)
                                    }
                                    disabled={followingBack.includes(sender._id)}
                                  >
                                    {followingBack.includes(sender._id) ? (
                                      followedBack.includes(sender._id) ? "Unfollowing..." : "Following..."
                                    ) : followedBack.includes(sender._id) ? (
                                      "Following"
                                    ) : (
                                      "Follow Back"
                                    )}
                                  </Button>
                                )}
                                {!n.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => markAsRead(n._id)}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          {!n.isRead && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-3">
              {loadingRequests && (
                <div className="text-sm text-gray-500">
                  Loading follow requests...
                </div>
              )}
              {!loadingRequests && followRequests.length === 0 && (
                <div className="text-sm text-gray-500">No pending requests</div>
              )}
              {!loadingRequests &&
                followRequests.map((u) => (
                  <Card key={u._id} className="bg-white border-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={
                                u.avatar || u.profileImage || "/placeholder.svg"
                              }
                            />
                            <AvatarFallback>
                              {(u.username || "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {u.username}
                            </div>
                            {u.fullName && (
                              <div className="text-xs text-gray-500">
                                {u.fullName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRequest(u._id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => declineRequest(u._id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500">
              When you get notifications, they'll appear here
            </p>
          </div>
        )}
      </div>

      {/* Unfollow Confirmation Dialog */}
      <Dialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unfollow {userToUnfollow?.name}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to unfollow {userToUnfollow?.name}? You can follow them again anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowUnfollowConfirm(false);
                setUserToUnfollow(null);
              }}
              disabled={userToUnfollow && followingBack.includes(userToUnfollow.id)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnfollowConfirm}
              disabled={userToUnfollow && followingBack.includes(userToUnfollow.id)}
            >
              {userToUnfollow && followingBack.includes(userToUnfollow.id) ? "Unfollowing..." : "Unfollow"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
