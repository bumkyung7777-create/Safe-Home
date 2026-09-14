"useClient";
import {
  ShieldCheck,
  Receipt,
  ArrowUpCircle,
  CheckCircle2,
  Landmark,
  Shield,
} from "lucide-react";
import { TIERS } from "@/components/mypage/type/typeMyPage";
export const MembershipStatus = () => {
  return (
    <section className="w-full bg-white rounded-xl p-4 md:p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#002045]/10 text-[#002045] text-[11px] uppercase tracking-wider font-bold">
              Tier System &amp; Paid Verification
            </span>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5">
              <CheckCircle2 className="h-4 w-4" />
              보증심사 자동 패스 활성화
            </span>
          </div>
          <h2 className="text-xl text-[#002045] font-bold mt-1">
            멤버십 등급 및 안심 라벨링 보증 현황
          </h2>
          <p className="text-sm text-gray-500">
            납부 등급에 따라 정부 공인 HUG/HF/SGI 보증기관 실시간 연동 라벨이
            부여되며 검색 결과 상단에 우선 매칭됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#002045] text-sm font-bold transition-colors flex items-center gap-1.5"
          >
            <Receipt className="h-[18px] w-[18px]" />
            <span>라벨링 갱신/결제 내역</span>
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-[#002045] hover:bg-[#002045]/90 text-white text-sm font-bold transition-shadow shadow-sm flex items-center gap-1.5"
          >
            <ArrowUpCircle className="h-[18px] w-[18px]" />
            <span>VIP 등급 승급 신청</span>
          </button>
        </div>
      </div>

      {/* 등급 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            className={`p-4 rounded-xl flex flex-col justify-between ${
              tier.current
                ? "bg-[#002045] text-white shadow-md"
                : "bg-gray-50 hover:bg-gray-100 transition-colors"
            }`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase ${
                    tier.current ? "text-emerald-300" : "text-gray-500"
                  }`}
                >
                  {tier.tag}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    tier.current
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {tier.tagSub}
                </span>
              </div>
              <span
                className={`text-lg font-bold ${
                  tier.current ? "text-white" : "text-[#002045]"
                }`}
              >
                {tier.name}
              </span>
              <span
                className={`text-base font-bold mt-1 ${
                  tier.current ? "text-white" : "text-gray-800"
                }`}
              >
                {tier.price}{" "}
                <span className="text-xs font-normal opacity-70">/월</span>
              </span>

              <ul
                className={`mt-2 flex flex-col gap-1.5 text-[13px] ${
                  tier.current ? "text-gray-100" : "text-gray-700"
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-4 w-4 flex-none ${
                        feature.ok
                          ? tier.current
                            ? "text-emerald-300"
                            : "text-emerald-500"
                          : "text-gray-300"
                      }`}
                    />
                    <span className={feature.ok ? "" : "text-gray-400"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`mt-4 pt-3 text-center text-[12px] font-medium ${
                tier.current
                  ? "bg-[#002045]/60 rounded-lg px-3 py-2 text-gray-100"
                  : "text-gray-400"
              }`}
            >
              {tier.footer}
            </div>
          </div>
        ))}
      </div>

      {/* 보증 라벨 발급 현황 바 */}
      <div className="p-4 rounded-xl bg-gray-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#002045] shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-[#002045] font-bold">
              보증 라벨링 발급 및 활성 상태 현황
            </span>
            <span className="text-[13px] text-gray-500">
              기관 검증 API 데이터베이스와 실시간 동기화 중입니다 (오차 보증제
              적용)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-[18px] w-[18px]" />
            <span className="text-sm font-bold">HUG 안심전세</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Landmark className="h-[18px] w-[18px]" />
            <span className="text-sm font-bold">HF 주택금융보증</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Shield className="h-[18px] w-[18px]" />
            <span className="text-sm font-bold">SGI 보증</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </section>
  );
};
