import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InterestTagsProps = {
  interests: string[];
};

export function InterestTags({ interests }: InterestTagsProps) {
  return (
    <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
      <CardHeader>
        <CardTitle>Zainteresowania</CardTitle>
      </CardHeader>

      <CardContent>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Dodaj zainteresowania, żeby Discover mógł lepiej pokazać wspólne tematy.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
