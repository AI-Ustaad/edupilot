export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);

    const idToken =
      await result.user.getIdToken();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE", data);

    if (!res.ok) {
      throw new Error(data.error);
    }

    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Google Login Failed:", error);
  }
};
