# Order Driven Development (ODD)

이 프로젝트는 **Order Driven Development** 방법론을 따릅니다.
AI와의 협업 시 컨텍스트 유실을 방지하고, 명확한 요구사항 분석을 위해 **모든 작업은 Order(작업 지시서)를 통해서만 시작**됩니다.

**모든 문서는 반드시 한국어로 작성합니다.**

## � Directory Structure

### 1. Task Archive (작업 공간)

작업 상태는 **파일의 확장자 조합**으로 식별합니다.

```text
docs/order/tasks/YYYY/MM/DD/
├── 01_login_order.json      # [필수] 요청서 (Start)
├── 01_login_progress.json   # [임시] 진행 중 (Working...)
└── 01_login_report.json     # [완료] 결과물 (Done)

```

### 2. Status Rules (상태 판별 규칙)

1. **Pending**: `Order` 파일만 존재함. (승인 전)
2. **In Progress**: `Order`와 `Progress` 파일이 공존함. (작업 중, 피드백 루프)
3. **Done**: `Order`와 `Report` 파일이 공존함. (**Progress 파일은 삭제됨**)

---

## � Workflow Rules

### **The Golden Rule: "No Order, No Work."**

Order가 확정되지 않았다면, 스펙 문서 수정이나 코드 작성 등 그 어떤 후속 작업도 진행할 수 없습니다.

---

### Phase 0. Strategy (전략 및 분류)

**"작업을 시작하기 전에 구조부터 설계합니다."**

1. **Request Analysis**: 사용자의 요청이 복잡하거나 여러 개일 경우, AI는 즉시 Order를 만들지 않고 **'Order 구조(포트폴리오)'**를 먼저 제안합니다.
2. **Restructuring**:
* **Merge**: 유사한 작업은 하나로 합칩니다.
* **Split**: 거대한 작업은 관리 가능한 단위(Atomic)로 쪼갭니다.


3. **Approval**: 사용자가 제안된 구조를 승인하면 Phase 1으로 진입합니다.

---

### Phase 1. Planning & Order (분석 및 지시)

**AI는 무작정 작성하기 전, 4단계 스펙 문서를 통해 '현재 상태'를 먼저 파악해야 합니다.**

1. **Context Analysis (기존 스펙 파악)**:
* **Rule**: Order 작성 전, 반드시 `docs/specs/` 하위의 4단계 문서를 교차 검토합니다.
* **검토 가이드 (For Order Reviews)**:
* `1_planning`: 기획 의도, 비즈니스 로직, 기능 명세 확인.
* `2_design`: UI 레이아웃, 디자인 에셋, 컴포넌트 재사용성 확인.
* `3_markup`: HTML 시맨틱 구조, 테마 변수(CSS), 접근성 전략 확인.
* `4_development`: API 명세, 데이터 스키마, 상태 관리 패턴 확인.


* 이 분석 결과는 Order JSON의 `reviews` 필드에 기록되어야 합니다.


2. **Draft Order**:
* `_templates/order.json`을 복사하여 생성합니다.
* 위에서 분석한 4가지 관점의 리뷰를 상세히 작성합니다.


3. **Approval**: 사용자가 `status`를 `APPROVED`로 변경하면 작업이 시작됩니다.

---

### Phase 2. Execution Loop (실행 및 수정)

**이 단계에서는 `Report`를 만들지 않고 `Progress` 파일만 사용합니다.**

1. **Create Progress**: 작업 착수 시 `_templates/progress.json`을 복사하여 생성합니다.
2. **Spec First Update**:
* 코드를 작성하기 전에, **`docs/specs/` 내의 관련 문서를 먼저 업데이트**합니다.
* 문서가 코드의 진실(Source of Truth)이 되도록 합니다.


3. **Implementation**: 업데이트된 스펙을 기준으로 코드를 작성합니다.
4. **Feedback Loop**:
* 버그나 수정 사항 발생 시, `Progress` 파일의 `logs`에 기록하고 작업을 반복합니다.
* 이 과정에서 `Order`는 수정하지 않으며, `Report`는 생성하지 않습니다.



---

### Phase 3. Completion (보고 및 완료)

**모든 목표가 달성되었을 때 수행합니다.**

1. **Generate Report**:
* `Progress` 파일의 내용 중 **핵심 결과(변경 파일, 스펙 업데이트 내역)**만 추출하여 `_templates/report.json`을 생성합니다.
* `review_validation` 필드를 통해 초기 Order의 리뷰 사항이 지켜졌는지 자가 검증합니다.


2. **Cleanup**:
* **`..._progress.json` 파일을 삭제합니다.**
* 이로써 해당 Task는 깔끔하게 `Order` + `Report` 상태로 남게 됩니다.



---

## � Usage Example

**상황**: 오늘(2025-12-19) '다크 모드 지원 로그인 폼' 구현 요청.

1. **Strategy**: "단일 작업이므로 1개의 Order로 진행하겠습니다."
2. **Order**:
* `docs/specs/3_markup/theme_system.md` 참조하여 다크모드 변수 확인.
* `reviews.markup`에 "var(--bg-primary) 사용 필요" 기록 후 승인.


3. **Progress**: `01_login_progress.json` 생성.
* 스펙 문서(`ui_ux.md`, `theme_system.md`) 업데이트.
* 코드 구현 및 테스트.


4. **Report**:
* 작업 성공. `01_login_report.json` 생성.
* `01_login_progress.json` 삭제. -> **완료**