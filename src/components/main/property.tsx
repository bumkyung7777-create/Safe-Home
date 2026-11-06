import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "@/components/main/main.css";
import Link from "next/link";
import type { PropertyProps } from "@/types/property";
import { formatPrice } from "@/utils/price";
import { MapPin } from "lucide-react";

export default function Property({ properties }: PropertyProps) {
  return (
    <div className="bg-[#f8f9ff]">
      <div className="max-w-[80.63rem] m-auto px-5 pt-5 pb-10">
        <p className="flex gap-[0.63rem] items-center">
          <span>
            <img src="/title_icon.svg" alt="" />
          </span>
          <span className="text-xl leading-[normal] text-[#0b1c30]">
            금주의 검증된 매물
          </span>
        </p>
        <div className="swiper-container mt-3">
          <Swiper
            loop={true}
            spaceBetween={10}
            slidesPerView="auto"
            navigation={true}
            autoplay={true}
          >
            {properties.map((slide) => {
              // HUG 또는 HF 인증(true)이 하나라도 있는 매물만 노출
              // 둘 다 인증된 매물만 보이게 하려면 || 를 && 로 바꾸면 됨
              if (!(slide.hug_mark || slide.hf_mark)) return null;

              const label =
                slide.hug_mark && slide.hf_mark
                  ? "HUG · HF verified"
                  : slide.hug_mark
                    ? "HUG verified"
                    : "HF verified";

              return (
                <SwiperSlide key={slide.id}>
                  <Link href="/">
                    <div className="relative h-48">
                      <div className="label-card  text-[#fff]">
                        <img src="/card_label.svg" alt="" />
                        {label}
                      </div>
                      {slide.thumbnail_url ? (
                        <img
                          className="w-full h-full object-cover"
                          src={slide.thumbnail_url}
                          alt={slide.title}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-gray-400">
                          이미지 없음
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 p-4">
                      {/* 건물 유형 + 거래 유형 태그 */}
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-[#002045]/5 px-2 py-0.5 text-[11px] font-semibold text-[#002045]">
                          {slide.building_type}
                        </span>
                        {slide.deal_type && (
                          <span className="rounded-md bg-[#006c4a]/10 px-2 py-0.5 text-[11px] font-bold text-[#006c4a]">
                            {slide.deal_type}
                          </span>
                        )}
                      </div>

                      {/* 가격: 가장 크게 강조 */}
                      <p className="text-xl font-extrabold tracking-tight text-[#002045]">
                        {formatPrice(slide.price)}
                      </p>

                      <p className="truncate font-semibold text-slate-800">
                        {slide.title}
                      </p>

                      {slide.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {slide.description}
                        </p>
                      )}

                      <p className="mt-1 flex items-center gap-1 border-t border-slate-100 pt-2.5 text-xs text-slate-400">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{slide.address}</span>
                      </p>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
