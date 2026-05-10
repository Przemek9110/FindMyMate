"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import type { Profile } from "@/lib/api/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormProps = {
  profile: Profile;
  onSave: (updatedProfile: Profile) => void | Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
};

type FormErrors = {
  bio?: string;
  interests?: string;
};

export function ProfileForm({
  profile,
  onSave,
  onCancel,
  isSaving,
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
      newErrors.bio = "Opis nie moze byc pusty.";
    } else if (trimmedBio.length < 10) {
      newErrors.bio = "Opis musi miec co najmniej 10 znakow.";
    }

    if (parsedInterests.length === 0) {
      newErrors.interests = "Dodaj przynajmniej jedno zainteresowanie.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSaving) return;

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
    <Card className="border-0 bg-card/95 shadow-lg ring-1 ring-border/70">
      <CardHeader>
        <CardTitle>Ustaw swoj profil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="bio">Opis</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                if (errors.bio) {
                  setErrors((prev) => ({ ...prev, bio: undefined }));
                }
              }}
              rows={5}
              disabled={isSaving}
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={errors.bio ? "bio-error" : undefined}
              className={errors.bio ? "border-red-500" : undefined}
              placeholder="Napisz cos o sobie..."
            />
            {errors.bio && (
              <p id="bio-error" className="text-sm text-red-500">
                {errors.bio}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Zainteresowania</Label>
            <Input
              id="interests"
              type="text"
              value={interests}
              onChange={(e) => {
                setInterests(e.target.value);
                if (errors.interests) {
                  setErrors((prev) => ({ ...prev, interests: undefined }));
                }
              }}
              disabled={isSaving}
              aria-invalid={Boolean(errors.interests)}
              aria-describedby={errors.interests ? "interests-error" : undefined}
              className={errors.interests ? "border-red-500" : undefined}
              placeholder="Np. React, muzyka, podroze"
            />
            <p className="text-xs text-muted-foreground">
              Oddziel zainteresowania przecinkami.
            </p>
            {errors.interests && (
              <p id="interests-error" className="text-sm text-red-500">
                {errors.interests}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving}>
              <Save className="size-4" />
              {isSaving ? "Zapisywanie..." : "Zapisz profil"}
            </Button>

            <Button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              variant="outline"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
