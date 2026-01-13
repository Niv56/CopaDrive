import { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "features/drive/api/filesApi";

// Build a cache of ownerId -> user and keep it updated during the session.
export function useOwnersMap(items) {
  const [owners, setOwners] = useState({});
  const fetchedRef = useRef(new Set());

  // Fetch missing owners only once per session.
  useEffect(() => {
    const ids = Array.from(new Set((items || []).map((x) => x?.ownerId).filter(Boolean)));

    ids.forEach((id) => {
      if (fetchedRef.current.has(id)) return;
      fetchedRef.current.add(id);

      getCurrentUser(id)
        .then((user) => {
          setOwners((prev) => ({ ...prev, [id]: user }));
        })
        .catch(() => {
          // Ignore fetch errors and fall back to default UI.
        });
    });
  }, [items]);

  // Listen for "user-updated" events and update the cache immediately.
  useEffect(() => {
    const handler = (e) => {
      const { userId, user } = e.detail || {};
      if (!userId || !user) return;

      setOwners((prev) => ({ ...prev, [userId]: user }));
      fetchedRef.current.add(userId);
    };

    window.addEventListener("user-updated", handler);
    return () => window.removeEventListener("user-updated", handler);
  }, []);

  return owners;
}
