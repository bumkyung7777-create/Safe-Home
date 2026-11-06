"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

// 매물 사진 슬라이드 (Swiper는 브라우저에서 움직여야 하므로 "use client")
export default function ProductGallery({ images, title }: ProductGalleryProps) {
  // 지금 보고 있는 사진 번호 (0부터 시작) → 오른쪽 아래 "1 / 5" 표시용
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-400 sm:aspect-[16/9]">
        등록된 사진이 없어요
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <Swiper
        modules={[Navigation, Keyboard]}
        navigation // 좌우 화살표
        keyboard // 키보드 ← → 로도 넘기기
        loop={images.length > 1}
        onSlideChange={(swiper) => setCurrent(swiper.realIndex)}
        className="product-gallery"
        style={
          {
            "--swiper-navigation-color": "#ffffff",
            "--swiper-navigation-size": "22px",
          } as React.CSSProperties
        }
      >
        {images.map((src, index) => (
          <SwiperSlide key={src}>
            {/* 모바일은 4:3, 태블릿 이상은 16:9 비율 */}
            <div className="aspect-[4/3] w-full sm:aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} 사진 ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 사진 번호 표시 */}
      <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm sm:bottom-4 sm:right-4 sm:text-sm">
        {current + 1} / {images.length}
      </span>
    </div>
  );
}
