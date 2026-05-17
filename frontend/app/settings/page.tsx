"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  ImagePlus,
  KeyRound,
  Mail,
  Monitor,
  Moon,
  Palette,
  RefreshCcw,
  Save,
  ShieldCheck,
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
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  type Profile,
} from "@/lib/api/profile";
import { updateCredentials } from "@/lib/api/auth";
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
    description: "Opis, zdjęcie i zainteresowania",
    icon: User,
  },
  {
    id: "account",
    label: "Dane konta",
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
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [accountUsername, setAccountUsername] = useState(
    authUser?.username ?? ""
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);

  const showProfileSuccess = (message: string) => {
    setProfileSuccess(message);
    window.setTimeout(() => setProfileSuccess(null), 3000);
  };

  const showAccountSuccess = (message: string) => {
    setAccountSuccess(message);
    window.setTimeout(() => setAccountSuccess(null), 3000);
  };

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

      const data = await getProfile();

      localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(data.id));
      setProfile(data);
    } catch (error) {
      console.error("Błąd podczas pobierania profilu:", error);

      localStorage.removeItem(CURRENT_PROFILE_ID_KEY);

      if (authUser?.id) {
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
      } else {
        setProfile(null);
      }

      setProfileError(
        "Nie udało się pobrać profilu. Możesz utworzyć nowy profil."
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }, [authUser?.id, authUser?.username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setAccountUsername(authUser?.username ?? "");
  }, [authUser?.username]);

  const saveInterests = async (profileId: number, interestNames: string[]) => {
    let availableInterests = await getInterests();

    for (const interestName of interestNames) {
      const trimmedName = interestName.trim();

      if (!trimmedName) {
        continue;
      }

      const normalizedName = trimmedName.toLowerCase();

      const existingInterest = availableInterests.find(
        (interest) => interest.name.toLowerCase() === normalizedName
      );

      let interestId = existingInterest?.id;

      if (!interestId) {
        try {
          const createdInterest = await createInterest(trimmedName);
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
          // Backend może zwracać 400, jeśli relacja już istnieje.
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

      const data = await updateProfile({
        ...updatedProfile,
        id: profileId,
        user_id: Number(authUser.id),
        display_name: updatedProfile.username,
        displayName: updatedProfile.username,
      });

      await saveInterests(profileId, updatedProfile.interests);

      setProfile({
        ...data,
        interests: updatedProfile.interests,
      });

      showProfileSuccess("Profil zapisany.");
    } catch (error) {
      console.error("Błąd podczas zapisywania profilu:", error);
      setProfileError("Nie udało się zapisać profilu.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSavingAccount) {
      return;
    }

    setAccountError(null);
    setAccountSuccess(null);

    if (!accountUsername.trim()) {
      setAccountError("Login nie może być pusty.");
      return;
    }

    if (!currentPassword.trim()) {
      setAccountError("Podaj aktualne hasło.");
      return;
    }

    if (!newPassword.trim()) {
      setAccountError("Podaj nowe hasło.");
      return;
    }

    if (newPassword.length < 6) {
      setAccountError("Nowe hasło powinno mieć co najmniej 6 znaków.");
      return;
    }

    if (!token) {
      setAccountError("Brak aktywnej sesji. Zaloguj się ponownie.");
      return;
    }

    try {
      setIsSavingAccount(true);

      const updatedUser = await updateCredentials({
        username: accountUsername,
        current_password: currentPassword,
        new_password: newPassword,
      });

      setAuth({
        user: updatedUser,
        token,
      });

      setCurrentPassword("");
      setNewPassword("");
      showAccountSuccess("Dane konta zostały zapisane.");
    } catch (error) {
      console.error("Błąd podczas zapisywania danych konta:", error);
      setAccountError(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać danych konta."
      );
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !authUser?.id) {
      return;
    }

    if (!profile?.id) {
      setProfileError("Najpierw zapisz profil, a dopiero potem dodaj zdjęcie.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileError("Wybierz plik graficzny.");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setProfileError(null);
      setProfileSuccess(null);

      await uploadProfilePhoto(profile.id, file);

      const reader = new FileReader();

      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : null;

        if (!result) {
          setProfileError(
            "Zdjęcie zostało wysłane, ale nie udało się pokazać podglądu."
          );
          return;
        }

        saveProfilePhoto(authUser.id, result);
        setProfilePhoto(result);
      };

      reader.readAsDataURL(file);

      showProfileSuccess("Zdjęcie profilu zostało zaktualizowane.");
    } catch (error) {
      console.error("Błąd podczas wysyłania zdjęcia:", error);
      setProfileError("Nie udało się wysłać zdjęcia profilu.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (!authUser?.id) {
      return;
    }

    removeProfilePhoto(authUser.id);
    setProfilePhoto(null);
    showProfileSuccess(
      "Zdjęcie usunięte z podglądu."
    );
  };

  const renderProfileSection = () => {
    return (
      <div className="space-y-5">
        {profileError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {profileError}
          </div>
        ) : null}

        {profileSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            {profileSuccess}
          </div>
        ) : null}

        {isLoadingProfile ? (
          <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="size-12 animate-pulse rounded-2xl bg-muted" />
              <div>
                <p className="font-bold">Ładowanie profilu...</p>
                <p className="mt-1 text-sm text-foreground/60">
                  Pobieramy Twoje dane...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : profile ? (
          <>
            <Card className="overflow-hidden border-0 bg-card/95 shadow-md ring-1 ring-border/70">
              <CardHeader className="border-b bg-muted/25 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-[-0.035em]">
                      Zdjęcie profilu
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-foreground/65">
                      Dodaj zdjęcie widoczne w profilu.
                    </CardDescription>
                  </div>

                  <div className="hidden size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                    <ImagePlus className="size-6" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="size-24 border-4 border-background shadow-md">
                    {profilePhoto ? (
                      <AvatarImage
                        src={profilePhoto}
                        alt={`Zdjęcie profilu ${profile.username}`}
                      />
                    ) : null}

                    <AvatarFallback className="bg-primary text-3xl font-black text-primary-foreground">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-lg font-extrabold tracking-[-0.02em]">
                      {profile.username}
                    </p>
                    <p className="mt-1 text-sm text-foreground/60">
                      {profilePhoto
                        ? "Zdjęcie jest ustawione."
                        : "Nie masz jeszcze zdjęcia profilu."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isUploadingPhoto || !profile.id}
                    className="h-11 rounded-full"
                  >
                    <Label htmlFor="profile-photo" className="cursor-pointer">
                      <ImagePlus className="size-4" />
                      {isUploadingPhoto ? "Wysyłanie..." : "Dodaj zdjęcie"}
                    </Label>
                  </Button>

                  <Input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isUploadingPhoto || !profile.id}
                  />

                  {profilePhoto ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto}
                      className="h-11 rounded-full"
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
          <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
            <CardContent className="p-6 text-sm text-foreground/65">
              Nie udało się przygotować formularza profilu.
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderAccountSection = () => {
    return (
      <Card className="overflow-hidden border-0 bg-card/95 shadow-md ring-1 ring-border/70">
        <CardHeader className="border-b bg-muted/25 p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="size-6" />
          </div>

          <CardTitle className="text-2xl font-black tracking-[-0.035em]">
            Dane konta
          </CardTitle>

          <CardDescription className="text-sm leading-6 text-foreground/65">
            Zmień login oraz hasło do konta. E-mail jest obecnie tylko do
            podglądu.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSaveAccount} className="grid gap-5" noValidate>
            {accountError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                {accountError}
              </div>
            ) : null}

            {accountSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                {accountSuccess}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="email">Adres e-mail</Label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  value={authUser?.email ?? ""}
                  disabled
                  onChange={() => undefined}
                  className="h-11 pl-9"
                />
              </div>

              <p className="text-xs text-foreground/55">
                Nowy endpoint zmienia login i hasło, ale nie adres e-mail.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Login</Label>

              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="username"
                  value={accountUsername}
                  onChange={(event) => setAccountUsername(event.target.value)}
                  disabled={isSavingAccount}
                  className="h-11 pl-9"
                  placeholder="Nowy login"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Aktualne hasło</Label>

                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={isSavingAccount}
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-password">Nowe hasło</Label>

                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isSavingAccount}
                  className="h-11"
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-primary/5 p-4 text-sm leading-6 text-foreground/68 ring-1 ring-primary/10">
              Dla bezpieczeństwa wymagane jest aktualne hasło. Po zapisaniu
              login odświeży się w aplikacji automatycznie.
            </div>

            <Button
              type="submit"
              disabled={isSavingAccount}
              className="h-11 w-fit rounded-full font-bold shadow-md shadow-primary/20"
            >
              <Save className="size-4" />
              {isSavingAccount ? "Zapisywanie..." : "Zapisz dane konta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  const renderSystemSection = () => {
    return (
      <Card className="overflow-hidden border-0 bg-card/95 shadow-md ring-1 ring-border/70">
        <CardHeader className="border-b bg-muted/25 p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Palette className="size-6" />
          </div>

          <CardTitle className="text-2xl font-black tracking-[-0.035em]">
            Systemowe
          </CardTitle>

          <CardDescription className="text-sm leading-6 text-foreground/65">
            Domyślnie aplikacja może dopasować się do ustawień systemu, ale
            możesz wymusić jasny albo ciemny motyw.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 p-6 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            onClick={setSystemTheme}
            className="h-24 flex-col rounded-2xl"
          >
            <Monitor className="size-5" />
            System
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={setLightTheme}
            className="h-24 flex-col rounded-2xl"
          >
            <Sun className="size-5" />
            Jasny
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={setDarkTheme}
            className="h-24 flex-col rounded-2xl"
          >
            <Moon className="size-5" />
            Ciemny
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderActiveSection = () => {
    if (activeSection === "profile") {
      return renderProfileSection();
    }

    if (activeSection === "account") {
      return renderAccountSection();
    }

    return renderSystemSection();
  };

  return (
    <ProtectedRoute>
      <section className="mx-auto max-w-6xl space-y-8 py-4 sm:py-8">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-8 shadow-sm ring-1 ring-border/70 sm:px-8">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 size-72 rounded-full bg-accent/60 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader
              eyebrow="Ustawienia"
              title="Preferencje konta"
              description="Zarządzaj profilem, zdjęciem, danymi konta i ustawieniami systemowymi."
            />

            <Button
              type="button"
              onClick={loadProfile}
              variant="outline"
              className="h-11 rounded-full px-5"
              disabled={isLoadingProfile}
            >
              <RefreshCcw className="size-4" />
              Odśwież profil
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-3">
            <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
              <CardContent className="space-y-2 p-3">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                        isActive
                          ? "border-primary/40 bg-primary/10 text-foreground shadow-sm"
                          : "border-transparent bg-transparent text-foreground/65 hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl transition ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground/60 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold tracking-[-0.015em]">
                          {section.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-foreground/55">
                          {section.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-0 bg-primary/5 shadow-sm ring-1 ring-primary/10">
              <CardContent className="flex gap-3 p-4">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>

                <p className="text-sm leading-6 text-foreground/68">
                  Najpierw uzupełnij profil — to on wpływa na odkrywanie i
                  dopasowania.
                </p>
              </CardContent>
            </Card>
          </aside>

          <section className="min-w-0">{renderActiveSection()}</section>
        </div>
      </section>
    </ProtectedRoute>
  );
}