"use client";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { Menu } from "lucide-react";
import { useUserProfile } from "@/context/auth-context";
import { createClient } from "@/services/supabase/client";
import { useRouter } from "next/navigation";
import SideMenu, { type MenuItem } from "./side-menu";

export default function Header() {
  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // 모바일 사이드 메뉴 열림 여부
  const { user, role } = useUserProfile();
  const supabase = createClient();
  const router = useRouter();

  // 집주인(landlord) 또는 공인중개사(realtor)만 "매물" 메뉴 표시
  // → PC 메뉴와 모바일 사이드 메뉴가 같은 목록을 함께 사용
  const menus: MenuItem[] = [
    ...(user && (role === "landlord" || role === "realtor")
      ? [{ href: "/join", label: "매물" }]
      : []),
    { href: "/mypage", label: "내 정보" },
    { href: "/home", label: "시장" },
  ];

  const handleLogout = () => {
    supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  };

  // useCallback: 사이드 메뉴에 넘기는 함수가 매번 새로 만들어지지 않게 고정
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // 검색: 입력값을 주소(/search?q=검색어)에 실어서 검색 페이지로 이동
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 기본 동작(페이지 새로고침) 막기
    const word = keyword.trim();
    if (!word) return; // 빈 칸이면 아무것도 안 함
    // encodeURIComponent: 한글·띄어쓰기를 주소에 넣을 수 있는 모양으로 변환
    router.push(`/search?q=${encodeURIComponent(word)}`);
  };

  return (
    <>
      <header className="bg-[#f8f9ff] opacity-80 z-[9]">
        {/* 모바일: [로고 ··· 햄버거] + 아래 줄에 검색창
          lg(1024px) 이상: [로고 | 검색창 | 메뉴 | 로그인] 한 줄 */}
        <div className="m-auto flex max-w-[80.63rem] flex-wrap items-center justify-between gap-x-10 gap-y-3 px-4 py-4 sm:px-5 lg:flex-nowrap">
          <Link href="/" className="shrink-0">
            <img src="/logo.svg" alt="Logo" />
          </Link>

          {/* 햄버거 버튼: 모바일에서만 보임 */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={menuOpen}
            aria-controls="side-menu"
            className="-mr-1.5 rounded-md p-1.5 text-[#0b1c30] lg:hidden"
          >
            <Menu className="size-6" />
          </button>

          {/* order-last: 모바일에선 맨 뒤로 가서 두 번째 줄 전체 차지, PC에선 원래 자리 */}
          <form
            className="order-last flex w-full items-center rounded-md border border-gray-300 px-4 py-2 lg:order-none lg:max-w-[25.00rem] lg:flex-1"
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

          {/* PC 메뉴: lg 이상에서만 보임 */}
          <div className="hidden items-center gap-5 lg:flex">
            <ul className="header-menu flex items-center gap-4">
              {menus.map((menu) => (
                <li key={menu.href}>
                  <Link href={menu.href}>{menu.label}</Link>
                </li>
              ))}
            </ul>
            <div className="bar" />
            <div className="flex gap-2">
              {user ? (
                <button onClick={handleLogout} className="login-button">
                  로그아웃
                </button>
              ) : (
                <Link href="/login" className="login-button">
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 사이드 메뉴는 header 밖에 둠: header의 opacity-80이 자식까지 투명하게 만들기 때문 */}
      <SideMenu
        open={menuOpen}
        onClose={closeMenu}
        menus={menus}
        isLoggedIn={!!user}
        onLogout={handleLogout}
      />
    </>
  );
}
