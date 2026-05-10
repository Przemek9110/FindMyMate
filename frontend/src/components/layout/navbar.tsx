"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  User,
  UsersRound,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <UsersRound className="size-4" />
          </span>
          <span>FindMyMate</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Start
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Search className="size-3.5" />
                Odkrywaj
              </Link>

              <Link
                href="/matches"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Sparkles className="size-3.5" />
                Dopasowania
              </Link>

              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="size-3.5" />
                Rozmowy
              </Link>

              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <User className="size-3.5" />
                Profil
              </Link>

              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="size-3.5" />
                Ustawienia
              </Link>

              <Button
                type="button"
                onClick={handleLogout}
                variant="ghost"
                size="sm"
              >
                <LogOut className="size-3.5" />
                Wyloguj
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Logowanie
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
