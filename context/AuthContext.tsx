const loadUser = useCallback(async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/auth/me", { cache: "no-store" });

    if (res.status === 401) {
      setUser(null);
      return;
    }
    if (!res.ok) throw new Error(`Auth Error: ${res.status}`);

    const userData = await res.json();
    setUser(userData);
  } catch (error) {
    console.error("Auth Load Error:", error);
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);
