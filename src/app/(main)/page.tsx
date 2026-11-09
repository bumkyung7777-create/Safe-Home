import Home from "@/components/main/home";
import IntroPopup from "@/components/main/intro-popup";

// 메인(/)에서만 소개 팝업을 띄움 → 다른 페이지에는 안 나옴
export default function Main() {
  return (
    <>
      <Home />
      <IntroPopup />
    </>
  );
}
