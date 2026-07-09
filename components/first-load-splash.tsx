"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_STORAGE_KEY = "hypatia-splash-seen";
const SPLASH_DURATION_MS = 3000;

export function FirstLoadSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const hasSeenSplash = window.localStorage.getItem(SPLASH_STORAGE_KEY) === "true";
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [showSplash]);

  const finishSplash = () => {
    window.localStorage.setItem(SPLASH_STORAGE_KEY, "true");
    document.body.style.overflow = "";
  };

  return (
    <>
      {children}

      <AnimatePresence onExitComplete={finishSplash}>
        {showSplash ? (
          <motion.div
            key="first-load-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[200] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(168,130,55,0.16),transparent_44%),linear-gradient(160deg,#0d1f38_0%,#14294b_48%,#091120_100%)]"
            role="alert"
            aria-busy="true"
            aria-label="Loading Hypatia Review Center"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%)]" />

            <motion.div
              aria-hidden="true"
              className="splash-depth-plane absolute left-[8%] top-[18%] h-28 w-28 rounded-[2rem] border border-white/10 bg-white/5"
              initial={{ opacity: 0, z: -180, y: 40 }}
              animate={{ opacity: 0.55, z: -80, y: [40, 24, 40] }}
              transition={{
                opacity: { duration: 0.8 },
                z: { duration: 0.8 },
                y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              }}
            />
            <motion.div
              aria-hidden="true"
              className="splash-depth-plane absolute right-[10%] top-[24%] h-20 w-20 rounded-3xl border border-[var(--secondary)]/20 bg-[var(--secondary)]/10"
              initial={{ opacity: 0, z: -220, y: 30 }}
              animate={{ opacity: 0.45, z: -120, y: [30, 14, 30] }}
              transition={{
                opacity: { duration: 0.8, delay: 0.08 },
                z: { duration: 0.8, delay: 0.08 },
                y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
              }}
            />
            <motion.div
              aria-hidden="true"
              className="splash-depth-plane absolute bottom-[22%] left-[14%] h-16 w-40 rounded-full border border-white/10 bg-white/5"
              initial={{ opacity: 0, z: -260 }}
              animate={{ opacity: 0.35, z: -160, scaleX: [0.92, 1.04, 0.92] }}
              transition={{
                opacity: { duration: 0.8, delay: 0.12 },
                z: { duration: 0.8, delay: 0.12 },
                scaleX: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
              }}
            />

            <div className="splash-3d-scene relative flex h-full items-center justify-center px-6">
              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  initial={{ opacity: 0, z: -240, scale: 0.72 }}
                  animate={{ opacity: 1, z: 0, scale: 1 }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative"
                >
                  <motion.div
                    initial={{ rotateY: 88, rotateX: 22, scale: 0.55, opacity: 0 }}
                    animate={{
                      rotateY: [88, 0, 0, -8, 0, 8, 0],
                      rotateX: [22, 0, 0, 5, 0, -5, 0],
                      scale: [0.55, 1, 1, 1, 1, 1, 1],
                      opacity: [0, 1, 1, 1, 1, 1, 1],
                      y: [24, 0, 0, -6, 0, -6, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      times: [0, 0.34, 0.42, 0.58, 0.66, 0.82, 1],
                      ease: "easeInOut",
                    }}
                    className="splash-3d-card relative"
                  >
                    <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04))] blur-xl" />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/25 bg-[linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] shadow-[0_28px_60px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md sm:h-32 sm:w-32">
                      <Image
                        src="/logo1.png"
                        alt="Hypatia Review Center"
                        width={72}
                        height={80}
                        priority
                        className="h-auto w-16 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)] sm:w-[4.5rem]"
                      />
                    </div>
                    <div className="splash-3d-card-edge absolute inset-x-3 bottom-0 h-3 translate-y-[70%] rounded-full bg-black/35 blur-md" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 28, rotateX: 18, z: -80 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
                  transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="mt-10"
                >
                  <p className="font-display text-2xl font-semibold tracking-[0.06em] text-white sm:text-3xl">
                    Hypatia
                  </p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.32em] text-white/65 sm:text-xs">
                    Review Center
                  </p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 16, z: -60 }}
                  animate={{ opacity: 1, y: 0, z: 0 }}
                  transition={{ delay: 0.82, duration: 0.55 }}
                  className="mt-6 text-sm text-white/55"
                >
                  Opening your review experience...
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.55, ease: "easeOut" }}
                  className="mt-7 h-1 w-36 origin-center overflow-hidden rounded-full bg-white/10"
                >
                  <motion.span
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ delay: 1, duration: 1.35, ease: "easeInOut" }}
                    className="block h-full w-1/2 rounded-full bg-[linear-gradient(90deg,transparent,var(--secondary),transparent)]"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
