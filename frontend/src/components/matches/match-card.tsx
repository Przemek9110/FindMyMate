"use client";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type MatchCardProps = {
  id: string;
  username: string;
  age?: number;
  bio?: string;
  city?: string;
  photoUrl?: string | null;
  interests: string[];
  sharedInterests?: string[];
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
  photoUrl,
  interests,
  sharedInterests = [],
  isExpanded,
  onToggle,
  onOpenChat,
  onPreviewProfile,
}: MatchCardProps) {
  const meta = [city, age].filter(Boolean).join(" • ");
  const hasInterests = interests.length > 0;
  const hasSharedInterests = sharedInterests.length > 0;

  const sharedInterestsSet = new Set(
    sharedInterests.map((interest) => interest.toLowerCase())
  );

  const isSharedInterest = (interest: string) => {
    return sharedInterestsSet.has(interest.toLowerCase());
  };

  return (
    <Card
      className="group overflow-hidden border-0 bg-card/95 shadow-sm ring-1 ring-border/70 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/25"
      data-match-id={id}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4 sm:p-5">
          <button
            type="button"
            onClick={onToggle}
            className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-expanded={isExpanded}
          >
            <Avatar className="size-16 border-4 border-background shadow-sm">
              {photoUrl ? (
                <AvatarImage
                  src={photoUrl}
                  alt={`Zdjęcie profilu ${username}`}
                />
              ) : null}

              <AvatarFallback className="bg-primary/10 text-xl font-black text-primary">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-lg font-extrabold tracking-[-0.02em] text-foreground">
                  {username}
                </p>

                <Badge
                  variant="accent"
                  className="hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs sm:inline-flex"
                >
                  match
                </Badge>

                {hasSharedInterests ? (
                  <Badge
                    variant="outline"
                    className="hidden shrink-0 rounded-full border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-primary sm:inline-flex"
                  >
                    {sharedInterests.length} wspólne
                  </Badge>
                ) : null}
              </div>

              {meta ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/65">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">{meta}</span>
                </p>
              ) : (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-foreground/60">
                  <UserRound className="size-3.5 shrink-0" />
                  Kliknij, żeby rozwinąć profil
                </p>
              )}

              {hasInterests ? (
                <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
                  {interests.slice(0, 3).map((interest) => (
                    <Badge
                      key={interest}
                      variant={isSharedInterest(interest) ? "accent" : "secondary"}
                      className="rounded-full px-2.5 py-0.5 text-xs"
                    >
                      {interest}
                    </Badge>
                  ))}

                  {interests.length > 3 ? (
                    <Badge
                      variant="outline"
                      className="rounded-full px-2.5 py-0.5 text-xs"
                    >
                      +{interests.length - 3}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>

            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/60 transition group-hover:bg-primary/10 group-hover:text-primary">
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onPreviewProfile}
              aria-label={`Pokaż profil ${username}`}
              className="rounded-full"
            >
              <Eye className="size-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              onClick={onOpenChat}
              aria-label={`Otwórz rozmowę z ${username}`}
              className="rounded-full shadow-sm shadow-primary/20"
            >
              <MessageCircle className="size-4" />
            </Button>
          </div>
        </div>

        {isExpanded ? (
          <div className="border-t bg-muted/20 px-5 py-5">
            <div className="space-y-5">
              <section className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  O profilu
                </p>

                <p className="text-sm leading-7 text-foreground/72">
                  {bio || "Ten profil nie ma jeszcze opisu."}
                </p>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="size-3.5" />
                    </span>

                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                      Zainteresowania
                    </p>
                  </div>

                  {hasSharedInterests ? (
                    <Badge variant="accent" className="rounded-full px-3 py-1">
                      {sharedInterests.length} wspólne
                    </Badge>
                  ) : null}
                </div>

                {hasInterests ? (
                  <div className="flex flex-wrap gap-2 rounded-2xl border bg-background/70 p-3">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={
                          isSharedInterest(interest) ? "accent" : "secondary"
                        }
                        className="rounded-full px-3 py-1"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed bg-background/70 p-4 text-sm text-foreground/60">
                    Brak zapisanych zainteresowań.
                  </div>
                )}

                {hasSharedInterests ? (
                  <p className="text-xs leading-5 text-foreground/55">
                    Wyróżnione tagi to zainteresowania, które macie wspólne.
                  </p>
                ) : null}
              </section>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPreviewProfile}
                  className="h-11 rounded-full"
                >
                  <Eye className="size-4" />
                  Pełny profil
                </Button>

                <Button
                  type="button"
                  onClick={onOpenChat}
                  className="h-11 rounded-full font-bold shadow-md shadow-primary/20"
                >
                  <MessageCircle className="size-4" />
                  Rozmowa
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}