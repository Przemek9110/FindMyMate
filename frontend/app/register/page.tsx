"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, UserPlus } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

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
      const response = await register(formData);

      setAuth({
        user: response.user,
        token: response.token,
      });

      router.push("/profile");
    } catch (err) {
      console.error("Błąd rejestracji:", err);
      setError("Nie udało się utworzyć konta. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-md content-center gap-6 px-4 py-8">
        <PageHeader
          eyebrow="Rejestracja"
          title="Dołącz do FindMyMate"
          description="Stwórz konto, uzupełnij profil i poznawaj osoby z podobnymi zainteresowaniami."
        />

        <Card className="w-full border-0 bg-card/95 shadow-xl ring-1 ring-border/70">
          <CardHeader className="space-y-2">
            <CardTitle>Dane konta</CardTitle>
            <CardDescription>
              Te dane posłużą do utworzenia konta w aplikacji.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Nazwa użytkownika</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Twoja nazwa"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "register-error" : undefined}
                  className={hasError ? "border-red-500" : undefined}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "register-error" : undefined}
                  className={hasError ? "border-red-500" : undefined}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "register-error" : undefined}
                  className={hasError ? "border-red-500" : undefined}
                  required
                />
              </div>

              {error && (
                <div
                  id="register-error"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
                >
                  {error}
                </div>
              )}

              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? (
                  "Tworzenie konta..."
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    Załóż konto
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-5" />

            <p className="text-center text-sm text-muted-foreground">
              Masz już konto?{" "}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <Mail className="size-3.5" />
                Zaloguj się
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </GuestRoute>
  );
}
