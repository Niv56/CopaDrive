const cacheRef = React.useRef(new Map());     // cache by query prefix
const lastDataRef = React.useRef([]);         // last server results for fast local refine
const abortRef = React.useRef(null);

useEffect(() => {
  const q = query.trim();
  if (!q) { setResults([]); return; }

  // ✅ show something immediately (browser-like feel):
  // first refine last results locally
  const immediate = Array.isArray(lastDataRef.current)
    ? lastDataRef.current.filter((item) => matchesQuery(item, q))
    : [];
  setResults(immediate);

  // debounce
  const timer = setTimeout(async () => {
    // ✅ cache hit: instant
    if (cacheRef.current.has(q)) {
      const cached = cacheRef.current.get(q);
      lastDataRef.current = cached;
      setResults(cached.filter((item) => matchesQuery(item, q)));
      return;
    }

    // ✅ cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const data = await getSearchResults(token, q, { signal: controller.signal });

      const arr = Array.isArray(data) ? data : [];
      cacheRef.current.set(q, arr);
      lastDataRef.current = arr;

      setResults(arr.filter((item) => matchesQuery(item, q)));
    } catch (e) {
      // ignore abort errors
      if (e?.name !== "AbortError") console.log("search error:", e);
    } finally {
      setLoading(false);
    }
  }, 200);

  return () => clearTimeout(timer);
}, [query, token]);
