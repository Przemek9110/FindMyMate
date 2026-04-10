type ProfileHeaderProps = {
  username: string;
  bio: string;
  onEdit: () => void;
  isEditing: boolean;
};

export function ProfileHeader({
  username,
  bio,
  onEdit,
  isEditing,
}: ProfileHeaderProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">{username}</h1>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {bio}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Edytuj profil
          </button>
        )}
      </div>
    </section>
  );
}