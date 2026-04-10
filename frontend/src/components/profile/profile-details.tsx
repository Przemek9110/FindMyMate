type ProfileDetailsProps = {
  bio: string;
};

export function ProfileDetails({ bio }: ProfileDetailsProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">O mnie</h2>
        <p className="leading-7 text-muted-foreground">{bio}</p>
      </div>
    </section>
  );
}