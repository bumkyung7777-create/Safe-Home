import { useState, useEffect, useMemo } from "react";
import type { RoomList } from "@/types/property";
import KakaoMap from "@/components/kakaoMap";
import { createClient } from "@/services/supabase/client";
import type { PropertyRecord } from "@/types/property";

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
          <div className="flex items-center justify-between pb-6">
            <p>매물 정보</p>
          </div>
          <KakaoMap
            latitude={37.5665}
            longitude={126.978}
            level={3}
            markers={markers}
          />
        </li>
        <li className="flex-1">
          <div className="flex items-center justify-between pb-6">
            <p>총 24개</p>
            <div>
              <button>
                <img src="/solt.svg" alt="" />
              </button>
              <div className="hidden">{/* solt 메뉴 */}</div>
            </div>
          </div>
          <ul className="flex flex-col gap-6 h-[36.88rem] overflow-hidden">
            {properties.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex font-card gap-4 w-full text-left ${
                    item.id === selectedId
                      ? "ring-2 ring-[#002045] rounded-md"
                      : ""
                  }`}
                >
                  {item.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      이미지 없음
                    </div>
                  )}
                  <div className="card-info">
                    <p>
                      <span>{item.price}</span>
                    </p>
                    <strong>{item.description}</strong>
                    <p>주소 : {item.address}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
