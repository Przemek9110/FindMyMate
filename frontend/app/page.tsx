"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useMatchesStore } from "@/store/matchesStore";

const flowSteps = [
  {
    title: "Uzupełnij profil",
    description: "Dodaj opis, wiek, miasto i zainteresowania, żeby inni mogli Cię lepiej poznać.",
    href: "/settings",
    icon: UserRound,
  },
  {
    title: "Odkrywaj osoby",
    description: "Przeglądaj profile i oceniaj, z kim chcesz nawiązać kontakt.",
    href: "/discover",
    icon: Search,
  },
  {
    title: "Sprawdź dopasowania",
    description: "Zobacz osoby, z którymi macie wzajemne dopasowanie.",
    href: "/matches",
    icon: Sparkles,
  },
  {
    title: "Rozpocznij rozmowę",
    description: "Przejdź do chatu i zacznij spokojną rozmowę.",
    href: "/chat",
    icon: MessageCircle,
  },
];

const quickLinks = [
  {
    label: "Profil",
    description: "Podejrzyj swój profil",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "Odkrywaj",
    description: "Przeglądaj osoby",
    href: "/discover",
    icon: Search,
  },
  {
    label: "Dopasowania",
    description: "Sprawdź matche",
    href: "/matches",
    icon: UsersRound,
  },
  {
    label: "Ustawienia",
    description: "Edytuj dane",
    href: "/settings",
    icon: Settings,
  },
];

export default function HomePage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const matches = useMatchesStore((state) => state.matches);

  const isAuthenticated = Boolean(token);
  const displayName = user?.username || "użytkowniku";

  return (
    <section className="mx-auto max-w-7xl space-y-10 py-4 sm:py-8">
      <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-8 shadow-sm ring-1 ring-border/70 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-10 size-72 rounded-full bg-accent/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
              FindMyMate
            </p>

            <h1 className="text-balance text-4xl font-black tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
              {isAuthenticated
                ? `Cześć, ${displayName}`
                : "Znajduj osoby do wspólnych aktywności"}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/75 sm:text-lg">
              Łączymy osoby na podstawie wspólnych zainteresowań, pasji i sposobu spędzania czasu. Przeglądaj profile, odkrywaj wspólne tematy i nawiązuj rozmowy dopiero wtedy, gdy obie strony chcą się poznać.
            </p>
          </div>

          <Button asChild size="lg" className="h-12 rounded-full px-6 shadow-md shadow-primary/20">
            <Link href={isAuthenticated ? "/discover" : "/register"}>
              {isAuthenticated ? "Odkrywaj" : "Załóż konto"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-0 bg-card/95 shadow-md ring-1 ring-border/70">
          <CardHeader className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                koleżeńskie kontakty
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                wspólne zainteresowania
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                rozmowy
              </Badge>
            </div>

            <div>
              <CardTitle className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                Wypełnij profil, znajdź dopasowanie, zacznij rozmowę.
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 p-6 pt-0 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-2xl border bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>

                  <span className="min-w-0">
                    <span className="block font-bold tracking-[-0.015em] text-foreground">
                      {item.label}
                    </span>
                    <span className="block text-sm text-foreground/65">
                      {item.description}
                    </span>
                  </span>

                  <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-extrabold tracking-[-0.025em]">
              Status
            </CardTitle>
            <CardDescription className="text-foreground/65">
              Twój szybki podgląd aplikacji.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-6 pt-0">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium text-foreground/70">
                Konto
              </span>
              <Badge variant={isAuthenticated ? "accent" : "outline"}>
                {isAuthenticated ? "aktywne" : "gość"}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium text-foreground/70">
                Dopasowania
              </span>
              <span className="text-xl font-black tracking-tight text-foreground">
                {matches.length}
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border bg-primary/5 p-4">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-4" />
              </span>
              <p className="text-sm leading-6 text-foreground/70">
                Najlepszy start: uzupełnij profil w ustawieniach, potem przejdź
                do odkrywania.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {flowSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <Link key={step.href} href={step.href} className="group">
              <Card className="h-full border-0 bg-card/95 shadow-sm ring-1 ring-border/70 transition hover:-translate-y-1 hover:shadow-md hover:ring-primary/25">
                <CardHeader className="space-y-5 p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black tracking-wide text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="flex size-10 items-center justify-center rounded-2xl bg-muted text-foreground/70 transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </span>
                  </div>

                  <div>
                    <CardTitle className="text-xl font-extrabold tracking-[-0.025em] text-foreground">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-foreground/68">
                      {step.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Przejdź
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}