"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import AlertPopup from "@/components/common/alert-popup";

// 아직 페이지가 없는 메뉴들 → 누르면 "준비 중" 팝업
const FOOTER_MENUS = [
  "About Us",
  "Privacy Policy",
  "Institutional Terms",
  "Contact Support",
];

export default function Footer() {
  // 누른 메뉴 이름 (null이면 팝업 닫힘)
  const [readyMenu, setReadyMenu] = useState<string | null>(null);
  const closePopup = useCallback(() => setReadyMenu(null), []);

  return (
    <footer>
      <div className="m-auto max-w-[80.63rem] px-4 py-8 sm:px-5">
        <Link href="/">
          <img src="/bottomLogo.svg" alt="Logo" />
        </Link>
        {/* 모바일·태블릿: 세로(문구 위, 메뉴 아래) / lg(1024px) 이상: 가로 양쪽 정렬 */}
        <div className="flex flex-col gap-4 pt-4 text-xs opacity-80 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-[#ffffff] sm:text-[14px]">
              © 2024 SafeHome Institutional Real Estate. All rights reserved.
              <br />
              Verified status is subject to HUG/HF audit.
            </p>
          </div>
          {/* flex-wrap: 화면이 좁으면 메뉴가 다음 줄로 넘어가게 */}
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#ffffff] lg:ml-10">
            {FOOTER_MENUS.map((menu) => (
              <li key={menu}>
                {/* 이동할 페이지가 없으니 Link가 아니라 button */}
                <button
                  type="button"
                  onClick={() => setReadyMenu(menu)}
                  className="hover:underline hover:underline-offset-2"
                >
                  {menu}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AlertPopup
        open={readyMenu !== null}
        variant="info"
        title="준비 중입니다"
        message={`${readyMenu ?? ""} 페이지는 현재 준비 중이에요.\n조금만 기다려 주세요!`}
        onClose={closePopup}
      />
    </footer>
  );
}
