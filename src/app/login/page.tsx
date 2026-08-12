"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex h-full justify-center flex min-h-screen flex-col items-center bg-[#f6f8fd] px-4 py-8 text-[#082d57]">
      <section className="relative w-full max-w-[580px] overflow-hidden rounded-2xl bg-white px-6 pb-8 pt-9 shadow-[0_8px_18px_rgba(8,45,87,0.12)] sm:px-9">
        {/* 상단 초록 라인 */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#082d57]" />

        <form className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-semibold text-[#45464b]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="h-14 w-full rounded-md border border-[#bfc2ca] bg-[#f8f9fd] px-4 text-base text-[#082d57] outline-none placeholder:text-[#7b8290] focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/20"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-[#45464b]"
              >
                Password
              </label>

              <button
                type="button"
                className="text-sm font-semibold text-[#082d57] transition hover:text-[#006c4a] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-14 w-full rounded-md border border-[#bfc2ca] bg-[#f8f9fd] px-4 text-base text-[#082d57] outline-none placeholder:text-[#7b8290] focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/20"
            />
          </div>

          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#082d57] text-lg font-semibold text-white transition hover:bg-[#006c4a] active:scale-[0.99]"
          >
            Sign In
          </button>
        </form>
        <Link
          href="/login/signUp"
          className=" mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#f8f9fd] text-lg font-semibold text-black transition hover:text-white hover:bg-[#006c4a] active:scale-[0.99]"
        >
          Sign Up
        </Link>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#c8cbd3]" />
          <span className="whitespace-nowrap text-xs font-bold text-[#4c4e55]">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-[#c8cbd3]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#c4c7cf] bg-white text-base font-medium text-[#082d57] transition hover:bg-[#fee500]/10"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[#fee500] text-xs font-bold text-[#3b2d00]">
              K
            </span>
            Kakao
          </button>

          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#c4c7cf] bg-white text-base font-medium text-[#082d57] transition hover:bg-[#03c75a]/10"
          >
            <span className="flex size-7 items-center justify-center rounded bg-[#03c75a] text-xs font-bold text-white">
              N
            </span>
            Naver
          </button>
        </div>
      </section>

      <div className="mt-8 flex flex-col items-center text-[#858992]">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold">
          <span className="flex items-center gap-2">Bank-Grade Encryption</span>

          <span className="flex items-center gap-2">HUG/HF Audited</span>
        </div>

        <p className="mt-3 text-center text-sm">
          © 2024 SafeHome Institutional Real Estate. All rights reserved.
        </p>
      </div>
    </main>
  );
}
