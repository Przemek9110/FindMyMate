import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/matches", label: "Matches" },
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export function Navbar() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          FindMyMate
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}