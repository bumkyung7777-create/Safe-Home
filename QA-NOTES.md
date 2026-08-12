# QA 노트

## TypeScript 타입 정의 정리 (src/types/property.ts)

```ts
// property.ts
export type Room = {
  label: string;
  name: string;
  price: string;
  description: string;
  img: string;
};

export type RoomWithMeta = Room & {
  like: boolean;
  score: number;
};

export type RoomList = RoomWithMeta[];

export type PropertyProps = {
  roomType: Room[];
};
```

### `{}` 를 쓰는 곳 vs 안 쓰는 곳

| 타입 | `{}` 사용 여부 | 이유 |
|---|---|---|
| `Room` | O | 새 객체 모양(필드 목록)을 처음부터 정의 |
| `RoomWithMeta` | O (`&` 뒤에) | `Room`에 필드(`like`, `score`)를 "추가"하는데, 추가할 필드 목록을 적어야 하니까 |
| `RoomList` | X | `RoomWithMeta[]`는 이미 있는 타입을 배열로 감싸기만 함. 새 필드가 없으니 `{}` 불필요 |
| `PropertyProps` | O | 새 객체 모양(필드 목록)을 처음부터 정의 |

**규칙**: `{}`는 "새 필드 목록을 나열할 때"만 쓴다. 기존 타입을 그대로 쓰거나(`RoomWithMeta`), 배열로 감싸거나(`RoomWithMeta[]`) 할 때는 필요 없다.

---

## 버그: home.tsx prop 이름 대소문자 오타

`src/components/main/home.tsx`에서:

```tsx
<KakaoMap RoomList={fakeDate} />   // ❌ 대문자 R
```

`KakaoMap` 컴포넌트는 `roomList`(소문자 시작)를 받도록 정의되어 있어서, 대소문자가 다르면 다른 이름의 prop으로 취급되어 타입 에러 발생. `roomList={fakeDate}`로 수정 완료.
