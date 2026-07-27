import { useCallback, useEffect, useMemo, useState } from "react";

type SeenMap = Record<string, number>; // userId -> timestamp seen

const STORAGE_KEY = "storySeenUsers";
const EVENT_KEY = "storySeen";

const loadSeenMap = (): SeenMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
};

const saveSeenMap = (map: SeenMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // noop
  }
};

type HasSeenOptions = {
  serverHasSeen?: boolean;
  serverViewers?: Array<string | { id?: string; _id?: string }>;
  currentUserId?: string;
};

export function useStorySeen() {
  const [seenMap, setSeenMap] = useState<SeenMap>(() => loadSeenMap());
  const [version, setVersion] = useState(0); // force updates across consumers

  const hasSeen = useCallback(
    (userId?: string | null, opts?: HasSeenOptions) => {
      if (!userId) return false;
      const localSeen = Boolean(seenMap[String(userId)]);
      // If locally marked seen (e.g., just viewed), treat as seen immediately
      if (localSeen) return true;
      // Otherwise, prefer server truth when available
      if (opts) {
        if (typeof opts.serverHasSeen === "boolean") {
          return opts.serverHasSeen;
        }
        if (opts.serverViewers && opts.currentUserId) {
          const uid = String(opts.currentUserId);
          const seenOnServer = opts.serverViewers.some((v: any) => {
            if (typeof v === "string") return String(v) === uid;
            const vid = v?._id || v?.id;
            return vid && String(vid) === uid;
          });
          return seenOnServer;
        }
      }
      // Fallback: not seen
      return false;
    },
    [seenMap]
  );

  const seenAt = useCallback(
    (userId?: string | null) => {
      if (!userId) return undefined;
      return seenMap[String(userId)];
    },
    [seenMap]
  );

  const markSeen = useCallback((userId?: string | null) => {
    if (!userId) return;
    setSeenMap((prev) => {
      const next = { ...prev, [String(userId)]: Date.now() };
      saveSeenMap(next);
      // Broadcast so other hook instances can refresh
      try {
        window.dispatchEvent(
          new CustomEvent(EVENT_KEY, { detail: { userId: String(userId) } })
        );
      } catch {}
      return next;
    });
    setVersion((v) => v + 1);
  }, []);

  const refresh = useCallback(() => {
    setSeenMap(loadSeenMap());
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const handler = () => {
      // Re-read from storage so all tabs/components stay in sync
      setSeenMap(loadSeenMap());
      setVersion((v) => v + 1);
    };
    window.addEventListener(EVENT_KEY, handler as EventListener);
    return () =>
      window.removeEventListener(EVENT_KEY, handler as EventListener);
  }, []);

  return useMemo(
    () => ({ hasSeen, markSeen, seenAt, refresh, version, seenMap }),
    [hasSeen, markSeen, seenAt, refresh, version, seenMap]
  );
}

export type UseStorySeen = ReturnType<typeof useStorySeen>;
