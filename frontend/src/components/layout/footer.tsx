export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} FindMyMate. All rights reserved.
      </div>
    </footer>
  );
}