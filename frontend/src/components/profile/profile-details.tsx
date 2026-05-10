import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProfileDetailsProps = {
  bio: string;
};

export function ProfileDetails({ bio }: ProfileDetailsProps) {
  return (
    <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
      <CardHeader>
        <CardTitle>O mnie</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-7 text-muted-foreground">
          {bio || "Profil czeka na pierwszy opis."}
        </p>
      </CardContent>
    </Card>
  );
}
