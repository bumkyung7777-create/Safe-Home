"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";
import type { PropertyRecord } from "@/types/property";

// 검색어로 매물 찾기 (Supabase가 내부적으로 REST API로 요청을 보냄)
export function useSearchProperties(keyword: string) {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // , ( ) 는 .or() 조건을 구분하는 기호, % _ 는 ilike의 와일드카드라서 빼고 검색
    const word = keyword.replace(/[,()%_\\]/g, " ").trim();

    if (!word) {
      setProperties([]);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let ignore = false; // 검색어를 빨리 바꿨을 때 예전 결과가 늦게 와서 덮어쓰는 것 방지
    setIsLoading(true);

    supabase
      .from("properties")
      .select("*")
      // ilike = 대소문자 구분 없이 "포함"하는지 (%검색어% = 앞뒤에 뭐가 있어도 됨)
      // or = 아래 4개 칸 중 "하나라도" 포함하면 결과에 넣기
      .or(
        [
          `title.ilike.%${word}%`,
          `address.ilike.%${word}%`,
          `description.ilike.%${word}%`,
          `building_type.ilike.%${word}%`,
        ].join(","),
      )
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) console.error("검색 실패", error.message);
        setProperties(data ?? []);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [keyword]);

  return { properties, isLoading };
}
