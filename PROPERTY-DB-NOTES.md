# 매물 등록 데이터베이스(Supabase) 연결 설명서

`registration.tsx`(매물 등록 화면)에서 입력한 내용을 **진짜로 저장하는 창고(Supabase 데이터베이스)** 에 넣는 기능이 어떻게 만들어졌는지 쉽게 설명한 문서입니다.

## 1. 지금까지는 왜 "진짜 저장"이 아니었나요?

전에는 "임시저장" 버튼을 눌러도 이런 코드만 있었어요.

```ts
function handleSave() {
  console.log("최종 저장할 매물 데이터:", form);
  alert("콘솔에서 저장할 데이터를 확인해 보세요.");
}
```

이건 그냥 **브라우저 콘솔창에 값을 찍어서 보여주는 것**뿐이에요. 새로고침하면 다 날아가고, 다른 사람은 이 데이터를 볼 수도 없어요. 진짜 저장을 하려면 **인터넷 어딘가에 있는 창고(데이터베이스)** 에 데이터를 보내야 합니다. 그 창고 역할을 여기서는 **Supabase**가 해줍니다.

## 2. Supabase는 뭔가요?

Supabase는 "인터넷에 있는 엑셀 시트 + 로그인 기능"이라고 생각하면 쉬워요.

- **테이블(table)** = 엑셀 시트 하나 (예: `properties`라는 시트)
- **행(row)** = 시트의 한 줄 (매물 하나)
- **컬럼(column)** = 시트의 세로줄 제목 (제목, 주소, 가격 등)

## 3. 창고(테이블)부터 만들어야 해요 — `supabase-properties-table.sql`

집을 짓기 전에 땅을 다지고 골조를 세우듯, 데이터를 넣기 전에 **"어떤 칸에 어떤 데이터를 넣을지" 미리 설계**해야 합니다. 그 설계도가 `supabase-properties-table.sql` 파일이에요.

```sql
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  address text not null,
  building_type text not null,
  title text not null,
  price numeric,
  ...
);
```

쉽게 풀면:

- `properties` 라는 이름의 시트를 만든다
- `id` : 매물마다 자동으로 붙는 고유 번호 (겹치지 않게 컴퓨터가 알아서 만들어줌)
- `owner_id` : "이 매물은 누가 등록했는지" 표시 (로그인한 사용자의 고유 번호)
- `address`, `building_type`, `title`, `price` 등: 우리가 폼에서 입력한 항목들

이 SQL은 Supabase 사이트의 **SQL Editor**라는 곳에 붙여넣고 실행하면, 그때 진짜로 창고(시트)가 만들어져요. (한 번만 실행하면 됩니다.)

### 잠깐, RLS는 뭔가요?

```sql
alter table public.properties enable row level security;

create policy "properties_select_own"
  on public.properties for select
  to authenticated
  using (auth.uid() = owner_id);
```

RLS(Row Level Security)는 **"이 줄(row)은 원래 주인만 볼 수 있어요"** 라는 잠금장치예요.

비유하면: 학교 사물함이 여러 개 있는데, 각자 자기 사물함 열쇠만 갖고 있어서 내 사물함은 나만 열 수 있는 것과 같아요. `owner_id`(사물함 주인)와 지금 로그인한 사람(`auth.uid()`)이 같아야만 그 매물을 보거나 수정할 수 있게 막아둔 거예요. 이게 없으면 다른 사람이 내 매물을 마음대로 보거나 지울 수 있어요.

## 4. 화면 코드에서는 어떻게 연결했나요?

### (1) "지금 로그인한 사람이 누군지" 알아내기

```ts
const user = useAuth();
```

이건 이 프로젝트에 이미 만들어져 있던 "로그인한 사람 정보를 알려주는 기능"이에요. 카카오/네이버 로그인 만들 때 이미 준비해 둔 걸 그대로 가져다 쓴 거예요.

### (2) 저장 버튼을 누르면 벌어지는 일 — `handleSave`

```ts
async function handleSave() {
  if (!user) {
    setErrorMessage("로그인 후 이용해 주세요.");
    return; // 로그인 안 했으면 여기서 멈춤
  }

  setIsSaving(true); // 버튼을 "저장 중..."으로 바꿈

  const supabase = createClient(); // 창고에 연결하는 통로를 만듦
  const { error } = await supabase.from("properties").insert({
    owner_id: user.id,
    address: form.address,
    title: form.title,
    price: form.price ? Number(form.price) : null,
    // ... 나머지 항목들도 여기서 폼 → DB 칸으로 옮겨 담음
  });

  setIsSaving(false);

  if (error) {
    setErrorMessage(`저장 중 오류가 발생했습니다: ${error.message}`);
    return;
  }

  alert("매물이 등록되었습니다.");
}
```

쉽게 풀면:

1. **로그인했는지 먼저 확인** — 안 했으면 "로그인 후 이용해 주세요" 라고 알려주고 끝냄
2. **버튼을 "저장 중..."으로 바꿔서** 사용자가 중복 클릭 못 하게 함
3. **`supabase.from("properties").insert({...})`** — "properties라는 시트에 새 줄 하나 추가해줘!" 라고 인터넷 너머 창고에 요청을 보냄
4. 요청이 끝나면 성공/실패 여부(`error`)를 확인
   - 실패했으면 에러 메시지를 화면에 보여줌
   - 성공했으면 "매물이 등록되었습니다" 라고 알려줌

### (3) 폼 데이터 → 데이터베이스 칸 이름이 서로 다른 이유

화면 코드(`form.type`, `form.subAddress`)와 데이터베이스 칸 이름(`building_type`, `sub_address`)이 조금 다른 걸 눈치챘을 수도 있어요.

- 자바스크립트 세계에서는 보통 `camelCase`(단어 첫 글자만 대문자: `subAddress`)를 씁니다.
- 데이터베이스(SQL) 세계에서는 보통 `snake_case`(밑줄로 구분: `sub_address`)를 씁니다.

그래서 `insert({...})` 안에서 **"내 폼의 이 값은 → 창고의 이 칸에 넣어줘"** 라고 이름을 하나하나 이어주는 작업이 필요했던 거예요.

```ts
sub_address: form.subAddress || null,
```

## 5. 실패하면 화면에 안 보였던 문제도 같이 고쳤어요

원래 `errorMessage`라는 상태(에러 메시지를 담는 상자)는 있었는데, **그걸 화면에 그려주는 코드가 없어서** 에러가 나도 사용자는 아무것도 못 봤어요. 그래서 이번에 이렇게 추가했어요.

```tsx
{errorMessage && (
  <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
    {errorMessage}
  </p>
)}
```

쉽게 풀면: "`errorMessage`에 뭔가 들어있으면(빈 문자열이 아니면), 빨간 배경의 문구로 화면에 보여줘라" 라는 뜻이에요.

## 6. 전체 흐름 한눈에 보기

```
[화면에서 폼 작성] (title, address, price, ...)
        ↓
[3단계에서 "임시저장" 버튼 클릭]
        ↓
handleSave() 실행
        ↓
로그인 확인 → 안 됐으면 에러 메시지 표시하고 중단
        ↓
supabase.from("properties").insert({...}) 실행
   → 인터넷 너머 Supabase 창고로 데이터 전송
        ↓
창고 쪽에서 RLS 정책 확인 (owner_id가 나 맞는지)
        ↓
성공 → "매물이 등록되었습니다" alert
실패 → 에러 메시지를 화면 상단에 빨갛게 표시
```

## 7. 이미지(사진)는 어떻게 저장되나요?

`title`, `price` 같은 글자·숫자는 그냥 테이블 칸에 쏙 들어가지만, **사진 파일은 테이블 칸에 직접 넣을 수 없어요.** 사진은 크기가 크기 때문에, 테이블(엑셀 시트)이 아니라 **Storage(파일 창고)** 라는 별도의 공간에 올려두고, 테이블에는 "그 사진이 어디 있는지 알려주는 주소(URL)"만 저장합니다.

비유하면: 학교 서류철(테이블)에 실제 사진을 풀로 붙이는 대신, **"사진은 캐비닛 3번 칸에 있음"** 이라고 메모만 적어두는 것과 같아요.

### (1) Storage에 "캐비닛" 하나 만들기

```sql
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true);
```

`property-images`라는 이름의 캐비닛(버킷)을 하나 만드는 명령이에요. `public: true`는 "이 캐비닛 안 사진은 누구나 볼 수 있게 공개해도 된다"는 뜻이에요. (매물 사진은 어차피 나중에 목록/상세 화면에서 다른 사람도 봐야 하니까요.)

### (2) 캐비닛에도 잠금 규칙(정책)이 필요해요

```sql
create policy "property_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

이건 "로그인한 사람만, 그리고 **자기 아이디 이름으로 된 서랍(폴더)에만** 사진을 넣을 수 있다"는 규칙이에요. 실제로 코드에서 파일을 올릴 때 경로를 이렇게 만들어요.

```ts
const filePath = `${ownerId}/${crypto.randomUUID()}-${file.name}`;
// 예: "3f9a.../8b2c-thumbnail.jpg"
```

맨 앞이 항상 "내 아이디 폴더"로 시작하니까, 다른 사람이 내 폴더 이름을 흉내내지 않는 이상 남의 사진칸에 함부로 못 넣습니다.

### (3) 사진을 실제로 올리는 코드 — `uploadPropertyImage`

```ts
async function uploadPropertyImage(supabase, file, ownerId) {
  const filePath = `${ownerId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("property-images")   // 어느 캐비닛에 넣을지
    .upload(filePath, file);   // 이 경로에 이 파일을 넣어줘

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("property-images")
    .getPublicUrl(filePath);   // 이 사진을 볼 수 있는 인터넷 주소를 알려줘

  return publicUrl; // 이 주소를 돌려받음
}
```

쉽게 풀면:

1. `crypto.randomUUID()`로 **절대 겹치지 않는 이름표**를 하나 뽑아서 파일 이름 앞에 붙임 (같은 이름 사진 두 장을 올려도 안 헷갈리게)
2. `.upload(filePath, file)` — "이 경로에 이 파일 좀 저장해줘" 라고 창고에 요청
3. 저장이 끝나면 `.getPublicUrl(filePath)` 로 **그 사진을 볼 수 있는 웹 주소(URL)** 를 받아옴 (예: `https://xxxx.supabase.co/storage/v1/object/public/property-images/3f9a.../8b2c-thumbnail.jpg`)
4. 이 주소를 돌려줘서, 나중에 테이블에 저장할 때 쓸 수 있게 함

### (4) 저장 버튼을 눌렀을 때 전체 순서 — `handleSave`

```ts
async function handleSave() {
  ...
  try {
    let thumbnailUrl = null;
    if (form.thumbnail) {
      thumbnailUrl = await uploadPropertyImage(supabase, form.thumbnail, user.id);
    }

    const detailImageUrls = [];
    for (const file of form.detailImages ?? []) {
      const url = await uploadPropertyImage(supabase, file, user.id);
      detailImageUrls.push(url);
    }

    const { error } = await supabase.from("properties").insert({
      ...
      thumbnail_url: thumbnailUrl,
      detail_image_urls: detailImageUrls,
    });

    if (error) throw error;

    alert("매물이 등록되었습니다.");
    router.push("/join");
  } catch (error) {
    setErrorMessage(`저장 중 오류가 발생했습니다: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
}
```

순서대로 읽으면:

1. **썸네일이 있으면** 먼저 캐비닛에 올리고, 그 사진 주소를 `thumbnailUrl`에 저장
2. **상세 이미지는 여러 장**이니까 `for` 반복문으로 한 장씩 순서대로 올리고, 주소들을 `detailImageUrls`라는 목록에 하나씩 쌓음
3. 사진들을 다 올렸으면, 이제 **주소(URL)들과 나머지 글자/숫자 데이터를 한꺼번에** `properties` 테이블에 저장
4. 이 모든 과정 중 어디선가 하나라도 실패하면(`throw error`), `catch`에서 잡아서 에러 메시지를 화면에 보여줌
5. 성공하든 실패하든 마지막엔 `finally`에서 "저장 중..." 표시를 꺼줌 (버튼을 다시 누를 수 있게)

> `try / catch / finally`는 "일단 해보고(try), 중간에 문제가 생기면 catch에서 처리하고, 성공하든 실패하든 finally는 꼭 실행해라"는 문법이에요. 사진 업로드처럼 **여러 단계를 거치는 작업**에서, 어느 단계에서 실패해도 놓치지 않고 처리하기 위해 씁니다.

## 8. 아직 안 된 부분 (참고용)

- **매물 목록 화면(`joinList.tsx`)은 아직 가짜 데이터**를 보여주고 있어요. 실제로 이 `properties` 테이블(과 저장된 사진 URL)을 읽어와서 보여주는 연결 작업이 남아있습니다.
- 사진을 여러 장 올릴 때 **하나씩 순서대로** 올리고 있어서, 사진이 아주 많으면 조금 느릴 수 있어요. (나중에 필요하면 동시에 올리는 방식으로 개선 가능)
