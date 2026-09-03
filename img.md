# 이미지 등록 기능 설명서

`registration.tsx`(매물 등록 화면)의 2단계에 있는 **썸네일 이미지 등록**, **상세 이미지 등록** 기능이 어떻게 동작하는지 쉽게 설명한 문서입니다.

## 1. 우리가 만들려는 것

매물을 등록할 때 사진을 올릴 수 있어야 합니다.

- **썸네일 이미지**: 목록 화면에서 대표로 보여줄 사진 1장
- **상세 이미지**: 매물 상세 화면에서 보여줄 사진 여러 장 (여러 개 선택 가능)

## 2. 사진 데이터는 어디에 저장되나요?

폼 데이터를 담고 있는 `form`이라는 상자(state) 안에 두 칸을 만들어뒀습니다.

```ts
thumbnail?: File | null;   // 썸네일 사진 1장 (없으면 null)
detailImages?: File[];     // 상세 사진 여러 장 (배열)
```

여기서 `File`은 "컴퓨터에서 내가 고른 사진 파일 그 자체"라고 생각하면 됩니다. 사진을 아직 안 골랐으면 `null`(아무것도 없음), 상세 이미지는 여러 장이라 배열(`[]`, 사진들을 넣는 줄)로 관리합니다.

## 3. 함수들이 하는 일

### `handleThumbnailChange` — 썸네일 사진을 골랐을 때

```ts
function handleThumbnailChange(event) {
  const file = event.target.files?.[0] ?? null; // 고른 사진 1장 꺼내기
  setForm((previous) => ({ ...previous, thumbnail: file })); // form 상자에 저장
  event.target.value = ""; // 같은 사진을 다시 골라도 인식되게 초기화
}
```

쉽게 말하면:
1. 사용자가 파일 선택창에서 사진을 하나 고른다.
2. 그 사진을 `form.thumbnail` 칸에 넣는다.
3. 파일 선택창을 다시 깨끗하게 비워둔다 (같은 사진을 또 고를 수 있게).

### `handleDetailImagesChange` — 상세 사진을 여러 장 골랐을 때

```ts
function handleDetailImagesChange(event) {
  const files = event.target.files ? Array.from(event.target.files) : [];
  setForm((previous) => ({
    ...previous,
    detailImages: [...(previous.detailImages ?? []), ...files], // 기존 사진 + 새로 고른 사진
  }));
  event.target.value = "";
}
```

쉽게 말하면:
1. 사용자가 사진을 여러 장 고른다 (예: 3장).
2. **기존에 이미 등록해둔 사진들 뒤에** 새로 고른 사진들을 이어 붙인다.
   - 그래서 여러 번 나눠서 사진을 추가해도 이전 사진이 사라지지 않습니다.

### `handleRemoveDetailImage` — 상세 사진을 하나 지울 때

```ts
function handleRemoveDetailImage(index) {
  setForm((previous) => ({
    ...previous,
    detailImages: (previous.detailImages ?? []).filter(
      (_, imageIndex) => imageIndex !== index,
    ),
  }));
}
```

쉽게 말하면: 사진 목록에서 **몇 번째 사진인지(index)** 를 받아서, 그 번호에 해당하는 사진만 빼고 나머지 사진들로 목록을 다시 만듭니다.

> 예시: 사진이 [사과, 바나나, 딸기] 있는데 1번(바나나)을 지우면 → [사과, 딸기]가 됩니다.

## 4. 미리보기는 어떻게 보여주나요?

사진 파일 자체는 그림이 아니라 "데이터 덩어리"라서, 화면에 그림으로 보여주려면 **미리보기용 임시 주소(URL)** 를 만들어야 합니다. 그 역할을 하는 게 `URL.createObjectURL()`입니다.

```ts
const thumbnailPreview = useMemo(
  () => (form.thumbnail ? URL.createObjectURL(form.thumbnail) : null),
  [form.thumbnail],
);

const detailImagePreviews = useMemo(
  () => (form.detailImages ?? []).map((file) => URL.createObjectURL(file)),
  [form.detailImages],
);
```

쉽게 말하면:
- `form.thumbnail`(사진 파일)을 브라우저가 이해할 수 있는 **임시 사진 주소**로 바꿔줍니다.
- 그 주소를 `<img src="주소" />` 에 넣으면 화면에 사진이 보입니다.
- `useMemo`는 "썸네일이 바뀔 때만 새로 계산하고, 안 바뀌면 이전 결과를 재사용해라"는 뜻입니다. (매번 다시 계산하면 컴퓨터가 쓸데없이 일을 많이 하게 되니까요.)

## 5. 전체 흐름 한눈에 보기

```
[사용자가 사진 선택]
        ↓
handleThumbnailChange / handleDetailImagesChange 실행
        ↓
form.thumbnail 또는 form.detailImages 에 파일 저장
        ↓
thumbnailPreview / detailImagePreviews 가 미리보기 주소를 계산
        ↓
화면에 <img> 태그로 사진이 보여짐
        ↓
(상세 이미지의 경우) X 버튼 클릭 시 handleRemoveDetailImage 실행 → 목록에서 제거
```

## 6. 아직 안 된 부분 (참고용)

- 지금은 사진을 화면에 **미리보기만** 하고 있고, 실제 서버(데이터베이스)로 전송하는 기능은 없습니다.
- 나중에 저장 버튼을 누르면 이 `File` 데이터들을 `FormData`라는 상자에 담아 서버로 보내는 작업이 추가로 필요합니다.
