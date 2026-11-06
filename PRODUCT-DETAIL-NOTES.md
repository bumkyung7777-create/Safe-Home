# 매물 상세 페이지 만들기 노트

> `/product/[id]` 페이지가 **어떤 순서로**, **왜 그렇게** 만들어졌는지 정리한 문서예요.

---

## 0. 한 줄 요약

**주소에 적힌 매물 번호(id)로 Supabase에서 매물 1개를 꺼내 와서 → 사진은 Swiper로 넘겨 보고 → 그 아래에 정보를 쭉 보여 주는 페이지**예요.

---

## 1. 만든 파일 3개

| 파일 | 하는 일 | 비유 |
|---|---|---|
| `src/app/product/[id]/page.tsx` | 매물 데이터를 가져와서 화면 전체를 조립 | **요리사**: 재료를 가져와서 접시에 담음 |
| `src/components/product/product-gallery.tsx` | 사진 슬라이드 (Swiper) | **앨범**: 사진을 옆으로 넘겨 봄 |
| `src/components/product/product-info.tsx` | 사진 아래 상세 정보 목록 | **영수증**: 항목과 값을 줄줄이 적음 |

그리고 **수정한 파일 1개**:
- `src/components/main/property.tsx` → 메인 화면 "금주의 검증된 매물" 카드를 누르면 상세 페이지로 가도록 링크를 `/`에서 `/product/매물id`로 바꿨어요.

---

## 2. 전체 흐름 한눈에 보기

```
[메인 화면에서 매물 카드 클릭]
        │   링크: /product/6f04d7f1-....
        ▼
[Next.js가 폴더 이름 [id]를 보고 "6f04d7f1-..."를 params.id로 넘겨줌]
        │
        ▼
[page.tsx (서버)] ── Supabase야, id가 이거인 매물 1개 줘!
        │
        ├─ 없으면 → 404 페이지
        │
        ▼
[사진 주소들을 배열 하나로 모음]
        │
        ▼
[화면 조립]
   ├─ 위: 인증 배지 + 가격 + 제목
   ├─ 왼쪽: ProductGallery(사진 슬라이드) + ProductInfo(정보)
   └─ 오른쪽: 인증 카드 + 찜/공유/문의 버튼
```

---

## 3. 단계별 설명

### 1단계. 폴더 이름 `[id]`의 비밀

```
src/app/product/[id]/page.tsx
```

Next.js에서는 **폴더 이름이 곧 주소**예요.
그런데 대괄호 `[ ]`로 감싸면 "여기엔 **아무 값이나** 들어올 수 있어"라는 뜻이 돼요.

| 브라우저 주소 | `params.id` 값 |
|---|---|
| `/product/abc` | `"abc"` |
| `/product/6f04d7f1-7b52-...` | `"6f04d7f1-7b52-..."` |

**비유**: 아파트 우편함이 `[호수]`라고 적혀 있으면 101호든 202호든 다 같은 모양의 우편함을 쓰는 것과 같아요. 페이지 파일은 하나인데, 들어오는 번호에 따라 내용만 달라져요.

```tsx
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  // params.id 에 주소의 번호가 들어 있음
```

---

### 2단계. Supabase에서 매물 1개 가져오기

```tsx
const supabase = createClient();            // 서버용 Supabase 연결
const { data } = await supabase
  .from("properties")                      // properties 테이블에서
  .select("*")                             // 모든 칸을
  .eq("id", params.id)                     // id가 주소의 번호와 같은 것만
  .maybeSingle();                          // 1개만 (없으면 null)
```

- `.eq("id", params.id)` = "id **가 같은(equal)** 것만 골라 줘"
- `.maybeSingle()` = "**1개만** 줘. 없으면 에러 말고 그냥 `null` 줘"

**왜 서버에서 가져오나요?**
이 파일 맨 위에 `"use client"`가 **없어요**. 그래서 이 페이지는 **서버에서** 실행돼요.
- 브라우저가 페이지를 받을 때 이미 데이터가 채워져 있어서 **빨라요** (로딩 깜빡임 없음)
- `useState`, `useEffect` 없이 `await` 한 줄로 끝나서 **코드가 짧아요**

`createClient`도 서버용(`@/services/supabase/server`)을 쓴 걸 꼭 확인하세요. 브라우저용(`client`)과 달라요.

---

### 3단계. 없는 매물이면 404

```tsx
if (!data) notFound();
```

누군가 `/product/아무거나` 처럼 없는 번호로 들어오면 `data`가 `null`이에요.
`notFound()`를 부르면 Next.js가 알아서 **404(페이지 없음)** 화면을 보여줘요.

---

### 4단계. 사진 모으기

DB에는 사진이 두 군데 나뉘어 있어요.
- `thumbnail_url` : 대표 사진 1장
- `detail_image_urls` : 상세 사진 여러 장 (배열)

이걸 **하나의 배열**로 합쳐야 슬라이드에 넣기 편해요.

```tsx
const images = Array.from(
  new Set(                                           // ③ 중복 제거
    [property.thumbnail_url, ...property.detail_image_urls]  // ① 합치기
      .filter((url): url is string => Boolean(url)),         // ② 빈 값 빼기
  ),
);
```

| 순서 | 하는 일 | 예시 |
|---|---|---|
| ① 합치기 | 대표 사진을 맨 앞에, 상세 사진을 뒤에 | `[A, B, C, A]` |
| ② 빈 값 빼기 | 대표 사진이 없으면(`null`) 빼기 | `[A, B, C, A]` |
| ③ 중복 제거 | `Set`은 같은 값을 한 번만 담는 상자 | `[A, B, C]` |

---

### 5단계. 사진 슬라이드 (Swiper) — `product-gallery.tsx`

이 파일 맨 위에는 `"use client"`가 **있어요**. 왜냐하면:
- 사진을 **손가락으로 밀거나 화살표를 누르는 건 브라우저에서만** 할 수 있어요.
- "지금 몇 번째 사진인지"를 기억하려면 `useState`가 필요한데, 이것도 브라우저 전용이에요.

**비유**: 서버는 **식당 주방**, 브라우저는 **손님 테이블**이에요. 요리(데이터)는 주방에서 만들어 오지만, 숟가락질(클릭, 스와이프)은 테이블에서 해야 하죠.

```tsx
<Swiper
  modules={[Navigation, Keyboard]}   // 화살표 기능 + 키보드 기능을 켬
  navigation                          // 좌우 화살표 보이기
  keyboard                            // ← → 키로도 넘기기
  loop={images.length > 1}            // 마지막 다음은 다시 첫 장 (사진 1장이면 안 함)
  onSlideChange={(swiper) => setCurrent(swiper.realIndex)}  // 넘길 때마다 번호 저장
>
  {images.map((src) => (
    <SwiperSlide key={src}> ...사진... </SwiperSlide>
  ))}
</Swiper>
```

- `modules` : Swiper는 기본 기능만 들어 있어서, 화살표(`Navigation`)나 키보드(`Keyboard`) 같은 기능은 **플러그인처럼 따로 켜야** 해요.
- `import "swiper/css/navigation"` : 화살표 모양 CSS도 따로 불러와야 보여요.
- 오른쪽 아래 `1 / 5` 숫자는 Swiper 기능이 아니라 **직접 만든 것**이에요. `current`(지금 번호, 0부터 시작)에 1을 더해서 보여줘요.

사진이 한 장도 없으면 슬라이드 대신 "등록된 사진이 없어요" 상자를 보여줘요.

---

### 6단계. 상세 정보 (탭 없이) — `product-info.tsx`

시안에는 탭(Detailed Info / Infrastructure / Parking / Reviews)이 있었지만, 요청대로 **탭 없이 정보만** 보여줘요.

핵심 아이디어는 **[이름, 값] 목록을 만들고 → 값이 없는 줄은 빼고 → 반복해서 그리기**예요.

```tsx
const rows = [
  ["건물 유형", property.building_type],
  ["거래 유형", property.deal_type],
  ["가격", formatPrice(property.price)],
  ["층수", floor],          // 예: "12층 / 총 20층"
  ["관리비", managementFee],
  ...
];

rows
  .filter(([, value]) => value)    // 값이 비어 있으면 빼기
  .map(([label, value]) => (       // 남은 것만 화면에 그리기
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  ));
```

**왜 이렇게 하나요?**
`<div>건물 유형</div><div>...</div>`를 8번 복사·붙여넣기 하는 대신, **목록 한 곳만 고치면** 항목을 추가·삭제할 수 있어요. 나중에 "방향", "입주 가능일" 같은 칸을 DB에 추가하면 `rows`에 한 줄만 넣으면 끝!

- `<dl>`, `<dt>`, `<dd>` : HTML에서 "**이름-값 목록**"을 만들 때 쓰는 태그예요 (dl = 목록, dt = 이름, dd = 값).
- 매물 설명은 `whitespace-pre-line` 덕분에 **등록할 때 엔터 친 줄바꿈이 그대로** 보여요.

이 파일에는 `"use client"`가 **없어요**. 클릭할 게 없고 보여주기만 하니까 서버에서 그려도 충분해요.

---

### 7단계. 반응형 (화면 크기별 배치)

Tailwind에서 `sm:`, `lg:` 같은 앞글자는 "**화면이 이만큼 이상 커지면** 이렇게 바꿔"라는 뜻이에요.

| 앞글자 | 적용되는 화면 너비 | 대략 |
|---|---|---|
| (없음) | 모든 화면 | 휴대폰부터 |
| `sm:` | 640px 이상 | 큰 휴대폰 · 태블릿 |
| `lg:` | 1024px 이상 | 노트북 · 데스크톱 |

이 페이지에서 바뀌는 것들:

| 부분 | 휴대폰 | 큰 화면 |
|---|---|---|
| 전체 배치 | 위아래로 쌓임 | `lg:grid-cols-[...1fr_360px]` → **왼쪽 넓게 + 오른쪽 360px 카드** |
| 사진 비율 | `aspect-[4/3]` (조금 더 세로로 김) | `sm:aspect-[16/9]` (와이드) |
| 정보 목록 | 1줄에 1개 | `sm:grid-cols-2` → 1줄에 2개 |
| 오른쪽 문의 카드 | 정보 아래에 나옴 | `lg:sticky lg:top-6` → **스크롤해도 화면에 붙어서 따라옴** |
| 가격 글씨 | `text-3xl` | `sm:text-4xl` (더 크게) |

**비유**: 휴대폰은 좁은 책상이라 물건을 **위로 쌓고**, 데스크톱은 넓은 책상이라 **옆으로 펼쳐 놓는** 것과 같아요.

`minmax(0, 1fr)`의 `0`은 작은 함정을 막는 장치예요. Swiper처럼 안에 아주 넓은 내용이 있으면 칸이 화면 밖으로 밀려나는 버그가 있는데, `0`이 "필요하면 0까지 줄어들어도 돼"라고 허락해 줘요. 같은 이유로 왼쪽 칸에 `min-w-0`도 붙였어요.

---

### 8단계. 메인에서 상세로 연결

```tsx
// src/components/main/property.tsx
<Link href={`/product/${slide.id}`}>
```

백틱(`` ` ``)과 `${ }`를 쓰면 문자열 안에 값을 끼워 넣을 수 있어요.
`slide.id`가 `"abc"`면 → `/product/abc`가 돼요. 이 주소가 1단계의 `params.id`로 들어가요. **처음과 끝이 연결됐죠!**

---

## 4. 서버 컴포넌트 vs 클라이언트 컴포넌트 정리

| | page.tsx | product-info.tsx | product-gallery.tsx |
|---|---|---|---|
| `"use client"` | ❌ 없음 | ❌ 없음 | ✅ 있음 |
| 실행 장소 | 서버 | 서버 | 브라우저 |
| 이유 | DB에서 데이터 가져오기 | 보여주기만 함 | 스와이프·클릭·번호 기억 |

**규칙**: 기본은 서버로 두고, **클릭·입력·`useState`가 필요한 부분만** 따로 떼어서 `"use client"`를 붙여요.
그래서 사진 슬라이드만 별도 파일로 분리한 거예요.

---

## 5. 아직 안 된 것 (다음 할 일)

- [ ] **찜하기 / 공유하기 / 메시지로 문의하기** 버튼은 모양만 있고 기능은 연결 전이에요.
- [ ] 시안의 **SafeScore(96점)** 는 DB에 점수 칸이 없어서, 대신 HUG·HF 인증 상태를 보여주고 있어요.
- [ ] 시안의 **면적(32㎡), 방향, 입주 가능일**도 DB에 칸이 없어요. 칸을 추가하면 `product-info.tsx`의 `rows`에 한 줄씩 넣으면 돼요.
- [ ] `/home` 목록 카드에서는 아직 상세 페이지로 가는 링크가 없어요 (지금은 카드를 누르면 지도만 이동).
- [ ] `src/app/product/page.tsx`가 **빈 파일**이에요. `/product`로 들어가면 에러가 나니까, 쓰지 않을 거면 지우거나 내용을 채워 주세요.

---

## 6. 🐛 버그 수정: 뒤로 가기 하면 메인 카드가 꽉 차게 늘어남

### 증상
메인 → 상세 페이지 → **뒤로 가기** 하면, "금주의 검증된 매물" 카드 한 장이 **화면 가로 전체**로 늘어났어요.
(원래는 260px짜리 카드가 옆으로 여러 장 나란히 있어야 함)

### 원인: CSS 두 개가 같은 대상을 두고 "줄다리기"

같은 `.swiper-slide`에 서로 다른 너비를 주는 CSS가 2개 있었어요.

| 파일 | 내용 | 뜻 |
|---|---|---|
| `swiper/css` (Swiper 기본) | `.swiper-slide { width: 100%; }` | 슬라이드는 가로 꽉 차게 |
| `main.css` (우리가 만든 것) | `.swiper-slide { width: 260px; }` | 슬라이드는 260px로 |

CSS에는 **"둘이 똑같이 힘이 세면(우선순위가 같으면) 나중에 불러온 쪽이 이긴다"** 는 규칙이 있어요.
둘 다 클래스 1개짜리(`.swiper-slide`)라 힘이 똑같아서, **불러온 순서**로만 승부가 났어요.

```
① 처음 메인 접속
   swiper/css 불러옴 → main.css 불러옴     → main.css(260px)가 나중 → ✅ 정상

② 상세 페이지로 이동
   상세 페이지의 사진 슬라이드가 swiper/css를 또 불러옴

③ 뒤로 가기
   이제 swiper/css가 main.css보다 "나중" 자리에 있음
                                         → swiper/css(100%)가 이김 → ❌ 카드가 꽉 참
```

**비유**: 반장 선거에서 표가 똑같으면 "나중에 투표함에 넣은 사람" 의견을 따르기로 한 셈이에요.
그러면 투표 순서가 바뀔 때마다 결과가 달라지죠. 순서에 기대면 안 돼요!

그리고 하나 더 문제가 있었어요. `main.css`의 `.swiper-slide`는 **모든 Swiper**에 적용돼서,
상세 페이지 사진 슬라이드에도 260px·테두리가 묻어날 수 있었어요.

### 해결: 이름표를 붙여서 "범위"와 "힘"을 둘 다 챙기기

**① 메인 Swiper에 이름표(class) 달기** — `property.tsx`
```tsx
<Swiper className="property-swiper" ...>
```

**② CSS를 이름표 안의 슬라이드에만 적용** — `main.css`
```css
/* 전 */ .swiper-slide { width: 260px; ... }
/* 후 */ .property-swiper .swiper-slide { width: 260px; ... }
```

`.property-swiper .swiper-slide` = "**property-swiper 안에 있는** swiper-slide만"이라는 뜻이에요.

| | 수정 전 | 수정 후 |
|---|---|---|
| 우선순위 | 클래스 1개 (Swiper 기본과 동점) | **클래스 2개** (항상 Swiper 기본보다 셈) |
| 불러온 순서 영향 | 받음 → 뒤로 가기 버그 | **안 받음** |
| 적용 범위 | 사이트의 모든 Swiper | **메인 매물 슬라이드만** |

### 기억할 것
라이브러리(Swiper 등)의 기본 클래스를 **그대로** 덮어쓰지 말고,
**내 이름표(class)를 하나 붙여서 그 안에서만** 덮어쓰세요. 순서 버그와 다른 페이지 오염을 한 번에 막을 수 있어요.

---

## 7. 직접 확인해 보기

1. dev 서버 실행
   ```cmd
   set NODE_OPTIONS=--use-system-ca&& npm run dev
   ```
2. 메인 화면 "금주의 검증된 매물"에서 카드 클릭 → 상세 페이지로 이동하는지
3. 사진 좌우 화살표 / 키보드 ← → / 손가락 스와이프로 넘어가는지, 오른쪽 아래 숫자가 바뀌는지
4. 브라우저 창을 좁게 줄여 보기 → 오른쪽 카드가 아래로 내려가고, 정보가 1줄에 1개로 바뀌는지
5. 주소창에 `/product/없는번호` 입력 → 404가 나오는지
