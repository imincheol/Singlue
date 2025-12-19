# Specification Architecture (5-Layer Specs)

이 프로젝트의 문서는 **관심사의 분리(Separation of Concerns)** 원칙에 따라 5단계 레이어로 구성됩니다.
AI와 개발자는 작업 시 해당 관점에 맞는 폴더와 파일을 찾아 내용을 작성해야 합니다.

## �️ The Structure

### 0. Origin (참조 & 원본) - `0_origin/`

- **Role**: 프로젝트의 시작점, 외부 레퍼런스, 불변의 자료.
- **Rule**: **[Read-Only]** 이 폴더의 내용은 원칙적으로 **수정하지 않습니다.** 오직 새로운 자료를 '추가'할 때만 건드립니다.
- **Contents**:
  - 프로젝트 발의 배경, 최초 아이디어 노트.
  - 외부 서비스 API 문서 (PDF, MD).
  - 레거시 시스템 명세서.
  - 절대 변하면 안 되는 브랜드 철학 등.

### 1. Planning (기획 & 정책) - `1_planning/`

- **What & Why**: 무엇을 만들고, 왜 만드는가?
- **Audience**: 기획자, PM, 사용자
- **Contents**: 기능 명세, 사용자 시나리오, 정책(예외처리), 비즈니스 로직.
- **Rule**: 기술 용어(React, API 등)를 배제하고 **사용자 관점**에서 작성합니다.

### 2. Design (디자인 & UI) - `2_design/`

- **Look & Feel**: 어떻게 보이는가?
- **Audience**: 디자이너, 퍼블리셔
- **Contents**: 와이어프레임, 레이아웃 구조, UI 컴포넌트 정의, 디자인 에셋.
- **Rule**: 로직보다는 **시각적 배치와 인터랙션**에 집중합니다.

### 3. Markup (구조 & 스타일) - `3_markup/`

- **Structure**: 뼈대와 색깔은 어떻게 구성하는가?
- **Audience**: 퍼블리셔, 프론트엔드 개발자
- **Contents**: HTML 시맨틱 구조, CSS 변수(테마), 접근성(A11y) 전략.
- **Rule**: JS 로직을 제외한 **순수 마크업 및 스타일링(Tailwind 등)** 전략을 정의합니다.

### 4. Development (구현 & 로직) - `4_development/`

- **How**: 어떻게 작동하는가?
- **Audience**: 프론트엔드/백엔드 개발자
- **Contents**: 데이터 스키마(Type), API 명세, 상태 관리(Store), 컴포넌트 아키텍처.
- **Rule**: 실제 코드로 구현될 **기술적 상세 명세**를 작성합니다.

---

## � Dependency Rule (의존성 규칙)

**"상류(Upstream)가 맑아야 하류(Downstream)가 맑다."**

1. `1_planning`이 변경되면 → 하위 모든 레이어 검토 필요.
2. `4_development`의 변경은 상위 레이어(기획/디자인)에 영향을 주지 않아야 함. (역류 금지)
3. 작업 순서: **Planning → Design → Markup → Development**
