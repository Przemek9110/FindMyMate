"use client";

import { useState } from "react";

type Profile = {
  username: string;
  bio: string;
  interests: string[];
};

type ProfileFormProps = {
  profile: Profile;
  onSave: (updatedProfile: Profile) => void | Promise<void>;
  onCancel: () => void;
};

type FormErrors = {
  bio?: string;
  interests?: string;
};

export function ProfileForm({
  profile,
  onSave,
  onCancel,
}: ProfileFormProps) {
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState(profile.interests.join(", "));
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const trimmedBio = bio.trim();
    const parsedInterests = interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!trimmedBio) {
      newErrors.bio = "Opis nie może być pusty.";
    } else if (trimmedBio.length < 10) {
      newErrors.bio = "Opis musi mieć co najmniej 10 znaków.";
    }

    if (parsedInterests.length === 0) {
      newErrors.interests = "Dodaj przynajmniej jedno zainteresowanie.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedProfile: Profile = {
      ...profile,
      bio: bio.trim(),
      interests: interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    await onSave(updatedProfile);
  };

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Opis
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (errors.bio) {
                setErrors((prev) => ({ ...prev, bio: undefined }));
              }
            }}
            rows={5}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2"
            placeholder="Napisz coś o sobie..."
          />
          {errors.bio && (
            <p className="text-sm text-red-500">{errors.bio}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="interests" className="text-sm font-medium">
            Zainteresowania
          </label>
          <input
            id="interests"
            type="text"
            value={interests}
            onChange={(e) => {
              setInterests(e.target.value);
              if (errors.interests) {
                setErrors((prev) => ({ ...prev, interests: undefined }));
              }
            }}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2"
            placeholder="Np. React, muzyka, podróże"
          />
          <p className="text-xs text-muted-foreground">
            Oddziel zainteresowania przecinkami.
          </p>
          {errors.interests && (
            <p className="text-sm text-red-500">{errors.interests}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Zapisz
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Anuluj
          </button>
        </div>
      </form>
    </section>
  );
}