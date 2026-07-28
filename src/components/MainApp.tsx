import { useState, useEffect } from "react";
import { Navigation, MobileNavigation } from "./Navigation";
import { EnhancedAuthModal } from "./EnhancedAuthModal";
import { StoryBar } from "./StoryBar";
import { InfiniteScrollFeed } from "./InfiniteScrollFeed";
import { EnhancedSearch } from "./EnhancedSearch";
import { ReelsViewer } from "./ReelsViewer";
import { LiveStream } from "./LiveStream";
import { ProfilePage } from "./ProfilePage";
import { MessagingPage } from "./MessagingPage";
import { ArcadePage } from "./ArcadePage";
import { NotificationPage } from "./NotificationPage";
import { AboutPage, TermsPage, PrivacyPage, Footer } from "./StaticPages";
import { UploadModal, GoLiveModal } from "./UploadModal";
import { ReportModal } from "./ReportModal";
import { StreamerSubscriptionSetup } from "./StreamerSubscriptionSetup";
import { StreamerSubscriptionStatus } from "./StreamerSubscriptionStatus";
import { SubscriptionHistoryPage } from "./SubscriptionHistoryPage";
import { StreamerDiscoveryPage } from "./StreamerDiscoveryPage";
import { SettingsPage } from "./SettingsPage";
import { SubscriptionsPage } from "./SubscriptionsPage";
import { UserProfilePage } from "./UserProfilePage";
import { ErrorBoundary } from "./ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { notificationsAPI } from "@/services/api";
import { useChat } from "@/hooks/useChat";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Bell,
  Settings,
  LogOut,
  Crown,
  Gift,
  Heart,
  User,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockPosts = [
  {
    id: "1",
    user: {
      name: "Alice Johnson",
      username: "alice",
      avatar: "/placeholder.svg",
      verified: true,
    },
    content: "Beautiful sunset today! 🌅",
    image: "/placeholder.svg",
    timestamp: "2h ago",
    likes: 234,
    comments: 12,
    shares: 5,
    liked: false,
    saved: false,
    type: "post" as const,
  },
  {
    id: "2",
    user: {
      name: "Admin",
      username: "admin",
      avatar: "/placeholder.svg",
      verified: true,
    },
    content: "🚨 IMPORTANT: New community guidelines are now in effect.",
    timestamp: "4h ago",
    likes: 89,
    comments: 23,
    shares: 45,
    liked: false,
    saved: true,
    type: "psa" as const,
  },
];

interface MainAppProps {
  // No props needed anymore
}

export const MainApp = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  // Mount chat hook globally to keep unread badges in sync app-wide
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _chat = useChat();
  const [activeTab, setActiveTab] = useState("home");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"post" | "story" | "reel">(
    "post"
  );
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<{
    type: "user" | "post" | "reel" | "stream" | "story";
    targetId: string;
    targetName: string;
  }>({
    type: "post",
    targetId: "",
    targetName: "",
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  // Function to refresh notification count
  const refreshNotificationCount = async () => {
    if (user?.id) {
      try {
        const response = await notificationsAPI.getUnreadCount();
        if (response.data) {
          setNotificationCount(response.data.count);
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    }
  };

  // Fetch unread notification count
  useEffect(() => {
    refreshNotificationCount();
  }, [user?.id]);

  // Sync header badge with NotificationPage events
  useEffect(() => {
    const onDec = (e: Event) => {
      const detail = (e as CustomEvent).detail as { by?: number } | undefined;
      const by = Math.max(1, Number(detail?.by ?? 1));
      setNotificationCount((prev) => Math.max(0, prev - by));
    };
    const onInc = (e: Event) => {
      const detail = (e as CustomEvent).detail as { by?: number } | undefined;
      const by = Math.max(1, Number(detail?.by ?? 1));
      setNotificationCount((prev) => prev + by);
    };
    const onSet = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { count?: number }
        | undefined;
      const count = Math.max(0, Number(detail?.count ?? 0));
      setNotificationCount(count);
    };
    window.addEventListener(
      "treesh:notifications-decrement",
      onDec as EventListener
    );
    window.addEventListener(
      "treesh:notifications-increment",
      onInc as EventListener
    );
    window.addEventListener("treesh:notifications-set", onSet as EventListener);
    return () => {
      window.removeEventListener(
        "treesh:notifications-decrement",
        onDec as EventListener
      );
      window.removeEventListener(
        "treesh:notifications-increment",
        onInc as EventListener
      );
      window.removeEventListener(
        "treesh:notifications-set",
        onSet as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show welcome screen for a few seconds before checking auth
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeScreen(false);
    }, 2000); // Show welcome screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Ensure login UI hides and tab resets when auth becomes true
  useEffect(() => {
    if (isAuthenticated) {
      setIsAuthOpen(false);
      setShowWelcomeScreen(false);
      if (activeTab === "home") return;
      // Stay on current tab if it was public; otherwise default to home
      const publicTabs = new Set([
        "home",
        "search",
        "about",
        "terms",
        "privacy",
        "reels",
        "live",
      ]);
      if (!publicTabs.has(activeTab)) {
        setActiveTab("home");
      }
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    // Close modal and take the user to the app immediately
    setIsAuthOpen(false);
    setShowWelcomeScreen(false);
    setActiveTab("home");
  };

  const handleLogout = () => {
    // This will be handled by the useAuth hook
    setActiveTab("home");
    setShowWelcomeScreen(true); // Show welcome screen again after logout
  };

  const handleUpload = (type: "post" | "story" | "reel") => {
    setUploadType(type);
    setUploadModalOpen(true);
  };

  const handleReport = (
    type: "user" | "post" | "reel" | "stream" | "story",
    targetId: string,
    targetName?: string
  ) => {
    setReportData({ type, targetId, targetName: targetName || "" });
    setReportModalOpen(true);
  };

  const handlePostReport = (
    type: "post",
    targetId: string,
    targetName?: string
  ) => {
    handleReport(type, targetId, targetName);
  };

  const handleTabChange = (tab: string) => {
    console.log("Tab change requested:", tab);
    console.log("Previous active tab:", activeTab);
    setActiveTab(tab);
    console.log("New active tab set to:", tab);
  };

  const handleBackToHome = () => {
    console.log("Back to home requested");
    setActiveTab("home");
  };

  const handleUserSelect = (userId: string) => {
    console.log("User selected:", userId);
    setViewingUserId(userId);
    setActiveTab("user-profile");
  };

  const handleBackFromUserProfile = () => {
    setViewingUserId(null);
    setActiveTab("search");
  };

  // Deep-link from Messaging: open user profile when requested
  useEffect(() => {
    const onNavigateToUserProfile = (e: any) => {
      const uid = String(e?.detail?.userId || "");
      if (!uid) return;
      setViewingUserId(uid);
      setActiveTab("user-profile");
    };
    window.addEventListener(
      "navigateToUserProfile",
      onNavigateToUserProfile as EventListener
    );
    return () =>
      window.removeEventListener(
        "navigateToUserProfile",
        onNavigateToUserProfile as EventListener
      );
  }, []);

  // Global navigation handler (e.g., from ProfilePage: Subscribe/Gift)
  useEffect(() => {
    const onNavigate = (e: any) => {
      const tab = String(e?.detail?.tab || "");
      if (!tab) return;
      setActiveTab(tab);
    };
    window.addEventListener("treesh:navigate", onNavigate as EventListener);
    return () =>
      window.removeEventListener(
        "treesh:navigate",
        onNavigate as EventListener
      );
  }, []);

  // Show welcome screen
  if (showWelcomeScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-accent flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-amber-50/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img
                src="/logo.svg"
                alt="Treesh"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
              <div className="w-16 h-16 rounded-full hidden overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="Treesh Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-4 font-treesh">
              Treesh
            </h1>
            <p className="text-muted-foreground mb-8 font-inter text-lg">
              Connect, Share, Stream
            </p>
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-inter text-lg py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
        <EnhancedAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  // Show loading state while authentication is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-accent flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-amber-50/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img
                src="/logo.svg"
                alt="Treesh"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
              <div className="w-16 h-16 rounded-full hidden overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="Treesh Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-4 font-treesh">
              Treesh
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground font-inter">
                Loading...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    console.log(
      "Current activeTab:",
      activeTab,
      "isAuthenticated:",
      isAuthenticated
    );

    // If not logged in, show login prompt for protected features
    if (
      !isAuthenticated &&
      ["arcade", "subscriptions", "messages", "profile", "settings"].includes(
        activeTab
      )
    ) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <img
                  src="/logo.svg"
                  alt="Treesh"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
                <div className="w-16 h-16 rounded-full hidden overflow-hidden">
                  <img
                    src="/logo.svg"
                    alt="Treesh Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4 font-treesh">
                Login Required
              </h2>
              <p className="text-muted-foreground mb-6 font-inter">
                Please log in to access {activeTab} features.
              </p>
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-inter py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                Login Now
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
            <StoryBar />
            <div className="p-2 sm:p-4">
              <InfiniteScrollFeed onReport={handlePostReport} />
            </div>
          </div>
        );

      case "search":
        console.log("Rendering EnhancedSearch component");
        return (
          <ErrorBoundary>
            <EnhancedSearch onUserSelect={handleUserSelect} />
          </ErrorBoundary>
        );

      case "user-profile":
        if (viewingUserId) {
          return (
            <ErrorBoundary>
              <UserProfilePage
                userId={viewingUserId}
                onBack={handleBackFromUserProfile}
                onFollowAction={refreshNotificationCount}
              />
            </ErrorBoundary>
          );
        }
        // Fallback to search if no user is selected
        return (
          <ErrorBoundary>
            <EnhancedSearch onUserSelect={handleUserSelect} />
          </ErrorBoundary>
        );

      case "reels":
        console.log("Rendering ReelsViewer component");
        return (
          <ErrorBoundary>
            <ReelsViewer />
          </ErrorBoundary>
        );

      case "live":
        console.log("Rendering LiveStream component");
        return (
          <ErrorBoundary>
            <LiveStream />
          </ErrorBoundary>
        );

      case "arcade":
        console.log("Rendering ArcadePage component");
        return (
          <ErrorBoundary>
            <ArcadePage />
          </ErrorBoundary>
        );

      case "subscriptions":
        console.log("Rendering SubscriptionsPage component");
        return (
          <ErrorBoundary>
            <SubscriptionsPage />
          </ErrorBoundary>
        );

      case "discover-streamers":
        return <StreamerDiscoveryPage />;

      case "subscription-setup":
        return <StreamerSubscriptionSetup />;

      case "my-subscriptions":
        console.log("Rendering StreamerSubscriptionStatus component");
        return (
          <ErrorBoundary>
            <StreamerSubscriptionStatus />
          </ErrorBoundary>
        );

      case "subscription-history":
        console.log("Rendering SubscriptionHistoryPage component");
        return (
          <ErrorBoundary>
            <SubscriptionHistoryPage />
          </ErrorBoundary>
        );

      case "messages":
        console.log("Rendering MessagingPage component");
        return (
          <ErrorBoundary>
            <MessagingPage />
          </ErrorBoundary>
        );

      case "notifications":
        console.log("Rendering NotificationPage component");
        return (
          <ErrorBoundary>
            <NotificationPage />
          </ErrorBoundary>
        );

      case "profile":
        console.log("Rendering ProfilePage component");
        return (
          <ErrorBoundary>
            <ProfilePage />
          </ErrorBoundary>
        );

      case "settings":
        console.log("Rendering SettingsPage component");
        return (
          <ErrorBoundary>
            <SettingsPage />
          </ErrorBoundary>
        );

      case "about":
        console.log("Rendering AboutPage component");
        return (
          <ErrorBoundary>
            <AboutPage />
          </ErrorBoundary>
        );

      case "terms":
        console.log("Rendering TermsPage component");
        return (
          <ErrorBoundary>
            <TermsPage />
          </ErrorBoundary>
        );

      case "privacy":
        console.log("Rendering PrivacyPage component");
        return (
          <ErrorBoundary>
            <PrivacyPage />
          </ErrorBoundary>
        );

      default:
        console.log("Unknown tab:", activeTab, "showing default content");
        return (
          <div className="p-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-center mb-4">
                  Page Not Found
                </h2>
                <p className="text-center text-muted-foreground font-inter mb-4">
                  The page "{activeTab}" is not available yet.
                </p>
                <div className="text-center">
                  <Button onClick={handleBackToHome} variant="outline">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-accent flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-offwhite/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img
                src="/logo.svg"
                alt="Treesh"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
              <div className="w-16 h-16 rounded-full hidden overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="Treesh Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-4 font-treesh">
              Treesh
            </h1>
            <p className="text-muted-foreground mb-8 font-inter text-lg">
              Connect, Share, Stream
            </p>
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-inter text-lg py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
        <EnhancedAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          {activeTab !== "home" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToHome}
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          <img
            src="/logo.svg"
            alt="Treesh"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hidden overflow-hidden">
            <img
              src="/logo.svg"
              alt="Treesh Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary font-treesh">
            Treesh
          </h1>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem
                onClick={() => handleUpload("post")}
                className="font-opensans"
              >
                Create Post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpload("story")}
                className="font-opensans"
              >
                Add Story
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpload("reel")}
                className="font-opensans"
              >
                Create Reel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setGoLiveModalOpen(true)}
                className="font-opensans"
              >
                Go Live
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("subscriptions")}
                className="font-opensans"
              >
                <Crown className="w-4 h-4 mr-2" />
                Subs
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("arcade")}
                className="font-opensans"
              >
                <Heart className="w-4 h-4 mr-2" />
                Arcade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-primary">
                {notificationCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            className="flex items-center space-x-2 h-9 px-2 sm:h-10 sm:px-3"
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline font-inter">Profile</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setActiveTab("arcade")}
                className="font-opensans"
              >
                <Heart className="w-4 h-4 mr-2" />
                Arcade
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("discover-streamers")}
                className="font-opensans"
              >
                <Crown className="w-4 h-4 mr-2" />
                Discover Streamers
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("subscriptions")}
                className="font-opensans"
              >
                <Crown className="w-4 h-4 mr-2" />
                Subs
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("subscription-setup")}
                className="font-opensans"
              >
                <Settings className="w-4 h-4 mr-2" />
                Subscription Setup
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("my-subscriptions")}
                className="font-opensans"
              >
                <Settings className="w-4 h-4 mr-2" />
                My Subscriptions
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("subscription-history")}
                className="font-opensans"
              >
                <Gift className="w-4 h-4 mr-2" />
                Subscription History
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("messages")}
                className="font-opensans"
              >
                Messages
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("settings")}
                className="font-opensans"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="font-opensans"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {!isMobile && (
          <Navigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            className="w-64 h-screen sticky top-16"
            notificationCount={notificationCount}
          />
        )}

        <main className="flex-1 min-h-screen pb-20 sm:pb-0">
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
          {activeTab === "home" && <Footer />}
        </main>
      </div>

      {isMobile && (
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          notificationCount={notificationCount}
        />
      )}

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        type={uploadType}
      />

      <GoLiveModal
        isOpen={goLiveModalOpen}
        onClose={() => setGoLiveModalOpen(false)}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        type={reportData.type}
        targetId={reportData.targetId}
        targetName={reportData.targetName}
      />

      <EnhancedAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};
