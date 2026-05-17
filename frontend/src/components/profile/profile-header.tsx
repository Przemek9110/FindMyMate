import { MapPin, Pencil, Sparkles, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ProfileHeaderProps = {
  username: string;
  bio: string;
  photoUrl?: string | null;
  onEdit: () => void;
  isEditing: boolean;
};

export function ProfileHeader({
  username,
  bio,
  photoUrl,
  onEdit,
  isEditing,
}: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden border-0 bg-card/95 shadow-md ring-1 ring-border/70">
      <CardContent className="p-0">
        <div className="relative min-h-56 overflow-hidden bg-gradient-to-br from-primary/18 via-accent/45 to-background">
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 size-56 rounded-full bg-accent/70 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-card via-card/80 to-transparent" />

          <div className="absolute left-5 top-5">
            <Badge
              variant="secondary"
              className="rounded-full bg-background/80 px-3 py-1 text-xs font-bold shadow-sm backdrop-blur"
            >
              Twój profil
            </Badge>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
            <Avatar className="size-24 border-4 border-card shadow-xl">
              {photoUrl ? (
                <AvatarImage
                  src={photoUrl}
                  alt={`Zdjęcie profilu ${username}`}
                />
              ) : null}

              <AvatarFallback className="bg-primary text-3xl font-black text-primary-foreground">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 pb-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-3xl font-black tracking-[-0.04em] text-foreground">
                  {username}
                </h1>

                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UsersRound className="size-4" />
                </span>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground/65">
                <MapPin className="size-4" />
                Profil widoczny w odkrywaniu
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                O Tobie
              </p>
            </div>

            <p className="text-sm leading-7 text-foreground/72">
              {bio || "Dodaj kilka słów o sobie, żeby łatwiej było Cię poznać."}
            </p>
          </div>

          {!isEditing ? (
            <Button
              type="button"
              onClick={onEdit}
              variant="outline"
              className="h-11 w-full rounded-full"
            >
              <Pencil className="size-4" />
              Edytuj profil
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}