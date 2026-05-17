import { HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 border-t bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HeartHandshake className="size-4" />
          </span>

          <div>
            <p className="font-black tracking-[-0.02em] text-foreground">
              FindMyMate
            </p>
            <p className="text-xs text-foreground/55">
              Poznawaj ludzi przez wspólne zainteresowania.
            </p>
          </div>
        </div>

        <span className="text-xs sm:text-sm">
          © 2026 FindMyMate — projekt zespołowy.
        </span>
      </div>
    </footer>
  );
}