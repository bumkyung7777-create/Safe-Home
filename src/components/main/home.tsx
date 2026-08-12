"use client";
import RoomType from "@/components/main/Room-type";
import { fakeDate } from "@/app/service/fakeDate";
import Property from "@/components/main/property";
import KakaoMap from "./kakao-map";
export default function Home() {
  return (
    <div>
      <RoomType />
      <Property roomType={fakeDate} />
      <KakaoMap roomList={fakeDate} />
    </div>
  );
}
