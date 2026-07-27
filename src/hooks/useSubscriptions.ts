import { useState, useEffect } from "react";
import { subscriptionAPI, usersAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface SubscriptionTier {
  id: string;
  tier: "gold" | "diamond" | "chrome";
  price: number;
  description: string;
  benefits: string[];
  isActive: boolean;
  customEmotes?: string[];
  exclusiveContent?: string[];
}

interface Subscription {
  id: string;
  streamerId: string;
  streamerName: string;
  tier: "gold" | "diamond" | "chrome";
  price: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
}

interface StreamerProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  category: string;
  totalViews: number;
  totalStreams: number;
  isOnline: boolean;
  subscriptionTiers: SubscriptionTier[];
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [streamers, setStreamers] = useState<StreamerProfile[]>([]);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadSubscriptions();
    loadStreamers();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await subscriptionAPI.getSubscriptions();
      if (response.success && response.data) {
        const activeSubscriptions = response.data.filter(
          (sub: Subscription) => sub.status === "active"
        );
        const subscriptionHistory = response.data.filter(
          (sub: Subscription) => sub.status !== "active"
        );
        setSubscriptions(activeSubscriptions);
        setHistory(subscriptionHistory);
      }
    } catch (err) {
      const errorMessage = "Failed to load subscriptions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStreamers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await subscriptionAPI.getStreamers();
      if (response.success && response.data) {
        const streamersWithTiers = response.data.map((streamer: any) => ({
          ...streamer,
          subscriptionTiers: streamer.streamerProfile?.subscriptionTiers || [],
        }));
        setStreamers(streamersWithTiers);
      }
    } catch (err) {
      const errorMessage = "Failed to load streamers";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (streamerId: string, tier: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await subscriptionAPI.subscribe(streamerId, tier);
      if (response.success && response.data) {
        setSubscriptions((prev) => [response.data, ...prev]);
        toast({
          title: "Subscription successful!",
          description: `You are now subscribed to ${tier} tier`,
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to subscribe";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await subscriptionAPI.cancelSubscription(subscriptionId);
      if (response.success) {
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, status: "cancelled" as const }
              : sub
          )
        );
        // Move to history
        const cancelledSub = subscriptions.find(
          (sub) => sub.id === subscriptionId
        );
        if (cancelledSub) {
          setHistory((prev) => [
            { ...cancelledSub, status: "cancelled" },
            ...prev,
          ]);
          setSubscriptions((prev) =>
            prev.filter((sub) => sub.id !== subscriptionId)
          );
        }
        toast({
          title: "Subscription cancelled",
          description: "Your subscription has been cancelled",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to cancel subscription";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAutoRenew = async (
    subscriptionId: string,
    autoRenew: boolean
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await subscriptionAPI.updateAutoRenew(
        subscriptionId,
        autoRenew
      );
      if (response.success) {
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId ? { ...sub, autoRenew } : sub
          )
        );
        toast({
          title: "Auto-renewal updated",
          description: `Auto-renewal ${autoRenew ? "enabled" : "disabled"}`,
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to update auto-renewal";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getStreamerTiers = (streamerId: string): SubscriptionTier[] => {
    const streamer = streamers.find((s) => s.id === streamerId);
    return streamer?.subscriptionTiers || [];
  };

  const isSubscribedTo = (streamerId: string): boolean => {
    return subscriptions.some(
      (sub) => sub.streamerId === streamerId && sub.status === "active"
    );
  };

  const getSubscriptionTier = (streamerId: string): string | null => {
    const subscription = subscriptions.find(
      (sub) => sub.streamerId === streamerId && sub.status === "active"
    );
    return subscription?.tier || null;
  };

  const getTotalSpent = (): number => {
    return [...subscriptions, ...history].reduce((total, sub) => {
      const startDate = new Date(sub.startDate);
      const endDate = new Date(sub.endDate);
      const months = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      return total + sub.price * months;
    }, 0);
  };

  const getActiveSubscriptionsCount = (): number => {
    return subscriptions.length;
  };

  return {
    // State
    subscriptions,
    streamers,
    history,
    isLoading,
    error,

    // Actions
    subscribe,
    cancelSubscription,
    updateAutoRenew,

    // Helpers
    getStreamerTiers,
    isSubscribedTo,
    getSubscriptionTier,
    getTotalSpent,
    getActiveSubscriptionsCount,

    // Refresh functions
    refreshSubscriptions: loadSubscriptions,
    refreshStreamers: loadStreamers,
  };
};
