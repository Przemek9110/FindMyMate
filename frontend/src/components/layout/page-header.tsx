import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-balance text-4xl font-black tracking-[-0.045em] text-foreground sm:text-5xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/75">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}