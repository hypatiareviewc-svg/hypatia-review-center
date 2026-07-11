"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  QrCode,
  UserRound,
  XCircle,
} from "lucide-react";

/* ─── types ────────────────────────────────────────────────────────────────── */
type Session = { id: string; title: string; sessionDate: string };

type ScanResult = {
  studentName: string;
  programCourse: string;
  applicationNumber: string;
  photoUrl: string | null;
  sessionTitle: string;
  alreadyRecorded: string | null;
  scannedAt?: string;
  isLate?: boolean;
  latePeriod?: string | null;
};

type ScanState = "idle" | "starting" | "scanning" | "loading" | "success" | "duplicate" | "error";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(new Date(iso));
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(iso));
}

/* ─── component ────────────────────────────────────────────────────────────── */
export function QrScannerClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionDropOpen, setSessionDropOpen] = useState(false);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef<any>(null);
  const cooldownRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable ref so the QR callback always sees latest session
  const sessionRef = useRef<Session | null>(null);

  /* ── load sessions ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pre = params.get("session");

    fetch("/api/attendance/scan" + (pre ? `?sessionId=${pre}` : ""))
      .then(r => r.json())
      .then(data => {
        if (pre && data.id) {
          setSessions([data]);
          setSelectedSession(data);
          sessionRef.current = data;
        } else if (Array.isArray(data)) {
          setSessions(data);
          if (data.length === 1) {
            setSelectedSession(data[0]);
            sessionRef.current = data[0];
          }
        }
      })
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  /* ── scanner lifecycle ──────────────────────────────────────────────────── */
  const stopScanner = useCallback(async () => {
    const s = scannerRef.current;
    if (!s) return;
    try { await s.stop(); } catch {}
    try { s.clear(); } catch {}
    scannerRef.current = null;
  }, []);

  const startScanner = useCallback(async () => {
    await stopScanner();
    setCameraError("");
    setScanState("starting");

    // Dynamically import — avoids Next.js SSR issues with html5-qrcode
    let Html5Qrcode: any;
    try {
      const mod = await import("html5-qrcode");
      Html5Qrcode = mod.Html5Qrcode;
    } catch {
      setCameraError("Failed to load QR scanner library.");
      setScanState("idle");
      return;
    }

    // Wait one tick so React has rendered #qr-video-container
    await new Promise(r => setTimeout(r, 80));

    const el = document.getElementById("qr-video-container");
    if (!el) {
      setCameraError("Scanner container not found.");
      setScanState("idle");
      return;
    }

    const scanner = new Html5Qrcode("qr-video-container");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: (w: number, h: number) => {
            const size = Math.min(w, h, 280);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        // success callback
        async (decodedText: string) => {
          if (cooldownRef.current) return;
          cooldownRef.current = true;
          setScanState("loading");

          const sess = sessionRef.current;
          if (!sess) {
            setScanState("scanning");
            cooldownRef.current = false;
            return;
          }

          try {
            const res = await fetch("/api/attendance/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                applicationNumber: decodedText.trim(),
                sessionId: sess.id,
              }),
            });
            const data = await res.json();

            if (!res.ok) {
              setErrorMsg(data.message ?? "Scan failed.");
              setScanState("error");
              scheduleReset(3500);
              return;
            }

            setScanResult(data);
            setScanState(data.alreadyRecorded ? "duplicate" : "success");
            scheduleReset(4500);
          } catch {
            setErrorMsg("Network error. Please try again.");
            setScanState("error");
            scheduleReset(3000);
          }
        },
        // error callback — silently ignore decode misses
        () => {},
      );

      setScanState("scanning");
    } catch (err: any) {
      const msg: string = err?.message ?? String(err);
      if (msg.toLowerCase().includes("permission")) {
        setCameraError("Camera permission denied. Please allow camera access and refresh.");
      } else if (msg.toLowerCase().includes("notfound") || msg.toLowerCase().includes("no camera")) {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Could not start camera: " + msg);
      }
      setScanState("idle");
    }
  }, [stopScanner]);

  function scheduleReset(ms: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setScanState("scanning");
      setScanResult(null);
      setErrorMsg("");
      cooldownRef.current = false;
    }, ms);
  }

  // Start scanner when session is chosen
  useEffect(() => {
    sessionRef.current = selectedSession;
    if (selectedSession) {
      startScanner();
    }
    return () => { stopScanner(); };
  }, [selectedSession]); // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stopScanner]);

  const showOverlay = scanState === "scanning" || scanState === "loading";

  /* ── render ────────────────────────────────────────────────────────────── */
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#080c18]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[480px] w-[480px] rounded-full bg-[#14294b]/50 blur-3xl" />
        <div className="absolute -right-48 bottom-0 h-[480px] w-[480px] rounded-full bg-[#a88237]/15 blur-3xl" />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 bg-black/30 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/20">
            <Image src="/logo1.png" alt="Hypatia" fill className="object-cover" />
          </div>
          <div>
            <p className="font-serif text-sm font-bold leading-tight text-white">Hypatia Review Center</p>
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.22em] text-[#a88237]">
              Attendance Scanner
            </p>
          </div>
        </div>

        {/* Session selector */}
        <div className="relative z-30">
          <button
            type="button"
            onClick={() => setSessionDropOpen(o => !o)}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          >
            {sessionsLoading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              : <QrCode className="h-3.5 w-3.5 shrink-0" />}
            <span className="max-w-[150px] truncate">
              {selectedSession?.title ?? "Select session…"}
            </span>
            <ChevronDown className={`h-3 w-3 shrink-0 opacity-60 transition-transform ${sessionDropOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {sessionDropOpen && (
              <motion.div
                className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-2xl border border-white/15 bg-[#0d1525]/98 shadow-2xl shadow-black/60 backdrop-blur-xl"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <div className="border-b border-white/10 px-4 py-2.5">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Choose Session
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                      <QrCode className="h-6 w-6 text-white/20" />
                      <p className="text-xs text-white/30">No sessions available</p>
                      <p className="text-[0.65rem] text-white/20">Create a session in the admin panel first</p>
                    </div>
                  ) : sessions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSession(s);
                        sessionRef.current = s;
                        setSessionDropOpen(false);
                      }}
                      className={[
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                        selectedSession?.id === s.id
                          ? "bg-[#14294b]/60"
                          : "hover:bg-white/8",
                      ].join(" ")}
                    >
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${selectedSession?.id === s.id ? "bg-[#a88237]" : "bg-white/20"}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{s.title}</p>
                        <p className="text-[0.63rem] text-white/40">{fmtDate(s.sessionDate)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-4 py-6">
        {!selectedSession ? (
          /* No session — prompt */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-white/5" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/8 backdrop-blur-sm">
                <QrCode className="h-10 w-10 text-white/50" />
              </div>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-white">QR Attendance Scanner</p>
              <p className="mt-2 max-w-xs text-sm text-white/40">
                Select an attendance session from the top menu to activate the camera scanner
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSessionDropOpen(true)}
              className="mt-1 rounded-full bg-[#14294b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#1e3a6b] active:scale-95"
            >
              Choose a Session
            </button>
          </motion.div>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center gap-5">
            {/* Session label */}
            <div className="text-center">
              <p className="font-serif text-xl font-bold text-white">{selectedSession.title}</p>
              <p className="mt-0.5 text-xs text-white/40">{fmtDate(selectedSession.sessionDate)}</p>
            </div>

            {/* Camera viewport */}
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl shadow-black/80">
              {/* html5-qrcode renders the <video> inside this div */}
              <div
                id="qr-video-container"
                className="w-full"
                style={{ minHeight: 300 }}
              />

              {/* Starting overlay */}
              {scanState === "starting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                  <p className="text-xs text-white/40">Starting camera…</p>
                </div>
              )}

              {/* Scanning overlay — viewfinder frame */}
              {showOverlay && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {/* Dark vignette around the frame */}
                  <div className="absolute inset-0 bg-black/40" style={{
                    maskImage: "radial-gradient(ellipse 55% 55% at center, transparent 0%, black 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 55% 55% at center, transparent 0%, black 100%)",
                  }} />

                  {/* Viewfinder corners */}
                  <div className="relative h-56 w-56">
                    {(["tl","tr","bl","br"] as const).map(c => (
                      <span
                        key={c}
                        className="absolute h-9 w-9"
                        style={{
                          borderColor: "#a88237",
                          borderTopWidth:    c[0] === "t" ? "3px" : 0,
                          borderBottomWidth: c[0] === "b" ? "3px" : 0,
                          borderLeftWidth:   c[1] === "l" ? "3px" : 0,
                          borderRightWidth:  c[1] === "r" ? "3px" : 0,
                          top:    c[0] === "t" ? 0 : "auto",
                          bottom: c[0] === "b" ? 0 : "auto",
                          left:   c[1] === "l" ? 0 : "auto",
                          right:  c[1] === "r" ? 0 : "auto",
                          borderRadius:
                            c === "tl" ? "8px 0 0 0" :
                            c === "tr" ? "0 8px 0 0" :
                            c === "bl" ? "0 0 0 8px" :
                                         "0 0 8px 0",
                        }}
                      />
                    ))}

                    {/* Animated scan line */}
                    <motion.div
                      className="absolute inset-x-3 h-px"
                      style={{ background: "linear-gradient(90deg, transparent, #a88237, transparent)" }}
                      initial={{ top: 12 }}
                      animate={{ top: "calc(100% - 12px)" }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Loading overlay — when processing a scan */}
              {scanState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
                  <Loader2 className="h-9 w-9 animate-spin text-white" />
                  <p className="text-xs font-medium text-white/60">Looking up student…</p>
                </div>
              )}
            </div>

            {/* Instruction text */}
            {(scanState === "scanning") && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-white/35"
              >
                Point the camera at a student's ID QR code
              </motion.p>
            )}

            {/* Camera permission error */}
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/60 px-4 py-3.5 backdrop-blur-sm"
              >
                <XCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-300">Camera Error</p>
                  <p className="text-xs text-white/50">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => { setCameraError(""); startScanner(); }}
                    className="mt-2 text-xs font-semibold text-red-300 underline underline-offset-2"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Result cards ────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {scanResult && (scanState === "success" || scanState === "duplicate") && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ type: "spring", damping: 20, stiffness: 260 }}
                  className={[
                    "w-full overflow-hidden rounded-3xl border shadow-2xl shadow-black/60",
                    scanState === "success"
                      ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/90 to-[#080c18]/95"
                      : "border-amber-500/40 bg-gradient-to-b from-amber-950/90 to-[#080c18]/95",
                  ].join(" ")}
                >
                  {/* Status banner */}
                  <div className={[
                    "flex items-center gap-3 border-b px-5 py-3",
                    scanState === "success"
                      ? (scanResult.isLate ? "border-orange-500/30 bg-orange-900/30" : "border-emerald-500/20 bg-emerald-500/15")
                      : "border-amber-500/20 bg-amber-500/15",
                  ].join(" ")}>
                    {scanState === "success" ? (
                      scanResult.isLate ? (
                        <AlertCircle className="h-5 w-5 shrink-0 text-orange-400" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      )
                    ) : (
                      <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold ${
                          scanState === "success" 
                            ? (scanResult.isLate ? "text-orange-300" : "text-emerald-300") 
                            : "text-amber-300"
                        }`}>
                          {scanState === "success" 
                            ? (scanResult.isLate ? "Late Arrival!" : "Attendance Recorded!")
                            : "Already Marked Present"}
                        </p>
                        {scanResult.isLate && (
                          <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-orange-300 border border-orange-500/30">
                            {scanResult.latePeriod || "Late"}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.65rem] text-white/40">
                        {scanState === "success"
                          ? `Logged at ${scanResult.scannedAt ? fmtTime(scanResult.scannedAt) : "—"}`
                          : `First scanned at ${scanResult.alreadyRecorded ? fmtTime(scanResult.alreadyRecorded) : "—"}`}
                      </p>
                    </div>
                  </div>

                  {/* Student profile */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                      {scanResult.photoUrl ? (
                        <Image
                          src={scanResult.photoUrl}
                          alt={scanResult.studentName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UserRound className="h-8 w-8 text-white/25" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-base font-bold leading-snug text-white">
                        {scanResult.studentName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-white/55">{scanResult.programCourse}</p>
                      <p className="mt-1 font-mono text-[0.62rem] text-white/30">{scanResult.applicationNumber}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {scanState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex w-full items-center gap-3 rounded-3xl border border-red-500/40 bg-gradient-to-b from-red-950/90 to-[#080c18]/95 px-5 py-4 shadow-2xl shadow-black/60"
                >
                  <XCircle className="h-6 w-6 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-bold text-red-300">Scan Failed</p>
                    <p className="text-xs text-white/45">{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-3 text-center">
        <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-white/15">
          Hypatia Review Center · Attendance System
        </p>
      </footer>

      {/* Backdrop to close dropdown */}
      {sessionDropOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setSessionDropOpen(false)} />
      )}
    </div>
  );
}
