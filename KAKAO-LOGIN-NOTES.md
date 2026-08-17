# 카카오 로그인 연결 노트

## 전체 흐름 한눈에 보기

```
[우리 앱: Kakao 버튼 클릭]
        │
        ▼
[카카오 로그인 화면] ← 사용자가 카카오 아이디로 로그인
        │
        ▼
[카카오 → Supabase 서버로 결과 전달]
        │
        ▼
[Supabase → 우리 앱의 /auth/callback 으로 브라우저를 돌려보냄]
        │
        ▼
[route.ts가 세션 교환 처리]
        │
        ▼
[메인 페이지로 이동, 로그인 완료]
```

**비유**: 놀이공원에 놀러 간다고 생각하면 쉬워요.
1. 매표소(카카오)에서 표를 사고
2. 매표소가 본사(Supabase)에 "이 사람 표 샀어요" 알려주고
3. 본사가 우리 놀이공원 입구(`/auth/callback`)로 "이 손님 들여보내도 돼" 하고 통보
4. 입구 직원(route.ts)이 표를 팔찌(로그인 세션)로 바꿔주고
5. 손님이 놀이공원 안(메인 페이지)으로 들어감

---

## 1단계: 카카오 개발자 사이트에서 앱 만들기

- [developers.kakao.com](https://developers.kakao.com) 에서 애플리케이션 하나 생성
- 생성하면 **REST API 키**가 발급됨 (나중에 Supabase에 넣을 열쇠)

## 2단계: 카카오 로그인 기능 켜기

- 만든 앱의 "카카오 로그인" 메뉴에서 활성화 스위치 ON
- **동의항목** 설정 — 로그인할 때 사용자에게 뭘 받을지 (이메일, 닉네임 등) 체크

## 3단계: Supabase 대시보드에서 Kakao Provider 설정

- Supabase 프로젝트 → Authentication → Providers → **Kakao** 찾아서 활성화
- 2단계에서 받은 카카오 **REST API 키(Client ID)**와 **Client Secret** 입력
- 이 화면에 Supabase가 만들어주는 **Redirect URL**이 표시됨 (예: `https://프로젝트ID.supabase.co/auth/v1/callback`)

## 4단계: 그 Redirect URL을 다시 카카오 콘솔에 등록

- 3단계에서 본 Redirect URL을 복사해서, 카카오 개발자 사이트의 "Redirect URI" 등록란에 붙여넣기
- **비유**: 카카오와 Supabase가 서로 "이 주소로 결과를 보내줄게" 하고 약속하는 절차. 양쪽에 같은 주소가 등록돼 있어야 로그인 결과가 제대로 돌아옴

## 5단계: 콜백을 받을 라우트 만들기 — `route.ts`

### 이게 뭔가요?

지금까지 만든 `page.tsx`는 "화면(HTML)을 그리는 파일"이었어요. `route.ts`는 다릅니다 — **화면 없이 서버에서 요청만 처리하는 파일**이에요. 파일 이름이 정확히 `route.ts`여야 하고, `src/app/auth/callback/` 폴더 안에 있으면 자동으로 `/auth/callback`이라는 주소로 요청을 받을 수 있어요.

**비유**: `page.tsx`가 손님이 들어와서 구경하는 "매장"이라면, `route.ts`는 손님이 안 보이는 "물류창고"예요 — 뭔가를 받아서 처리만 하고, 화면은 안 그려요.

### 실제 코드 (`src/app/auth/callback/route.ts`)

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-error`);
}
```

### 코드 한 줄씩 풀어보기

| 코드 | 하는 일 | 쉬운 설명 |
|---|---|---|
| `export async function GET(request: Request) {` | GET 요청 처리 함수 정의 | Next.js가 "이 주소로 GET 요청이 오면 이 함수를 실행해줘"라고 자동 연결해줌 |
| `const code = searchParams.get("code");` | 주소에 붙어온 `code` 값 꺼내기 | 카카오 로그인이 끝나면 `/auth/callback?code=abc123` 처럼 돌아오는데, 그 `code`(로그인 성공 증명서)를 꺼냄 |
| `const supabase = createClient();` | Supabase 서버용 도구 준비 | 서버에서 Supabase와 통신할 연결 객체 생성 |
| `await supabase.auth.exchangeCodeForSession(code);` | 증명서를 진짜 로그인 세션으로 교환 | 놀이공원 매표소에서 표(code)를 내면 팔찌(세션/쿠키)로 바꿔주는 것과 같음 |
| `if (!error) { return NextResponse.redirect(...) }` | 성공하면 페이지 이동 | 교환 성공 시 원래 가려던 페이지(기본값 `/`, 메인)로 이동시킴 |
| 마지막 `return NextResponse.redirect(...)` | 실패 처리 | 실패하면 로그인 페이지로 다시 보내면서 에러 표시 |

---

## 6단계: 로그인 페이지의 Kakao 버튼에 기능 연결 (다음 작업)

버튼 클릭 시 호출할 코드는 이런 모양이 될 예정:

```ts
supabase.auth.signInWithOAuth({
  provider: "kakao",
  options: { redirectTo: `${location.origin}/auth/callback` },
});
```

- `redirectTo`에 **5단계에서 만든 라우트 주소**를 정확히 넣어줘야, 로그인 끝나고 우리 앱으로 제대로 돌아옴

## 7단계: 로그인 성공 후 확인

- 성공하면 `auth.users`에 사용자가 자동 생성되고, [schema.sql](src/services/supabase/schema.sql)의 트리거가 `profiles` 테이블에도 자동으로 행을 만듦

### ⚠️ 미리 알아둘 주의사항

카카오 로그인은 이메일/비밀번호 회원가입 때처럼 `options.data`로 `full_name`을 직접 넘길 수 없음 (카카오가 알아서 계정 정보를 보내주는 방식이라). 그런데 `profiles` 테이블의 `full_name`은 `not null`(필수)이라, 카카오가 보내주는 정보에 맞는 이름이 없으면 **가입이 실패**할 수 있음. 6~7단계 진행하면서 실제로 테스트해보고, 필요하면 트리거를 고치는 작업을 같이 해야 함.

---

## route.ts는 정확히 언제 실행되나? (다시 정리)

전체 흐름을 순서대로 놓고 보면:

```
① 우리 앱: Kakao 버튼 클릭 → signInWithOAuth() 호출
② 카카오 로그인 화면으로 이동
③ (성공 시) 카카오 → Supabase 서버로 결과 전달
④ (성공 시) Supabase → 우리 앱 /auth/callback 으로 브라우저 복귀
⑤ (성공 시) route.ts가 code를 세션으로 교환
```

`route.ts`는 **⑤번, 맨 마지막**에만 실행됨. ②번(카카오 로그인 화면)에서 에러가 나면 `route.ts`는 아직 한 번도 실행 안 된 상태 — 즉 카카오 화면에서 나는 에러는 `route.ts` 문제가 아니라 **카카오 개발자 콘솔 설정 문제**.

---

## 트러블슈팅: 카카오 에러 KOE205 (잘못된 요청)

### 증상

카카오 로그인 화면에서:
```
잘못된 요청 (KOE205)
safe home 서비스 설정에 오류가 있어, 이용할 수 없습니다.
설정하지 않은 동의 항목: account_email, profile_image, profile_nickname
```

### 원인

Supabase는 카카오 로그인을 요청할 때 기본적으로 "이메일, 프로필 사진, 닉네임" 세 가지 정보를 달라고 요청함. 카카오 앱 쪽에서 이 세 항목을 아직 "제공하겠다"고 켜두지 않으면, 카카오가 요청 자체를 거부함.

### 해결 순서

1. **카카오 개발자 사이트** ([developers.kakao.com](https://developers.kakao.com)) 로그인 → 내 애플리케이션 → 만든 앱 선택
2. 왼쪽 메뉴 **카카오 로그인 → 동의항목** 클릭
3. 아래 항목들을 찾아 "설정" 눌러서 켜기:
   - **닉네임** (`profile_nickname`)
   - **프로필 사진** (`profile_image`)
   - **카카오계정(이메일)** (`account_email`)
4. 각 항목을 "필수 동의"로 설정하고 저장
5. 저장 후 다시 로그인 버튼 눌러서 테스트

### ⚠️ 이메일 항목은 막힐 수도 있음

카카오 정책상 **`카카오계정(이메일)` 항목은 "비즈 앱"으로 전환한 앱만 사용 가능**. 개인 개발자 계정이면 이 항목 활성화 버튼이 아예 안 보이거나 막혀있을 수 있음.

- **사업자 등록번호가 있으면**: 앱 설정에서 "비즈 앱" 전환 신청 → 이메일 항목 사용 가능
- **없으면**: 이메일 없이 닉네임/프로필 사진만 받도록 진행. 이 경우 Supabase 쪽 요청에서 이메일 스코프를 빼야 함:

```ts
supabase.auth.signInWithOAuth({
  provider: "kakao",
  options: {
    redirectTo: `${location.origin}/auth/callback`,
    scopes: "profile_nickname profile_image",
  },
});
```

**정리**: 먼저 카카오 개발자 콘솔에서 계정에 "비즈 앱 전환"이 가능한지부터 확인하고, 그 결과에 따라 이메일을 포함할지 뺄지 결정.
