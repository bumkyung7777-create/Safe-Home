"use client";
import Registration from "@/components/join/registration";

// /join/edit/매물id → 등록 화면을 그대로 쓰되, propertyId를 넘겨서 "수정 모드"로 열기
export default function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  return <Registration propertyId={params.id} />;
}
