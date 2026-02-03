"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_AVATARS = Array.from(
  { length: 10 },
  (_, i) => `/assets/avatars/avatar-${String(i + 1).padStart(2, "0")}.png`
);

const DROPDOWN_COUNT = 10;

export function AvatarDropDown({
  selected,
  setSelected,
}: {
  selected: string | null;
  setSelected: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const avatarsToDisplay = DEFAULT_AVATARS.slice(0, DROPDOWN_COUNT);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-3 px-3 py-2 bg-transparent border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
          {selected ? (
            <img src={selected} alt="selected avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
              No
            </div>
          )}
        </div>
        <span className="text-sm text-black">Choose your avatar!</span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M6 8L10 12L14 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute z-20 mt-2 w-64 bg-white border rounded-lg shadow-lg p-3"
          style={{ minWidth: 0 }}
        >
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            {avatarsToDisplay.map((a) => {
              const isSelected = a === selected;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setSelected(a);
                    setOpen(false);
                  }}
                  aria-pressed={isSelected}
                  className={`w-full h-16 rounded-full overflow-hidden flex items-center justify-center border ${
                    isSelected ? "ring-2 ring-orange-400" : "hover:opacity-90"
                  }`}
                >
                  <img src={a} alt="avatar option" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">Pick an avatar</div>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_AVATARS };
