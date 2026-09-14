"useClient";
import { useState } from "react";
import { ROLES } from "@/components/mypage/type/typeMyPage";
import { useUserProfile } from "@/context/auth-context";
import type { Role } from "@/types/user";

export const MypageHeader = () => {
  const { role: accountRole } = useUserProfile();
  const [role, setRole] = useState<Role>(accountRole);

  return (
    <section className="w-full bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          계정 역할 모드 전환:
        </span>
        <span className="text-sm text-[#002045] font-bold hidden md:inline">
          기관 보증 파트너 포털
        </span>
      </div>

      <div className="flex items-center p-1 bg-gray-100 rounded-lg w-full sm:w-auto justify-between sm:justify-start gap-1">
        {ROLES.map((item) => {
          const Icon = item.icon;
          const isActive = item.value === role;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setRole(item.value)}
              disabled={!isActive}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? "bg-[#002045] text-white shadow-sm" : "text-gray-500"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
              {isActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white ml-0.5">
                  활성
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
