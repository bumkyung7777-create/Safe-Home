import HomeTabs from "@/components/home/home-tabs";

// /home 아래 모든 페이지 공통 틀: 위쪽 유형 탭 + 아래 [지도 | 매물 목록] 2단 영역
// 각 page.tsx는 <HomeMap />, <HomeList /> 두 개를 반환하고, 이 grid가 좌우로 배치함
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-[#f8f9ff]">
      <div className="m-auto max-w-[80.63rem] px-5 pt-5">
        <HomeTabs />
      </div>
      <div className="m-auto grid max-w-[80.63rem] gap-6 px-5 py-5 lg:h-[calc(100vh-180px)] lg:min-h-[560px] lg:grid-cols-2">
        {children}
      </div>
    </main>
  );
}
