import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Smartphone,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Settings,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { usersAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const SettingsPage = () => {
  const {
    settings,
    isLoading,
    error,
    updateAccountSettings,
    updatePrivacySettings,
    updateNotificationSettings,
    updateAppSettings,
    exportSettings,
    resetSettings,
  } = useSettings();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("account");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Local state for form inputs
  const [localAccountSettings, setLocalAccountSettings] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    language: "en",
    timezone: "UTC-5",
  });
  const [privacySettings, setPrivacySettings] = useState(
    settings?.privacy || {
      profileVisibility: "public" as const,
      showOnlineStatus: true,
      allowMessagesFrom: "everyone" as const,
      showLastSeen: true,
      allowProfileViews: true,
    }
  );
  const [notificationSettings, setNotificationSettings] = useState(
    settings?.notifications || {
      newMatches: true,
      messages: true,
      likes: true,
      superLikes: true,
      subscriptionUpdates: true,
      streamNotifications: true,
    }
  );
  const [appSettings, setAppSettings] = useState(
    settings?.app || {
      theme: "system" as const,
      language: "en",
      timezone: "UTC-5",
      autoPlayVideos: true,
      soundEffects: true,
      dataSaver: false,
      downloadQuality: "medium" as const,
      hapticFeedback: false,
    }
  );

  // Sync local state when settings load
  useEffect(() => {
    if (settings) {
      setPrivacySettings(settings.privacy);
      setNotificationSettings(settings.notifications);
      setAppSettings(settings.app);
      setLocalAccountSettings((prev) => ({
        ...prev,
        language: settings.app.language || prev.language,
        timezone: settings.app.timezone || prev.timezone,
      }));
    }
  }, [settings]);

  useEffect(() => {
    if (user) {
      setLocalAccountSettings((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        bio: user.bio || "",
      }));
    }
  }, [user]);

  // Use settings from hook or fallback to defaults
  const accountSettings = settings?.account || {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
  };

  // removed derived fallbacks in favor of local state above

  const handleSaveSettings = async (section: string) => {
    try {
      let success = false;

      switch (section) {
        case "account": {
          // Save profile info to users endpoint
          const profilePayload: any = {
            username: localAccountSettings.username || undefined,
            bio: localAccountSettings.bio ?? undefined,
          };
          // Map optional fields if backend supports them in users/profile
          if (localAccountSettings.fullName)
            profilePayload.fullName = localAccountSettings.fullName;
          if (localAccountSettings.email)
            profilePayload.email = localAccountSettings.email;
          if (localAccountSettings.phone)
            profilePayload.phone = localAccountSettings.phone;
          const resp = await usersAPI.updateProfile(profilePayload);
          const profileSuccess = !!resp.success;
          if (resp.success && resp.data) {
            // Ensure fullName is mirrored from name when present
            const normalized = {
              ...(resp.data as any),
              fullName:
                (resp.data as any).fullName || (resp.data as any).name || "",
            } as any;
            updateUser(normalized);
          }
          // Save language/timezone under app settings
          const appResp = await updateAppSettings({
            language: localAccountSettings.language,
            timezone: localAccountSettings.timezone,
          });
          success = profileSuccess && !!appResp;
          if (profileSuccess) {
            toast({
              title: "Profile updated",
              description: "Your profile information was saved successfully.",
            });
            // Redirect to profile page
            window.dispatchEvent(
              new CustomEvent("treesh:navigate", { detail: { tab: "profile" } })
            );
            if (!appResp) {
              toast({
                title: "Partial save",
                description:
                  "Profile saved, but app preferences failed. You can retry later.",
                variant: "destructive",
              });
            }
          }
          break;
        }
        case "privacy":
          success = await updatePrivacySettings(privacySettings);
          break;
        case "notifications":
          success = await updateNotificationSettings(notificationSettings);
          break;
        case "app":
          success = await updateAppSettings(appSettings);
          break;
        default:
          break;
      }

      if (success && section !== "account") {
        toast({
          title: "Settings Saved",
          description: `${section} settings have been updated successfully.`,
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api"
        }/settings/account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.message || `HTTP ${resp.status}`);
      }
      toast({ title: "Account deleted", variant: "destructive" });
      // Clear auth and redirect
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {}
      window.location.href = "/";
    } catch (e: any) {
      toast({
        title: "Failed to delete",
        description: e?.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={localAccountSettings.fullName}
                onChange={(e) =>
                  setLocalAccountSettings({
                    ...localAccountSettings,
                    fullName: e.target.value,
                  })
                }
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={localAccountSettings.username}
                onChange={(e) =>
                  setLocalAccountSettings({
                    ...localAccountSettings,
                    username: e.target.value,
                  })
                }
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={localAccountSettings.email}
                onChange={(e) =>
                  setLocalAccountSettings({
                    ...localAccountSettings,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={localAccountSettings.phone}
                onChange={(e) =>
                  setLocalAccountSettings({
                    ...localAccountSettings,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={localAccountSettings.bio}
              onChange={(e) =>
                setLocalAccountSettings({
                  ...localAccountSettings,
                  bio: e.target.value,
                })
              }
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={localAccountSettings.language}
                onValueChange={(value) =>
                  setLocalAccountSettings({
                    ...localAccountSettings,
                    language: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={localAccountSettings.timezone}
                onValueChange={(value) =>
                  setLocalAccountSettings({
                    ...localAccountSettings,
                    timezone: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC+0">UTC</SelectItem>
                  <SelectItem value="UTC+1">Central European Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => handleSaveSettings("account")}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Save Account Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile
                </p>
              </div>
              <Select
                value={privacySettings.profileVisibility}
                onValueChange={(value) =>
                  setPrivacySettings({
                    ...privacySettings,
                    profileVisibility: value as
                      | "public"
                      | "friends"
                      | "private",
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you're online
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showOnlineStatus}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      showOnlineStatus: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Messages From</Label>
                  <p className="text-sm text-muted-foreground">
                    Who can message you
                  </p>
                </div>
                <Select
                  value={privacySettings.allowMessagesFrom}
                  onValueChange={(value) =>
                    setPrivacySettings({
                      ...privacySettings,
                      allowMessagesFrom: value as
                        | "everyone"
                        | "friends"
                        | "none",
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="none">No one</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Profile Views</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to view your profile
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowProfileViews}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      allowProfileViews: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Last Seen</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your last active time
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showLastSeen}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      showLastSeen: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleSaveSettings("privacy")}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>New Matches</Label>
                <p className="text-sm text-muted-foreground">
                  When you get a new match
                </p>
              </div>
              <Switch
                checked={notificationSettings.newMatches}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    newMatches: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Messages</Label>
                <p className="text-sm text-muted-foreground">
                  When you receive a message
                </p>
              </div>
              <Switch
                checked={notificationSettings.messages}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    messages: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Likes</Label>
                <p className="text-sm text-muted-foreground">
                  When someone likes your post
                </p>
              </div>
              <Switch
                checked={notificationSettings.likes}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    likes: checked,
                  })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Notification Types</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Live Streams</Label>
                  <p className="text-sm text-muted-foreground">
                    When followed streamers go live
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.streamNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      streamNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Subscription Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates about your subscriptions
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.subscriptionUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      subscriptionUpdates: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Super Likes</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone super likes you
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.superLikes}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      superLikes: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleSaveSettings("notifications")}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Save Notification Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>App Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <Select
                value={appSettings.theme}
                onValueChange={(value) =>
                  setAppSettings({
                    ...appSettings,
                    theme: value as "light" | "dark" | "system",
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-play Videos</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically play videos in feed
                </p>
              </div>
              <Switch
                checked={appSettings.autoPlayVideos}
                onCheckedChange={(checked) =>
                  setAppSettings({ ...appSettings, autoPlayVideos: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play app sound effects
                </p>
              </div>
              <Switch
                checked={appSettings.soundEffects}
                onCheckedChange={(checked) =>
                  setAppSettings({ ...appSettings, soundEffects: checked })
                }
              />
            </div>
          </div>

          <Button
            onClick={() => handleSaveSettings("app")}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Save App Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderDangerZone = () => (
    <div className="space-y-6">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="w-full"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">
              Manage your account preferences and privacy settings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-gray-100"
          >
            <Save className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 h-10 sm:h-12">
            <TabsTrigger
              value="account"
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            >
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="app"
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            >
              <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>App</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 sm:space-y-6">
            {renderAccountSettings()}
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
            {renderPrivacySettings()}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
            {renderNotificationSettings()}
          </TabsContent>

          <TabsContent value="app" className="space-y-4 sm:space-y-6">
            {renderAppSettings()}
            <Separator className="my-6 sm:my-8" />
            {renderDangerZone()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation modal */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={(open) => {
          setShowDeleteModal(open);
          if (!open) setDeleteConfirmText("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm permanent deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Type DELETE to confirm you want to
              permanently remove your account and all associated content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              autoFocus
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={() => {
                  setShowDeleteModal(false);
                  handleDeleteAccount();
                }}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
