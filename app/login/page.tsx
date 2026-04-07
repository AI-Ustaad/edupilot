// (باقی امپورٹس وہی رہیں گے، بس فنکشن اپڈیٹ کریں)

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // 1. فائر بیس سے لاگ ان کریں
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // 2. مڈل ویئر (Middleware) کے لیے بیک اینڈ سے کوکی بنوائیں
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (response.ok) {
      // 3. جب کوکی 100% بن جائے، تب ڈیش بورڈ پر جائیں
      router.push("/dashboard");
      router.refresh(); // یہ مڈل ویئر کو فوراً جگا دے گا
    } else {
      setError("Server Error: Please check Vercel Environment Variables.");
      await signOut(auth); // کوکی نہیں بنی تو لاگ آؤٹ کر دو
    }
  } catch (err: any) {
    setError("Invalid email or password.");
  }
  setLoading(false);
};
