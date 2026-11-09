"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Download, ExternalLink, FileText, X } from "lucide-react";

// localStorage에 저장할 이름과 PDF 경로
const HIDE_KEY = "safe-home:intro-hide-until";
const PDF_PATH = "/safe-home-portfolio.pdf";
const GITHUB_URL = "https://github.com/bumkyung7777-create/Safe-Home";

// 저장소 읽기/쓰기는 시크릿 창 등에서 막힐 수 있어서 try/catch로 감쌈
function isHiddenToday() {
  try {
    const until = Number(localStorage.getItem(HIDE_KEY));
    return until > Date.now();
  } catch {
    return false;
  }
}

function hideUntilTomorrow() {
  try {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0); // 오늘 밤 12시(자정)까지
    localStorage.setItem(HIDE_KEY, String(tomorrow.getTime()));
  } catch {
    /* 저장 못 해도 팝업만 닫히면 됨 */
  }
}

export default function IntroPopup() {
  // open: 팝업이 보이는지 (display:none 대신 "상태"로 보여주고 숨김)
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 처음 화면이 그려진 뒤, "오늘 하루 보지 않기"를 안 눌렀으면 열기
  // (서버에는 localStorage가 없어서 useEffect 안에서 확인)
  useEffect(() => {
    if (!isHiddenToday()) setOpen(true);
  }, []);

  // 팝업이 열려 있는 동안: ESC로 닫기 + 뒤 화면 스크롤 막기 + 닫기 버튼에 포커스
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    // 정리(cleanup): 닫히면 원래대로 되돌리기
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // dim(검은 배경)을 "직접" 눌렀을 때만 닫기 — 팝업 안쪽 클릭은 무시
  const handleDimClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  const handleHideToday = () => {
    hideUntilTomorrow();
    setOpen(false);
  };

  return (
    <>
      {/* 닫은 뒤에도 다시 열 수 있는 작은 버튼 */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#082d57] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#002045]"
        >
          <FileText className="size-4" />
          프로젝트 소개
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={handleDimClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-popup-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* 상단 컬러 영역 */}
            <div className="bg-gradient-to-br from-[#082d57] to-[#006c4a] px-6 pb-6 pt-8 text-white">
              <p className="text-xs font-semibold tracking-widest text-white/70">
                PORTFOLIO PROJECT
              </p>
              <h2
                id="intro-popup-title"
                className="mt-2 text-2xl font-bold leading-snug"
              >
                전세사기 걱정 없는
                <br />
                안전 매물 플랫폼, Safe Home
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="팝업 닫기"
                className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <p className="text-sm leading-relaxed text-slate-600">
                HUG · HF 인증 매물을 지도와 목록으로 한눈에 비교하는 부동산
                서비스예요. 기획 의도, 주요 기능, 기술 스택, 트러블슈팅을
                PDF에 정리했어요.
              </p>

              <ul className="flex flex-wrap gap-1.5">
                {["Next.js 14", "TypeScript", "Supabase", "Kakao Map", "Tailwind"].map(
                  (tech) => (
                    <li
                      key={tech}
                      className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-[#082d57]"
                    >
                      {tech}
                    </li>
                  ),
                )}
              </ul>

              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href={PDF_PATH}
                  download="safe-home-portfolio.pdf"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#006c4a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#00573c]"
                >
                  <Download className="size-4" />
                  소개서 PDF 받기
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-[#082d57] transition hover:bg-slate-50"
                >
                  <ExternalLink className="size-4" />
                  GitHub 보기
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3 text-sm">
              <button
                type="button"
                onClick={handleHideToday}
                className="text-slate-500 hover:text-slate-800"
              >
                오늘 하루 보지 않기
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-semibold text-[#082d57]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
