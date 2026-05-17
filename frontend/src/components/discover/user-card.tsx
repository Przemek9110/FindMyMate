import {
  Heart,
  MapPin,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type User = {
  id: string;
  username: string;
  bio: string;
  interests: string[];
  photoUrl?: string | null;
  age?: number;
  city?: string;
};

type UserCardProps = {
  user: User;
  onLike: () => void;
  onPass: () => void;
  sharedInterests: string[];
  disabled?: boolean;
};

export function UserCard({
  user,
  onLike,
  onPass,
  sharedInterests,
  disabled = false,
}: UserCardProps) {
  const meta = [user.age, user.city].filter(Boolean).join(" • ");
  const hasInterests = user.interests.length > 0;
  const hasSharedInterests = sharedInterests.length > 0;

  return (
    <Card className="overflow-hidden border-0 bg-card/95 p-0 shadow-xl ring-1 ring-border/70">
      <div className="relative min-h-72 overflow-hidden bg-gradient-to-br from-primary/18 via-accent/45 to-background">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 size-56 rounded-full bg-accent/70 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-card via-card/80 to-transparent" />

        <div className="absolute left-5 top-5">
          <Badge
            variant="secondary"
            className="rounded-full bg-background/80 px-3 py-1 text-xs font-bold shadow-sm backdrop-blur"
          >
            profil do odkrycia
          </Badge>
        </div>

        {hasSharedInterests ? (
          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="size-3.5" />
            wspólne zainteresowania
          </div>
        ) : null}

        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
          <Avatar className="size-24 border-4 border-card shadow-xl">
            {user.photoUrl ? (
              <AvatarImage
                src={user.photoUrl}
                alt={`Zdjęcie profilu ${user.username}`}
              />
            ) : null}
            <AvatarFallback className="bg-primary text-3xl font-black text-primary-foreground">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 pb-1">
            <h2 className="truncate text-3xl font-black tracking-[-0.04em] text-foreground">
              {user.username}
            </h2>

            {meta ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground/68">
                <MapPin className="size-4" />
                {meta}
              </p>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground/60">
                <UserRound className="size-4" />
                Brak podstawowych danych
              </p>
            )}
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 p-6">
        <section className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
            O profilu
          </p>

          <p className="text-sm leading-7 text-foreground/72">
            {user.bio || "Ten profil nie ma jeszcze opisu."}
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
            Zainteresowania
          </p>

          {hasInterests ? (
            <div className="flex flex-wrap gap-2 rounded-2xl border bg-muted/20 p-3">
              {user.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="rounded-full px-3 py-1"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-foreground/60">
              Brak zapisanych zainteresowań.
            </div>
          )}
        </section>

        {hasSharedInterests ? (
          <section className="rounded-2xl border bg-primary/5 p-4 ring-1 ring-primary/10">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart className="size-4" />
              </span>

              <div>
                <p className="text-sm font-extrabold tracking-[-0.015em]">
                  Macie coś wspólnego
                </p>
                <p className="text-xs text-foreground/60">
                  To może być dobry początek rozmowy.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sharedInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant="accent"
                  className="rounded-full px-3 py-1"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-3 border-t bg-background/70 p-5">
        <Button
          type="button"
          onClick={onPass}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="h-12 rounded-full border-border bg-background text-foreground/75 hover:bg-muted hover:text-foreground"
        >
          <ThumbsDown className="size-4" />
          Pomiń
        </Button>

        <Button
          type="button"
          onClick={onLike}
          disabled={disabled}
          size="lg"
          className="h-12 rounded-full bg-primary font-bold shadow-md shadow-primary/20 hover:bg-primary/90"
        >
          <ThumbsUp className="size-4" />
          Poznajmy się
        </Button>
      </CardFooter>
    </Card>
  );
}
