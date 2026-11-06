# 매물 수정하기 노트

> 매물 관리 화면의 ✏️ 버튼을 누르면 **어떤 순서로** 수정 화면이 열리고 저장되는지 정리한 문서예요.

---

## 0. 한 줄 요약

**새로 만든 "수정 화면"은 없어요.** 이미 있던 **등록 화면을 그대로 다시 쓰면서**, "이번엔 이 매물(id)을 고치는 거야"라는 정보만 넘겨 줘요.
그러면 등록 화면이 알아서 **① 그 매물 정보를 미리 채우고 ② 버튼을 "수정하기"로 바꾸고 ③ 저장할 때 새로 만들지 않고 고쳐서 저장**해요.

**비유**: 시험지 양식은 하나인데,
- 빈 시험지를 받으면 → 처음부터 쓰는 거(**등록**)
- 내가 전에 쓴 답이 적힌 시험지를 돌려받으면 → 틀린 곳만 고치는 거(**수정**)

양식(화면)은 똑같고, **처음에 답이 채워져 있느냐**만 달라요.

---

## 1. 관련 파일 3개

| 파일 | 하는 일 | 비유 |
|---|---|---|
| `src/components/join/joinList.tsx` | ✏️ 버튼 → 수정 주소로 보내기 | **안내 표지판** |
| `src/app/join/edit/[id]/page.tsx` | 주소의 id를 꺼내서 등록 화면에 넘겨주기 | **접수 창구** |
| `src/components/join/registration.tsx` | 실제 화면 (등록 + 수정 둘 다) | **시험지 양식** |

---

## 2. 전체 흐름 한눈에 보기

```
[매물 관리 화면에서 ✏️ 클릭]
        │   이동: /join/edit/6f04d7f1-...
        ▼
[edit/[id]/page.tsx]
        │   "id가 6f04d7f1-... 이구나" → <Registration propertyId="6f04d7f1-..." />
        ▼
[registration.tsx]  propertyId가 있네? → 수정 모드!
        │
        ├─ ① Supabase에서 그 매물 불러오기 (내 매물인지도 확인)
        ├─ ② 불러온 값을 입력칸에 채우기
        ├─ ③ 사용자가 1→2→3단계에서 고치기
        └─ ④ [수정하기] 클릭 → DB에서 그 줄만 update
        │
        ▼
["매물이 수정되었습니다." → /join 으로 돌아감]
```

---

## 3. 단계별 설명

### 1단계. ✏️ 버튼이 링크가 됨 — `joinList.tsx`

```tsx
<Link href={`/join/edit/${listing.id}`}>
  <Pencil />
</Link>
```

- 이 버튼은 `properties.map((listing) => ...)` **반복문 안**에 있어요.
- 그래서 카드마다 `listing.id`가 달라지고, **카드마다 다른 주소**로 가요.

| 카드 | 가는 주소 |
|---|---|
| 1번 매물 (id: `abc`) | `/join/edit/abc` |
| 2번 매물 (id: `xyz`) | `/join/edit/xyz` |

---

### 2단계. 주소에서 id 꺼내기 — `edit/[id]/page.tsx`

```tsx
export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return <Registration propertyId={params.id} />;
}
```

- 폴더 이름이 `[id]`(대괄호)라서, 주소의 그 자리 값이 `params.id`로 들어와요. (상세 페이지 `/product/[id]`와 같은 원리!)
- 이 파일이 하는 일은 딱 하나: **등록 화면을 부르면서 `propertyId`를 쥐여 주는 것**.

---

### 3단계. "지금 등록이야, 수정이야?" 판단하기 — `registration.tsx`

```tsx
export default function Registration({ propertyId }: { propertyId?: string }) {
  const isEdit = Boolean(propertyId);
```

- `propertyId?` 의 `?` = "**있을 수도, 없을 수도** 있어"라는 뜻이에요.
- `Boolean(값)` = 값이 있으면 `true`, 없으면 `false`.

| 어디서 열었나 | `propertyId` | `isEdit` |
|---|---|---|
| `/join/registration` (등록) | 없음 (`undefined`) | `false` |
| `/join/edit/abc` (수정) | `"abc"` | `true` |

이제부터 화면 곳곳에서 `isEdit`을 보고 **"등록용으로 보여줄까, 수정용으로 보여줄까"**를 정해요.

```tsx
{isEdit ? "매물 수정 (Edit Property)" : "매물 등록 (Property Registration)"}
```

`조건 ? A : B` = "조건이 맞으면 A, 아니면 B" (삼항 연산자)

---

### 4단계. 매물 불러와서 입력칸 채우기 (useEffect)

```tsx
useEffect(() => {
  if (!propertyId || !user) return;   // 등록 모드거나 로그인 정보가 없으면 아무것도 안 함

  supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)     // 이 id의 매물 중에서
    .eq("owner_id", user.id)  // 내가 올린 것만!
    .maybeSingle()            // 1개만 (없으면 null)
    .then(({ data, error }) => {
      if (error || !data) { /* "매물을 찾을 수 없거나 수정 권한이 없어요." */ }
      setForm({ ...채워 넣기... });
    });
}, [propertyId, user]);
```

**`useEffect`가 뭐예요?**
화면이 처음 나타난 **직후에 한 번** 실행되는 코드예요. "화면 켜지면 이거 해 줘" 하고 예약해 두는 거예요.
마지막 `[propertyId, user]`는 "이 값들이 바뀌면 다시 실행해"라는 뜻이에요.

**`.eq("owner_id", user.id)`가 왜 중요해요?**
누군가 주소창에 **남의 매물 id**를 직접 쳐서 들어올 수도 있어요. 이 조건 덕분에 내 매물이 아니면 아무것도 안 불러와져요. (**자물쇠** 역할)

#### DB 이름 → 입력칸 이름으로 옮겨 담기

DB와 화면(폼)은 이름 짓는 방식이 달라서 **번역**이 필요해요.

| DB 컬럼 (snake_case, 밑줄) | 폼 값 (camelCase, 대문자) | 변환 |
|---|---|---|
| `sub_address` | `subAddress` | 그대로 |
| `building_type` | `type` | 그대로 |
| `total_floor` (숫자 `5`) | `totalFloor` (글자 `"5"`) | `.toString()` |
| `price` (숫자 `780000000`) | `price` (글자 `"780000000"`) | `.toString()` |
| `no_management_fee` | `noManagementFee` | 그대로 |

**왜 숫자를 글자로 바꿔요?**
`<input>` 칸에 들어가는 값은 **항상 글자(string)**예요. 그래서 폼도 글자로 들고 있고, 저장할 때 다시 `Number()`로 숫자로 바꿔요.

```tsx
totalFloor: data.total_floor?.toString() ?? "",
```

- `?.` : 값이 `null`이면 에러 내지 말고 그냥 넘어가
- `?? ""` : 결과가 비어 있으면 빈 글자 `""`로 대신해

#### 불러오는 동안

```tsx
const [isLoading, setIsLoading] = useState(isEdit);  // 수정 모드면 처음엔 true
```

불러오는 동안은 입력칸 대신 **"매물 정보를 불러오는 중..."**을 보여 줘요. 빈 칸이 잠깐 보였다가 확 바뀌는 어색함을 막아요.

---

### 5단계. 사진은 "기존 사진"과 "새 사진"을 따로 관리 ⭐

여기가 수정하기에서 **제일 헷갈리는 부분**이에요.

사진은 두 종류가 있어요.

| 종류 | 생김새 | 어디 있음 |
|---|---|---|
| **기존 사진** | 주소(URL) 글자 `"https://...jpg"` | 이미 Supabase Storage에 올라가 있음 |
| **새 사진** | 파일(`File`) 덩어리 | 아직 내 컴퓨터에만 있음 (업로드 전) |

둘은 **생김새가 달라서 한 상자에 섞을 수 없어요.** 그래서 상자를 따로 만들었어요.

```tsx
// 기존 사진 (주소 글자)
const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);
const [existingDetailUrls, setExistingDetailUrls] = useState<string[]>([]);

// 새 사진 (파일) — 원래 있던 것
form.thumbnail       // 새로 고른 대표 사진 File
form.detailImages    // 새로 고른 상세 사진 File 들
```

**비유**: 앨범 정리할 때
- **기존 사진** = 이미 앨범에 꽂혀 있는 사진
- **새 사진** = 방금 인화해서 손에 들고 있는 사진

#### 대표 사진

```tsx
let thumbnailUrl = existingThumbnailUrl;    // 일단 기존 사진으로 시작
if (form.thumbnail) {                        // 새 사진을 골랐다면
  thumbnailUrl = await uploadPropertyImage(...);  // 올리고 그 주소로 교체
}
```

- 새로 안 골랐으면 → **기존 사진 그대로**
- 새로 골랐으면 → **새 사진으로 교체**

미리보기도 같은 규칙이에요: 새 사진이 있으면 그걸, 없으면 기존 사진을 보여 줘요.

#### 상세 사진

```tsx
const detailImageUrls = [...existingDetailUrls];   // ① 남겨 둔 기존 사진으로 시작
for (const file of form.detailImages ?? []) {        // ② 새 사진을 하나씩
  const url = await uploadPropertyImage(...);        //    올리고
  detailImageUrls.push(url);                         //    뒤에 붙이기
}
```

```
기존 사진 [A, B, C]  ── X로 B 빼기 ──▶  [A, C]
새 사진   [D, E]     ── 업로드 ─────▶  [D주소, E주소]
                                        │
최종 저장                          [A, C, D주소, E주소]
```

`...` (스프레드) = "배열 안의 것들을 **쏟아서** 새 배열에 담아"라는 뜻이에요.

---

### 6단계. 저장: 새로 만들기(insert) vs 고치기(update)

```tsx
const { error } = isEdit
  ? await supabase.from("properties")
      .update({ ...values, ...coordValues, updated_at: 지금시간 })
      .eq("id", propertyId)       // 이 id의 줄만
      .eq("owner_id", user.id)    // 내 것만
  : await supabase.from("properties")
      .insert({ ...values, ...coordValues, owner_id: user.id });
```

| | insert (등록) | update (수정) |
|---|---|---|
| 하는 일 | 표에 **새 줄 추가** | **이미 있는 줄**의 칸을 고침 |
| 필요한 것 | `owner_id` (누가 올렸나) | `.eq("id", ...)` (어느 줄을 고칠지) |
| 비유 | 공책에 새 페이지 쓰기 | 쓴 페이지를 지우개로 지우고 고쳐 쓰기 |

**`.eq("id", ...)` 를 빼먹으면?** update가 **모든 줄**에 적용될 수 있어요! 그래서 "어느 줄인지"를 꼭 집어 줘야 해요.

`values`는 등록·수정에서 **똑같이 쓰는 값들**(주소, 제목, 가격 …)을 한 번만 적어 둔 상자예요. 같은 코드를 두 번 쓰지 않으려고 묶었어요.

---

### 7단계. 지도 좌표는 주소가 바뀔 때만 다시 계산

```tsx
const addressChanged = !isEdit || form.address !== originalAddress;

if (addressChanged) {
  const coords = await getCoordsFromAddress(form.address);
  coordValues.latitude = coords?.lat ?? null;
  coordValues.longitude = coords?.lng ?? null;
}
```

- 처음 불러올 때 원래 주소를 `originalAddress`에 **기억**해 둬요.
- 저장할 때 지금 주소와 비교해서
  - **같으면** → 좌표를 아예 안 보냄 → DB의 기존 좌표가 **그대로 유지**
  - **다르면** → 카카오에게 새 좌표를 물어봐서 저장

**왜요?** 가격만 고쳤는데 지도 핀 위치가 바뀌거나, 카카오 지도가 늦게 떠서 좌표가 `null`로 덮어써지는 사고를 막기 위해서예요.

`!isEdit ||` 부분은 "**등록 모드면 무조건** 좌표 계산"이라는 뜻이에요.

---

### 8단계. 버튼 글자 바꾸기

```tsx
{isEdit
  ? (isSaving ? "수정 중..." : "수정하기")
  : (isSaving ? "저장 중..." : "임시저장")}
```

| | 평소 | 누른 뒤 (저장하는 동안) |
|---|---|---|
| 등록 모드 | 임시저장 | 저장 중... |
| 수정 모드 | **수정하기** | **수정 중...** |

불러오는 중(`isLoading`)이거나 저장 중(`isSaving`)일 때는 버튼을 **못 누르게**(`disabled`) 막아서 두 번 저장되는 걸 방지해요.

---

## 4. 핵심 개념 정리

| 개념 | 한 줄 설명 |
|---|---|
| **컴포넌트 재사용** | 화면 하나(`Registration`)를 props만 바꿔서 등록·수정 둘 다 씀 |
| **props `propertyId?`** | 있으면 수정, 없으면 등록 — 모드를 정하는 스위치 |
| **useEffect** | 화면이 켜진 직후 매물 정보를 불러오는 예약 작업 |
| **`.eq("owner_id", ...)`** | 내 매물만 불러오고 고칠 수 있게 하는 자물쇠 |
| **기존 사진 / 새 사진 분리** | 주소(글자)와 파일은 생김새가 달라서 상자를 나눔 |
| **insert vs update** | 새 줄 추가 vs 있는 줄 고치기 |
| **originalAddress** | 주소가 바뀌었을 때만 좌표를 다시 구하려고 기억해 둔 값 |

---

## 5. 아직 안 된 것 / 알아 둘 것

- [ ] 상세 사진에서 X로 뺀 기존 사진은 **DB 목록에서만 빠지고, Storage 창고의 실제 파일은 남아 있어요.** (나중에 창고 파일도 지우는 기능 추가 가능)
- [ ] 대표 사진을 새 사진으로 바꿔도 **예전 대표 사진 파일은 창고에 남아 있어요.** (위와 같은 이유)
- [ ] 등록 모드 버튼 글자가 "임시저장"이지만 실제로는 **바로 등록**돼요. "등록하기"로 바꾸는 게 더 정확해요.
- [ ] HUG/HF 인증(`hug_mark`, `hf_mark`)은 등록·수정 화면에 입력칸이 없어서, 지금은 Supabase에서 직접 바꿔야 해요.

---

## 6. 직접 확인해 보기

1. dev 서버 실행
   ```cmd
   set NODE_OPTIONS=--use-system-ca&& npm run dev
   ```
2. `/join` (매물 관리)에서 아무 카드의 ✏️ 클릭
3. 주소가 `/join/edit/매물id`로 바뀌고, 제목이 **"매물 수정"**인지
4. 1·2·3단계 입력칸에 **기존 정보가 채워져 있는지** (사진 포함)
5. 가격만 바꾸고 **[수정하기]** → "매물이 수정되었습니다." → 목록에서 가격이 바뀌었는지
6. 주소창에 `/join/edit/없는번호` → "매물을 찾을 수 없거나 수정 권한이 없어요."가 나오는지
