"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import type { EnrollmentRecord } from "@/lib/enrollment-display";

const CARD_W = 320; // px — CR80 proportions scaled for screen
const CARD_H = 200;

function formatName(r: EnrollmentRecord) {
  const mid = r.middleName ? ` ${r.middleName.charAt(0)}.` : "";
  return `${r.firstName}${mid} ${r.lastName}`;
}

function formatBirthday(raw: string | null) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

/** Front face of the student ID card */
export function StudentIdCardFront({ student }: { student: EnrollmentRecord }) {
  return (
    <div
      className="id-card-face relative overflow-hidden rounded-xl border border-[var(--border)] bg-white text-[#101828] shadow-lg"
      style={{ width: CARD_W, height: CARD_H, flexShrink: 0 }}
    >
      {/* Navy header strip */}
      <div className="absolute inset-x-0 top-0 h-[52px] bg-[#14294b]" />

      {/* Gold accent line */}
      <div className="absolute inset-x-0 top-[52px] h-[3px] bg-[#a88237]" />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Header content */}
      <div className="absolute inset-x-0 top-0 flex h-[52px] items-center gap-2 px-3">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
          <Image src="/logo1.png" alt="Hypatia" fill className="object-cover" />
        </div>
        <div className="leading-tight">
          <p className="font-serif text-[11px] font-bold tracking-wide text-white">
            Hypatia Review Center
          </p>
          <p className="text-[7.5px] font-medium uppercase tracking-[0.18em] text-[#a88237]">
            Student Identification Card
          </p>
        </div>
      </div>

      {/* Photo */}
      <div
        className="absolute left-3 top-[61px] overflow-hidden rounded-lg border-2 border-[#a88237] bg-slate-100"
        style={{ width: 64, height: 72 }}
      >
        {student.photoUrl ? (
          <Image src={student.photoUrl} alt={formatName(student)} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-300" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Student info */}
      <div className="absolute left-[87px] top-[60px] right-3">
        <p className="font-serif text-[12px] font-bold leading-tight text-[#14294b]">
          {formatName(student)}
        </p>
        <p className="mt-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-[#a88237]">
          {student.programCourse}
        </p>

        <div className="mt-2 space-y-[3px]">
          <InfoRow label="ID No." value={student.applicationNumber} />
          <InfoRow label="Birthday" value={formatBirthday(student.birthday)} />
          <InfoRow label="Sex" value={student.sex ?? "—"} />
          <InfoRow label="Contact" value={student.contactNumber} />
        </div>
      </div>

      {/* Footer bar */}
      <div className="absolute inset-x-0 bottom-0 flex h-[22px] items-center justify-between bg-[#14294b] px-3">
        <p className="text-[7px] tracking-[0.15em] text-white/60 uppercase">
          Not transferable · For identification only
        </p>
        <p className="text-[7px] font-semibold tracking-wide text-[#a88237]">
          AY {new Date().getFullYear()}–{new Date().getFullYear() + 1}
        </p>
      </div>
    </div>
  );
}

/** Back face of the student ID card */
export function StudentIdCardBack({ student }: { student: EnrollmentRecord }) {
  return (
    <div
      className="id-card-face relative overflow-hidden rounded-xl border border-[var(--border)] bg-white text-[#101828] shadow-lg"
      style={{ width: CARD_W, height: CARD_H, flexShrink: 0 }}
    >
      {/* Navy header */}
      <div className="absolute inset-x-0 top-0 h-[36px] bg-[#14294b]" />
      <div className="absolute inset-x-0 top-[36px] h-[2.5px] bg-[#a88237]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="absolute inset-x-0 top-0 flex h-[36px] items-center justify-center">
        <p className="font-serif text-[9px] font-bold tracking-[0.2em] uppercase text-white/80">
          Hypatia Review Center
        </p>
      </div>

      {/* QR code */}
      <div className="absolute left-3 top-[46px] flex flex-col items-center gap-1">
        <div className="rounded-md border border-slate-200 bg-white p-1.5">
          <QRCodeSVG
            value={student.applicationNumber}
            size={72}
            level="H"
            fgColor="#14294b"
            bgColor="#ffffff"
            imageSettings={{
              src: "/logo1.png",
              width: 16,
              height: 16,
              excavate: true,
            }}
          />
        </div>
        <p className="text-[7px] font-mono font-semibold tracking-wide text-[#14294b]">
          {student.applicationNumber}
        </p>
      </div>

      {/* Back info */}
      <div className="absolute left-[110px] top-[46px] right-3 space-y-[4px]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          Emergency Contact
        </p>
        <p className="text-[9px] font-semibold text-[#14294b] leading-tight">
          {student.guardianFullName}
        </p>
        <p className="text-[8px] text-slate-500 leading-tight">{student.guardianAddress}</p>
        <p className="text-[8.5px] font-medium text-[#14294b]">{student.guardianContactNumber}</p>

        <div className="mt-1 border-t border-slate-200 pt-1.5">
          <p className="text-[7.5px] text-slate-400 leading-snug">
            If found, please return to Hypatia Review Center or contact the number above.
          </p>
        </div>
      </div>

      {/* Signature line */}
      <div className="absolute bottom-[22px] right-3 flex flex-col items-center gap-0.5">
        <div className="w-20 border-b border-slate-400" />
        <p className="text-[7px] text-slate-400">Authorized Signature</p>
      </div>

      {/* Footer */}
      <div className="absolute inset-x-0 bottom-0 flex h-[22px] items-center justify-center bg-[#14294b]">
        <p className="text-[7px] tracking-[0.14em] text-white/60 uppercase">
          Scan QR to verify student record
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1 text-[8px] leading-tight">
      <span className="w-[42px] shrink-0 font-semibold uppercase tracking-[0.1em] text-[#a88237]">
        {label}
      </span>
      <span className="text-[#101828] truncate">{value}</span>
    </div>
  );
}
