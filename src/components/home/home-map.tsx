"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { PropertyRecord } from "@/types/property";
import { formatPriceShort } from "./home-types";

// 기존 components/kakaoMap.tsx와 같은 주소여야 SDK가 두 번 로드되지 않음
const KAKAO_SDK_SRC = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청

type HomeMapProps = {
  properties: PropertyRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function HomeMap({
  properties,
  selectedId,
  onSelect,
}: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // 다른 페이지에서 이미 SDK를 불러온 경우 onLoad가 다시 안 불리므로 직접 확인
  useEffect(() => {
    if (window.kakao?.maps) setIsSdkLoaded(true);
  }, []);

  // 1) 지도 생성 (한 번만)
  useEffect(() => {
    if (!isSdkLoaded || !containerRef.current || mapRef.current) return;

    window.kakao.maps.load(() => {
      const { maps } = window.kakao;
      mapRef.current = new maps.Map(containerRef.current, {
        center: new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
        level: 7,
      });
      mapRef.current.addControl(
        new maps.ZoomControl(),
        maps.ControlPosition.RIGHT,
      );
      setIsMapReady(true);
    });
  }, [isSdkLoaded]);

  // 2) 매물 목록이 바뀌면 모든 매물이 보이도록 지도 범위 맞추기
  useEffect(() => {
    if (!isMapReady) return;
    const { maps } = window.kakao;
    const located = properties.filter((p) => p.latitude && p.longitude);
    if (located.length === 0) return;

    const bounds = new maps.LatLngBounds();
    located.forEach((p) => bounds.extend(new maps.LatLng(p.latitude, p.longitude)));
    mapRef.current.setBounds(bounds);
  }, [isMapReady, properties]);

  // 3) 가격 말풍선 마커 그리기 (선택 상태가 바뀌면 다시 그림)
  useEffect(() => {
    if (!isMapReady) return;
    const { maps } = window.kakao;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    properties.forEach((p) => {
      if (!p.latitude || !p.longitude) return;
      const isSelected = p.id === selectedId;

      const el = document.createElement("button");
      el.type = "button";
      el.textContent = formatPriceShort(p.price);
      el.className = isSelected
        ? "rounded-full bg-[#006c4a] px-3 py-1.5 text-xs font-bold text-white shadow-lg ring-2 ring-white"
        : "rounded-full bg-[#082d57] px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-[#0b3c72]";
      el.onclick = () => onSelectRef.current(p.id);

      overlaysRef.current.push(
        new maps.CustomOverlay({
          position: new maps.LatLng(p.latitude, p.longitude),
          content: el,
          yAnchor: 1.2,
          zIndex: isSelected ? 10 : 1,
          map: mapRef.current,
        }),
      );
    });
  }, [isMapReady, properties, selectedId]);

  // 4) 목록에서 매물을 고르면 그 위치로 지도 이동
  useEffect(() => {
    if (!isMapReady || !selectedId) return;
    const target = properties.find((p) => p.id === selectedId);
    if (!target?.latitude || !target.longitude) return;
    mapRef.current.panTo(
      new window.kakao.maps.LatLng(target.latitude, target.longitude),
    );
  }, [isMapReady, selectedId, properties]);

  return (
    <section className="relative h-[420px] overflow-hidden rounded-xl border border-[#c4c6cf] lg:h-full">
      <Script
        src={KAKAO_SDK_SRC}
        strategy="afterInteractive"
        onLoad={() => setIsSdkLoaded(true)}
      />
      <div ref={containerRef} className="h-full w-full" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9ff] text-sm text-gray-400">
          지도를 불러오는 중...
        </div>
      )}
    </section>
  );
}
