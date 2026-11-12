"use client";

import Script from "next/script";
import { FormEvent, useCallback, useState } from "react";
import { Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { createClient } from "@/services/supabase/client";
import { useAuth } from "@/context/auth-context";
import AlertPopup from "@/components/common/alert-popup";
import SharePopup from "./share-popup";

// 카카오 공유용 SDK (지도 SDK와 별개) — window.Kakao 로 사용
type KakaoSDK = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: { sendDefault: (options: unknown) => void };
};
declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

type ProductActionsProps = {
  propertyId: string;
  title: string;
  priceText: string; // "매매 7억 8,000만원" 처럼 이미 보기 좋게 바꾼 가격
  address: string;
  imageUrl: string | null;
  initialLike: boolean; // DB에 저장된 like 값
};

type Message = { id: number; text: string; time: string };
type PopupState = { title: string; message: string; variant?: "warning" | "info" } | null;

export default function ProductActions({
  propertyId,
  title,
  priceText,
  address,
  imageUrl,
  initialLike,
}: ProductActionsProps) {
  const user = useAuth();
  const [like, setLike] = useState(initialLike);
  const [isSaving, setIsSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [popup, setPopup] = useState<PopupState>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const closeShare = useCallback(() => setShareOpen(false), []);
  const closePopup = useCallback(() => setPopup(null), []);

  // 로그인했을 때만 찜 상태(빨간 하트)를 보여줌
  const isLiked = Boolean(user) && like;

  // ───────── ① 찜하기 ─────────
  const handleLike = async () => {
    if (!user) {
      setPopup({
        title: "로그인이 필요해요",
        message: "찜하기는 로그인 후에 이용할 수 있어요.",
      });
      return;
    }
    if (isSaving) return;

    const next = !like;
    setLike(next); // 먼저 화면부터 바꾸기 (빠르게 느껴지도록)
    setIsSaving(true);

    // like 칸만 바꾸는 Supabase 함수 호출 (supabase-properties-table.sql 참고)
    const supabase = createClient();
    const { error } = await supabase.rpc("set_property_like", {
      p_id: propertyId,
      p_like: next,
    });
    setIsSaving(false);

    if (error) {
      setLike(!next); // 실패하면 원래대로 되돌리기
      console.error("찜하기 실패", error.message);
      setPopup({ title: "찜하기에 실패했어요", message: error.message });
    }
  };

  // ───────── ② 공유하기 ─────────
  const shareKakao = () => {
    const Kakao = window.Kakao;
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!Kakao || !key) {
      setPopup({
        title: "카카오톡 공유를 준비 중이에요",
        message: "잠시 후 다시 눌러 주세요.",
      });
      return;
    }
    if (!Kakao.isInitialized()) Kakao.init(key);

    const url = window.location.href;
    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${priceText} · ${title}`,
        description: address,
        imageUrl: imageUrl ?? `${window.location.origin}/logo.svg`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: "매물 보러 가기", link: { mobileWebUrl: url, webUrl: url } },
      ],
    });
    setShareOpen(false);
  };

  const shareNaver = () => {
    const url = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(`${priceText} · ${title}`);
    window.open(
      `https://share.naver.com/web/shareView?url=${url}&title=${shareTitle}`,
      "_blank",
      "noopener,noreferrer,width=600,height=700",
    );
    setShareOpen(false);
  };

  const copyLink = async () => {
    setShareOpen(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setPopup({
        title: "링크를 복사했어요",
        message: "원하는 곳에 붙여넣기(Ctrl+V) 해 보세요.",
        variant: "info",
      });
    } catch {
      setPopup({
        title: "복사에 실패했어요",
        message: "주소창의 링크를 직접 복사해 주세요.",
      });
    }
  };

  // ───────── ③ 메시지로 문의하기 (DB 저장 없이 화면에만 보여줌) ─────────
  const handleMessageSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: now.getTime(),
        text,
        time: now.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessageText("");
  };

  return (
    <>
      {/* 카카오 공유 SDK: 화면이 뜬 뒤 천천히 불러와도 됨 */}
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        strategy="lazyOnload"
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={isLiked}
          className={`flex h-12 items-center justify-center gap-2 rounded-lg border font-medium transition ${
            isLiked
              ? "border-[#e5484d] bg-[#e5484d]/5 text-[#e5484d]"
              : "border-[#002045] text-[#002045] hover:bg-[#002045]/5"
          }`}
        >
          <Heart
            className={`size-5 transition-transform ${isLiked ? "scale-110 fill-[#e5484d]" : ""}`}
          />
          {isLiked ? "찜 완료" : "찜하기"}
        </button>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#002045] font-medium text-[#002045] transition hover:bg-[#002045]/5"
        >
          <Share2 className="size-5" />
          공유하기
        </button>
      </div>

      <button
        type="button"
        onClick={() => setMessageOpen((v) => !v)}
        aria-expanded={messageOpen}
        aria-controls="message-area"
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#002045] text-lg font-semibold text-white transition hover:bg-[#0b3c72]"
      >
        <MessageCircle className="size-5" />
        {messageOpen ? "문의 닫기" : "메시지로 문의하기"}
      </button>

      {/* 메시지 영역: 버튼을 누르면 열림 */}
      {messageOpen && (
        <div id="message-area" className="mt-4 rounded-xl bg-[#f8f9ff] p-4">
          {messages.length > 0 ? (
            <ul className="mb-3 flex max-h-60 flex-col gap-2 overflow-y-auto">
              {messages.map((msg) => (
                <li key={msg.id} className="flex flex-col items-end gap-0.5">
                  <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-sm bg-[#002045] px-3.5 py-2 text-sm text-white">
                    {msg.text}
                  </p>
                  <span className="text-[11px] text-slate-400">{msg.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-sm text-slate-500">
              매물에 대해 궁금한 점을 남겨 주세요.
            </p>
          )}

          <form onSubmit={handleMessageSubmit} className="flex flex-col gap-2">
            <label htmlFor="message-input" className="sr-only">
              문의 메시지
            </label>
            <textarea
              id="message-input"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="예) 입주 가능한 날짜가 언제인가요?"
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#006c4a] focus:ring-2 focus:ring-[#006c4a]/15"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {messageText.length} / 500
              </span>
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#006c4a] px-4 text-sm font-semibold text-white transition hover:bg-[#00573c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="size-4" />
                등록
              </button>
            </div>
          </form>
        </div>
      )}

      <SharePopup
        open={shareOpen}
        onClose={closeShare}
        onKakao={shareKakao}
        onNaver={shareNaver}
        onCopy={copyLink}
      />
      <AlertPopup
        open={popup !== null}
        title={popup?.title ?? ""}
        message={popup?.message ?? ""}
        variant={popup?.variant}
        onClose={closePopup}
      />
    </>
  );
}
