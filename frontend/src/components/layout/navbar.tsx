"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          FindMyMate
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/discover"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Discover
              </Link>

              <Link
                href="/matches"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Matches
              </Link>

              <Link
                href="/chat"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Chat
              </Link>

              <Link
                href="/profile"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}