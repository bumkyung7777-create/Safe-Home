# 네이버 로그인 연결 노트

## 왜 카카오보다 복잡한가?

Supabase 대시보드의 Authentication → Providers 목록에 **"Naver"가 없음** (카카오는 있지만 네이버는 미지원). 그래서 카카오처럼 "설정만 켜면 끝"이 아니라, 네이버와의 OAuth 대화를 **직접 구현**하고 Supabase 로그인 세션도 **관리자 권한(Admin API)으로 손수 만들어야** 함.

## 전체 흐름 한눈에 보기

```
① 우리 앱: Naver 버튼 클릭 → 네이버 인증 페이지로 직접 이동 (state 쿠키에 저장)
        │
        ▼
② 네이버 로그인 화면 (사용자가 로그인)
        │
        ▼
③ 네이버 → 우리 앱 /auth/naver/callback 으로 code, state와 함께 복귀
        │
        ▼
④ route.ts: state 검증 → code로 access_token 발급 → 사용자 정보(이메일/이름) 조회
        │
        ▼
⑤ route.ts: Admin API로 로그인 링크 생성(generateLink) → 세션으로 검증(verifyOtp)
        │
        ▼
⑥ 메인 페이지로 이동, 로그인 완료
```

카카오는 ①~③을 Supabase가 대신 해주고 우리는 `route.ts`(④부터, 그것도 훨씬 단순한 버전)만 만들면 됐지만, 네이버는 ①부터 ⑤까지 전부 우리가 만들어야 함.

---

## Phase 1: 네이버 개발자 센터에서 앱 등록

1. [네이버 개발자 센터](https://developers.naver.com)에서 애플리케이션 등록
2. **Client ID / Client Secret** 발급받기
3. **서비스 URL**과 **Callback URL** 등록

### 서비스 URL 입력 규칙

```
http://localhost:3000
```
- 끝에 슬래시(`/`)나 경로 없이 **도메인만 정확히**. `http://localhost:3000/` (X), `http://localhost:3000/login` (X)

### Callback URL

```
http://localhost:3000/auth/naver/callback
```
- 앞으로 만들 콜백 라우트 주소와 **글자 하나까지 정확히 일치**해야 함

---

## Phase 2: 로그인 시작 버튼

`src/app/login/page.tsx`

```tsx
const handleNaverLogin = () => {
  const state = crypto.randomUUID();
  document.cookie = `naver_oauth_state=${state}; path=/; max-age=600`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
    redirect_uri: `${window.location.origin}/auth/naver/callback`,
    state,
  });

  window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
};
```

### 코드 설명

| 코드 | 하는 일 | 쉬운 설명 |
|---|---|---|
| `crypto.randomUUID()` | 랜덤 문자열 생성 | 아무나 흉내 낼 수 없는 값으로 "이 요청은 진짜 우리 앱이 보냈다"는 증표를 만듦 (보안 장치) |
| `document.cookie = ...` | 증표를 쿠키에 저장 | `sessionStorage`가 아니라 **쿠키**를 써야 하는 이유: 나중에 네이버가 돌려보낸 요청은 서버(`route.ts`)가 처리하는데, `sessionStorage`는 브라우저 안에만 있어서 서버가 못 읽음. 쿠키는 브라우저가 요청 보낼 때 자동으로 서버까지 같이 실어다 줌. `max-age=600`은 10분 뒤 자동 삭제 |
| `URLSearchParams({...})` | 네이버에 보낼 정보 조립 | `?response_type=code&client_id=...&redirect_uri=...&state=...` 형태의 쿼리 문자열 자동 생성 |
| `redirect_uri` | 로그인 후 돌아올 주소 | Phase 1에서 네이버에 등록한 Callback URL과 정확히 일치해야 함 |
| `window.location.href = ...` | 실제 페이지 이동 | 브라우저를 네이버 로그인 화면으로 강제 이동 |

### 비유
`state`는 "이 티켓은 오늘, 이 사람에게만 유효하다"는 도장 같은 거예요. 쿠키에 넣어두는 건 편지봉투에 넣어서 부치는 것 — 나중에 물류창고(서버)가 봉투를 열어서 확인할 수 있게.

---

## Phase 3: 콜백 라우트 (`/auth/naver/callback`)

`src/app/auth/naver/callback/route.ts`

### 1) state 검증

```ts
const cookieStore = cookies();
const savedState = cookieStore.get("naver_oauth_state")?.value;
cookieStore.delete("naver_oauth_state");

if (!code || !state || state !== savedState) {
  return NextResponse.redirect(`${origin}/login?error=naver-state-mismatch`);
}
```
- Phase 2에서 쿠키에 저장해둔 값을 서버에서 꺼내 비교. 다르면 위조 요청일 수 있으니 차단
- 검증 후 바로 삭제 (한 번 쓴 티켓 재사용 방지)

### 2) 토큰 발급

```ts
const tokenRes = await fetch(
  `https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`,
);
const tokenData = await tokenRes.json();
```
- 네이버가 준 1회용 `code`를 `access_token`(진짜 출입증)으로 교환
- 이때 처음으로 **`client_secret`** 사용 — 서버에서만 다뤄야 하는 값이라 브라우저 코드(Phase 2)에는 절대 넣지 않음

### 3) 사용자 정보 조회

```ts
const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
  headers: { Authorization: `Bearer ${tokenData.access_token}` },
});
const { email, name } = (await profileRes.json()).response;
```
- `access_token`을 Authorization 헤더에 넣어 네이버에 사용자 정보 요청
- 응답 구조: `{ resultcode, message, response: { email, name, ... } }`

---

## 서버 전용 Admin 클라이언트 (`src/services/supabase/admin.ts`)

```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
```

| 부분 | 설명 |
|---|---|
| `@supabase/supabase-js`의 `createClient` | `client.ts`/`server.ts`는 쿠키로 "특정 사용자의 로그인 세션"을 유지하는 용도. Admin 클라이언트는 세션과 무관하게 "관리자 권한으로 아무 유저나 다루는" 용도라 쿠키 처리 없는 기본 클라이언트를 씀 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 새 키 체계의 **Secret key** (`sb_secret_...`). RLS까지 다 무시하고 모든 데이터에 접근 가능한 최상위 권한 키 |
| `autoRefreshToken: false, persistSession: false` | 요청 하나 처리하고 버려지는 용도라 세션 자동 갱신/저장 기능 불필요 |

### ⚠️ 절대 규칙

**`createAdminClient()`는 `"use client"` 파일(브라우저 실행 컴포넌트)에서 절대 import 금지.** `route.ts`처럼 서버에서만 실행되는 파일에서만 사용. 클라이언트 컴포넌트에서 불러오면 강력한 Secret key가 브라우저 번들에 그대로 노출됨.

---

## Phase 4: Admin API로 실제 로그인 세션 만들기

```ts
const adminClient = createAdminClient();
const { data: linkData, error: linkError } =
  await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: { full_name: name } },
  });

const supabase = createClient(); // server.ts의 쿠키 인식 클라이언트
const { error: verifyError } = await supabase.auth.verifyOtp({
  type: "magiclink",
  token_hash: linkData.properties.hashed_token,
});

return NextResponse.redirect(`${origin}/`);
```

### 단계별 설명

| 단계 | 하는 일 | 쉬운 설명 |
|---|---|---|
| `generateLink({ type: "magiclink", email, ... })` | 로그인 링크 생성 (이메일 발송 없이) | 원래는 "매직링크를 이메일로 보내주는" 기능인데, 네이버가 이미 신원을 확인해줬으니 이메일 발송 없이 **링크 정보만** 받아서 우리가 직접 처리 |
| `options: { data: { full_name: name } }` | 트리거용 이름 정보 전달 | [schema.sql](src/services/supabase/schema.sql)의 트리거가 `full_name`을 `not null`로 요구하는데, 네이버 이름을 미리 넣어줘서 처음 로그인하는 사용자도 `profiles`가 정상 생성되게 함 |
| `linkData.properties.hashed_token` | "본인 확인 도장" | 이 사람이 진짜 본인이라는 걸 증명하는 일회용 토큰 |
| `createClient()` (server.ts) | 쿠키를 쓸 수 있는 클라이언트로 전환 | `admin.ts`는 쿠키 처리가 없어서 세션을 못 만듦. **쿠키를 응답에 실을 수 있는** `server.ts`의 클라이언트가 필요 |
| `supabase.auth.verifyOtp({ type: "magiclink", token_hash })` | 도장 검증 + 세션(쿠키) 발급 | 도장이 유효하면 Supabase가 진짜 로그인 세션 쿠키를 응답에 실어줌 |
| `NextResponse.redirect(`${origin}/`)` | 메인 페이지로 이동 | 세션 쿠키를 브라우저가 저장하면서 로그인 상태로 인식됨 |

### 비유
`generateLink`로 받은 도장을 `verifyOtp`가 검사하는 건, 매표소에서 표(code)를 팔찌(세션)로 바꿔주는 것과 같은 원리 (카카오 콜백 라우트의 `exchangeCodeForSession`과 목적은 동일, 방식만 다름).

---

## 트러블슈팅

### 1. 네이버 "페이지를 찾을 수 없습니다" (404)

**원인**: `.env.local`에 `NEXT_PUBLIC_NAVER_CLIENT_ID`가 아예 없거나 비어있음. `process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!`의 `!`는 TypeScript한테만 "무조건 있다"고 우기는 표시일 뿐, 실제로 없으면 값이 `undefined`가 되어 `client_id=undefined`라는 잘못된 요청이 네이버로 감. 네이버는 등록 안 된 client_id라 카카오처럼 "설정 오류" 화면이 아니라 아예 "페이지 없음" 취급.

**해결**: `.env.local`에 `NEXT_PUBLIC_NAVER_CLIENT_ID=발급받은값` 추가 후 개발 서버 재시작.

### 2. "Invalid API key" (generateLink 단계)

**원인**: `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY=sb_secret_sb_secret_...`처럼 **`sb_secret_` 접두어가 중복**됨. 대시보드에서 복사한 값 자체에 이미 접두어가 포함돼 있는데, 안내 예시의 접두어까지 같이 남겨서 붙여넣기 하면 이렇게 됨.

**해결**: 접두어가 정확히 한 번만 있는지 확인 (`sb_secret_ptCeSWSa...` 형태). 수정 후 개발 서버 재시작 필수.

### 공통 팁

`.env` 파일을 고칠 때마다 **반드시 개발 서버 재시작**해야 반영됨 (`Ctrl+C` → `npm run dev`). Next.js는 서버 시작 시점에 환경변수를 읽어서, 서버가 켜진 채로 파일만 고치면 반영 안 됨.

---

## 이 패턴, 다른 프로젝트에도 재사용 가능한가?

| 재사용 가능 (공통) | 프로젝트마다 다름 |
|---|---|
| OAuth2 "인가 코드 흐름" 자체 (state 검증 → 토큰 교환 → 프로필 조회) | 토큰/프로필 조회 URL, 응답 JSON 구조 |
| `route.ts`를 서버 전용 라우트로 만드는 구조 | 환경변수 이름 |
| Admin API로 세션을 대신 만들어주는 패턴 (`generateLink` + `verifyOtp`) | Supabase가 아닌 다른 백엔드면 이 부분 자체가 그 서비스의 Admin API로 교체 |

OAuth2 표준 흐름과 `route.ts` 뼈대는 Google, GitHub 등 다른 미지원 제공자를 붙일 때도 그대로 템플릿처럼 재사용 가능. 바뀌는 건 제공자별 URL과 응답 구조뿐.
