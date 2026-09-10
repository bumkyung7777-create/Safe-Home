# 필터 버튼마다 다른 개수 보여주기 (.reduce 설명서)

`myPage.tsx`의 매물 필터 버튼("전체", "라벨링 인증완료", "심사중", "비공개")에 **각자 다른 개수**를 보여주려다가 생긴 버그와, 그걸 고치는 데 쓴 `.reduce()` 문법을 정리한 문서입니다.

## 1. 뭐가 문제였나요?

원래 코드는 이렇게 되어 있었어요.

```tsx
{PROPERTY_FILTERS.map((filter) => (
  <button key={filter.value} onClick={() => setPropertyFilter(filter.value)}>
    {filter.label}
    {filteredProperties.length}
  </button>
))}
```

버튼 4개를 `.map()`으로 반복해서 그리는데, **버튼 4개가 전부 `filteredProperties.length`라는 똑같은 값 하나**를 보여주고 있었어요.

`filteredProperties`는 "지금 선택된 필터 하나"에 대한 결과라서, 필터를 클릭할 때마다 이 값 하나가 바뀌고 → 그 값을 참조하는 **버튼 4개 전부의 숫자가 동시에 같이 바뀌는** 이상한 현상이 생겼던 거예요.

## 2. 원하는 것 vs 실제로 있던 것

| | 원하는 것 | 실제로 있던 것 |
|---|---|---|
| "전체" 버튼 | 항상 전체 매물 수 | 지금 선택된 필터의 결과 수 (계속 바뀜) |
| "심사중" 버튼 | 항상 심사중인 매물 수 | 지금 선택된 필터의 결과 수 (계속 바뀜) |

버튼마다 **고유하고 고정된 숫자**가 필요한데, 코드는 "지금 선택된 것 하나"만 계산하고 있었으니 안 맞았던 거예요.

## 3. 해결: 상태별 개수를 미리 세어두는 사전 만들기

```ts
const statusCounts = PROPERTIES.reduce(
  (counts, property) => {
    counts[property.status] = (counts[property.status] ?? 0) + 1;
    return counts;
  },
  {} as Record<PropertyStatus, number>,
);
```

## 4. `.reduce()`가 뭐하는 애인지부터

`.reduce()`는 **"배열을 하나씩 훑으면서, 결과 하나(누적값)로 뭉쳐나가는"** 함수예요. 이름 그대로 "여러 개를 하나로 줄인다(reduce)"는 뜻이에요.

비유하면: 사탕이 여러 개 든 바구니(배열)를 하나씩 꺼내면서, **손에 들고 있는 "누적 결과판"** 에 계속 정보를 더해나가는 거예요.

## 5. 구조 뜯어보기

`.reduce()`는 괄호 안에 두 가지를 받아요.

1. **첫 번째: 반복할 때마다 실행할 함수** — `(counts, property) => {...}`
   - `counts` = 지금까지 누적된 결과판 (매번 이전 결과를 이어받음)
   - `property` = 지금 보고 있는 매물 하나 (배열을 하나씩 꺼낸 것)
2. **두 번째: 결과판의 "시작 상태"** — `{} as Record<PropertyStatus, number>`
   - 맨 처음엔 아무것도 안 세어졌으니까 **빈 객체 `{}`** 에서 시작해요.
   - `as Record<PropertyStatus, number>`는 "이 빈 객체는 나중에 `{labeled: 숫자, review: 숫자, private: 숫자}` 모양이 될 거야"라고 TypeScript한테 미리 알려주는 것뿐이에요.

## 6. 실제로 하나씩 따라가보기

`PROPERTIES` 배열엔 매물이 3개 있어요.

```
1번: status: "labeled"
2번: status: "labeled"
3번: status: "review"
```

`.reduce()`가 이걸 하나씩 돌면서 `counts`를 어떻게 바꿔나가는지 순서대로 보면:

**시작**: `counts = {}` (빈 결과판)

**1번째 돌 때** (강남 아크로텔, `status: "labeled"`)
```ts
counts["labeled"] = (counts["labeled"] ?? 0) + 1;
// counts["labeled"]는 아직 없으니까 undefined → ?? 0 → 0 + 1 = 1
```
→ `counts = { labeled: 1 }`

**2번째 돌 때** (마포 리버뷰, `status: "labeled"`)
```ts
counts["labeled"] = (counts["labeled"] ?? 0) + 1;
// 이번엔 counts["labeled"]가 이미 1이 있음 → 1 + 1 = 2
```
→ `counts = { labeled: 2 }`

**3번째 돌 때** (서초 반포, `status: "review"`)
```ts
counts["review"] = (counts["review"] ?? 0) + 1;
// counts["review"]는 아직 없음 → 0 + 1 = 1
```
→ `counts = { labeled: 2, review: 1 }`

**끝!** 더 이상 돌 매물이 없으니 최종 결과: `{ labeled: 2, review: 1 }`

## 7. `counts[property.status] = (counts[property.status] ?? 0) + 1;` 한 줄 자세히

오른쪽부터 읽어보면:

1. `counts[property.status]` — 지금 결과판에서 **이 매물의 상태(labeled든 review든)에 해당하는 숫자**를 꺼내봐요.
2. `?? 0` — 근데 **아직 한 번도 안 세어본 상태라서 값이 없으면(`undefined`)**, `0`으로 시작해요. (`??`는 "없으면 0부터 시작"이라는 뜻으로 딱 이럴 때 씁니다.)
3. `+ 1` — 거기에 **1을 더해요** (지금 이 매물 하나만큼 카운트 올리기)
4. `counts[property.status] = ...` — 그렇게 나온 새 숫자를 **다시 그 자리에 저장**해요.

즉 **"이 매물의 상태 칸을 하나 증가시켜라"** 는 뜻이에요.

## 8. `return counts;`는 왜 필요한가요?

`.reduce()`의 콜백 함수는 **"이번 순서를 다 처리했으면, 다음 순서로 넘겨줄 결과판을 돌려줘야"** 해요. `return counts`가 없으면, 다음 매물을 처리할 때 `counts`가 뭔지 몰라서 에러가 나요. (매번 "자, 이게 지금까지 누적된 결과야, 다음 사람한테 넘길게" 하고 건네주는 거예요.)

## 9. 이걸로 버튼을 어떻게 고쳤나요

```tsx
{PROPERTY_FILTERS.map((filter) => {
  const count =
    filter.value === "all"
      ? PROPERTIES.length
      : (statusCounts[filter.value] ?? 0);

  return (
    <button key={filter.value} onClick={() => setPropertyFilter(filter.value)}>
      {filter.label} ({count})
    </button>
  );
})}
```

- `filter.value === "all"`이면 → 그냥 `PROPERTIES.length`(전체 개수)를 보여줘요.
- 그게 아니면 → 미리 만들어둔 `statusCounts` 사전에서 **그 버튼에 해당하는 상태의 개수만** 꺼내서 보여줘요.

이제 버튼마다 **자기 고유의 숫자**를 갖게 돼서, 어떤 필터를 클릭하든 다른 버튼들의 숫자는 그대로 유지돼요.

## 10. 한 줄 요약

`filteredProperties.length`는 "지금 선택된 것 하나"만 알려주는 값이라 버튼 4개가 공유하면 안 됐고, `.reduce()`로 **"상태별로 각각 몇 개인지" 미리 다 세어둔 사전(`statusCounts`)** 을 만들어서 버튼마다 자기 몫의 숫자를 따로 꺼내 쓰도록 고쳤습니다.
