# 매물 클릭 → 지도 핀 색깔 바뀌는 기능, 실제로 어떻게 만들었나

`MAP-PIN-NOTES.md`가 "이렇게 만들면 돼요"라는 **계획서**였다면, 이 문서는 **실제로 짜여진 코드**(`kakaoMap.tsx`, `main/kakao-map.tsx`)를 한 줄 한 줄 왜 그렇게 만들었는지 설명하는 문서예요.

## 0. 전체 그림 먼저

```
[매물 목록에서 카드 클릭]
        ↓
selectedId state가 그 매물의 id로 바뀜 (main/kakao-map.tsx)
        ↓
markers 배열을 다시 계산 (useMemo) — 클릭한 매물만 isSelected: true
        ↓
markers를 KakaoMap 컴포넌트에 props로 전달
        ↓
KakaoMap이 markers를 보고 지도 위 핀들을 다시 그림
   - isSelected가 true인 것 → 빨간 핀
   - 나머지 → 파란 핀
```

두 파일이 역할을 나눠 갖고 있어요.

- **`main/kakao-map.tsx`** = "누가 선택됐는지" 기억하고 관리하는 곳 (두뇌)
- **`kakaoMap.tsx`** = 받은 정보대로 실제 지도에 핀을 그리는 곳 (손)

## 1. 핀 이미지를 어떻게 "파일 없이" 만들었나 — `createPinImageSrc`

```ts
function createPinImageSrc(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${color}" />
    <circle cx="16" cy="16" r="6" fill="white" />
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const BLUE_PIN_IMAGE = createPinImageSrc("#2563eb");
const RED_PIN_IMAGE = createPinImageSrc("#dc2626");
```

원래 계획(`MAP-PIN-NOTES.md`)에는 "파란 핀/빨간 핀 PNG 이미지 파일을 `public/markers/`에 넣어두자"고 되어 있었는데, 실제로는 **이미지 파일 없이 코드로 직접 그림을 만드는 방식**으로 갔어요.

쉽게 풀면:

1. `svg` 변수 안에 **글자로 된 그림 설명서**가 들어있어요. `<path>`는 물방울 모양(지도 핀 모양)을 그리는 좌표들이고, `fill="${color}"`가 그 모양을 무슨 색으로 칠할지 정해요. `<circle>`은 핀 가운데 흰 동그라미(장식)예요.
2. `btoa(svg)` — 이 글자 그림 설명서를 **base64**라는 방식으로 암호처럼 인코딩해요. (이미지 파일을 인터넷 주소 하나에 통째로 욱여넣기 위한 변환 작업이라고 생각하면 돼요.)
3. `data:image/svg+xml;base64,...` — 이렇게 시작하는 문자열은 **"이건 파일 경로가 아니라, 이미지 데이터 자체가 이 안에 다 들어있다"** 는 뜻이에요. `<img src="여기">`에 넣으면 진짜 이미지 파일을 올린 것처럼 브라우저가 그려줘요.
4. `BLUE_PIN_IMAGE`, `RED_PIN_IMAGE` — 이렇게 색깔별로 미리 하나씩 만들어두고 재사용해요. (매번 새로 만들면 낭비니까, 컴포넌트 바깥에서 딱 한 번만 계산해둔 거예요.)

**장점**: 이미지 파일을 따로 준비하고 `public` 폴더에 넣는 수고를 안 해도 돼요. **단점**: 복잡한 그림(사진 같은 것)은 이 방식으로 못 만들어요. 지금처럼 단순한 도형에만 적합해요.

## 2. "지금까지 그려둔 핀"을 기억해야 하는 이유 — `useRef`

```ts
const mapObjRef = useRef<any>(null);
const propertyMarkerObjsRef = useRef<any[]>([]);
```

핀을 다시 그릴 때마다(선택이 바뀔 때마다), **이전에 그려둔 핀들을 먼저 지워야** 해요. 안 지우면 클릭할 때마다 핀이 계속 쌓여서 지도가 핀으로 도배될 거예요.

그런데 "지도 객체"나 "핀 객체들"은 `useState`로 관리하기 애매해요. 왜냐하면:

- `useState`로 관리하면, 값이 바뀔 때마다 컴포넌트가 **다시 렌더링**돼요. 근데 지도 객체 자체는 화면에 보이는 것과 상관없이 "그냥 저장해두고 나중에 다시 쓸 도구"일 뿐이라, 렌더링을 유발할 필요가 없어요.
- `useRef`는 **"값은 저장하는데, 바뀌어도 다시 렌더링은 안 시키는 상자"** 예요. 딱 이런 용도(카카오 지도 API가 주는 객체를 그냥 붙잡아두는 용도)에 맞아요.

그래서 마커를 다시 그리는 코드 맨 앞에 이런 게 있어요.

```ts
propertyMarkerObjsRef.current.forEach((marker) => marker.setMap(null)); // 지도에서 다 지움
propertyMarkerObjsRef.current = []; // 목록도 비움
```

**"이전에 그려둔 핀들을 지도에서 다 떼어내고, 목록도 깨끗이 비운 다음, 새로 그린다"** 는 뜻이에요.

## 3. useEffect를 왜 2개로 나눴나

```ts
// ① 지도 자체를 만들고, 중심 위치를 옮기는 역할
useEffect(() => { ... }, [isLoaded, center, level]);

// ② 매물 핀들을 그리는 역할
useEffect(() => { ... }, [isLoaded, markers]);
```

이 둘을 합치지 않고 나눈 이유는, **"언제 다시 실행돼야 하는지"가 서로 다르기 때문**이에요.

- ①번은 "내 현재 위치(`center`)"가 바뀌거나 확대/축소 단계(`level`)가 바뀔 때만 다시 실행되면 돼요. 매물을 클릭했다고 해서 지도 자체를 통째로 새로 만들 필요는 없어요.
- ②번은 "선택된 매물이 바뀌었을 때"(`markers` 배열 안의 `isSelected` 값이 바뀔 때) 다시 실행돼야 해요.

이렇게 나눠두면, **매물을 클릭해도 지도 자체는 그대로 있고 핀들만 다시 그려져요.** 만약 하나로 합쳤다면, 클릭할 때마다 지도가 통째로 다시 만들어져서 화면이 깜빡이거나 확대/이동했던 게 초기화되는 문제가 생겼을 거예요.

### ①번 안에서 지도를 "새로 만들지, 그냥 옮길지" 구분하는 부분

```ts
if (!mapObjRef.current) {
  mapObjRef.current = new window.kakao.maps.Map(mapRef.current!, {
    center: position,
    level,
  });
} else {
  mapObjRef.current.setCenter(position);
}
```

- **처음 한 번**은 `mapObjRef.current`가 비어있으니(`null`) 지도를 새로 만들고 그 결과를 `mapObjRef`에 저장해둬요.
- **그 다음부터는** 이미 지도가 있으니, 새로 만들지 않고 `setCenter(...)`로 **중심 위치만 옮겨요.**

이것도 "지도를 계속 새로 만드는 낭비를 막기 위한" 장치예요.

## 4. `main/kakao-map.tsx`에서 "누가 선택됐는지" 계산하는 부분

```ts
const markers = useMemo(
  () =>
    properties
      .filter(
        (property): property is PropertyRecord & {
          latitude: number;
          longitude: number;
        } => property.latitude !== null && property.longitude !== null,
      )
      .map((property) => ({
        id: property.id,
        lat: property.latitude,
        lng: property.longitude,
        isSelected: property.id === selectedId,
      })),
  [properties, selectedId],
);
```

쉽게 풀면:

1. **`.filter(...)`** — 전체 매물 중에서 **좌표(`latitude`, `longitude`)가 있는 것만** 골라내요. 지오코딩이 실패해서 좌표가 `null`인 매물은 핀을 못 찍으니까 아예 걸러내는 거예요.
   - 여기 필터 함수가 좀 복잡해 보이는데(`property is PropertyRecord & {...}`), 이건 TypeScript한테 **"이 필터를 통과한 것들은 이제 latitude/longitude가 진짜 숫자라고 믿어도 돼"** 라고 알려주는 문법이에요. 이게 없으면 바로 다음 줄에서 "null일 수도 있는데?"라고 TypeScript가 계속 딴지를 걸어요.
2. **`.map(...)`** — 걸러낸 매물들을 지도가 이해할 수 있는 모양(`{id, lat, lng, isSelected}`)으로 바꿔요.
3. **`isSelected: property.id === selectedId`** — "이 매물의 id가 지금 선택된 id랑 똑같니?"를 매번 다시 계산해요. 클릭해서 `selectedId`가 바뀌면, 이 계산도 자동으로 다시 돌아가서 **새로 클릭한 것만 `true`, 나머지는 전부 `false`**가 돼요. (이게 "하나만 빨간색 유지"가 자동으로 되는 이유예요 — 따로 "이전 것을 파란색으로 되돌리는 코드"를 안 짜도, 매번 전체를 다시 계산하니까 자연스럽게 그렇게 돼요.)
4. **`useMemo`** — "properties나 selectedId가 진짜로 바뀔 때만 이 계산을 다시 해라"는 뜻이에요. 관계없는 다른 상태가 바뀌었다고 매번 이 계산을 다시 하면 낭비니까요.

## 5. 목록 클릭했을 때 — `<Link>`를 `<button>`으로 바꾼 이유

원래 코드는 이렇게 되어 있었어요.

```tsx
<Link href="/">
  <div>...</div>
</Link>
```

이건 클릭하면 그냥 메인페이지(`/`)로 이동만 하는, **아직 아무 기능도 없는 자리표시자(placeholder)** 였어요. 지금 우리가 원하는 건 "페이지 이동"이 아니라 **"이 매물을 선택 상태로 만들기"** 니까, 페이지 이동 링크 대신 클릭 이벤트를 받을 수 있는 버튼으로 바꿨어요.

```tsx
<button
  type="button"
  onClick={() => setSelectedId(item.id)}
  className={`flex font-card gap-4 w-full text-left ${
    item.id === selectedId ? "ring-2 ring-[#002045] rounded-md" : ""
  }`}
>
  ...
</button>
```

- `onClick={() => setSelectedId(item.id)}` — 클릭하면 "선택된 매물"을 이 매물의 id로 바꿔요. 이게 전체 흐름의 **출발점**이에요. 이 한 줄이 실행돼야 위에서 설명한 `markers` 재계산 → 지도 다시 그리기가 전부 연쇄적으로 일어나요.
- `ring-2 ring-[#002045]` — 지도 핀뿐 아니라, **목록의 카드 자체에도** 선택됐다는 표시(테두리)를 넣어서, 사용자가 "내가 방금 뭘 클릭했는지" 목록에서도 바로 알 수 있게 했어요.

## 6. 전체 흐름을 이어서 다시 보기

```
1. 사용자가 "강남 아크로텔" 카드를 클릭
        ↓
2. onClick 실행 → setSelectedId("강남아크로텔의id")
        ↓
3. selectedId state가 바뀌었으니 컴포넌트가 다시 렌더링됨
        ↓
4. useMemo가 selectedId 변경을 감지 → markers 배열을 새로 계산
   → 강남 아크로텔 항목만 isSelected: true, 나머지는 false
        ↓
5. 새로 계산된 markers가 <KakaoMap markers={markers} />로 전달됨
        ↓
6. KakaoMap 안의 useEffect가 markers 변경을 감지해서 실행됨
        ↓
7. 기존 핀들 전부 지도에서 제거 (setMap(null))
        ↓
8. markers를 하나씩 돌면서 새 핀 생성
   - isSelected가 true인 것 → RED_PIN_IMAGE
   - 나머지 → BLUE_PIN_IMAGE
        ↓
9. 화면에 "강남 아크로텔"만 빨간 핀, 나머지는 파란 핀으로 보임
```

## 7. 요약: 제가 판단해서 정한 것들

계획서(`MAP-PIN-NOTES.md`)에는 없었지만, 실제로 코드를 짜면서 제가 판단해서 결정한 부분들이에요.

| 결정 | 이유 |
|---|---|
| PNG 이미지 파일 대신 SVG를 코드로 생성 | 이미지 파일을 따로 준비/업로드할 필요 없이 바로 동작하게 하려고 |
| `useRef`로 지도/마커 객체 저장 | 렌더링을 유발하지 않으면서 카카오 API 객체를 계속 붙잡아두기 위해 |
| `useEffect`를 지도 생성용/마커 그리기용으로 분리 | 매물 클릭할 때마다 지도 전체가 재생성되는 걸 막기 위해 |
| `<Link href="/">`를 `<button onClick>`으로 교체 | 원래 아무 기능 없던 더미 링크를 실제 선택 기능이 있는 버튼으로 바꾸기 위해 |
| 목록 카드에도 선택 테두리 표시 추가 | 지도 핀 색깔뿐 아니라 목록에서도 어떤 걸 선택했는지 바로 보이게 하려고 |

궁금한 부분이나 다르게 바꾸고 싶은 결정이 있으면 말씀해주세요.
