"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  latitude?: number;
  longitude?: number;
  level?: number;
}

export default function KakaoMap({
  latitude = 37.5665,
  longitude = 126.978,
  level = 3,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const position = new window.kakao.maps.LatLng(latitude, longitude);

      const map = new window.kakao.maps.Map(mapRef.current!, {
        center: position,
        level,
      });

      new window.kakao.maps.Marker({
        position,
        map,
      });
    });
  }, [isLoaded, latitude, longitude, level]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "calc(100% - 45px)",
          borderRadius: "12px",
          border: "solid 1px #c4c6cf",
        }}
      />
    </>
  );
}
