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
import { PageHeader } from "@/components/layout/page-header";
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
    description: "Dodaj opis i zainteresowania, żeby inni mogli Cię lepiej poznać.",
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
    description: "Przejdź do chatu i umów wspólną aktywność albo temat.",
    href: "/chat",
    icon: MessageCircle,
  },
];

const quickLinks = [
  {
    label: "Profil",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "Odkrywaj",
    href: "/discover",
    icon: Search,
  },
  {
    label: "Dopasowania",
    href: "/matches",
    icon: UsersRound,
  },
  {
    label: "Ustawienia",
    href: "/settings",
    icon: Settings,
  },
];

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const matches = useMatchesStore((state) => state.matches);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="FindMyMate"
        title={
          isAuthenticated && user
            ? `Cześć, ${user.username}`
            : "Znajduj osoby do wspólnych aktywności"
        }
        description="FindMyMate pomaga poznawać ludzi przez zainteresowania, dopasowania i spokojne rozmowy."
        action={
          <Button asChild>
            <Link href={isAuthenticated ? "/discover" : "/register"}>
              {isAuthenticated ? "Odkrywaj" : "Załóż konto"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-0 bg-card/95 shadow-lg ring-1 ring-border/70">
          <CardHeader>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="secondary">koleżeńskie kontakty</Badge>
              <Badge variant="outline">zainteresowania</Badge>
              <Badge variant="outline">rozmowy</Badge>
            </div>
            <CardTitle className="text-2xl">
              Zbuduj profil, znajdź dopasowanie, zacznij rozmowę.
            </CardTitle>
            <CardDescription>
              Strona główna zbiera najważniejsze akcje, żebyś szybko wrócił do
              flow aplikacji.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant="outline"
                  className="h-auto justify-start gap-3 p-4"
                >
                  <Link href={item.href}>
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-left">
                      <span className="block font-medium">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        Przejdź dalej
                      </span>
                    </span>
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/95 shadow-lg ring-1 ring-border/70">
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Twój szybki podgląd aplikacji.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-muted-foreground">Konto</span>
              <Badge variant={isAuthenticated ? "accent" : "outline"}>
                {isAuthenticated ? "aktywne" : "gość"}
              </Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-muted-foreground">Dopasowania</span>
              <span className="text-lg font-semibold">{matches.length}</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Najlepszy start: uzupełnij profil w ustawieniach, potem przejdź
                do odkrywania.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {flowSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <Card
              key={step.href}
              className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70"
            >
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    0{index + 1}
                  </span>
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="px-0">
                  <Link href={step.href}>
                    Przejdź
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
