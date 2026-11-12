"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// 팝업을 <body> 바로 아래로 "순간이동"시켜서 그리는 컴포넌트
// → 부모에 sticky / transform / z-index 가 있어도 그 안에 갇히지 않고 항상 맨 앞에 보임
export default function Portal({ children }: { children: ReactNode }) {
  // 서버에는 document(body)가 없어서, 브라우저에서 화면이 뜬 뒤에만 그림
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
