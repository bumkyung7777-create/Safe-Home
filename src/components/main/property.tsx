import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "@/components/main/main.css";
import Link from "next/link";
import type { PropertyProps } from "@/types/property";

export default function Property({ roomType }: PropertyProps) {
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
            {roomType.map((slide) => (
              <SwiperSlide key={slide.name}>
                <Link href="/">
                  <div className="relative h-48">
                    <div className="label-card  text-[#fff]">
                      <img src="/card_label.svg" alt="" />
                      {slide.label}
                    </div>
                    <img
                      className="w-full h-full object-cover"
                      src={slide.img}
                      alt={slide.name}
                    />
                  </div>
                  <div className="p-4">
                    <div>{slide.name}</div>
                    <div>{slide.price}</div>
                    <div>{slide.description}</div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
