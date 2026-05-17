"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  KeyRound,
  Mail,
  Monitor,
  Moon,
  Palette,
  ImagePlus,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileForm } from "@/components/profile/profile-form";
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
import {
  assignInterest,
  createInterest,
  createProfile,
  getInterests,
  getProfileByUserId,
  updateProfile,
  type Profile,
} from "@/lib/api/profile";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/layout/page-header";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getSystemTheme,
} from "@/components/theme/theme-initializer";
import {
  getProfilePhoto,
  removeProfilePhoto,
  saveProfilePhoto,
} from "@/lib/profile-photo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";

type SettingsSection = "profile" | "account" | "system";

const sections: {
  id: SettingsSection;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    id: "profile",
    label: "Profil",
    description: "Opis i zainteresowania",
    icon: User,
  },
  {
    id: "account",
    label: "Zmień dane",
    description: "Login, e-mail i hasło",
    icon: KeyRound,
  },
  {
    id: "system",
    label: "Systemowe",
    description: "Motyw aplikacji",
    icon: Palette,
  },
];

export default function SettingsPage() {
  const authUser = useAuthStore((state) => state.user);
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const setLightTheme = () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    applyTheme("light");
  };

  const setDarkTheme = () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    applyTheme("dark");
  };

  const setSystemTheme = () => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    applyTheme(getSystemTheme());
  };

  const loadProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      if (!authUser?.id) {
        setProfile(null);
        setProfilePhoto(null);
        return;
      }

      setProfilePhoto(getProfilePhoto(authUser.id));

      const data = await getProfileByUserId(authUser.id);

      if (data) {
        localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(data.id));
        setProfile(data);
        return;
      }

      localStorage.removeItem(CURRENT_PROFILE_ID_KEY);
      setProfile({
        id: 0,
        user_id: Number(authUser.id),
        display_name: authUser.username,
        username: authUser.username,
        displayName: authUser.username,
        age: 18,
        bio: "",
        city: "",
        interests: [],
      });
    } catch {
      setProfileError("Nie udało się pobrać profilu.");
    } finally {
      setIsLoadingProfile(false);
    }
  }, [authUser?.id, authUser?.username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveInterests = async (profileId: number, interestNames: string[]) => {
    let availableInterests = await getInterests();

    for (const interestName of interestNames) {
      const normalizedName = interestName.toLowerCase();
      const existingInterest = availableInterests.find(
        (interest) => interest.name.toLowerCase() === normalizedName
      );

      let interestId = existingInterest?.id;

      if (!interestId) {
        try {
          const createdInterest = await createInterest(interestName);
          interestId = createdInterest.id;
          availableInterests = [...availableInterests, createdInterest];
        } catch {
          availableInterests = await getInterests();
          interestId = availableInterests.find(
            (interest) => interest.name.toLowerCase() === normalizedName
          )?.id;
        }
      }

      if (interestId) {
        try {
          await assignInterest(profileId, interestId);
        } catch {
          // Backend returns 400 when this interest is already assigned.
        }
      }
    }
  };

  const handleSaveProfile = async (updatedProfile: Profile) => {
    try {
      setIsSavingProfile(true);
      setProfileError(null);
      setProfileSuccess(null);

      if (!authUser?.id) {
        throw new Error("User not found");
      }

      let profileId = updatedProfile.id;

      if (!profileId) {
        const createdProfile = await createProfile({
          user_id: Number(authUser.id),
          display_name: updatedProfile.username || authUser.username,
          age: updatedProfile.age || 18,
          bio: updatedProfile.bio,
          city: updatedProfile.city || null,
        });

        profileId = createdProfile.id;
        localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(profileId));
      }

      await saveInterests(profileId, updatedProfile.interests);

      const data = await updateProfile({
        ...updatedProfile,
        id: profileId,
        user_id: Number(authUser.id),
        display_name: updatedProfile.username,
        displayName: updatedProfile.username,
      });

      setProfile(data);
      setProfileSuccess("Profil zapisany");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch {
      setProfileError("Nie udało się zapisać profilu.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !authUser?.id) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileError("Wybierz plik graficzny.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;

      if (!result) {
        setProfileError("Nie udało się wczytać zdjęcia.");
        return;
      }

      saveProfilePhoto(authUser.id, result);
      setProfilePhoto(result);
      setProfileSuccess("Zdjęcie profilu zapisane");
      setTimeout(() => setProfileSuccess(null), 3000);
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (!authUser?.id) {
      return;
    }

    removeProfilePhoto(authUser.id);
    setProfilePhoto(null);
    setProfileSuccess("Zdjęcie profilu usunięte");
    setTimeout(() => setProfileSuccess(null), 3000);
  };

  const renderActiveSection = () => {
    if (activeSection === "profile") {
      return (
        <div className="space-y-4">
          {profileError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              {profileError}
            </div>
          ) : null}

          {profileSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              {profileSuccess}
            </div>
          ) : null}

          {isLoadingProfile ? (
            <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Ładowanie profilu...
              </CardContent>
            </Card>
          ) : profile ? (
            <>
              <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
                <CardHeader>
                  <CardTitle>Zdjęcie profilu</CardTitle>
                  <CardDescription>
                    Zdjęcie jest tymczasowo zapisywane lokalnie w przeglądarce.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="size-24 border-4 border-background shadow-md">
                    {profilePhoto ? (
                      <AvatarImage
                        src={profilePhoto}
                        alt={`Zdjęcie profilu ${profile.username}`}
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" asChild>
                      <Label htmlFor="profile-photo" className="cursor-pointer">
                        <ImagePlus className="size-4" />
                        Dodaj zdjęcie
                      </Label>
                    </Button>
                    <Input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    {profilePhoto ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemovePhoto}
                      >
                        <Trash2 className="size-4" />
                        Usuń zdjęcie
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <ProfileForm
                profile={profile}
                onSave={handleSaveProfile}
                onCancel={loadProfile}
                isSaving={isSavingProfile}
              />
            </>
          ) : (
            <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Nie udało się przygotować formularza profilu.
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (activeSection === "account") {
      return (
        <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
          <CardHeader>
            <CardTitle>Dane konta</CardTitle>
            <CardDescription>
              Backend nie ma jeszcze endpointów zmiany loginu, e-maila ani hasła,
              więc pola są przygotowane wizualnie na kolejny etap.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input
                id="email"
                value={authUser?.email ?? ""}
                disabled
                onChange={() => undefined}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Login</Label>
              <Input
                id="username"
                value={authUser?.username ?? ""}
                disabled
                onChange={() => undefined}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current-password">Aktualne hasło</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nowe hasło</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                disabled
              />
            </div>
            <Button type="button" disabled className="w-fit">
              <Mail className="size-4" />
              Zapisz dane
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
        <CardHeader>
          <CardTitle>Systemowe</CardTitle>
          <CardDescription>
            Domyślnie aplikacja może dopasować się do ustawień systemu, ale
            możesz wymusić jasny albo ciemny motyw.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={setSystemTheme}>
            <Monitor className="size-4" />
            System
          </Button>
          <Button type="button" variant="outline" onClick={setLightTheme}>
            <Sun className="size-4" />
            Jasny
          </Button>
          <Button type="button" variant="outline" onClick={setDarkTheme}>
            <Moon className="size-4" />
            Ciemny
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          eyebrow="Ustawienia"
          title="Preferencje konta"
          description="Zarządzaj profilem, danymi konta i ustawieniami systemowymi."
        />

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <aside className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                    isActive
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "bg-card/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">
                      {section.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          <section>{renderActiveSection()}</section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
