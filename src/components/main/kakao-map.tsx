import { useState, useEffect, useMemo } from "react";
import type { RoomList } from "@/types/property";
import KakaoMap from "@/components/kakaoMap";
import { createClient } from "@/services/supabase/client";
import type { PropertyRecord } from "@/types/property";
import { formatPrice } from "@/utils/price";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

export default function KakaoMapArea({ roomList }: { roomList: RoomList }) {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const supabase = createClient();

  const getProducts = async () => {
    const { data, error } = await supabase.from("properties").select("*");

    if (data) {
      
      setProperties(data);
    }
  };

  useEffect(() => {
    if (properties.length === 0) {
      getProducts();
    }
  }, []);

  // 좌표가 있는 매물만 지도 마커 정보로 변환
  const markers = useMemo(
    () =>
      properties
        .filter(
          (property): property is PropertyRecord & {
            latitude: number;
            longitude: number;
          } => property.latitude !== null && property.longitude !== null,
        )
        .map((property) => ({
          id: property.id,
          lat: property.latitude,
          lng: property.longitude,
          isSelected: property.id === selectedId,
        })),
    [properties, selectedId],
  );

  return (
    <div className="bg-[#f8f9ff]">
      <ul className="flex max-w-[80.63rem] m-auto px-5 pt-5 pb-10 gap-6">
        <li className="flex-1">
          {/* "금주의 검증된 매물" 제목(property.tsx)과 같은 스타일 */}
          <div className="flex h-10 items-center justify-between mb-6">
            <p className="flex items-center gap-[0.63rem]">
              <span>
                <img src="/title_icon.svg" alt="" />
              </span>
              <span className="text-xl leading-[normal] text-[#0b1c30]">
                매물 정보
              </span>
            </p>
          </div>
          <KakaoMap
            latitude={37.5665}
            longitude={126.978}
            level={3}
            markers={markers}
          />
        </li>
        <li className="flex-1">
          <div className="flex h-10 items-center justify-between mb-6">
            <p className="text-base text-slate-500">
              총{" "}
              <strong className="text-xl font-bold text-[#002045]">
                {properties.length}
              </strong>
              개의 매물
            </p>
            <div>
              <button>
                <img src="/solt.svg" alt="" />
              </button>
              <div className="hidden">{/* solt 메뉴 */}</div>
            </div>
          </div>
          <ul className="flex h-[36.88rem] flex-col gap-4 overflow-y-auto p-1 pr-2">
            {properties.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <li key={item.id}>
                  {/* 카드 테두리는 바깥 div가 담당
                      (button 안에 Link(a)를 넣을 수 없어서 둘을 형제로 나란히 둠) */}
                  <div
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:shadow-lg ${
                      isSelected
                        ? "border-[#002045] ring-2 ring-[#002045]/20"
                        : "border-slate-200 hover:-translate-y-0.5 hover:border-[#8eadd2]"
                    }`}
                  >
                  {/* ① 카드 클릭 → 선택(지도 핀 빨간색) + 아래에 "상세 보기" 열림 */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    aria-expanded={isSelected}
                    className="group flex w-full gap-4 p-3 text-left"
                  >
                    {/* 썸네일 + 건물 유형 배지 */}
                    <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          이미지 없음
                        </div>
                      )}
                      <span className="absolute left-2 top-2 rounded-md bg-[#002045]/80 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        {item.building_type}
                      </span>
                    </div>

                    {/* 매물 정보 */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                      <p className="flex items-center gap-2">
                        {item.deal_type && (
                          <span className="rounded-md bg-[#006c4a]/10 px-2 py-0.5 text-xs font-bold text-[#006c4a]">
                            {item.deal_type}
                          </span>
                        )}
                        <span className="text-xl font-extrabold tracking-tight text-[#002045]">
                          {formatPrice(item.price)}
                        </span>
                      </p>
                      <strong className="truncate font-semibold text-slate-800">
                        {item.title}
                      </strong>
                      {item.description && (
                        <p className="line-clamp-1 text-sm text-slate-500">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </p>
                    </div>

                    {/* 선택되면 화살표가 아래(⌄)로 돌아감 → "펼쳐졌다"는 표시 */}
                    <ChevronRight
                      className={`size-5 shrink-0 self-center transition ${
                        isSelected
                          ? "rotate-90 text-[#002045]"
                          : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-[#002045]"
                      }`}
                    />
                  </button>

                  {/* ② 선택된 카드에만 보이는 "상세 보기" 링크 → /product/매물id */}
                  {isSelected && (
                    <div className="border-t border-slate-100 bg-[#f8f9ff] px-3 py-3">
                      <Link
                        href={`/product/${item.id}`}
                        className="group/link flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#002045] text-sm font-semibold text-white shadow-md transition hover:bg-[#0b3c72]"
                      >
                        상세 보기
                        <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  )}
                  </div>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </div>
  );
}
