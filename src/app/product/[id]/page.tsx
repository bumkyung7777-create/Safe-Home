import { notFound } from "next/navigation";
import { BadgeCheck, Heart, MessageCircle, Share2, ShieldCheck } from "lucide-react";
import { createClient } from "@/services/supabase/server";
import type { PropertyRecord } from "@/types/property";
import { formatPrice } from "@/utils/price";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";

// 주소의 [id] 부분이 params.id 로 들어옴
//   예) /product/abc-123  →  params.id === "abc-123"
export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // 1) 서버에서 Supabase로 이 id의 매물 한 개만 가져오기
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  // 2) 없는 매물이면 404 페이지
  if (!data) notFound();
  const property = data as PropertyRecord;

  // 3) 대표 사진 + 상세 사진을 하나의 배열로 (같은 사진 중복 제거)
  const images = Array.from(
    new Set(
      [property.thumbnail_url, ...property.detail_image_urls].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  );

  return (
    <main className="min-h-screen bg-[#f8f9ff]">
      <div className="mx-auto max-w-[80.63rem] px-4 py-6 sm:px-5 sm:py-10">
        {/* ── 상단: 인증 배지 + 가격 + 제목 ── */}
        <header className="mb-6">
          {(property.hug_mark || property.hf_mark) && (
            <div className="mb-3 flex flex-wrap gap-2">
              {property.hug_mark && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#006c4a]/40 bg-[#006c4a]/5 px-2 py-0.5 text-xs font-semibold text-[#006c4a]">
                  <ShieldCheck className="size-3.5" />
                  HUG 인증
                </span>
              )}
              {property.hf_mark && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#006c4a]/40 bg-[#006c4a]/5 px-2 py-0.5 text-xs font-semibold text-[#006c4a]">
                  <BadgeCheck className="size-3.5" />
                  HF 대출 가능
                </span>
              )}
            </div>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-[#002045] sm:text-4xl">
            {property.deal_type && `${property.deal_type} `}
            {formatPrice(property.price)}
          </h1>
          <p className="mt-2 text-slate-600">
            {property.title}
            <span className="mx-2 text-slate-300">•</span>
            {property.building_type}
          </p>
        </header>

        {/* ── 본문: 왼쪽(사진+정보) / 오른쪽(문의 카드) ──
            모바일: 위아래로 쌓임 / 큰 화면(lg): 좌우 2칸 */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-col gap-6">
            <ProductGallery images={images} title={property.title} />
            <ProductInfo property={property} />
          </div>

          {/* lg:sticky → 큰 화면에서 스크롤해도 오른쪽 카드가 따라옴 */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(0,32,69,0.08)] sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-3 rounded-xl bg-[#eef3ff] p-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#006c4a] text-white">
                <ShieldCheck className="size-6" />
              </span>
              <div>
                <p className="font-semibold text-[#002045]">
                  {property.hug_mark || property.hf_mark
                    ? "보증 인증 매물"
                    : "인증 확인 중"}
                </p>
                <p className="text-xs text-slate-500">
                  {property.hug_mark && property.hf_mark
                    ? "HUG · HF 모두 확인됨"
                    : property.hug_mark
                      ? "HUG 보증 확인됨"
                      : property.hf_mark
                        ? "HF 대출 가능"
                        : "보증 정보가 아직 없어요"}
                </p>
              </div>
            </div>

            <div className="my-5 h-px bg-slate-200" />

            {/* TODO: 찜하기 / 공유하기 / 문의하기 기능은 아직 연결 전 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#002045] font-medium text-[#002045] transition hover:bg-[#002045]/5"
              >
                <Heart className="size-5" />
                찜하기
              </button>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#002045] font-medium text-[#002045] transition hover:bg-[#002045]/5"
              >
                <Share2 className="size-5" />
                공유하기
              </button>
            </div>
            <button
              type="button"
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#002045] text-lg font-semibold text-white transition hover:bg-[#0b3c72]"
            >
              <MessageCircle className="size-5" />
              메시지로 문의하기
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
