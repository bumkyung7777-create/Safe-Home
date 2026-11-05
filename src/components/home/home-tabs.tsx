"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOME_TYPES } from "./home-types";

export default function HomeTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto">
      {Object.values(HOME_TYPES).map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-[#082d57] bg-[#082d57] text-white"
                : "border-slate-300 bg-white text-[#082d57] hover:border-[#082d57]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
