"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeInfo,
  MapPin,
  RefreshCcw,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileDetails } from "@/components/profile/profile-details";
import { InterestTags } from "@/components/profile/interest-tags";
import { getProfile, type Profile } from "@/lib/api/profile";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { getProfilePhoto } from "@/lib/profile-photo";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";

export default function ProfilePage() {
  const router = useRouter();

  const authUserId = useAuthStore((state) => state.user?.id);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isAuthenticated = Boolean(token);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      setProfile(null);
      setProfilePhoto(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await getProfile();

      localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(data.id));

      setProfile(data);
      setProfilePhoto(authUserId ? getProfilePhoto(authUserId) : null);
    } catch (error) {
      console.error("Błąd podczas pobierania profilu:", error);

      localStorage.removeItem(CURRENT_PROFILE_ID_KEY);
      setProfile(null);
      setProfilePhoto(null);
      setError("Nie udało się pobrać profilu.");
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, hasHydrated, isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    async function runLoadProfile() {
      if (cancelled) {
        return;
      }

      await loadProfile();
    }

    runLoadProfile();

    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const hasProfileDetails = Boolean(profile?.bio || profile?.city || profile?.age);
  const interestsCount = profile?.interests.length ?? 0;

  return (
    <ProtectedRoute>
      <section className="mx-auto max-w-6xl space-y-8 py-4 sm:py-8">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-8 shadow-sm ring-1 ring-border/70 sm:px-8">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 size-72 rounded-full bg-accent/60 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader
              eyebrow="Twój profil"
              title="Podgląd profilu"
              description="Tak widzą Cię inni użytkownicy. Uzupełnij opis, miasto, wiek i zainteresowania, żeby łatwiej zdobywać dopasowania."
            />

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={loadProfile}
                variant="outline"
                className="h-11 rounded-full px-5"
                disabled={isLoading}
              >
                <RefreshCcw className="size-4" />
                Odśwież
              </Button>

              <Button
                type="button"
                onClick={() => router.push("/settings")}
                className="h-11 rounded-full px-5 font-bold shadow-md shadow-primary/20"
              >
                <Settings className="size-4" />
                Edytuj profil
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
            <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
              <CardContent className="space-y-5 p-6">
                <Skeleton className="size-24 rounded-full" />
                <Skeleton className="h-8 w-48 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <Card className="border-0 bg-card/95 shadow-md ring-1 ring-red-200 dark:ring-red-900/50">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <BadgeInfo className="size-7" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-[-0.025em]">
                  Nie udało się pobrać profilu
                </h2>
                <p className="mt-2 text-sm leading-6 text-foreground/68">
                  {error}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  onClick={loadProfile}
                  variant="outline"
                  className="rounded-full"
                >
                  <RefreshCcw className="size-4" />
                  Spróbuj ponownie
                </Button>

                <Button
                  type="button"
                  onClick={() => router.push("/settings")}
                  className="rounded-full"
                >
                  Przejdź do ustawień
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : profile ? (
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
            <div className="space-y-5">
              <ProfileHeader
                username={profile.username}
                bio={profile.bio}
                photoUrl={profilePhoto}
                onEdit={() => router.push("/settings")}
                isEditing={false}
              />

              <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                <CardContent className="space-y-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="size-6" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
                      Status profilu
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                      Im pełniejszy profil, tym łatwiej znaleźć osoby o podobnych
                      zainteresowaniach.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border bg-primary/5 p-4">
                      <p className="text-sm font-bold">Zainteresowania</p>
                      <p className="mt-1 text-3xl font-black tracking-tight text-primary">
                        {interestsCount}
                      </p>
                      <p className="mt-1 text-sm text-foreground/65">
                        Tyle zainteresowań masz przypisanych do profilu.
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-background/70 p-4">
                      <p className="text-sm font-bold">Dane podstawowe</p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm leading-6 text-foreground/65">
                        <MapPin className="size-4 shrink-0 text-primary" />
                        {[profile.age, profile.city].filter(Boolean).join(" • ") ||
                          "Uzupełnij wiek i miejsce zamieszkania."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                        Opis profilu
                      </p>
                      <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
                        O Tobie
                      </h2>
                    </div>

                    <Button
                      type="button"
                      onClick={() => router.push("/settings")}
                      variant="outline"
                      className="shrink-0 rounded-full"
                    >
                      Edytuj
                    </Button>
                  </div>

                  <ProfileDetails bio={profile.bio} />
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                        Dopasowania
                      </p>
                      <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
                        Zainteresowania
                      </h2>
                    </div>

                    <Button
                      type="button"
                      onClick={() => router.push("/settings")}
                      variant="outline"
                      className="shrink-0 rounded-full"
                    >
                      Dodaj
                    </Button>
                  </div>

                  <InterestTags interests={profile.interests} />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-7" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-[-0.025em]">
                  Nie masz jeszcze profilu
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-foreground/68">
                  Utwórz profil w ustawieniach, dodaj opis i zainteresowania, a
                  potem przejdź do odkrywania osób.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => router.push("/settings")}
                className="rounded-full"
              >
                Przejdź do ustawień
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </ProtectedRoute>
  );
}