import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type InterestTagsProps = {
  interests: string[];
};

export function InterestTags({ interests }: InterestTagsProps) {
  if (interests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>

          <div>
            <p className="text-sm font-extrabold tracking-[-0.015em]">
              Brak zainteresowań
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground/60">
              Dodaj zainteresowania, żeby Discover mógł lepiej pokazywać osoby
              z podobnymi tematami.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border bg-muted/20 p-4">
      {interests.map((interest) => (
        <Badge
          key={interest}
          variant="secondary"
          className="rounded-full px-3 py-1"
        >
          {interest}
        </Badge>
      ))}
    </div>
  );
}