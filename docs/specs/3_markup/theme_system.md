# 테마 및 마크업 시스템

이 문서는 HTML 시맨틱 구조와 CSS 스타일링(Theme) 전략을 정의합니다.
Logic(JS)이 아닌 **Structure(HTML) & Style(CSS)** 관점입니다.

## � Design Tokens (CSS Variables)

- **Colors**:
  - `--bg-primary`: 메인 배경색
  - `--text-main`: 본문 텍스트 색상
  - `--brand-color`: 포인트 컬러
- **Typography**: 폰트 패밀리 및 사이즈 체계.

## �️ Semantic Structure Rules

- 주요 컨텐츠는 반드시 `<main>` 태그 내부애 위치.
- 클릭 가능한 요소 중 페이지 이동은 `<a>`, 액션은 `<button>` 사용 엄수.
- 아이콘 버튼에는 반드시 `aria-label` 속성 포함.

---
## 🥞 Layer Hierarchy (Z-Index System)

UI 요소의 겹침 순서(Stacking Context)를 제어하기 위한 Z-Index 시스템입니다.
매직 넘버(`z-50`, `z-9999`)를 사용하지 말고, 의미 있는 이름을 사용하십시오.

| Semantic Name | Value | Description |
| :--- | :--- | :--- |
| `z-base` | 0 | 기본 컨텐츠 레벨 |
| `z-fab` | 10 | Floating Action Button, Toast 등 바닥 위의 요소 |
| `z-gnb` | 50 | Global Navigation Bar (헤더) |
| `z-overlay` | 100 | 전체 화면 오버레이 (노래방 모드 등) |
| `z-modal` | 200 | 모달, 다이얼로그 (오버레이 위에 뜸) |
| `z-tooltip` | 300 | 툴팁, 드롭다운 메뉴 (최상단) |

> **Tailwind Config**: `tailwind.config.mjs`에 `theme.extend.zIndex`로 등록되어 있습니다.

