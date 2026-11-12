"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { AlertCircle, Clock } from "lucide-react";
import Portal from "@/components/common/portal";

type AlertPopupProps = {
  open: boolean; // 보이는지 여부 (부모가 상태로 관리)
  title: string;
  message: string;
  onClose: () => void;
  // warning: 주황 느낌표(경고) / info: 초록 시계(안내·준비 중)
  variant?: "warning" | "info";
};

// 공통 알림 팝업 — alert() 대신 사용 (dim + 가운데 레이어)
export default function AlertPopup({
  open,
  title,
  message,
  onClose,
  variant = "warning",
}: AlertPopupProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // 열려 있는 동안: ESC로 닫기 + 뒤 화면 스크롤 막기 + 확인 버튼에 포커스
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  // dim을 "직접" 눌렀을 때만 닫기 (팝업 안쪽 클릭은 무시)
  const handleDimClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
        onClick={handleDimClick}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="alert-popup-title"
          aria-describedby="alert-popup-message"
          className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          {variant === "info" ? (
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#006c4a]/10">
              <Clock className="size-6 text-[#006c4a]" />
            </div>
          ) : (
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fff4e5]">
              <AlertCircle className="size-6 text-[#e8590c]" />
            </div>
          )}
          <h2
            id="alert-popup-title"
            className="mt-4 text-lg font-bold text-[#082d57]"
          >
            {title}
          </h2>
          <p
            id="alert-popup-message"
            className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600"
          >
            {message}
          </p>
          <button
            ref={confirmRef}
            type="button"
            onClick={onClose}
            className="mt-6 h-12 w-full rounded-lg bg-[#082d57] font-semibold text-white transition hover:bg-[#006c4a]"
          >
            확인
          </button>
        </div>
      </div>
    </Portal>
  );
}
