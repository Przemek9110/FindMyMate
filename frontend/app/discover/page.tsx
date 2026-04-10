"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DiscoverPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute>
    <div>
      <h1>Discover</h1>
    </div>
    </ProtectedRoute>
  );
}