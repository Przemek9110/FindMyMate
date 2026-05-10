// src/components/layout/container.tsx
export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      {children}
    </div>
  );
}
