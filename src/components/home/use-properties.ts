"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";
import type { PropertyRecord } from "@/types/property";

// buildingTypes가 null이면 전체, 배열이면 해당 건물 유형만 가져옴
export function useProperties(buildingTypes: readonly string[] | null) {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const typesKey = buildingTypes?.join(",") ?? "";

  useEffect(() => {
    const supabase = createClient();
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      let query = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (buildingTypes) {
        query = query.in("building_type", [...buildingTypes]);
      }

      const { data, error } = await query;
      if (ignore) return;
      if (error) console.error("매물 불러오기 실패", error.message);
      setProperties(data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      ignore = true;
    };
    // typesKey가 같으면 같은 조건이므로 다시 불러오지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesKey]);

  return { properties, isLoading };
}
