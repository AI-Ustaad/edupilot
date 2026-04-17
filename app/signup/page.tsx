"use client";

import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { user, userData } = useAuth();

  return (
    <div>
      <h1>Signup Page</h1>

      {user && (
        <div>
          <p>Email: {user.email}</p>
          <p>Role: {userData?.role}</p>
        </div>
      )}
    </div>
  );
}
