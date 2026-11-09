// 글자 속에서 검색어와 같은 부분만 <mark>로 감싸서 색칠해 주는 컴포넌트
//   예) text="강남구 논현동", keyword="논현"  →  강남구 [논현]동

// 정규식에서 특별한 뜻을 가진 문자(. * ? ( ) 등)를 "그냥 글자"로 바꿔 줌
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightText({
  text,
  keyword,
}: {
  text: string | null | undefined;
  keyword?: string;
}) {
  if (!text) return null;
  const word = keyword?.trim();
  if (!word) return <>{text}</>;

  // 괄호 ( )로 감싸서 split하면, 잘린 "검색어 부분"도 배열에 같이 남음
  //   "강남구 논현동".split(/(논현)/i) → ["강남구 ", "논현", "동"]
  const parts = text.split(new RegExp(`(${escapeRegExp(word)})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <mark
            key={index}
            className="rounded bg-[#ffe066] px-0.5 font-bold text-[#002045]"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
