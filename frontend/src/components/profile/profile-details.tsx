import { BadgeInfo } from "lucide-react";

type ProfileDetailsProps = {
  bio: string;
};

export function ProfileDetails({ bio }: ProfileDetailsProps) {
  if (!bio.trim()) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BadgeInfo className="size-4" />
          </span>

          <div>
            <p className="text-sm font-extrabold tracking-[-0.015em]">
              Brak opisu profilu
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground/60">
              Dodaj kilka zdań o sobie, żeby inni mogli lepiej Cię poznać przed
              dopasowaniem.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-muted/20 p-5">
      <p className="text-sm leading-7 text-foreground/72">{bio}</p>
    </div>
  );
}