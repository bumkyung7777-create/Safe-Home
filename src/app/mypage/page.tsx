import { redirect } from "next/navigation";
import MyPage from "@/components/mypage/myPage";
import { createClient } from "@/services/supabase/server";

// 서버 컴포넌트: 화면을 보내기 "전에" 서버에서 로그인 여부를 확인
// → 메뉴를 숨겨도 주소창에 /mypage 를 직접 치면 들어올 수 있으니 여기서 한 번 더 막음
export default async function MyPageRoute() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 안 했으면 로그인 페이지로 보내기
  if (!user) redirect("/login");

  return <MyPage />;
}
