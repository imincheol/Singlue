# 🎨 Web Layer System (웹 레이어 시스템)

복잡한 겹침(Overlapping) 요소들을 제어하기 위한 규칙입니다.
`z-index: 9999`와 같은 매직 넘버 사용을 금지합니다.

## 🏗️ Semantic Z-Index Hierarchy

우리는 `tailwind.config.mjs`에 정의된 **의미론적 이름(Semantic Name)**만을 사용해야 합니다.

| Level | Value | Name | Description |
|:---:|:---:|:---|:---|
| **Top** | `9999` | `z-toast` | 최상단 알림 (Toast) |
| ↑ | `5000` | `z-modal` | 대화상자, 팝업 |
| ↑ | `4000` | `z-dropdown` | 드롭다운 메뉴 |
| ↑ | `3000` | `z-sticky` | 상단 고정 헤더 (GNB) |
| ↑ | `2000` | `z-overlay` | 카라오케 전체화면 오버레이 |
| **Base** | `0` | `z-base` | 일반 콘텐츠 |
| **Bottom**| `-1` | `z-background`| 배경 요소 |

### Usage Example
```tsx
// Bad ❌
<div className="z-50" />
<div style={{ zIndex: 999 }} />

// Good ⭕
<div className="z-modal" />
<div className="z-overlay" />
```

---

## 🏛️ Decision History

### [2025-12-20] Z-Index Systemization
- **Issue**: 모바일 메뉴가 헤더 뒤로 숨거나, 카라오케 가사가 드롭다운을 가리는 문제 발생.
- **Fix**: 숫자로 하드코딩된 모든 z-index를 제거하고, 위 표에 따른 Tailwind Utility로 전면 교체함.

## ⚠️ Cautions

1. **Stacking Context (쌓임 맥락)**:
   - `opacity`나 `transform`이 적용된 부모 요소 내부에 있으면, 자식의 `z-index`가 아무리 높아도 부모를 탈출할 수 없습니다.
   - 모달이나 오버레이는 가능하면 DOM 트리의 최상위(`Body` 직계 자식)로 포탈(Portal)을 사용해 렌더링하십시오.
