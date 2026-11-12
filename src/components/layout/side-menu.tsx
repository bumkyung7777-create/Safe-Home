"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronRight, LogIn, LogOut, X } from "lucide-react";
import Portal from "@/components/common/portal";

export type MenuItem = { href: string; label: string };

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
  menus: MenuItem[];
  isLoggedIn: boolean;
  onLogout: () => void;
};

// 모바일 전용 사이드 메뉴 (오른쪽에서 밀려 나오는 패널 + dim)
export default function SideMenu({
  open,
  onClose,
  menus,
  isLoggedIn,
  onLogout,
}: SideMenuProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 페이지가 바뀌면(메뉴 링크를 누르면) 자동으로 닫기
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 열려 있는 동안: ESC로 닫기 + 뒤 화면 스크롤 막기 + 닫기 버튼에 포커스
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    // lg(1024px) 이상에서는 아예 숨김 → PC는 원래 가로 메뉴 사용
    <Portal>
      <div
        className={`fixed inset-0 z-[1000] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* dim: 누르면 닫힘. 열고 닫을 때 서서히 나타나고 사라짐 */}
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* 패널: 닫혀 있을 땐 오른쪽 화면 밖(translate-x-full)에 숨어 있음 */}
        <nav
          id="side-menu"
          role="dialog"
          aria-modal="true"
          aria-label="전체 메뉴"
          // 닫혀 있을 때는 inert: 안쪽 링크에 Tab 키 포커스·클릭이 안 들어가게
          // (React 18은 inert 속성을 제대로 못 넣어줘서 DOM에 직접 설정)
          // 콜백 ref: Portal로 늦게 그려져도, 그려지는 순간 + 다시 그릴 때마다 적용됨
          ref={(el) => {
            if (el) el.inert = !open;
          }}
          className={`absolute right-0 top-0 flex h-full z-[99] w-[80%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <img src="/logo.svg" alt="Safe Home" className="h-7" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="메뉴 닫기"
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="size-6" />
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto px-3 py-4">
            {menus.map((menu) => {
              const isActive = pathname.startsWith(menu.href);
              return (
                <li key={menu.href}>
                  <Link
                    href={menu.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition ${
                      isActive
                        ? "bg-[#006c4a]/10 text-[#006c4a]"
                        : "text-[#0b1c30] hover:bg-slate-50"
                    }`}
                  >
                    {menu.label}
                    <ChevronRight className="size-4 opacity-50" />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-slate-100 p-5">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onLogout}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold text-[#082d57] transition hover:bg-slate-50"
              >
                <LogOut className="size-4" />
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#002045] text-sm font-semibold text-white transition hover:bg-[#0b3c72]"
              >
                <LogIn className="size-4" />
                로그인
              </Link>
            )}
          </div>
        </nav>
      </div>
    </Portal>
  );
}
