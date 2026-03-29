"use client";

import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div>
      login page

      <button
        onClick={() =>
          setAuth({
            user: {
              id: "1",
              username: "Karo",
              email: "test@test.pl",
            },
            token: "123",
          })
        }
      >
        TEST LOGIN
      </button>

      <p>{user?.username}</p>

      <button onClick={logout}>LOGOUT</button>
    </div>
  );
}