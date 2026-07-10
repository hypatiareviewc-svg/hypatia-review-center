"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  QrCode,
  UserRound,
  XCircle,
} from "lucide-react";

/* ─── types ───────────────────────────────────────────────────────────────── */
type Session = { id: string; title: string; sessionDate: string };

type ScanResult = {
  studentName: string;
  programCourse: string;
  applicationNumber: string;
  photoUrl: string | null;
  sessionTitle: string;
  alreadyRecorded: string | null; // ISO if already present
  scannedAt?: string;             // ISO of new scan
};

type ScanState = "idle" | "scanning" | "loading" | "success" | "duplicate" | "error";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
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

/* ─── component ───────────────────────────────────────────────────────────── */
export function QrScannerClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionDropOpen, setSessionDropOpen] = useState(false);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const scannerRef = useRef<any>(null);
  const scannerDivId = "qr-reader";
  const cooldownRef = useRef(false);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── load sessions ─────────────────────────────────────────────────────── */
  useEffect(() => {
    // Pre-select from URL param if present
    const params = new URLSearchParams(window.location.search);
    const preSession = params.get("session");

    fetch("/api/attendance/scan" + (preSession ? `?sessionId=${preSession}` : ""))
      .then(r => r.json())
      .then(data => {
        if (preSession && data.id) {
          // single session returned
          setSessions([data]);
          setSelectedSession(data);
        } else if (Array.isArray(data)) {
          setSessions(data);
          if (data.length === 1) setSelectedSession(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  /* ── start / stop scanner ──────────────────────────────────────────────── */
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!selectedSession) return;
    await stopScanner();
    setScanState("scanning");
    setScanResult(null);
    setErrorMsg("");

    // dynamic import to avoid SSR issues
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode(scannerDivId);
    scannerRef.current = scanner;

    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      async (decodedText: string) => {
        if (cooldownRef.current) return;
        cooldownRef.current = true;
        setScanState("loading");

        try {
          const res = await fetch("/api/attendance/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              applicationNumber: decodedText.trim(),
              sessionId: selectedSession.id,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setErrorMsg(data.message ?? "Scan failed.");
            setScanState("error");
            scheduleReset(3000);
            return;
          }

          setScanResult(data);
          setScanState(data.alreadyRecorded ? "duplicate" : "success");
          scheduleReset(4000);
        } catch {
          setErrorMsg("Network error. Please try again.");
          setScanState("error");
          scheduleReset(3000);
        }
      },
      () => { /* ignore decode failures */ },
    );
  }, [selectedSession, stopScanner]);

  function scheduleReset(ms: number) {
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      setScanState("scanning");
      setScanResult(null);
      setErrorMsg("");
      cooldownRef.current = false;
    }, ms);
  }

  // Auto-start when session is selected
  useEffect(() => {
    if (selectedSession) {
      startScanner();
    }
    return () => { stopScanner(); };
  }, [selectedSession]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, [stopScanner]);

  const isScanning = scanState === "scanning";

  /* ── render ────────────────────────────────────────────────────────────── */
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0e1a]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#14294b]/40 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#a88237]/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg">
            <Image src="/logo1.png" alt="Hypatia" fill className="object-cover" />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-sm font-bold text-white">Hypatia Review Center</p>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#a88237]">Attendance Scanner</p>
          </div>
        </div>

        {/* Session selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSessionDropOpen(o => !o)}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            {sessionsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <QrCode className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="max-w-[160px] truncate">
              {selectedSession ? selectedSession.title : "Select session…"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          <AnimatePresence>
            {sessionDropOpen && (
              <motion.div
                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/20 bg-[#0d1525]/95 shadow-2xl backdrop-blur-md"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
              >
                <div className="border-b border-white/10 px-3 py-2">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/40">Choose Session</p>
                </div>
                {sessions.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-white/40">No sessions available</p>
                ) : (
                  sessions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSession(s);
                        setSessionDropOpen(false);
                      }}
                      className={[
                        "flex w-full flex-col items-start px-3 py-2.5 text-left transition hover:bg-white/10",
                        selectedSession?.id === s.id ? "bg-white/10" : "",
                      ].join(" ")}
                    >
                      <p className="text-xs font-semibold text-white">{s.title}</p>
                      <p className="text-[0.62rem] text-white/50">{fmtDate(s.sessionDate)}</p>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main area */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6">
        {!selectedSession ? (
          /* ── no session selected ─────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <QrCode className="h-9 w-9 text-white/60" />
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-white">QR Attendance Scanner</p>
              <p className="mt-1 text-sm text-white/50">Select a session above to begin scanning</p>
            </div>
            <button
              type="button"
              onClick={() => setSessionDropOpen(true)}
              className="mt-2 rounded-full bg-[#14294b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a6b]"
            >
              Choose Session
            </button>
          </motion.div>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center gap-5">
            {/* Session info */}
            <div className="text-center">
              <p className="font-serif text-lg font-bold text-white">{selectedSession.title}</p>
              <p className="text-xs text-white/50">{fmtDate(selectedSession.sessionDate)}</p>
            </div>

            {/* Scanner viewport */}
            <div className="relative w-full">
              {/* Camera feed container — html5-qrcode renders its video here */}
              <div
                id={scannerDivId}
                className="overflow-hidden rounded-2xl"
                style={{ minHeight: 280 }}
              />

              {/* Scanning overlay — corner brackets */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-52 w-52">
                    {/* corners */}
                    {(["tl","tr","bl","br"] as const).map(c => (
                      <span
                        key={c}
                        className="absolute h-8 w-8 border-[#a88237]"
                        style={{
                          borderTopWidth:    c.startsWith("t") ? 3 : 0,
                          borderBottomWidth: c.startsWith("b") ? 3 : 0,
                          borderLeftWidth:   c.endsWith("l") ? 3 : 0,
                          borderRightWidth:  c.endsWith("r") ? 3 : 0,
                          top:    c.startsWith("t") ? 0 : "auto",
                          bottom: c.startsWith("b") ? 0 : "auto",
                          left:   c.endsWith("l") ? 0 : "auto",
                          right:  c.endsWith("r") ? 0 : "auto",
                          borderRadius: c === "tl" ? "8px 0 0 0" : c === "tr" ? "0 8px 0 0" : c === "bl" ? "0 0 0 8px" : "0 0 8px 0",
                        }}
                      />
                    ))}
                    {/* scan line */}
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-[#a88237]/70"
                      initial={{ top: "8px" }}
                      animate={{ top: "calc(100% - 8px)" }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {/* Loading spinner over camera */}
              {scanState === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Instruction */}
            {isScanning && (
              <p className="text-center text-xs text-white/50">
                Point the camera at a student's QR code
              </p>
            )}

            {/* Result card */}
            <AnimatePresence mode="wait">
              {scanResult && (scanState === "success" || scanState === "duplicate") && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ type: "spring", damping: 22, stiffness: 280 }}
                  className={[
                    "w-full overflow-hidden rounded-2xl border shadow-2xl",
                    scanState === "success"
                      ? "border-emerald-500/40 bg-emerald-950/80"
                      : "border-amber-500/40 bg-amber-950/80",
                  ].join(" ")}
                >
                  {/* Status banner */}
                  <div className={[
                    "flex items-center gap-2.5 px-4 py-2.5",
                    scanState === "success" ? "bg-emerald-500/20" : "bg-amber-500/20",
                  ].join(" ")}>
                    {scanState === "success" ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                    )}
                    <div>
                      <p className={`text-sm font-bold ${scanState === "success" ? "text-emerald-300" : "text-amber-300"}`}>
                        {scanState === "success" ? "Attendance Recorded!" : "Already Marked Present"}
                      </p>
                      <p className="text-[0.65rem] text-white/50">
                        {scanState === "success"
                          ? scanResult.scannedAt ? fmtTime(scanResult.scannedAt) : ""
                          : `First scan: ${scanResult.alreadyRecorded ? fmtTime(scanResult.alreadyRecorded) : ""}`}
                      </p>
                    </div>
                  </div>

                  {/* Student info */}
                  <div className="flex items-center gap-4 px-4 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10">
                      {scanResult.photoUrl ? (
                        <Image
                          src={scanResult.photoUrl}
                          alt={scanResult.studentName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UserRound className="h-8 w-8 text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-base font-bold leading-tight text-white">
                        {scanResult.studentName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-white/60">{scanResult.programCourse}</p>
                      <p className="mt-1 font-mono text-[0.65rem] text-white/40">{scanResult.applicationNumber}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {scanState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/80 px-4 py-3.5"
                >
                  <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-bold text-red-300">Scan Failed</p>
                    <p className="text-xs text-white/50">{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-[0.6rem] text-white/20 uppercase tracking-[0.2em]">
          Hypatia Review Center · Attendance System
        </p>
      </footer>

      {/* Click away to close dropdown */}
      {sessionDropOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSessionDropOpen(false)}
        />
      )}
    </div>
  );
}
