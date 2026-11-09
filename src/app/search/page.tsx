import SearchResults from "@/components/search/search-results";

// 주소: /search?q=논현
//   ?q=논현 부분(쿼리스트링)이 searchParams.q 로 들어옴
export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const keyword = searchParams.q?.trim() ?? "";

  // key={keyword}: 검색어가 바뀌면 화면을 새로 그려서 선택 상태 등을 초기화
  return <SearchResults key={keyword} keyword={keyword} />;
}
