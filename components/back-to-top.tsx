"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 700);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="focus-ring fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] shadow-lg"
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}