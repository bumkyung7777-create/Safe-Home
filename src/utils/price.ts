// 매물 가격(price)은 DB에 "원" 단위 숫자로 저장됨
//   예) 5000000     → 500만원
//       120000000   → 1억 2,000만원
//       780000000   → 7억 8,000만원
//       1000000000  → 10억원
const EOK = 100_000_000; // 1억 = 0이 8개
const MAN = 10_000; //      1만 = 0이 4개

export function formatPrice(price: number | null | undefined) {
  if (price == null) return "가격 협의";
  if (price < MAN) return `${price.toLocaleString()}원`;

  const eok = Math.floor(price / EOK); // 억 단위
  const man = Math.floor((price % EOK) / MAN); // 남은 금액의 만 단위 (만 원 미만은 버림)

  if (eok && man) return `${eok.toLocaleString()}억 ${man.toLocaleString()}만원`;
  if (eok) return `${eok.toLocaleString()}억원`;
  return `${man.toLocaleString()}만원`;
}

// 지도 말풍선처럼 좁은 곳용 짧은 표기 (예: 780000000 → 7.8억, 5000000 → 500만)
export function formatPriceShort(price: number | null | undefined) {
  if (price == null) return "협의";
  if (price >= EOK) return `${Number((price / EOK).toFixed(1))}억`;
  if (price >= MAN) return `${Math.floor(price / MAN).toLocaleString()}만`;
  return `${price.toLocaleString()}원`;
}
