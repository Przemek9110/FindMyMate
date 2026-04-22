"use client";

import { Card, CardContent } from "@/components/ui/card";

type MatchCardProps = {
  id: string;
  username: string;
  interests: string[];
  onClick: () => void;
};

export function MatchCard({ id, username, interests, onClick }: MatchCardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`Otwórz rozmowę z ${username}`}
      className="w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      data-match-id={id}
    >
      <Card className="transition hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold">{username}</p>
            <p className="truncate text-sm text-muted-foreground">
              {interests.join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
