"use client";

import "./mypage.css";
import { MypageHeader } from "./mypageHeader/mypageHeader";
import { MemberProfile } from "./memberProfile/memberProfile";
import { MembershipStatus } from "./membershipStatus/membershipStatus";
import { PasswordChangeForm } from "./passwordChangeForm/passwordChangeForm";
import { MypageState } from "./myPageStats/myPageState";
import { StatCard } from "./statCard/statCard";

export default function MyPage() {
  return (
    <div className="w-full bg-[#f8f9ff] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-6 flex flex-col gap-6">
        {/* 역할 전환 바 */}
        <MypageHeader />
        {/* 프로필 & 신뢰 점수 */}
        <MemberProfile />

        {/* 멤버십 등급 & 라벨링 현황 */}
        <MembershipStatus />

        {/* 좌: 계정 관리 / 우: 매물 관리 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 컬럼 비밀번호 변경 */}
          <PasswordChangeForm />
          {/* 우측 컬럼 */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* KPI */}
            <MypageState />

            {/* 매물 관리 */}
            <StatCard />
          </div>
        </section>
      </div>
    </div>
  );
}
