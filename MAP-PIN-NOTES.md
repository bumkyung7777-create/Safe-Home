# 매물 지도 핀(마커) 만들기 순서 설명서

메인페이지에서 **매물 목록을 클릭하면 지도에 파란 핀들이 있고, 클릭한 매물의 핀만 빨간색으로 바뀌는** 기능을 어떤 순서로 만들면 되는지 정리한 문서입니다. 하나씩 따라 만들면서 확인해보세요.

## 0. 전체 그림 먼저 이해하기

핀을 찍으려면 "이 매물이 지도 어디에 있는지"를 컴퓨터가 알아야 해요. 그런데 지금 `properties` 테이블에는 **주소 글자(`address`)만 있고, 좌표(위도/경도 숫자)가 없어요.**

지도는 주소 글자를 못 읽어요. 오직 **숫자 좌표(위도, 경도)만** 이해할 수 있어요. 그래서 "주소 → 좌표"로 바꿔주는 작업이 꼭 필요합니다.

전체 순서를 미리 보면:

```
1. DB에 좌표 저장할 칸 추가 (latitude, longitude)
        ↓
2. 매물 등록할 때, 주소를 좌표로 자동 변환 (카카오 지오코딩)
        ↓
3. 변환된 좌표를 매물 데이터와 함께 저장
        ↓
4. 지도 컴포넌트가 매물 "여러 개"의 핀을 한꺼번에 그릴 수 있게 만들기
        ↓
5. 파란 핀 / 빨간 핀, 두 가지 색깔의 핀 이미지 준비
        ↓
6. "지금 선택된 매물이 뭔지" 기억하는 상태 만들기
        ↓
7. 매물 목록 클릭 → 선택 상태 변경 → 해당 핀만 빨간색으로, 나머지는 파란색으로
```

## 1단계 — DB에 좌표 저장할 칸(컬럼) 추가하기

`supabase-properties-table.sql`에 이런 컬럼을 추가하세요.

```sql
alter table public.properties add column if not exists latitude double precision;
alter table public.properties add column if not exists longitude double precision;
```

- `double precision`은 소수점이 있는 숫자를 저장하는 타입이에요. (위도/경도는 `37.5665` 처럼 소수점이 있으니까요.)
- 지금 이미 있는 매물들은 이 칸이 비어있을(`null`) 거예요. 나중에 새로 등록하는 매물부터 값이 채워집니다.

## 2단계 — 주소를 좌표로 바꿔주는 카카오 "지오코딩" 기능 쓰기

"지오코딩(Geocoding)"은 **"주소 글자를 좌표 숫자로 바꿔주는 것"** 을 말해요. 카카오 지도 SDK 안에 이 기능이 이미 들어있어요.

### 준비물: SDK에 `services` 라이브러리 추가로 불러오기

지금 `kakaoMap.tsx`에서 SDK를 불러올 때 이렇게 되어 있죠.

```
//dapi.kakao.com/v2/maps/sdk.js?appkey=...&autoload=false
```

지오코딩 기능은 **`services`라는 추가 라이브러리**에 들어있어서, 주소를 다룰 화면(예: `registration.tsx`)에서도 SDK를 불러올 때 뒤에 `&libraries=services`를 붙여줘야 해요.

```
//dapi.kakao.com/v2/maps/sdk.js?appkey=...&autoload=false&libraries=services
```

### 주소 → 좌표 변환 코드 (개념 예시)

```ts
function getCoordsFromAddress(address: string) {
  return new Promise<{ lat: number; lng: number } | null>((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve({
          lat: Number(result[0].y), // 위도
          lng: Number(result[0].x), // 경도
        });
      } else {
        resolve(null); // 변환 실패 (주소가 이상하거나 못 찾음)
      }
    });
  });
}
```

쉽게 풀면:

1. `new window.kakao.maps.services.Geocoder()` — "주소를 좌표로 바꿔주는 번역기"를 하나 만듦
2. `geocoder.addressSearch(주소, 콜백함수)` — "이 주소 좀 좌표로 바꿔줘" 라고 요청
3. 성공하면(`status === "OK"`) 결과의 `y`가 위도, `x`가 경도예요 (카카오는 x=경도, y=위도로 줌 — 헷갈리기 쉬운 부분이니 주의!)
4. `Promise`로 감싼 이유는, 이 변환 작업이 **비동기**(시간이 걸림)라서 `await`로 기다렸다가 쓸 수 있게 하기 위해서예요.

## 3단계 — 등록할 때 좌표도 같이 저장하기

`registration.tsx`의 `handleSave` 안, 실제로 `insert`하기 **직전에** 주소를 좌표로 바꾸는 코드를 추가하세요.

```ts
const coords = await getCoordsFromAddress(form.address);

const { error } = await supabase.from("properties").insert({
  ...
  latitude: coords?.lat ?? null,
  longitude: coords?.lng ?? null,
});
```

> 만약 지오코딩이 실패하면(`coords`가 `null`) 좌표 없이 저장돼요. 그런 매물은 나중에 지도에 핀을 못 찍겠지만, 일단 저장 자체는 막지 않는 게 좋아요.

## 4단계 — 지도 컴포넌트가 "매물 여러 개"의 핀을 그릴 수 있게 바꾸기

지금 `kakaoMap.tsx`는 **마커를 딱 1개**만 그리게 되어 있어요 (`center` 위치에 1개).

```ts
new window.kakao.maps.Marker({ position, map });
```

여러 매물의 핀을 찍으려면, **매물 배열을 받아서 `for`문(또는 `forEach`)으로 매물 개수만큼 마커를 반복해서 만들어야** 해요.

```ts
properties.forEach((property) => {
  if (!property.latitude || !property.longitude) return; // 좌표 없으면 건너뜀

  const position = new window.kakao.maps.LatLng(
    property.latitude,
    property.longitude,
  );

  const marker = new window.kakao.maps.Marker({ position, map });
});
```

이렇게 하면 매물 개수만큼 핀이 지도 위에 쫙 찍혀요. (이 작업은 `main/kakao-map.tsx`에서 이미 가지고 있는 `properties` 배열을 `KakaoMap` 컴포넌트에 props로 넘겨주는 것부터 시작하면 됩니다.)

## 5단계 — 파란 핀 / 빨간 핀 이미지 준비하기

카카오 지도의 기본 마커는 항상 똑같은 모양이라, **색을 구분하려면 직접 이미지를 지정**해야 해요. `kakao.maps.MarkerImage`를 씁니다.

```ts
const blueMarkerImage = new window.kakao.maps.MarkerImage(
  "/markers/blue-pin.png", // public 폴더에 넣어둔 파란 핀 이미지 경로
  new window.kakao.maps.Size(32, 36), // 이미지 크기
);

const redMarkerImage = new window.kakao.maps.MarkerImage(
  "/markers/red-pin.png",
  new window.kakao.maps.Size(32, 36),
);
```

- `public/markers/` 폴더를 만들어서 파란 핀 PNG, 빨간 핀 PNG 이미지 파일을 넣어두면 돼요. (인터넷에서 무료 핀 아이콘을 받거나, 간단한 SVG를 PNG로 만들어도 됩니다.)
- 마커를 만들 때 `image` 옵션에 넣어주면 그 색으로 나와요.

```ts
new window.kakao.maps.Marker({
  position,
  map,
  image: blueMarkerImage, // 기본은 파란색
});
```

## 6단계 — "지금 선택된 매물이 뭔지" 기억하기

클릭했을 때 "어떤 매물이 선택됐는지" 기억할 상자가 필요해요. `useState`로 만듭니다.

```ts
const [selectedId, setSelectedId] = useState<string | null>(null);
```

- 매물 목록에서 카드를 클릭하면 `setSelectedId(property.id)`를 실행해서, "지금 이 매물이 선택된 상태다"라고 기록해요.
- 이 상태는 `main/kakao-map.tsx`(부모)에서 관리하고, `KakaoMap`에는 `selectedId`를 props로 내려줘야 해요. (지도 컴포넌트가 "지금 어떤 게 선택됐는지" 알아야 그 핀만 빨갛게 그릴 수 있으니까요.)

## 7단계 — 선택 상태에 따라 핀 색깔 다시 그리기

매물을 반복하면서 마커를 만들 때, **"이 매물의 id가 selectedId랑 같은지"** 를 확인해서 이미지를 다르게 주면 됩니다.

```ts
properties.forEach((property) => {
  if (!property.latitude || !property.longitude) return;

  const position = new window.kakao.maps.LatLng(
    property.latitude,
    property.longitude,
  );

  const isSelected = property.id === selectedId;

  new window.kakao.maps.Marker({
    position,
    map,
    image: isSelected ? redMarkerImage : blueMarkerImage,
  });
});
```

그리고 이 마커를 그리는 `useEffect`의 **의존성 배열에 `selectedId`도 추가**해야 해요.

```ts
}, [isLoaded, properties, selectedId]);
```

이렇게 해야 `selectedId`가 바뀔 때마다(=사용자가 다른 매물을 클릭할 때마다) **마커들을 다시 그려서** 새로 선택된 것만 빨갛게, 나머지는 전부 파랗게 보이게 돼요. (하나만 선택되는 방식으로 정하셨으니, 매번 전체를 다시 그리면서 `isSelected` 조건만 새로 판단하면 자연스럽게 "이전 빨간 핀은 파랑으로, 새로 클릭한 핀만 빨강으로" 바뀝니다.)

## (선택) 8단계 — 클릭하면 지도가 그 위치로 스르륵 이동하는 연출

원하시면, 선택된 매물 쪽으로 지도 중심을 부드럽게 옮기는 연출도 추가할 수 있어요.

```ts
if (isSelected) {
  map.panTo(position); // 지도를 그 위치로 부드럽게 이동
}
```

`panTo`는 "휙 이동"이 아니라 "스르륵 이동"하는 애니메이션이 들어있는 함수예요.

## 막힐 수 있는 부분 미리 알려드릴게요

- **x/y 헷갈림**: 카카오는 `result[0].x`가 경도, `result[0].y`가 위도예요. 반대로 넣으면 지도가 엉뚱한 나라로 튀어요 (아프리카 앞바다 같은 곳으로요!).
- **`services` 라이브러리 빼먹기**: SDK 주소에 `&libraries=services`를 안 붙이면 `window.kakao.maps.services`가 `undefined`라서 에러가 나요.
- **마커 이미지 경로**: `public/markers/blue-pin.png`처럼 `public` 폴더 기준으로 넣으면, 코드에서는 `/markers/blue-pin.png`로 씁니다 (`public`은 경로에 안 씀).
- **좌표가 없는 매물**: 지오코딩 실패했거나 옛날에 등록한 매물은 `latitude`/`longitude`가 `null`일 수 있어요. 그런 매물은 `if (!property.latitude || !property.longitude) return;`로 건너뛰어야 에러 없이 넘어갑니다.

## 다음에 진행할 순서 (요약)

1. SQL에 `latitude`, `longitude` 컬럼 추가
2. `registration.tsx`에 카카오 SDK(`services` 포함) 불러오고, 지오코딩 함수 작성
3. `handleSave`에서 저장 직전에 좌표 변환 후 같이 insert
4. `kakaoMap.tsx`가 매물 배열(`properties`)을 props로 받아서 여러 마커를 그리도록 수정
5. `public/markers/`에 파란/빨간 핀 이미지 준비
6. `main/kakao-map.tsx`에 `selectedId` state 추가, 목록 클릭 시 변경
7. 마커 그리는 코드에서 `selectedId`와 비교해서 색 다르게 지정 + 의존성 배열에 `selectedId` 추가
8. (선택) `panTo`로 이동 연출 추가

하나씩 만들어보시고, 막히는 단계 있으면 그 단계 번호랑 어떤 에러/현상이 있는지 알려주세요.
