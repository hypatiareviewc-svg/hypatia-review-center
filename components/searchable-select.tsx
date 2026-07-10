"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export function SearchableSelect({
  label,
  options,
  register,
  onValueChange,
  error,
  placeholder = "Search...",
}: {
  label: string;
  options: string[];
  register: UseFormRegisterReturn;
  onValueChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // react-hook-form manages the hidden input value via register; keep it in sync
  const { ref: registerRef, ...registerRest } = register;
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (registerRef) {
      registerRef(hiddenRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = query
    ? options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
    : options;

  function selectOption(opt: string) {
    setSelected(opt);
    setQuery(opt);
    setOpen(false);
    onValueChange?.(opt);
  }

  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          value={query}
          placeholder={selected || placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // delay to allow click on option
            window.setTimeout(() => setOpen(false), 150);
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="focus-ring w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-10 text-sm"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          aria-label="Toggle options"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* hidden input for react-hook-form registration */}
        <input type="hidden" ref={hiddenRef} {...registerRest} />

        {open ? (
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--muted)]">
                No match — your typed text will be used.
              </li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={opt === selected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(opt);
                  }}
                  className={[
                    "cursor-pointer px-4 py-2.5 text-sm",
                    opt === selected
                      ? "bg-[var(--surface-soft)] font-medium text-[var(--foreground)]"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]",
                  ].join(" ")}
                >
                  {opt}
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </div>
  );
}
