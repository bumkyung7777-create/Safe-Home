"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { Link2, X } from "lucide-react";
import Portal from "@/components/common/portal";

type SharePopupProps = {
  open: boolean;
  onClose: () => void;
  onKakao: () => void;
  onNaver: () => void;
  onCopy: () => void;
};

// 공유 방법을 고르는 팝업 (카카오톡 / 네이버 / 링크 복사)
export default function SharePopup({
  open,
  onClose,
  onKakao,
  onNaver,
  onCopy,
}: SharePopupProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // 열려 있는 동안: ESC로 닫기 + 뒤 화면 스크롤 막기 + 닫기 버튼에 포커스
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleDimClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const items = [
    {
      label: "카카오톡",
      onClick: onKakao,
      icon: (
        <span className="flex size-14 items-center justify-center rounded-full bg-[#FEE500] text-lg font-black text-[#3c1e1e]">
          K
        </span>
      ),
    },
    {
      label: "네이버",
      onClick: onNaver,
      icon: (
        <span className="flex size-14 items-center justify-center rounded-full bg-[#03C75A] text-lg font-black text-white">
          N
        </span>
      ),
    },
    {
      label: "링크 복사",
      onClick: onCopy,
      icon: (
        <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-[#002045]">
          <Link2 className="size-6" />
        </span>
      ),
    },
  ];

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
        onClick={handleDimClick}
      >
        {/* 모바일: 아래에서 올라오는 시트 / sm 이상: 가운데 팝업 */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-popup-title"
          className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <h2
              id="share-popup-title"
              className="text-lg font-bold text-[#002045]"
            >
              매물 공유하기
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="공유 팝업 닫기"
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-2">
            {items.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full flex-col items-center gap-2 rounded-xl py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Portal>
  );
}
