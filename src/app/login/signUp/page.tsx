"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  House,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type UserRole = "tenant" | "landlord" | "realtor";

const roles = [
  {
    id: "tenant" as const,
    title: "Tenant",
    subtitle: "Find verified homes securely.",
    koreanTitle: "세입자",
    icon: UserRound,
  },
  {
    id: "landlord" as const,
    title: "Landlord",
    subtitle: "List and manage properties.",
    koreanTitle: "임대인",
    icon: House,
  },
  {
    id: "realtor" as const,
    title: "Realtor",
    subtitle: "Manage clients and listings.",
    koreanTitle: "중개사",
    icon: Building2,
  },
];

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("tenant");

  return (
    <main className="min-h-screen bg-[#f6f8fd] px-4 py-10 text-[#082d57]">
      <section className="mx-auto w-full max-w-[680px] rounded-2xl bg-white p-6 shadow-[0_8px_20px_rgba(8,45,87,0.1)] sm:p-10">
        {/* 제목 */}
        <header className="text-center">
          <div className="mx-auto mb-6 h-0.5 w-4 bg-[#55b8eb]" />

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create Your Account
          </h1>

          <p className="mt-3 text-sm text-[#737783] sm:text-base">
            Join SafeHome to access verified listings and trusted insights.
          </p>

          <div className="mx-auto mt-6 h-0.5 w-4 bg-[#ee82c8]" />
        </header>

        {/* 역할 선택 */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`min-h-[190px] rounded-xl border p-5 text-center transition ${
                  isSelected
                    ? "border-2 border-[#082d57] bg-[#eaf1ff] shadow-sm"
                    : "border-[#edf0f5] bg-white hover:border-[#9fb3d1]"
                }`}
              >
                <Icon className="mx-auto size-9" strokeWidth={2.2} />

                <strong className="mt-4 block text-xl font-semibold">
                  {role.title}
                </strong>

                <span className="mt-1 block text-sm leading-5 text-[#707582]">
                  {role.subtitle}
                </span>

                <span className="mt-2 block text-sm text-[#707582]">
                  {role.koreanTitle}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto my-7 h-0.5 w-4 bg-[#ee82c8]" />

        {/* 가입 폼 */}
        <form className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-semibold text-[#3e4149]"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="h-12 w-full rounded-md border border-[#9ca3af] px-4 text-base outline-none placeholder:text-[#8b909c] focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/15"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-[#3e4149]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="h-12 w-full rounded-md border border-[#9ca3af] px-4 text-base outline-none placeholder:text-[#8b909c] focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/15"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-semibold text-[#3e4149]"
              >
                Phone Number
              </label>

              <div className="flex gap-2">
                <input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  className="h-12 min-w-0 flex-1 rounded-md border border-[#9ca3af] px-4 text-base outline-none placeholder:text-[#8b909c] focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/15"
                />

                <button
                  type="button"
                  className="h-12 shrink-0 rounded-md bg-[#e6eeff] px-4 text-sm font-medium text-[#082d57] transition hover:bg-[#d5e3ff]"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold text-[#3e4149]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a strong password"
              className="h-12 w-full rounded-md border border-[#9ca3af] px-4 text-base outline-none placeholder:text-[#8b909c] focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/15"
            />
          </div>

          {/* 휴대폰 인증 안내 */}
          <div className="flex gap-3 rounded-lg bg-[#edf3ff] p-4 text-sm leading-5 text-[#5d6471]">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#006c4a]" />

            <p>
              Phone verification is required to ensure account security and
              enable secure communication with landlords.
            </p>
          </div>

          <div className="border-t border-[#d6d9df] pt-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-[#565b66]">
              <input
                type="checkbox"
                className="mt-0.5 size-5 rounded border-[#9ca3af] accent-[#006c4a]"
              />

              <span>
                I agree to the{" "}
                <a
                  href="/terms"
                  className="font-medium text-[#082d57] underline underline-offset-2"
                >
                  Terms of Service
                </a>{" "}
                and acknowledge the{" "}
                <a
                  href="/privacy"
                  className="font-medium text-[#082d57] underline underline-offset-2"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="h-14 w-full rounded-lg bg-[#082d57] text-lg font-semibold text-white transition hover:bg-[#006c4a] active:scale-[0.99]"
          >
            Create Account
          </button>
        </form>
      </section>
    </main>
  );
}
