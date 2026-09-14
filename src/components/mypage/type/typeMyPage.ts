
import type { Role } from "@/types/user";
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

  export type PropertyStatus = "labeled" | "review" | "private";

  export const ROLES: { value: Role; label: string; icon: typeof Building2 }[] = [
  { value: "landlord", label: "임대인", icon: Building2 },
  { value: "realtor", label: "공인중개사", icon: BadgeCheck },
  { value: "tenant", label: "세입자", icon: UserCheck },
  ];

  //같은 모양의 값을 정해진 키집합에 빠짐없이 보여줄라고 할떄사용
  export const ROLE_CONTENT: Record<
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

  export const TIERS = [
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
    footer: "기본 등록",
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
    footer: "베이직 등록",
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

  export const PROPERTY_FILTERS: { value: "all" | PropertyStatus; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "labeled", label: "라벨링 인증완료" },
    { value: "review", label: "심사중" },
    { value: "private", label: "비공개" },
  ];

  export const PROPERTIES: {
    id: string;
    title: string;
    type: string;
    status: PropertyStatus;
    image: string;
    labels: { text: string; icon: typeof ShieldCheck }[];
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
      labels: [{ text: "HUG 안심라벨", icon: ShieldCheck }],
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
      labels: [{ text: "HF 주택보증라벨", icon: Landmark }],
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
      labels: [
        { text: "HF 주택보증라벨", icon: Landmark  },
        { text: "SGI 보증라벨", icon: Shield },
      ],
      priceLine:
        "전세 8억 5,000만 · 전용 84.9㎡ (25.7평) · 전담 심사관: 김도현 책임연구원",
      noteLine: "안내: 국세 완납증명서 최신본 보완 요청 접수됨",
      noteTone: "error",
    },
  ];

