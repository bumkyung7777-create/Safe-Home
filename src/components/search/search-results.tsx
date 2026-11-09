"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import HomeMap from "@/components/home/home-map";
import HomeList from "@/components/home/home-list";
import { useSearchProperties } from "./use-search-properties";

// /search 화면 본문: /home과 같은 [지도 | 목록] 구성 + 검색어 강조
export default function SearchResults({ keyword }: { keyword: string }) {
  const { properties, isLoading } = useSearchProperties(keyword);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="bg-[#f8f9ff]">
      <div className="m-auto max-w-[80.63rem] px-5 pt-6">
        <h1 className="flex flex-wrap items-center gap-2 text-xl text-[#0b1c30]">
          <Search className="size-5 text-[#006c4a]" />
          {keyword ? (
            <>
              <mark className="rounded bg-[#ffe066] px-1.5 font-bold text-[#002045]">
                {keyword}
              </mark>
              <span>검색 결과</span>
              {!isLoading && (
                <span className="text-base text-slate-500">
                  {properties.length}개
                </span>
              )}
            </>
          ) : (
            <span>검색어를 입력해 주세요</span>
          )}
        </h1>
      </div>

      <div className="m-auto grid max-w-[80.63rem] gap-6 px-5 py-5 lg:h-[calc(100vh-180px)] lg:min-h-[560px] lg:grid-cols-2">
        <HomeMap
          properties={properties}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <HomeList
          properties={properties}
          isLoading={isLoading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          highlight={keyword}
          emptyMessage={
            keyword
              ? `"${keyword}"에 맞는 매물이 없어요. 동네 이름이나 건물 유형으로 검색해 보세요.`
              : "위 검색창에 동네 이름, 매물 제목 등을 입력해 보세요."
          }
        />
      </div>
    </main>
  );
}
