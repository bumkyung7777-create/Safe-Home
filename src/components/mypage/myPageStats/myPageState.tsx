"useClient";
import type { Role } from "@/types/user";
import { useState } from "react";
import { ROLE_CONTENT } from "@/components/mypage/type/typeMyPage";
import { useUserProfile } from "@/context/auth-context";
import {
  Building2,
  TrendingUp,
  MessagesSquare,
  CreditCard,
  Eye,
} from "lucide-react";
export const MypageState = () => {
  const { role: accountRole } = useUserProfile();
  const [role, setRole] = useState<Role>(accountRole);
  const content = ROLE_CONTENT[role];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold">총 등록 매물</span>
          <Building2 className="h-[18px] w-[18px] text-[#002045]" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl text-[#002045] font-bold">
            {content.statPropertyCount}
          </span>
          <span className="text-sm text-gray-500">건</span>
        </div>
        <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
          <span>인증완료 8</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 font-normal">심사 3</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold">이번 달 조회수</span>
          <Eye className="h-[18px] w-[18px] text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl text-[#002045] font-bold">4,820</span>
          <span className="text-sm text-gray-500">회</span>
        </div>
        <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>전월대비 +24%</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold">안심 문의 신청</span>
          <MessagesSquare className="h-[18px] w-[18px] text-[#002045]" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl text-[#002045] font-bold">38</span>
          <span className="text-sm text-gray-500">건</span>
        </div>
        <div className="text-[11px] text-[#002045] font-bold">
          <span>실계약 진행 5건</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold">누적 납부 금액</span>
          <CreditCard className="h-[18px] w-[18px] text-[#002045]" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl text-[#002045] font-bold">₩354,000</span>
        </div>
        <div className="text-[11px] text-gray-500">
          <span>프로 멤버십 6개월차</span>
        </div>
      </div>
    </div>
  );
};
