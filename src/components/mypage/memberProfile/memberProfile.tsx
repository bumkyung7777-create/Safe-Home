"useClient";
import { useState } from "react";
import { ShieldCheck, User, Calendar, Gavel, Shield } from "lucide-react";
import { useUserProfile } from "@/context/auth-context";
import type { Role } from "@/types/user";
import {
  type PropertyStatus,
  ROLE_CONTENT,
} from "@/components/mypage/type/typeMyPage";

export const MemberProfile = () => {
  const {
    role: accountRole,
    fullName,
    phone,
    createdAt,
    updatedAt,
  } = useUserProfile();
  const [role, setRole] = useState<Role>(accountRole);

  const content = ROLE_CONTENT[role];
  return (
    <section className="w-full bg-white rounded-xl p-4 md:p-6 shadow-sm relative overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-100 overflow-hidden shadow-md flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md ring-2 ring-white"
              title="SafeHome 1등급 실명인증 완료"
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl text-[#002045] font-bold tracking-tight">
                {fullName}
              </h1>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {content.badgeText}
              </span>
              {/* ROLE 별 구분 */}
              {/* <span className="px-2 py-0.5 rounded-md bg-[#002045] text-white text-xs font-semibold">
                    PRO 파트너
                  </span> */}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                가입일:{" "}
                <strong className="text-gray-800 font-semibold">
                  {createdAt}
                </strong>
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Gavel className="h-4 w-4 text-emerald-500" />
                전화번호:{" "}
                <strong className="text-emerald-600 font-bold">{phone}</strong>
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                최근 접속일:{" "}
                <strong className="text-[#002045] font-bold">
                  {updatedAt}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
