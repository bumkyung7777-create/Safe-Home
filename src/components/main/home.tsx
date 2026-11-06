"use client";
import { useEffect, useState } from "react";
import RoomType from "@/components/main/Room-type";
import { fakeDate } from "@/app/service/fakeDate";
import Property from "@/components/main/property";
import KakaoMap from "./kakao-map";
import { createClient } from "@/services/supabase/client";
import type { PropertyRecord } from "@/types/property";

export default function Home() {
  // Supabase properties 테이블의 매물 → Property 슬라이드에 props로 전달
  const [properties, setProperties] = useState<PropertyRecord[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("매물 불러오기 실패", error.message);
        setProperties(data ?? []);
      });
  }, []);

  return (
    <>
      <RoomType />
      <Property properties={properties} />
      <KakaoMap roomList={fakeDate} />
    </>
  );
}
