"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
  UsersRound,
} from "lucide-react";
import { register } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { GuestRoute } from "@/components/auth/GuestRoute";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";

function clearStaleSessionData() {
  localStorage.removeItem("currentProfileId");
  localStorage.removeItem("matches-storage");
  localStorage.removeItem("discover-storage");
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasError = Boolean(error);

  const handleChange = (
    field: "username" | "email" | "password",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Uzupełnij nazwę użytkownika, e-mail i hasło.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      clearStaleSessionData();

      setAuth({
        user: response.user,
        token: response.token,
      });

      router.replace("/settings");
    } catch (err) {
      console.error("Błąd rejestracji:", err);
      setError("Nie udało się utworzyć konta. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <section className="mx-auto grid min-h-[calc(100vh-140px)] max-w-6xl items-center gap-8 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-8 shadow-sm ring-1 ring-border/70 sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 size-72 rounded-full bg-accent/60 blur-3xl" />

          <div className="relative space-y-7">
            <PageHeader
              eyebrow="Rejestracja"
              title="Dołącz do FindMyMate"
              description="Stwórz konto, uzupełnij profil i poznawaj osoby z podobnymi zainteresowaniami."
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </div>
                <p className="text-sm font-extrabold tracking-[-0.015em]">
                  Profil
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground/65">
                  Dodaj opis, miasto, wiek i zdjęcie.
                </p>
              </div>

              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <p className="text-sm font-extrabold tracking-[-0.015em]">
                  Zainteresowania
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground/65">
                  Wybierz pasje, które pomogą w dopasowaniu.
                </p>
              </div>

              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UsersRound className="size-5" />
                </div>
                <p className="text-sm font-extrabold tracking-[-0.015em]">
                  Matche
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground/65">
                  Rozmawiaj dopiero po wzajemnym polubieniu.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-primary/5 p-4 ring-1 ring-primary/10">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>

                <p className="text-sm leading-6 text-foreground/70">
                  Po rejestracji przejdziesz do ustawień profilu, gdzie od razu
                  dodasz dane widoczne dla innych użytkowników.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full overflow-hidden border-0 bg-card/95 shadow-xl ring-1 ring-border/70">
          <CardHeader className="border-b bg-muted/25 p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserPlus className="size-6" />
            </div>

            <CardTitle className="text-2xl font-black tracking-[-0.035em]">
              Dane konta
            </CardTitle>

            <CardDescription className="text-sm leading-6 text-foreground/65">
              Te dane posłużą do utworzenia konta w aplikacji.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">Nazwa użytkownika</Label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="username"
                    type="text"
                    placeholder="Twoja nazwa"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? "register-error" : undefined}
                    className={`h-11 pl-9 ${
                      hasError ? "border-red-500" : ""
                    }`}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail</Label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? "register-error" : undefined}
                    className={`h-11 pl-9 ${
                      hasError ? "border-red-500" : ""
                    }`}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>

                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? "register-error" : undefined}
                    className={`h-11 pl-9 ${
                      hasError ? "border-red-500" : ""
                    }`}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error ? (
                <div
                  id="register-error"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
                >
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-11 w-full rounded-full font-bold shadow-md shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? "Tworzenie konta..." : "Załóż konto"}
                <ArrowRight className="size-4" />
              </Button>

              <div className="rounded-2xl border bg-muted/20 p-4 text-center">
                <p className="text-sm text-foreground/65">Masz już konto?</p>

                <Button
                  type="button"
                  asChild
                  variant="link"
                  className="mt-1 h-auto p-0 font-extrabold text-primary"
                >
                  <Link href="/login">Zaloguj się</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </GuestRoute>
  );
}