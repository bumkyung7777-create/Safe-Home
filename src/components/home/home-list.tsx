"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PropertyRecord } from "@/types/property";
import { formatPrice } from "./home-types";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import HighlightText from "@/components/search/highlight-text";

const SORT_OPTIONS = {
  latest: "최신순",
  priceAsc: "낮은 가격순",
  priceDesc: "높은 가격순",
} as const;
type SortKey = keyof typeof SORT_OPTIONS;

type HomeListProps = {
  properties: PropertyRecord[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  // (검색 페이지 전용) 이 글자를 제목·주소·설명에서 색칠해서 보여줌
  highlight?: string;
  // 결과가 없을 때 보여줄 문구 (안 넘기면 기본 문구)
  emptyMessage?: string;
};

export default function HomeList({
  properties,
  isLoading,
  selectedId,
  onSelect,
  highlight,
  emptyMessage = "등록된 매물이 없어요.",
}: HomeListProps) {
  const [sort, setSort] = useState<SortKey>("latest");
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const sorted = useMemo(() => {
    const list = [...properties];
    if (sort === "priceAsc")
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "priceDesc")
      list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return list; // latest: 이미 created_at 내림차순으로 받아옴
  }, [properties, sort]);

  // 지도에서 마커를 누르면 목록의 해당 카드로 스크롤
  useEffect(() => {
    if (selectedId) {
      itemRefs.current[selectedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  return (
    <section className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between pb-4">
        <p className="text-lg font-semibold text-[#082d57]">
          매물 {isLoading ? "-" : sorted.length}개
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          정렬
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[#082d57]"
          >
            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="py-20 text-center text-sm text-gray-400">
          매물을 불러오는 중...
        </p>
      ) : sorted.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {sorted.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <li
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`flex w-full overflow-hidden rounded-xl border bg-white text-left transition hover:shadow-md ${
                    isSelected
                      ? "border-[#006c4a] ring-2 ring-[#006c4a]/30"
                      : "border-slate-200"
                  }`}
                >
                  <div className="relative h-36 w-40 shrink-0 bg-slate-100 sm:w-56">
                    {item.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        이미지 없음
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-[#082d57]">
                      {item.building_type}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
                    {/* HUG / HF 인증이 true인 매물만 체크 마크 표시 */}
                    {(item.hug_mark || item.hf_mark) && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.hug_mark && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#006c4a]/10 px-2 py-0.5 text-[11px] font-bold text-[#006c4a]">
                            <ShieldCheck className="size-3.5" />
                            HUG 인증
                          </span>
                        )}
                        {item.hf_mark && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#082d57]/10 px-2 py-0.5 text-[11px] font-bold text-[#082d57]">
                            <BadgeCheck className="size-3.5" />
                            HF 인증
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-lg font-bold text-[#082d57]">
                      {item.deal_type && (
                        <span className="mr-1.5 text-[#006c4a]">
                          {item.deal_type}
                        </span>
                      )}
                      {formatPrice(item.price)}
                    </p>
                    <p className="truncate font-medium text-slate-800">
                      <HighlightText text={item.title} keyword={highlight} />
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      <HighlightText text={item.address} keyword={highlight} />
                    </p>
                    {/* 검색 중이고, 설명에 검색어가 들어 있을 때만 설명 한 줄 보여주기 */}
                    {highlight &&
                      item.description
                        ?.toLowerCase()
                        .includes(highlight.trim().toLowerCase()) && (
                        <p className="line-clamp-1 text-sm text-slate-500">
                          <HighlightText
                            text={item.description}
                            keyword={highlight}
                          />
                        </p>
                      )}
                    <p className="text-sm text-slate-500">
                      {item.current_floor != null &&
                        `${item.current_floor}층${item.total_floor ? ` / ${item.total_floor}층` : ""}`}
                      {item.no_management_fee
                        ? " · 관리비 없음"
                        : item.management_fee != null &&
                          ` · 관리비 ${item.management_fee}만`}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
