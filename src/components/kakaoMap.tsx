"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao?: any;
  }
}

export interface PropertyMarker {
  id: string;
  lat: number;
  lng: number;
  isSelected?: boolean;
}

interface KakaoMapProps {
  latitude?: number;
  longitude?: number;
  level?: number;
  markers?: PropertyMarker[];
}

// 지도 핀 모양 SVG를 파란색/빨간색으로 각각 만들어서 data URL로 반환
function createPinImageSrc(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${color}" />
    <circle cx="16" cy="16" r="6" fill="white" />
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const BLUE_PIN_IMAGE = createPinImageSrc("#2563eb");
const RED_PIN_IMAGE = createPinImageSrc("#dc2626");

export default function KakaoMap({
  latitude = 37.5665,
  longitude = 126.978,
  level = 3,
  markers = [],
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObjRef = useRef<any>(null);
  const propertyMarkerObjsRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // 처음엔 위치를 모르는 상태(null)로 시작 — 시청/서울역 같은 기본 좌표를 아예 보여주지 않기 위함
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  // 다른 페이지 갔다가 다시 돌아온 경우: 스크립트는 이미 로드돼 있는데
  // 이 컴포넌트는 새로 마운트돼서 isLoaded가 false로 초기화된 상태일 수 있음
  // → onLoad가 다시 안 불려도, 마운트될 때 한 번 직접 확인해서 잡아줌
  useEffect(() => {
    if (window.kakao?.maps) {
      setIsLoaded(true);
    }
  }, []);

  // 지도 생성 & 중심 이동 (현재 위치 마커 포함)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao?.maps || !center) return;

    window.kakao.maps.load(() => {
      const position = new window.kakao.maps.LatLng(center.lat, center.lng);

      if (!mapObjRef.current) {
        mapObjRef.current = new window.kakao.maps.Map(mapRef.current!, {
          center: position,
          level,
        });
      } else {
        mapObjRef.current.setCenter(position);
      }

      new window.kakao.maps.Marker({
        position,
        map: mapObjRef.current,
      });
    });
  }, [isLoaded, center, level]);

  // 매물 마커들 그리기 (markers 배열이나 선택 상태가 바뀔 때마다 다시 그림)
  useEffect(() => {
    if (!isLoaded || !window.kakao?.maps || !mapObjRef.current) return;

    window.kakao.maps.load(() => {
      // 이전에 그렸던 매물 마커들을 전부 지움
      propertyMarkerObjsRef.current.forEach((marker) => marker.setMap(null));
      propertyMarkerObjsRef.current = [];

      markers.forEach((item) => {
        const position = new window.kakao.maps.LatLng(item.lat, item.lng);

        const image = new window.kakao.maps.MarkerImage(
          item.isSelected ? RED_PIN_IMAGE : BLUE_PIN_IMAGE,
          new window.kakao.maps.Size(32, 40),
          { offset: new window.kakao.maps.Point(16, 40) },
        );

        const marker = new window.kakao.maps.Marker({
          position,
          map: mapObjRef.current,
          image,
        });

        propertyMarkerObjsRef.current.push(marker);
      });
    });
  }, [isLoaded, markers]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 성공: 진짜 현재 위치로 교체
        console.log("현재 위치 가져오기 성공:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // 실패(권한 거부 등): 이때만 기본 좌표(props로 받은 값)를 사용
        // code: 1=권한 거부, 2=위치 확인 불가, 3=시간 초과
        console.log("위치 가져오기 실패", {
          code: error.code,
          message: error.message,
        });
        setCenter({ lat: latitude, lng: longitude });
      },
    );
  }, []);
  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />

      {center ? (
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "calc(100% - 45px)",
            borderRadius: "12px",
            border: "solid 1px #c4c6cf",
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center text-sm text-gray-400"
          style={{
            width: "100%",
            height: "calc(100% - 45px)",
            borderRadius: "12px",
            border: "solid 1px #c4c6cf",
          }}
        >
          현재 위치를 확인하고 있어요...
        </div>
      )}
    </>
  );
}
