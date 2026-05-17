"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  User,
  HeartHandshake
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

const authenticatedLinks = [
  {
    href: "/discover",
    label: "Odkrywaj",
    icon: Search,
  },
  {
    href: "/matches",
    label: "Dopasowania",
    icon: Sparkles,
  },
  {
    href: "/chat",
    label: "Rozmowy",
    icon: MessageCircle,
  },
  {
    href: "/profile",
    label: "Profil",
    icon: User,
  },
  {
    href: "/settings",
    label: "Ustawienia",
    icon: Settings,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = Boolean(token);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="group flex w-fit items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition group-hover:scale-105">
            <HeartHandshake className="size-5" />
          </span>

          <span className="text-lg font-black tracking-[-0.03em] text-foreground">
            FindMyMate
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              isActiveLink("/")
                ? "bg-primary/10 text-primary"
                : "text-foreground/65 hover:bg-muted hover:text-foreground"
            }`}
          >
            Start
          </Link>

          {hasHydrated && isAuthenticated ? (
            <>
              {authenticatedLinks.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/65 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Link>
                );
              })}

              <Button
                type="button"
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="rounded-full text-foreground/65 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              >
                <LogOut className="size-3.5" />
                Wyloguj
              </Button>
            </>
          ) : hasHydrated ? (
            <Button
              asChild
              size="sm"
              className="rounded-full px-4 font-bold shadow-md shadow-primary/20"
            >
              <Link href="/login">Logowanie</Link>
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}