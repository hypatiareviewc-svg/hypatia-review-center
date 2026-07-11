"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import type { EnrollmentRecord } from "@/lib/enrollment-display";

// Portrait card dimensions (CR80 standard ~2.125" x 3.375" ratio)
const CARD_W = 200;
const CARD_H = 320;

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

/** Front face of the student ID card - Portrait */
export function StudentIdCardFront({ student }: { student: EnrollmentRecord }) {
  return (
    <div
      className="id-card-face relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl"
      style={{ width: CARD_W, height: CARD_H, flexShrink: 0 }}
    >
      {/* Watermark - subtle logo pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <div className="relative w-32 h-32">
          <Image src="/logo1.png" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="absolute top-14 left-1 opacity-[0.03] pointer-events-none">
        <div className="relative w-12 h-12 -rotate-12">
          <Image src="/logo1.png" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="absolute bottom-24 right-1 opacity-[0.03] pointer-events-none">
        <div className="relative w-14 h-14 rotate-12">
          <Image src="/logo1.png" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Navy header */}
      <div className="absolute inset-x-0 top-0 h-[68px] bg-gradient-to-b from-[#1a365d] to-[#14294b]" />

      {/* Gold accent line */}
      <div className="absolute inset-x-0 top-[68px] h-[3px] bg-[#c9a227]" />

      {/* Decorative corner accents */}
      <div className="absolute top-[68px] left-0 w-8 h-8 bg-gradient-to-br from-[#c9a227]/20 to-transparent rounded-br-full" />
      <div className="absolute top-[68px] right-0 w-8 h-8 bg-gradient-to-bl from-[#c9a227]/20 to-transparent rounded-bl-full" />

      {/* Header content */}
      <div className="absolute inset-x-0 top-0 flex h-[68px] flex-col items-center justify-center px-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-md">
          <Image src="/logo1.png" alt="Hypatia" fill className="object-cover" />
        </div>
        <div className="mt-1.5 text-center">
          <p className="font-serif text-[10px] font-bold tracking-wide text-white">
            Hypatia Review Center
          </p>
          <p className="text-[6.5px] font-medium uppercase tracking-[0.2em] text-[#c9a227]">
            Student ID
          </p>
        </div>
      </div>

      {/* Photo container with rounded frame */}
      <div
        className="absolute left-1/2 top-[82px] -translate-x-1/2 overflow-hidden rounded-2xl border-3 border-white bg-slate-100 shadow-lg"
        style={{ width: 76, height: 86 }}
      >
        {student.photoUrl ? (
          <Image src={student.photoUrl} alt={formatName(student)} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-300" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Student name - prominent */}
      <div className="absolute left-3 right-3 top-[176px] text-center">
        <p className="font-serif text-[13px] font-bold leading-tight text-slate-800">
          {formatName(student)}
        </p>
        <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.15em] text-[#1a365d]">
          {student.programCourse}
        </p>
      </div>

      {/* Student details - organized in clean rows */}
      <div className="absolute left-4 right-4 top-[218px] space-y-1.5">
        <InfoRow label="ID No." value={student.applicationNumber} />
        <InfoRow label="Birthday" value={formatBirthday(student.birthday)} />
        <InfoRow label="Sex" value={student.sex ?? "—"} />
        <InfoRow label="Contact" value={student.contactNumber} />
      </div>

      {/* Footer bar */}
      <div className="absolute inset-x-0 bottom-0 h-[28px] bg-gradient-to-t from-[#14294b] to-[#1a365d]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#c9a227]/50" />
        <div className="flex h-full items-center justify-between px-4">
          <p className="text-[5.5px] tracking-[0.12em] text-white/50 uppercase">
            Not transferable
          </p>
          <p className="text-[6px] font-semibold tracking-wide text-[#c9a227]">
            AY {new Date().getFullYear()}–{new Date().getFullYear() + 1}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Back face of the student ID card - Portrait */
export function StudentIdCardBack({ student }: { student: EnrollmentRecord }) {
  return (
    <div
      className="id-card-face relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl"
      style={{ width: CARD_W, height: CARD_H, flexShrink: 0 }}
    >
      {/* Watermark - Hypatia logo repeated */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <div className="relative w-32 h-32">
          <Image src="/logo1.png" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="absolute top-16 left-2 opacity-[0.03] pointer-events-none">
        <div className="relative w-16 h-16 rotate-12">
          <Image src="/logo1.png" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="absolute bottom-20 right-2 opacity-[0.03] pointer-events-none">
        <div className="relative w-14 h-14 -rotate-12">
          <Image src="/logo1.png" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Navy header */}
      <div className="absolute inset-x-0 top-0 h-[48px] bg-gradient-to-b from-[#1a365d] to-[#14294b]" />
      <div className="absolute inset-x-0 top-[48px] h-[2px] bg-[#c9a227]" />

      {/* Center logo text */}
      <div className="absolute inset-x-0 top-0 flex h-[48px] items-center justify-center">
        <p className="font-serif text-[9px] font-bold tracking-[0.25em] uppercase text-white/90">
          Hypatia Review Center
        </p>
      </div>

      {/* QR code - centered */}
      <div className="absolute left-1/2 top-[52px] -translate-x-1/2 flex flex-col items-center gap-1.5">
        <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
          <QRCodeSVG
            value={student.applicationNumber}
            size={56}
            level="H"
            fgColor="#1a365d"
            bgColor="#ffffff"
            imageSettings={{
              src: "/logo1.png",
              height: 12,
              width: 12,
              excavate: true,
            }}
          />
        </div>
        <p className="text-[6px] font-mono font-semibold tracking-wide text-slate-600">
          {student.applicationNumber}
        </p>
      </div>

      {/* Back info - compact to avoid overlap */}
      <div className="absolute left-4 right-4 top-[142px]">
        <div className="mb-2 border-l-2 border-[#c9a227] pl-2">
          <p className="text-[5.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Emergency Contact
          </p>
          <p className="text-[8px] font-semibold text-slate-800 leading-tight">
            {student.guardianFullName}
          </p>
          <p className="text-[6.5px] text-slate-500 leading-tight">{student.guardianAddress}</p>
          <p className="text-[7px] font-medium text-[#1a365d]">{student.guardianContactNumber}</p>
        </div>

        <div className="border-t border-slate-100 pt-1.5">
          <p className="text-[5.5px] leading-snug text-slate-400">
            If found, please return to Hypatia Review Center or contact the number above.
          </p>
        </div>
      </div>

      {/* Signature line */}
      <div className="absolute bottom-[30px] left-4 right-4 flex flex-col items-center">
        <div className="w-16 border-b border-slate-300" />
        <p className="mt-0.5 text-[4.5px] text-slate-400 uppercase tracking-wider">Authorized Signature</p>
      </div>

      {/* Footer */}
      <div className="absolute inset-x-0 bottom-0 h-[28px] bg-gradient-to-t from-[#14294b] to-[#1a365d]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#c9a227]/50" />
        <div className="flex h-full items-center justify-center">
          <p className="text-[5.5px] tracking-[0.12em] text-white/50 uppercase">
            Scan QR to verify student record
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[7px] leading-tight">
      <span className="w-14 shrink-0 font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>
      <span className="truncate font-medium text-slate-700">{value}</span>
    </div>
  );
}
