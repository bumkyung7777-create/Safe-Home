const propertyTypes = [
  {
    title: "주택 & 빌라",
    description: "다세대 주택, 별장, 연립주택",
    icon: "/villa.svg",
  },
  {
    title: "원룸 & 투룸",
    description: "50㎡ 미만 전세/월세 매물",
    icon: "/apartment.svg",
  },
  {
    title: "상가 & 사무실",
    description: "임대, 매매, 스타트업 공간",
    icon: "/store.svg",
  },
];
export default function RoomType() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Left main card */}
        <article className="relative min-h-[230px] overflow-hidden rounded-3xl border border-slate-300 bg-[#eef3ff]">
          {/* Left content area */}
          <div className="relative z-10 flex h-full min-h-[230px] w-full flex-col justify-between p-8 sm:p-10 lg:w-1/2">
            <div>
              <div className="mb-9 flex size-16 items-center justify-center rounded-2xl bg-[#062b55] text-white shadow-md">
                <img src="/apart.svg" alt="home" className="size-8" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[#082d57] sm:text-2xl">
                아파트 & 오피스텔
              </h2>

              <p className="mt-2 max-w-md text-md leading-relaxed text-slate-600">
                매매, 전세, 월세 매물을 시세 및 실거래가 정보와 함께
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                className="rounded-xl bg-[#062b55] px-6 py-3 font-semibold text-white transition hover:bg-[#0b3c72]"
              >
                매물 찾기
              </button>

              <button
                type="button"
                className="rounded-xl border border-slate-400 bg-white px-6 py-3 font-semibold text-[#062b55] transition hover:bg-slate-50"
              >
                실거래 찾기
              </button>
            </div>
          </div>

          {/* Right visual area */}
          <div className="absolute inset-y-0 right-0 hidden w-1/2 border-l border-slate-200 bg-[#e6efff] lg:block">
            <div className="flex h-full items-center justify-center">
              <img
                className="h-full w-full object-cover"
                src="https://www.koreadaily.com/data/photo/202302/09/78178693-a563-4d98-977c-393c245ebd84.jpg"
                alt=""
              />
            </div>
          </div>
        </article>

        {/* Right cards */}
        <div className="grid gap-6">
          {propertyTypes.map(({ title, description, icon: Icon }) => (
            <button
              key={title}
              type="button"
              className="group flex min-h-[58px] items-center justify-between rounded-3xl border border-slate-300 bg-white px-8 py-3 text-left transition hover:-translate-y-1 hover:border-[#8eadd2] hover:shadow-lg"
            >
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
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
