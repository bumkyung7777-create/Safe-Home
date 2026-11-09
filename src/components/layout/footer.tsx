import Link from "next/link";
export default function Footer() {
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
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Institutional Terms</Link>
            </li>
            <li>
              <Link href="/contact">Contact Support</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
