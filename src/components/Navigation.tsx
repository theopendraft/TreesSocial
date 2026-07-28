import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Search,
  Play,
  Radio,
  Heart,
  MessageCircle,
  User,
  Settings,
  Bell,
  Crown,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
  notificationCount?: number;
}

export const Navigation = ({
  activeTab,
  onTabChange,
  className,
  notificationCount,
}: NavigationProps) => {
  const notifications = Math.max(0, Number(notificationCount ?? 0));
  const [messageBadges, setMessageBadges] = useState({ total: 0, chats: 0 });

  // Subscribe to global messages badge updates from useChat
  useEffect(() => {
    const onSet = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { total?: number; chatsCount?: number }
        | undefined;
      setMessageBadges({
        total: Math.max(0, Number(detail?.total ?? 0)),
        chats: Math.max(0, Number(detail?.chatsCount ?? 0)),
      });
    };
    window.addEventListener(
      "treesh:messages-badge-set",
      onSet as EventListener
    );
    // Request initial state
    try {
      window.dispatchEvent(new Event("treesh:messages-badge-request"));
    } catch {}
    return () =>
      window.removeEventListener(
        "treesh:messages-badge-set",
        onSet as EventListener
      );
  }, []);

  // Allow rerender on chatRead; useChat updates its internal state on this event
  useEffect(() => {
    const onRead = () => setTimeout(() => {}, 0);
    window.addEventListener("chatRead", onRead);
    return () => window.removeEventListener("chatRead", onRead);
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: Home, badge: 0 },
    { id: "search", label: "Search", icon: Search, badge: 0 },
    { id: "reels", label: "Reels", icon: Play, badge: 0 },
    { id: "live", label: "Live", icon: Radio, badge: 0 },
    { id: "arcade", label: "Arcade", icon: Heart, badge: 0 },
    { id: "subscriptions", label: "Subscriptions", icon: Crown, badge: 0 },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      badge: messageBadges.chats,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: notifications,
    },
    { id: "profile", label: "Profile", icon: User, badge: 0 },
  ];

  return (
    <nav
      className={cn(
        "bg-offwhite border-r border-accent/20 shadow-sm",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Treesh"
              className="w-10 h-10 text-primary"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary font-treesh">
            Treesh
          </h1>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-4 font-inter",
                  isActive && "bg-primary hover:bg-primary-dark text-white"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <div className="flex items-center space-x-3 relative">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-accent/20">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 px-4 font-inter"
            onClick={() => onTabChange("settings")}
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </div>
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Mobile Navigation
export const MobileNavigation = ({
  activeTab,
  onTabChange,
  notificationCount,
}: NavigationProps) => {
  const notifications = Math.max(0, Number(notificationCount ?? 0));
  const [messageBadges, setMessageBadges] = useState({ total: 0, chats: 0 });

  useEffect(() => {
    const onSet = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { total?: number; chatsCount?: number }
        | undefined;
      setMessageBadges({
        total: Math.max(0, Number(detail?.total ?? 0)),
        chats: Math.max(0, Number(detail?.chatsCount ?? 0)),
      });
    };
    window.addEventListener(
      "treesh:messages-badge-set",
      onSet as EventListener
    );
    try {
      window.dispatchEvent(new Event("treesh:messages-badge-request"));
    } catch {}
    return () =>
      window.removeEventListener(
        "treesh:messages-badge-set",
        onSet as EventListener
      );
  }, []);

  // Allow rerender on chatRead; useChat updates its internal state on this event
  useEffect(() => {
    const onRead = () => setTimeout(() => {}, 0);
    window.addEventListener("chatRead", onRead);
    return () => window.removeEventListener("chatRead", onRead);
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: Home, badge: 0 },
    { id: "search", label: "Search", icon: Search, badge: 0 },
    { id: "reels", label: "Reels", icon: Play, badge: 0 },
    { id: "arcade", label: "Arcade", icon: Heart, badge: 0 },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      badge: messageBadges.chats,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-accent/20 z-50 shadow-lg">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center space-y-1 h-14 px-2 min-w-0 font-inter",
                isActive && "text-primary"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs truncate max-w-full">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
