"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useUserProfile } from "@/context/auth-context";
import { createClient } from "@/services/supabase/client";
import { useRouter } from "next/navigation";
export default function Header() {
  const [keyword, setKeyword] = useState("");
  const { user, role } = useUserProfile();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = () => {
    supabase.auth.signOut();
    router.push("/");
  };

  // 검색: 입력값을 주소(/search?q=검색어)에 실어서 검색 페이지로 이동
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 기본 동작(페이지 새로고침) 막기
    const word = keyword.trim();
    if (!word) return; // 빈 칸이면 아무것도 안 함
    // encodeURIComponent: 한글·띄어쓰기를 주소에 넣을 수 있는 모양으로 변환
    router.push(`/search?q=${encodeURIComponent(word)}`);
  };

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
            {/* 집주인(landlord) 또는 공인중개사(realtor)만 매물 메뉴 표시 */}
            {user && (role === "landlord" || role === "realtor") && (
              <li>
                <Link className="" href="/join">
                  매물
                </Link>
              </li>
            )}
            <li>
              <Link href="/mypage">내 정보</Link>
            </li>
            <li>
              <Link href="/home">시장</Link>
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
