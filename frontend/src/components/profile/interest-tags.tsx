type InterestTagsProps = {
  interests: string[];
};

export function InterestTags({ interests }: InterestTagsProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Zainteresowania</h2>

        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}