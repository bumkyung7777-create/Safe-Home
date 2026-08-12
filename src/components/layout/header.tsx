"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/services/supabase/client";

export default function Header() {
  const [keyword, setKeyword] = useState("");
  const user = useAuth();
  const supabase = createClient();

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  console.log("로그인", user);

  return (
    <header className="bg-[#f8f9ff] opacity-80">
      <div className="flex items-center gap-10 px-10  py-4 justify-between max-w-[80.63rem] m-auto">
        <Link href="/">
          <img src="/logo.svg" alt="Logo" />
        </Link>
        <form
          className="flex-1 flex items-center py-2 px-4 border border-gray-300 rounded-md max-w-[25.00rem] w-full"
          onSubmit={handleSubmit}
        >
          <label htmlFor="header-search" className="sr-only">
            검색어
          </label>

          <input
            className="w-full bg-[#f8f9ff] opacity-80 outline-none"
            id="header-search"
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력하세요"
          />

          <button type="submit">
            <img src="/search.svg" alt="검색" />
          </button>
        </form>
        <div className="flex gap-5 flex items-center">
          <ul className="header-menu flex items-center gap-4">
            <li>
              <Link className="active" href="/mypage">
                매물
              </Link>
            </li>
            <li>
              <Link href="/mypage">사용자</Link>
            </li>
            <li>
              <Link href="/mypage">점수</Link>
            </li>
            <li>
              <Link href="/mypage">시장</Link>
            </li>
          </ul>
          <div className="bar" />
          <div className="flex gap-2">
            {user ? (
              <button onClick={handleLogout} className="login-button">
                로그아웃
              </button>
            ) : (
              <>
                <Link href="/login" className="login-button">
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
