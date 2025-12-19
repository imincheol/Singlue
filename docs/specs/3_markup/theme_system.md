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
(아래에 실제 테마 변수 및 마크업 규칙을 추가하세요)
