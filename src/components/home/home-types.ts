// /home 아래 각 링크(폴더)가 어떤 건물 유형을 보여줄지 한 곳에서 관리
// building_type 값은 매물 등록 폼(registration.tsx)의 BUILDING_TYPES와 같아야 함
export const HOME_TYPES = {
  all: { href: "/home", label: "전체", buildingTypes: null },
  apt: { href: "/home/apt", label: "아파트", buildingTypes: ["아파트"] },
  villa: {
    href: "/home/villa",
    label: "빌라 · 투룸",
    buildingTypes: ["빌라/투룸"],
  },
  oneroom: { href: "/home/oneroom", label: "원룸", buildingTypes: ["원룸"] },
  officetel: {
    href: "/home/office",
    label: "상가 · 사무실",
    buildingTypes: ["상가/사무실"],
  },
} as const;

export type HomeTypeKey = keyof typeof HOME_TYPES;

// 가격 표시 함수는 src/utils/price.ts로 옮김 (매물 관리 페이지와 같이 사용)
export { formatPrice, formatPriceShort } from "@/utils/price";
