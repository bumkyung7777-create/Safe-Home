import type { PropertyRecord } from "@/types/property";
import { formatPrice } from "@/utils/price";

// 사진 아래에 보이는 "상세 정보" 영역 (탭 없이 정보만 나열)
export default function ProductInfo({ property }: { property: PropertyRecord }) {
  const floor =
    property.current_floor != null
      ? `${property.current_floor}층${property.total_floor ? ` / 총 ${property.total_floor}층` : ""}`
      : null;

  const managementFee = property.no_management_fee
    ? "없음"
    : property.management_fee != null
      ? `${property.management_fee.toLocaleString()}만원`
      : null;

  // [이름, 값] 목록 → 값이 비어 있는(null) 항목은 화면에서 빼기
  const rows: [string, string | null][] = [
    ["건물 유형", property.building_type],
    ["거래 유형", property.deal_type],
    ["가격", formatPrice(property.price)],
    ["층수", floor],
    ["관리비", managementFee],
    [
      "관리비 포함",
      property.included_items.length > 0
        ? property.included_items.join(", ")
        : null,
    ],
    ["주소", [property.address, property.sub_address].filter(Boolean).join(" ")],
    ["등록일", new Date(property.created_at).toLocaleDateString("ko-KR")],
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-200 px-5 py-4 text-lg font-bold text-[#002045] sm:px-6">
        상세 정보
      </h2>

      {/* 모바일 1열, 태블릿 이상 2열 */}
      <dl className="grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-slate-500">{label}</dt>
              <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
            </div>
          ))}
      </dl>

      {property.description && (
        <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
          <h3 className="text-xs font-medium text-slate-500">매물 설명</h3>
          {/* whitespace-pre-line: 등록할 때 넣은 줄바꿈을 그대로 보여줌 */}
          <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">
            {property.description}
          </p>
        </div>
      )}
    </section>
  );
}
