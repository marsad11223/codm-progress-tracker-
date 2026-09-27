"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK = "/weapons/fallback.svg";

export function WeaponImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(src || FALLBACK);

  return (
    // Weapon art is optional and often missing. A plain img lets onError fall back locally.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={cn(
        "bg-[radial-gradient(circle_at_50%_60%,oklch(0.34_0.03_75),oklch(0.13_0.01_70))] object-contain p-1",
        className,
      )}
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK);
      }}
    />
  );
}
