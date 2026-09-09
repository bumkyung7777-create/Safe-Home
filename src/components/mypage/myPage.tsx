"use client";

import { useState } from "react";
import {
  ShieldCheck,
  User,
  Building2,
  BadgeCheck,
  UserCheck,
  Calendar,
  Gavel,
  UserCog,
  ChevronRight,
  Receipt,
  ArrowUpCircle,
  KeyRound,
  CheckCircle2,
  Zap,
  Rocket,
  RefreshCw,
  Landmark,
  Shield,
  Download,
  Plus,
  TrendingUp,
  MessagesSquare,
  CreditCard,
  Eye,
  BarChart3,
  Upload,
  FileCheck2,
} from "lucide-react";
import { useUserProfile } from "@/context/auth-context";
import type { Role } from "@/types/user";

type PropertyStatus = "labeled" | "review" | "private";

const ROLES: { value: Role; label: string; icon: typeof Building2 }[] = [
  { value: "landlord", label: "임대인", icon: Building2 },
  { value: "realtor", label: "공인중개사", icon: BadgeCheck },
  { value: "tenant", label: "세입자", icon: UserCheck },
];

const ROLE_CONTENT: Record<
  Role,
  {
    badgeText: string;
    navPropertyText: string;
    managementTitle: string;
    managementDesc: string;
    statPropertyCount: string;
  }
> = {
  landlord: {
    badgeText: "인증 우수 임대인",
    navPropertyText: "내 등록 매물 관리",
    managementTitle: "내 등록 매물 관리",
    managementDesc:
      "HUG 및 HF 공인 보증 라벨링이 부여된 안전 인증 관리 매물 목록입니다.",
    statPropertyCount: "12",
  },
  realtor: {
    badgeText: "공인중개사 (안심 중개 파트너)",
    navPropertyText: "중개 의뢰 매물 관리",
    managementTitle: "책임 공인중개 검증 매물 관리",
    managementDesc:
      "부동산 공제 2억원 가입 및 SafeHome 기관 인증 라벨링을 대행/발행한 매물 목록입니다.",
    statPropertyCount: "28",
  },
  tenant: {
    badgeText: "인증 세입자 (안심 입주자)",
    navPropertyText: "내가 찜한 안심 매물",
    managementTitle: "계약/보증금 보호 리포트",
    managementDesc:
      "현재 거주 중이거나 계약 검토 중인 안심 라벨링 보증금 보호 현황입니다.",
    statPropertyCount: "4",
  },
};

const TIERS = [
  {
    key: "free",
    name: "일반 회원",
    tag: "FREE",
    tagSub: "기본 등록",
    price: "₩0",
    current: false,
    features: [
      { ok: true, text: "매물 등록 최대 2건" },
      { ok: false, text: "안심기관 공식 라벨 미제공" },
      { ok: false, text: "일반 검색 순위" },
    ],
    footer: "기본 활성화",
  },
  {
    key: "basic",
    name: "베이직 파트너",
    tag: "BASIC",
    tagSub: "HUG 단독",
    price: "₩29,000",
    current: false,
    features: [
      { ok: true, text: "매물 등록 최대 5건" },
      { ok: true, text: "HUG 안심전세 단독 라벨" },
      { ok: true, text: "표준 안전도 리포트 발행" },
    ],
    footer: "다운그레이드",
  },
  {
    key: "pro",
    name: "PRO 파트너",
    tag: "CURRENT ACTIVE",
    tagSub: "이용중",
    price: "₩59,000",
    current: true,
    features: [
      { ok: true, text: "매물 등록 무제한 (안심 15건)" },
      { ok: true, text: "HUG + HF 듀얼 인증 라벨" },
      { ok: true, text: "지역 탐색 최상단 3배 부스팅" },
      { ok: true, text: "등기부 실시간 변동 24H 감시" },
    ],
    footer: "다음 결제: 2025.04.15",
  },
  {
    key: "vip",
    name: "VIP 프레스티지",
    tag: "PRESTIGE",
    tagSub: "트리플 라벨",
    price: "₩129,000",
    current: false,
    features: [
      { ok: true, text: "HUG + HF + SGI 3대 보증 완비" },
      { ok: true, text: "전담 법무사/공인심사관 1:1 배정" },
      { ok: true, text: "무제한 안심보증 에스크로 패스" },
    ],
    footer: "VIP 업그레이드",
  },
];

const PROPERTY_FILTERS: { value: "all" | PropertyStatus; label: string }[] = [
  { value: "all", label: "전체 (12)" },
  { value: "labeled", label: "라벨링 인증완료 (8)" },
  { value: "review", label: "심사중 (3)" },
  { value: "private", label: "비공개 (1)" },
];

const PROPERTIES: {
  id: string;
  title: string;
  type: string;
  status: PropertyStatus;
  image: string;
  labelBadge: string;
  labelIcon: typeof ShieldCheck;
  safeScore?: number;
  boosted?: boolean;
  priceLine: string;
  noteLine: string;
  noteTone: "default" | "error";
}[] = [
  {
    id: "gangnam-acrotel",
    title: "강남 아크로텔 101동 1204호",
    type: "오피스텔",
    status: "labeled",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCot6cQ825XCqMQT9HBh3Eh3e4PRy49mVemjnKWqO1jOyZsbKh6pk13DXXeDQwdcI3ruzyifXDPitsv2eSU9nNXqw5NxJdxXfc0Bj002ea1uhRI2in0O2gitMN61nN3fG9yUw-keRweHO2d_iUCblL_gSdAfFSf6VevFXKqYp1WLhIeVRnsdzrwjmPo34KzBQ9mhW1VqIq1966875Z_-c5dpMVVS8p4rrZO_i3IeP6w043cZx_9eBRiDg",
    labelBadge: "HUG 안심라벨",
    labelIcon: ShieldCheck,
    safeScore: 98,
    boosted: true,
    priceLine:
      "전세 2억 5,000만 · 전용 54.2㎡ (16.4평) · 보증금 반환보증 가입완료",
    noteLine: "최근 등기 변동 확인: 오늘 11:30 (무결성 검증됨)",
    noteTone: "default",
  },
  {
    id: "mapo-riverview",
    title: "마포 리버뷰 빌라 302호",
    type: "다세대",
    status: "labeled",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVnneUNQvRuDLgUpywcXPWqDTyezclZDfXQIlRFUXK1p89gz0fC6u8P-R8wa7ZyG1s6iZawSV68nUMja4S13cLXB9aKH_q2Pwd0O20FM0WYQLTTHsXlkRFQ9jFz2VQ0NvluG0l11bxDgMlxL_HZ-C7hrsZibNVbACMqlV4lW6XI2viqDUdwNR89wNNfDw02O9bMZcYuvJkD_8qHi_syOf_GEKHybfqWlNG-JtsFKMEhi3I-QfN5LTt9A",
    labelBadge: "HF 주택보증라벨",
    labelIcon: Landmark,
    safeScore: 95,
    priceLine: "월세 1억 / 70만 · 전용 68.1㎡ (20.6평) · 선순위 근저당 0원",
    noteLine: "실시간 안심 임대차 계약서 자동 작성 가능",
    noteTone: "default",
  },
  {
    id: "seocho-banpo",
    title: "서초 반포 써밋플레이스 505호",
    type: "아파트",
    status: "review",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-7ceJERcBnIbfIfjXVxU-oqTa691ehdZy8eoC2k0FOkv_S9Q3ZpTtNkeTRS_Xsua9dlg9Js3LpA43wlFpK5RZJmCLy6tx0bPVHm29iVgLG9W4l5511kQA-BSS8hKKYLloJy4V37L1EHTDnpSoE78HEjBsk1S9uWX9o1a_jyThxZZV_m6WcTj6pqLmaqGdWbVbTto_a1E2PA455didPpcMFYkkMsLaid1cBOivSZ-VJCLDoCoa0BVh3w",
    labelBadge: "라벨링 심사중 (서류검토 단계) · 진행률 65%",
    labelIcon: RefreshCw,
    priceLine:
      "전세 8억 5,000만 · 전용 84.9㎡ (25.7평) · 전담 심사관: 김도현 책임연구원",
    noteLine: "안내: 국세 완납증명서 최신본 보완 요청 접수됨",
    noteTone: "error",
  },
];

export default function MyPage() {
  const { role: accountRole, fullName, phone, createdAt, updatedAt } =
    useUserProfile();
  const [role, setRole] = useState<Role>(accountRole);
  const [propertyFilter, setPropertyFilter] = useState<"all" | PropertyStatus>(
    "all",
  );

  const content = ROLE_CONTENT[role];
  const filteredProperties = PROPERTIES.filter(
    (property) =>
      propertyFilter === "all" || property.status === propertyFilter,
  );

  function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    alert("비밀번호가 안전하게 변경되었습니다.");
  }

  return (
    <div className="w-full bg-[#f8f9ff] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-6 flex flex-col gap-6">
        {/* 역할 전환 바 */}
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
                    isActive
                      ? "bg-[#002045] text-white shadow-sm"
                      : "text-gray-500"
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

        {/* 프로필 & 신뢰 점수 */}
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
                    <strong className="text-emerald-600 font-bold">
                      {phone}
                    </strong>
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

        {/* 멤버십 등급 & 라벨링 현황 */}
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
                납부 등급에 따라 정부 공인 HUG/HF/SGI 보증기관 실시간 연동
                라벨이 부여되며 검색 결과 상단에 우선 매칭됩니다.
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
                      <li
                        key={feature.text}
                        className="flex items-center gap-1.5"
                      >
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
                  기관 검증 API 데이터베이스와 실시간 동기화 중입니다 (오차
                  보증제 적용)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-[18px] w-[18px]" />
                <span className="text-sm font-bold">HUG 안심전세</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase">부여됨</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Landmark className="h-[18px] w-[18px]" />
                <span className="text-sm font-bold">HF 주택금융보증</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase">부여됨</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 opacity-80">
                <Shield className="h-[18px] w-[18px]" />
                <span className="text-sm font-bold">SGI 서울보증</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-white text-[#002045] font-semibold">
                  VIP 전용 즉시신청
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 좌: 계정 관리 / 우: 매물 관리 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 컬럼 */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1">
              <div className="px-3 py-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                  My Account Management
                </span>
              </div>

              <a
                href="#profile"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-100 text-[#002045] text-sm font-bold"
              >
                <div className="flex items-center gap-3">
                  <UserCog className="h-5 w-5" />
                  <span>프로필 &amp; 회원 등급</span>
                </div>
                <ChevronRight className="h-[18px] w-[18px]" />
              </a>

              <a
                href="#properties"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-[#002045] transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5" />
                  <span>{content.navPropertyText}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                  12건
                </span>
              </a>

              <a
                href="#labels"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-[#002045] transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <FileCheck2 className="h-5 w-5" />
                  <span>안심 라벨링 발급/결제 내역</span>
                </div>
                <ChevronRight className="h-[18px] w-[18px]" />
              </a>

              <a
                href="#inquiries"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-[#002045] transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <MessagesSquare className="h-5 w-5" />
                  <span>받은 문의 및 계약 현황</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#002045]/10 text-[#002045] text-[11px] font-bold">
                  5건
                </span>
              </a>

              <a
                href="#security"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-[#002045] transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5" />
                  <span>보안 및 비밀번호 변경</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </a>
            </div>

            {/* 보안 및 비밀번호 변경 */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[#002045]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <span className="text-lg text-[#002045] font-bold">
                    보안 및 비밀번호 변경
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                  보안 1등급
                </span>
              </div>

              <p className="text-[13px] text-gray-500">
                안심 매물 등록 권한과 에스크로 계좌 보호를 위해 주기적으로
                비밀번호를 변경해 주세요.
              </p>

              <form
                onSubmit={handleChangePassword}
                className="flex flex-col gap-2"
              >
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-[#002045] font-semibold">
                    현재 비밀번호
                  </span>
                  <input
                    type="password"
                    placeholder="기존 비밀번호 입력"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-gray-100 transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm text-[#002045] font-semibold">
                    새 비밀번호
                  </span>
                  <input
                    type="password"
                    placeholder="영문, 숫자, 특수문자 조합 8자 이상"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-gray-100 transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm text-[#002045] font-semibold">
                    새 비밀번호 확인
                  </span>
                  <input
                    type="password"
                    placeholder="새 비밀번호 재입력"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-gray-100 transition-colors"
                  />
                </label>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 mt-1">
                  <div className="flex flex-col">
                    <span className="text-sm text-[#002045] font-bold">
                      2단계 SMS 안전 인증 (2FA)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      매물 계약 및 라벨링 변경 시 필수
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full py-2.5 rounded-lg bg-[#002045] hover:bg-[#002045]/90 text-white text-sm font-bold transition-shadow shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="h-[18px] w-[18px]" />
                  <span>비밀번호 변경하기</span>
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500">
                <span>최근 보안 업데이트: 2025.02.10</span>
                <a
                  href="#"
                  className="text-[#002045] font-semibold hover:underline"
                >
                  로그인 기기 관리 (2)
                </a>
              </div>
            </div>

            {/* 무과실 보증 안내 */}
            <div className="p-4 rounded-xl bg-gray-100 flex items-start gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500 flex-none" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-[#002045] font-bold">
                  SafeHome 무과실 보증 체계
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  라벨링 인증 매물에서 허위 권리 관계 또는 보증금 미반환 사고
                  발생 시 기관 예치금으로 100% 우선 변제됩니다.
                </span>
              </div>
            </div>
          </div>

          {/* 우측 컬럼 */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* KPI */}
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
                  <span className="text-2xl text-[#002045] font-bold">
                    4,820
                  </span>
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
                  <span className="text-xl text-[#002045] font-bold">
                    ₩354,000
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  <span>프로 멤버십 6개월차</span>
                </div>
              </div>
            </div>

            {/* 매물 관리 */}
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
                  {PROPERTY_FILTERS.map((filter) => (
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
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {filteredProperties.map((property) => {
                  const LabelIcon = property.labelIcon;

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
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                              <LabelIcon className="h-[13px] w-[13px]" />
                              <span>{property.labelBadge}</span>
                            </span>
                            {property.safeScore && (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                                SafeScore {property.safeScore}점
                              </span>
                            )}
                            {property.boosted && (
                              <span className="px-1.5 py-0.5 rounded bg-[#002045] text-emerald-300 text-[10px] font-bold flex items-center gap-0.5">
                                <Rocket className="h-3 w-3" />
                                <span>프로 상단 노출중</span>
                              </span>
                            )}
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
                                심사 취소
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg bg-[#002045] hover:bg-[#002045]/90 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-1"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                <span>추가 서류 제출</span>
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
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-1"
                              >
                                <Zap className="h-3.5 w-3.5" />
                                <span>라벨링 업그레이드</span>
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

              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-[#002045] hover:bg-[#002045]/95 text-white text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-[18px] w-[18px]" />
                </div>
                <span>새 매물 등록하고 HUG/HF 안심 라벨링 받기</span>
              </button>
            </div>

            {/* 무과실 보증 인증서 */}
            <div className="p-4 md:p-6 rounded-xl bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-[#002045] font-bold">
                      임대인 책임 보증제 자동 등록 완료
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      인증 번호: SH-2025-04829
                    </span>
                  </div>
                  <span className="text-[13px] text-gray-500 mt-0.5">
                    등록된 12개 매물 전체가 SafeHome 사기예방 알고리즘 및 3대
                    공인기관 리스크 데이터베이스에 의해 실시간 감시됩니다.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#002045] text-sm font-semibold transition-colors flex items-center gap-1 whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <Download className="h-[18px] w-[18px]" />
                <span>공식 인증서 PDF 다운로드</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
