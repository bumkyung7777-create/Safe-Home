import Link from "next/link";
import { ArrowRight } from "lucide-react";

const propertyTypes = [
  {
    title: "빌라 & 투룸",
    description: "다세대 주택, 별장, 연립주택",
    link: "/home/villa",
    icon: "/villa.svg",
  },
  {
    title: "원룸",
    link: "/home/oneroom",
    description: "50㎡ 미만 전세/월세 매물",
    icon: "/apartment.svg",
  },
  {
    title: "상가 & 사무실",
    link: "/home/office",
    description: "임대, 매매, 스타트업 공간",
    icon: "/store.svg",
  },
];
export default function RoomType() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Left main card: 사진을 카드 전체 배경으로 깔고, 왼쪽에서 오른쪽으로 남색 그라데이션 */}
        <Link
          href="/home/apt"
          className="group relative isolate flex min-h-[300px] overflow-hidden rounded-3xl bg-[#062b55] shadow-[0_24px_48px_-24px_rgba(6,43,85,0.6)]"
        >
          {/* 배경 사진 (hover 시 살짝 확대) */}
          <img
            className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            src="https://www.koreadaily.com/data/photo/202302/09/78178693-a563-4d98-977c-393c245ebd84.jpg"
            alt=""
          />
          {/* 글씨가 잘 읽히도록 덮는 그라데이션 */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#041d3a] via-[#062b55]/85 to-[#062b55]/10" />
          {/* 오른쪽 위 은은한 초록 빛 */}
          <div className="absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-[#006c4a]/30 blur-3xl" />

          <div className="flex w-full max-w-md flex-col justify-between gap-8 p-8 sm:p-10">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25 backdrop-blur-md">
                  <img
                    src="/apart.svg"
                    alt=""
                    className="size-7 brightness-0 invert"
                  />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006c4a]/25 px-3 py-1 text-xs font-semibold text-[#9ff0cd] ring-1 ring-[#3ddc97]/40">
                  <span className="size-1.5 rounded-full bg-[#3ddc97]" />
                  HUG · HF 검증 매물
                </span>
              </div>

              <p className="mt-7 text-xs font-semibold tracking-[0.3em] text-[#9ff0cd]/80">
                APARTMENT
              </p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                아파트
              </h2>
              <p className="mt-3 leading-relaxed text-white/75">
                실거래가와 안전 점수까지 한눈에,
                <br className="hidden sm:block" /> 믿을 수 있는 아파트 매물을
                찾아보세요.
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {["매매", "전세", "월세"].map((deal) => (
                  <li
                    key={deal}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm"
                  >
                    {deal}
                  </li>
                ))}
              </ul>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#062b55] shadow-lg transition group-hover:bg-[#9ff0cd]">
              매물 찾기
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Right cards */}
        <div className="grid gap-6">
          {propertyTypes.map(({ title, description, icon: Icon, link }) => (
            <Link href={link} key={title} className="group flex min-h-[58px] items-center justify-between rounded-3xl border border-slate-300 bg-white px-8 py-3 text-left transition hover:-translate-y-1 hover:border-[#8eadd2] hover:shadow-lg">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[#082d57]">
                  {title}
                </h3>

                <p className="mt-2 text-base font-medium text-slate-600">
                  {description}
                </p>
              </div>

              <span className="ml-5 flex size-12 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] text-[#082d57] transition group-hover:bg-[#062b55] group-hover:text-white">
                <img
                  src={Icon}
                  alt={title}
                  className="size-6 transition group-hover:brightness-0 group-hover:invert"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
