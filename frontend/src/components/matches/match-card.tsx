"use client";

import { ChevronDown, ChevronUp, Eye, MapPin, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type MatchCardProps = {
  id: string;
  username: string;
  age?: number;
  bio?: string;
  city?: string;
  interests: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onOpenChat: () => void;
  onPreviewProfile: () => void;
};

export function MatchCard({
  id,
  username,
  age,
  bio,
  city,
  interests,
  isExpanded,
  onToggle,
  onOpenChat,
  onPreviewProfile,
}: MatchCardProps) {
  const meta = [age, city].filter(Boolean).join(" • ");

  return (
    <Card
      className="border-0 bg-card/95 transition hover:shadow-lg ring-1 ring-border/70"
      data-match-id={id}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          <button
            type="button"
            onClick={onToggle}
            className="flex min-w-0 flex-1 items-center gap-4 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-expanded={isExpanded}
          >
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary/10 text-lg text-primary">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{username}</p>
                {isExpanded ? (
                  <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>
              {meta ? (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {meta}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Kliknij, zeby rozwinac profil
                </p>
              )}
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onPreviewProfile}
              aria-label={`Pokaz profil ${username}`}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={onOpenChat}
              aria-label={`Otworz rozmowe z ${username}`}
            >
              <MessageCircle className="size-4" />
            </Button>
          </div>
        </div>

        {isExpanded ? (
          <div className="border-t bg-muted/20 px-4 py-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {bio || "Ten profil nie ma jeszcze opisu."}
            </p>
            {interests.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Brak zapisanych zainteresowan.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
