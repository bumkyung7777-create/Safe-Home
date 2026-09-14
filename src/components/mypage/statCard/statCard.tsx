"useClient";
import type { Role } from "@/types/user";
import { useState } from "react";
import { useUserProfile } from "@/context/auth-context";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  PropertyStatus,
  PROPERTIES,
  ROLE_CONTENT,
  PROPERTY_FILTERS,
} from "@/components/mypage/type/typeMyPage";
export const StatCard = () => {
  const { role: accountRole } = useUserProfile();
  const [role, setRole] = useState<Role>(accountRole);
  const content = ROLE_CONTENT[role];

  const statusCounts = PROPERTIES.reduce(
    (counts, property) => {
      // 지금까지 센값을 가져오는데 만약 없으면 0으로 초기화하고 1을 더해서 다시 넣어준다.
      counts[property.status] = (counts[property.status] ?? 0) + 1;
      return counts;
    },
    {} as Record<PropertyStatus, number>,
  );
  const [propertyFilter, setPropertyFilter] = useState<"all" | PropertyStatus>(
    "all",
  );
  const filteredProperties = PROPERTIES.filter(
    (property) =>
      propertyFilter === "all" || property.status === propertyFilter,
  );
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-lg text-[#002045] font-bold">
              {content.managementTitle}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {content.managementDesc}
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {PROPERTY_FILTERS.map((filter) => {
            const count =
              filter.value === "all"
                ? PROPERTIES.length
                : (statusCounts[filter.value] ?? 0);

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setPropertyFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  propertyFilter === filter.value
                    ? "bg-[#002045] text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                }`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredProperties.map((property) => {
          return (
            <article
              key={property.id}
              className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-none shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#002045]/90 backdrop-blur-sm text-white text-[10px] font-bold">
                    {property.type}
                  </span>
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {property.labels.map((label) => {
                      const LabelIcon = label.icon;

                      return (
                        <span
                          key={label.text}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1"
                        >
                          <LabelIcon className="h-[13px] w-[13px]" />
                          <span>{label.text}</span>
                        </span>
                      );
                    })}
                  </div>

                  <h3 className="text-lg text-[#002045] font-bold truncate">
                    {property.title}
                  </h3>

                  <p className="text-[13px] text-gray-500">
                    {property.priceLine}
                  </p>

                  <span
                    className={`text-[11px] ${
                      property.noteTone === "error"
                        ? "text-red-600 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {property.noteLine}
                  </span>
                </div>
              </div>

              <div className="flex md:flex-col items-center sm:items-end justify-end gap-1.5 w-full md:w-auto pt-2 md:pt-0">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  {property.status === "review" ? (
                    <>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-semibold transition-colors"
                      >
                        심사 중
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-[#002045] text-sm font-semibold transition-colors"
                      >
                        매물 수정
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {filteredProperties.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            해당 조건에 맞는 매물이 없습니다.
          </p>
        )}
      </div>

      <Link
        href="/join/registration"
        className="w-full py-3.5 rounded-xl bg-[#002045] hover:bg-[#002045]/95 text-white text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="h-[18px] w-[18px]" />
        </div>
        <span>새 매물 등록하고 HUG/HF 안심 라벨링 받기</span>
      </Link>
    </div>
  );
};
