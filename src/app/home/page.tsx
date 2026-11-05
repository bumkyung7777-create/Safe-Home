"use client";

import { useState } from "react";
import HomeMap from "@/components/home/home-map";
import HomeList from "@/components/home/home-list";
import { HOME_TYPES } from "@/components/home/home-types";
import { useProperties } from "@/components/home/use-properties";

export default function HomePage() {
  const { properties, isLoading } = useProperties(
    HOME_TYPES.all.buildingTypes,
  );
  // 지도와 목록이 같은 선택 상태를 공유 (마커 클릭 ↔ 카드 클릭)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
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
      />
    </>
  );
}
