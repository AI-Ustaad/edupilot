// React Query: Data Fetching with Defensive JSON Parsing
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardData", user?.tenantId],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      
      // اگر رسپانس 500 یا کوئی اور ایرر ہے تو یہیں روک لیں
      if (!res.ok) {
        throw new Error(`Dashboard API Error: ${res.status}`);
      }
      
      const text = await res.text();
      if (!text) return null; // خالی رسپانس کا علاج
      
      try {
        const json = JSON.parse(text);
        return json.data || json; // اگر API 'data' key میں ریٹرن کر رہی ہے تو وہ، ورنہ پورا ابجیکٹ
      } catch (err) {
        throw new Error("Invalid JSON from API");
      }
    },
    enabled: !!user?.tenantId && !authLoading,
  });
