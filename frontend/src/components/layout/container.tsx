// src/components/layout/container.tsx

import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-4 sm:py-8 ${className}`}>
      {children}
    </div>
  );
}