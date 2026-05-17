"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeInfo,
  MapPin,
  Plus,
  Save,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import type { Interest, Profile } from "@/lib/api/profile";
import { getInterests } from "@/lib/api/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  displayName?: string;
  age?: string;
  city?: string;
  bio?: string;
  interests?: string;
};

export function ProfileForm({
  profile,
  onSave,
  onCancel,
  isSaving,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(
    profile.displayName || profile.display_name || profile.username || ""
  );
  const [age, setAge] = useState(String(profile.age ?? ""));
  const [city, setCity] = useState(profile.city ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile.interests ?? []
  );

  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [interestQuery, setInterestQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setDisplayName(
      profile.displayName || profile.display_name || profile.username || ""
    );
    setAge(String(profile.age ?? ""));
    setCity(profile.city ?? "");
    setBio(profile.bio ?? "");
    setSelectedInterests(profile.interests ?? []);
    setErrors({});
    setInterestQuery("");
    setIsSuggestionsOpen(false);
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    async function loadInterests() {
      try {
        setIsLoadingInterests(true);
        const interests = await getInterests();

        if (!cancelled) {
          setAvailableInterests(interests);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania zainteresowań:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingInterests(false);
        }
      }
    }

    loadInterests();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSelectedInterests = useMemo(() => {
    return selectedInterests.map((interest) => interest.toLowerCase());
  }, [selectedInterests]);

  const filteredInterests = useMemo(() => {
    const query = interestQuery.trim().toLowerCase();

    return availableInterests
      .filter((interest) => {
        const normalizedName = interest.name.toLowerCase();

        if (normalizedSelectedInterests.includes(normalizedName)) {
          return false;
        }

        if (!query) {
          return true;
        }

        return normalizedName.includes(query);
      })
      .slice(0, 8);
  }, [availableInterests, interestQuery, normalizedSelectedInterests]);

  const canAddTypedInterest = useMemo(() => {
    const query = interestQuery.trim();

    if (!query) {
      return false;
    }

    return !normalizedSelectedInterests.includes(query.toLowerCase());
  }, [interestQuery, normalizedSelectedInterests]);

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addInterest = (interestName: string) => {
    const trimmedName = interestName.trim();

    if (!trimmedName) {
      return;
    }

    setSelectedInterests((current) => {
      const alreadyExists = current.some(
        (interest) => interest.toLowerCase() === trimmedName.toLowerCase()
      );

      if (alreadyExists) {
        return current;
      }

      return [...current, trimmedName];
    });

    setInterestQuery("");
    setIsSuggestionsOpen(false);
    clearError("interests");
  };

  const removeInterest = (interestName: string) => {
    setSelectedInterests((current) =>
      current.filter((interest) => interest !== interestName)
    );
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const trimmedDisplayName = displayName.trim();
    const trimmedCity = city.trim();
    const trimmedBio = bio.trim();
    const parsedAge = Number(age);

    if (!trimmedDisplayName) {
      newErrors.displayName = "Nazwa profilu jest wymagana.";
    }

    if (!age.trim()) {
      newErrors.age = "Wiek jest wymagany.";
    } else if (Number.isNaN(parsedAge) || parsedAge < 18 || parsedAge > 120) {
      newErrors.age = "Podaj poprawny wiek od 18 do 120.";
    }

    if (!trimmedCity) {
      newErrors.city = "Miejsce zamieszkania jest wymagane.";
    }

    if (!trimmedBio) {
      newErrors.bio = "Opis nie może być pusty.";
    } else if (trimmedBio.length < 10) {
      newErrors.bio = "Opis musi mieć co najmniej 10 znaków.";
    }

    if (selectedInterests.length === 0) {
      newErrors.interests = "Dodaj przynajmniej jedno zainteresowanie.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSaving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const trimmedDisplayName = displayName.trim();

    const updatedProfile: Profile = {
      ...profile,
      username: trimmedDisplayName,
      displayName: trimmedDisplayName,
      display_name: trimmedDisplayName,
      age: Number(age),
      city: city.trim(),
      bio: bio.trim(),
      interests: selectedInterests,
    };

    await onSave(updatedProfile);
  };

  return (
    <Card className="overflow-hidden border-0 bg-card/95 shadow-md ring-1 ring-border/70">
      <CardHeader className="border-b bg-muted/25 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="size-6" />
            </div>

            <CardTitle className="text-2xl font-black tracking-[-0.035em]">
              Ustaw swój profil
            </CardTitle>

            <CardDescription className="mt-2 text-sm leading-6 text-foreground/65">
              Te informacje będą widoczne dla innych osób w odkrywaniu i
              dopasowaniach.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nazwa profilu</Label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    clearError("displayName");
                  }}
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.displayName)}
                  aria-describedby={
                    errors.displayName ? "display-name-error" : undefined
                  }
                  className={`h-11 pl-9 ${
                    errors.displayName ? "border-red-500" : ""
                  }`}
                  placeholder="Np. Karolina"
                />
              </div>

              {errors.displayName ? (
                <p id="display-name-error" className="text-sm text-red-500">
                  {errors.displayName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Wiek</Label>

              <Input
                id="age"
                type="number"
                min={18}
                max={120}
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  clearError("age");
                }}
                disabled={isSaving}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? "age-error" : undefined}
                className={`h-11 ${errors.age ? "border-red-500" : ""}`}
                placeholder="Np. 28"
              />

              {errors.age ? (
                <p id="age-error" className="text-sm text-red-500">
                  {errors.age}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Miasto</Label>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  clearError("city");
                }}
                disabled={isSaving}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? "city-error" : undefined}
                className={`h-11 pl-9 ${errors.city ? "border-red-500" : ""}`}
                placeholder="Np. Warszawa"
              />
            </div>

            {errors.city ? (
              <p id="city-error" className="text-sm text-red-500">
                {errors.city}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Opis</Label>

            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                clearError("bio");
              }}
              disabled={isSaving}
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={errors.bio ? "bio-error" : undefined}
              className={`min-h-32 resize-none leading-6 ${
                errors.bio ? "border-red-500" : ""
              }`}
              placeholder="Napisz kilka zdań o sobie, swoich zainteresowaniach i tym, kogo chcesz poznać."
            />

            <div className="flex items-center justify-between gap-3">
              {errors.bio ? (
                <p id="bio-error" className="text-sm text-red-500">
                  {errors.bio}
                </p>
              ) : (
                <p className="text-xs text-foreground/55">
                  Minimum 10 znaków.
                </p>
              )}

              <p className="text-xs text-foreground/55">{bio.length} znaków</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="interest-search">Zainteresowania</Label>
              <p className="mt-1 text-sm text-foreground/60">
                Wybierz istniejące zainteresowania albo dodaj własne.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="interest-search"
                type="text"
                value={interestQuery}
                onChange={(e) => {
                  setInterestQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                  clearError("interests");
                }}
                onFocus={() => setIsSuggestionsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();

                    if (filteredInterests.length > 0) {
                      addInterest(filteredInterests[0].name);
                      return;
                    }

                    if (canAddTypedInterest) {
                      addInterest(interestQuery);
                    }
                  }

                  if (e.key === "Escape") {
                    setIsSuggestionsOpen(false);
                  }
                }}
                disabled={isSaving}
                aria-invalid={Boolean(errors.interests)}
                aria-describedby={
                  errors.interests ? "interests-error" : undefined
                }
                className={`h-11 pl-9 ${
                  errors.interests ? "border-red-500" : ""
                }`}
                placeholder={
                  isLoadingInterests
                    ? "Ładowanie zainteresowań..."
                    : "Wpisz np. książki, podróże, gry..."
                }
              />

              {isSuggestionsOpen ? (
                <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border bg-popover p-2 shadow-xl ring-1 ring-border/70">
                  {filteredInterests.length > 0 ? (
                    filteredInterests.map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => addInterest(interest.name)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                      >
                        <span>{interest.name}</span>
                        <Plus className="size-4 text-muted-foreground" />
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-sm text-foreground/60">
                      Brak pasujących zainteresowań.
                    </div>
                  )}

                  {canAddTypedInterest ? (
                    <button
                      type="button"
                      onClick={() => addInterest(interestQuery)}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl border border-dashed bg-primary/5 px-3 py-2 text-left text-sm font-bold text-primary transition hover:bg-primary/10"
                    >
                      <Plus className="size-4" />
                      Dodaj nowe: {interestQuery.trim()}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {errors.interests ? (
              <p id="interests-error" className="text-sm text-red-500">
                {errors.interests}
              </p>
            ) : null}

            {selectedInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2 rounded-2xl border bg-muted/20 p-3">
                {selectedInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="gap-1 rounded-full px-3 py-1"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      disabled={isSaving}
                      className="ml-1 rounded-full text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Usuń zainteresowanie ${interest}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
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
                      Dodaj przynajmniej jedno zainteresowanie, żeby Discover
                      mógł lepiej dobierać profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {Object.keys(errors).length > 0 ? (
            <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <BadgeInfo className="mt-0.5 size-4 shrink-0" />
              <p>Popraw oznaczone pola przed zapisaniem profilu.</p>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="h-11 rounded-full"
            >
              Anuluj
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded-full font-bold shadow-md shadow-primary/20"
            >
              <Save className="size-4" />
              {isSaving ? "Zapisywanie..." : "Zapisz profil"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}