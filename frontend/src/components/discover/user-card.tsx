type User = {
    id: string;
    username: string;
    bio: string;
    interests: string[];
};

type UserCardProps = {
    user: User;
    onLike: () => void;
    onPass: () => void;
    sharedInterests: string[];
};

export function UserCard({ user, onLike, onPass, sharedInterests }: UserCardProps) {
    return (
        <section className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                    {user.username.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-xl font-semibold">{user.username}</h2>
            </div>

            <p className="text-sm text-muted-foreground">{user.bio}</p>

            <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                    <span
                        key={interest}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                        {interest}
                    </span>
                ))}
            </div>

            {sharedInterests.length > 0 && (
                <div className="flex flex-col gap-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        Wspólne zainteresowania:
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {sharedInterests.map((interest) => (
                            <span
                                key={interest}
                                className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onPass}
                    className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                    Pass
                </button>

                <button
                    type="button"
                    onClick={onLike}
                    className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                    Like
                </button>
            </div>
        </section>
    );
}