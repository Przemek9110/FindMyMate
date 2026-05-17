"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasError = Boolean(error);

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Uzupełnij e-mail i hasło.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(formData);

      setAuth({
        user: response.user,
        token: response.token,
      });

      router.push("/discover");
    } catch (err) {
      console.error("Błąd logowania:", err);
      setError("Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center gap-6 px-4 py-10">
        <PageHeader
          eyebrow="Logowanie"
          title="Wróć do FindMyMate"
          description="Zaloguj się, aby przejść do aplikacji."
        />

        <Card className="w-full border-0 bg-card/95 shadow-xl ring-1 ring-border/70">
          <CardHeader className="space-y-2">
            <CardTitle>Dane logowania</CardTitle>
            <CardDescription>Wpisz e-mail i hasło.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "login-error" : undefined}
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
                  aria-describedby={hasError ? "login-error" : undefined}
                  className={hasError ? "border-red-500" : undefined}
                  required
                />
              </div>

              {error && (
                <p id="login-error" className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Nie masz jeszcze konta?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Zarejestruj się
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </GuestRoute>
  );
}
