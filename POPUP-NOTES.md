# 메인 소개 팝업 + 포트폴리오 PDF 만들기 (중학생 버전 설명)

## 0. 한눈에 보기

```
메인(/) 접속
  → "오늘 하루 보지 않기"를 누른 적 있나? (localStorage 확인)
       ├─ 아니오 → 팝업 열기 (dim + 레이어)
       └─ 예     → 팝업 안 열고, 오른쪽 아래 "프로젝트 소개" 버튼만 보이기
  → 팝업 안: [소개서 PDF 받기] [GitHub 보기]
  → 닫는 방법: X 버튼 / 닫기 / dim 클릭 / ESC 키 / 오늘 하루 보지 않기
```

| 파일 | 하는 일 |
|---|---|
| `src/components/main/intro-popup.tsx` | 팝업 컴포넌트 (새로 만듦) |
| `src/app/(main)/page.tsx` | 메인 페이지에만 `<IntroPopup />` 추가 |
| `public/safe-home-portfolio.pdf` | 다운로드되는 PDF |
| `docs/portfolio.html` | PDF의 **원본**. 여기를 고치고 다시 PDF로 뽑으면 됨 |

---

## 1. 왜 메인에만 나올까?

`layout.tsx`에 넣으면 **모든 페이지**에 팝업이 떠요.
그래서 메인 주소(`/`)를 담당하는 `src/app/(main)/page.tsx`에만 넣었어요.

```tsx
<>
  <Home />
  <IntroPopup />
</>
```

> `(main)`처럼 괄호가 있는 폴더는 **주소에 안 나타나요.** 정리용 폴더예요. 그래서 이 페이지 주소는 그냥 `/`예요.

---

## 2. `display:none` 대신 "상태(state)"로 보여주기

퍼블리싱할 때는 이렇게 했었죠.

```js
// jQuery 방식: 화면(DOM)을 직접 건드림
$(".popup").css("display", "none");
```

React에서는 **"지금 열려 있나?"를 변수(상태)로 기억**하고, 그 값에 따라 그려요.

```tsx
const [open, setOpen] = useState(false);

{open && <div className="dim">...팝업...</div>}
```

- `setOpen(false)` → `open`이 false → 팝업이 **아예 안 그려짐** (display:none보다 더 확실)
- 닫기 버튼, dim, ESC 모두 결국 `setOpen(false)` 하나만 부르면 끝!

> 💡 면접 포인트: "퍼블리셔 때는 DOM을 직접 바꿨는데, React에서는 상태만 바꾸고 화면은 React가 그리게 했다"

---

## 3. dim을 눌렀을 때만 닫히게 하기

팝업은 dim **안에** 들어 있어요. 그래서 팝업 안을 클릭해도 클릭이 dim까지 "올라가요"(이벤트 버블링).
그러면 팝업 안 아무 데나 눌러도 닫혀 버리겠죠?

```tsx
const handleDimClick = (e) => {
  if (e.target === e.currentTarget) setOpen(false);
};
```

- `e.target` = **실제로 누른** 요소
- `e.currentTarget` = **이벤트를 달아 둔** 요소 (dim)
- 둘이 같다 = dim의 빈 곳을 직접 눌렀다 → 닫기 ✅
- 다르다 = 팝업 안쪽을 눌렀다 → 무시

---

## 4. "오늘 하루 보지 않기" — localStorage

**localStorage** = 브라우저 안의 작은 메모장. 새로고침해도, 창을 껐다 켜도 남아 있어요.

```ts
// 저장: "오늘 밤 12시까지 숨겨"
const tomorrow = new Date();
tomorrow.setHours(24, 0, 0, 0);       // 다음 날 0시 0분
localStorage.setItem(HIDE_KEY, String(tomorrow.getTime()));

// 확인: 저장된 시간이 아직 안 지났으면 숨김
Number(localStorage.getItem(HIDE_KEY)) > Date.now();
```

### 왜 useEffect 안에서 확인할까?
Next.js는 페이지를 **서버에서 먼저** 만들어요. 서버에는 브라우저가 없으니 `localStorage`도 없어요. 바로 쓰면 에러가 나요.
`useEffect`는 **브라우저에서 화면이 그려진 다음에** 실행돼서 안전해요.

```tsx
useEffect(() => {
  if (!isHiddenToday()) setOpen(true);
}, []);
```

### 왜 try/catch로 감쌌을까?
시크릿 창이나 보안 설정에 따라 localStorage가 **막혀 있을 수 있어요.** 그래도 사이트가 멈추지 않게 감싸 뒀어요.

---

## 5. 접근성 (퍼블리셔 강점 살리기 ⭐)

| 한 것 | 이유 |
|---|---|
| `role="dialog"` | 스크린리더에게 "이건 팝업창이야" 알려줌 |
| `aria-modal="true"` | "뒤쪽 화면은 지금 못 써" 알려줌 |
| `aria-labelledby="intro-popup-title"` | 팝업 제목(h2)을 팝업 이름으로 읽어줌 |
| 열리면 닫기 버튼에 `focus()` | 키보드 사용자가 바로 닫을 수 있게 |
| ESC 키로 닫기 | 팝업의 기본 약속 |
| `aria-label="팝업 닫기"` | 아이콘(X)만 있는 버튼에 이름 붙이기 |
| 열려 있을 때 `body overflow: hidden` | 뒤 화면이 같이 스크롤되지 않게 |

### 정리(cleanup) 함수
```tsx
useEffect(() => {
  if (!open) return;
  document.addEventListener("keydown", onKeyDown);
  document.body.style.overflow = "hidden";

  return () => {   // ← 팝업이 닫힐 때 실행
    document.removeEventListener("keydown", onKeyDown);
    document.body.style.overflow = prevOverflow;
  };
}, [open]);
```
열 때 붙인 것(키보드 감시, 스크롤 막기)은 닫을 때 **꼭 떼어 줘야** 해요. 안 그러면 팝업을 닫아도 스크롤이 계속 막혀 있어요.

---

## 6. PDF 다운로드

`public` 폴더에 넣은 파일은 **주소로 바로** 열 수 있어요.
`public/safe-home-portfolio.pdf` → `https://내사이트/safe-home-portfolio.pdf`

```tsx
<a href="/safe-home-portfolio.pdf" download="safe-home-portfolio.pdf">
```

`download` 속성이 있으면 브라우저가 "열기" 대신 **"저장"**해요. 값은 저장될 파일 이름이에요.

---

## 7. PDF 고치는 방법 ⭐

PDF는 `docs/portfolio.html`(HTML+CSS)로 만든 거예요. 퍼블리셔라 HTML 고치는 게 제일 편할 거예요!

1. `docs/portfolio.html` 수정
   - 주황색 `[ ... ]` 부분 = **직접 채워야 하는 곳** (개발 기간, Vercel URL, 연락처, 동기)
   - `<div class="shot">스크린샷...</div>` = **스크린샷 자리**
     → `public`이나 `docs`에 이미지를 넣고 `<img src="./main.png" style="width:100%;height:100%;object-fit:cover">`로 바꾸기
2. 브라우저(크롬/엣지)로 `docs/portfolio.html` 열기 → **Ctrl + P**
3. 대상: **PDF로 저장**, 용지: **A4**, 여백: **없음**, **머리글/바닥글 끄기**, **배경 그래픽 켜기**
4. `public/safe-home-portfolio.pdf`에 덮어쓰기

> 한 페이지가 넘치면 아래 내용이 잘려요. 저장 전에 미리보기에서 3장인지 확인!

---

## 8. 배운 개념 정리

| 개념 | 한 줄 설명 |
|---|---|
| 상태로 보여주기 | `{open && <팝업/>}` — DOM 대신 변수를 바꿈 |
| 이벤트 버블링 | 안쪽 클릭이 바깥(부모)까지 전달되는 것 |
| `e.target` vs `e.currentTarget` | 누른 것 vs 이벤트 달린 것 |
| localStorage | 브라우저에 남는 작은 저장소 |
| useEffect cleanup | 붙인 것은 떼고 가기 |
| `role="dialog"` / `aria-modal` | 스크린리더용 팝업 표시 |
| `public` 폴더 | 파일을 주소로 바로 제공 |
| `download` 속성 | 링크를 "저장"으로 바꿈 |

## 9. 아직 안 한 것 (다음 단계 후보)
- **포커스 가두기(focus trap)**: Tab을 계속 누르면 팝업 밖으로 포커스가 나갈 수 있어요.
- 팝업 열고 닫을 때 **페이드 애니메이션**
- 닫으면 원래 누르던 버튼으로 **포커스 되돌리기**
