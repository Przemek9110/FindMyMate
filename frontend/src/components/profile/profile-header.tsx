import { Pencil, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <Card className="border-0 bg-card/95 shadow-lg ring-1 ring-border/70">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border-4 border-background shadow-md">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={`Zdjecie profilu ${username}`} />
              ) : null}
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{username}</h1>
                <UsersRound className="size-4 text-primary" />
              </div>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                {bio || "Dodaj kilka slow o sobie, zeby latwiej bylo Cie poznac."}
              </p>
            </div>
          </div>

          {!isEditing && (
            <Button type="button" onClick={onEdit} variant="outline">
              <Pencil className="size-4" />
              Edytuj profil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
