import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type User = {
  id: string;
  username: string;
  bio: string;
  interests: string[];
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

  return (
    <Card className="overflow-hidden border-0 bg-card/95 p-0 shadow-xl ring-1 ring-border/70">
      <div className="relative min-h-52 bg-gradient-to-br from-emerald-100 via-lime-50 to-background dark:from-emerald-950/45 dark:via-card dark:to-background">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
          <Avatar className="size-20 border-4 border-card shadow-lg">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 pb-1">
            <h2 className="truncate text-2xl font-bold tracking-tight">
              {user.username}
            </h2>
            {meta ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {meta}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <CardContent className="space-y-5 p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {user.bio || "Ten profil nie ma jeszcze opisu."}
        </p>

        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest) => (
            <Badge key={interest} variant="secondary">
              {interest}
            </Badge>
          ))}
        </div>

        {sharedInterests.length > 0 && (
          <div className="rounded-xl border bg-accent/35 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Wspólne zainteresowania
            </p>
            <div className="flex flex-wrap gap-2">
              {sharedInterests.map((interest) => (
                <Badge key={interest} variant="accent">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-3 border-t bg-background/60 p-5">
        <Button
          type="button"
          onClick={onPass}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="h-12 rounded-full border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-800 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <ThumbsDown className="size-4" />
          Pomiń
        </Button>

        <Button
          type="button"
          onClick={onLike}
          disabled={disabled}
          size="lg"
          className="h-12 rounded-full bg-primary shadow-md shadow-primary/20 hover:bg-primary/90"
        >
          <ThumbsUp className="size-4" />
          Poznajmy się
        </Button>
      </CardFooter>
    </Card>
  );
}
