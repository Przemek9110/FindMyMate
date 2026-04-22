"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      setError("Uzupełnij nazwę użytkownika, email i hasło.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(formData);

      setAuth({
        user: response.user,
        token: response.token,
      });

      router.push("/discover");
    } catch (err) {
      console.error("Błąd rejestracji:", err);
      setError("Nie udało się utworzyć konta. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Rejestracja</CardTitle>
            <CardDescription>
              Utwórz konto, aby rozpocząć korzystanie z FindMyMate.
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
                <p id="register-error" className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Tworzenie konta..." : "Załóż konto"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Masz już konto?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Zaloguj się
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </GuestRoute>
  );
}
