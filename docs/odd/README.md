# Order Driven Development (ODD)

이 프로젝트는 **Order Driven Development** 방법론을 따릅니다.
AI와의 협업 시 컨텍스트 유실을 방지하고, 명확한 요구사항 분석을 위해 **모든 작업은 Order(작업 지시서)를 통해서만 시작**됩니다.

**모든 문서는 반드시 한국어로 작성합니다.**

## � Directory Structure

### 1. Task Archive (작업 공간)

작업 상태는 `docs/odd/tasks/YYYY/MM/DD/` 내의 **파일 확장자 조합**으로 식별합니다.

```text
docs/odd/tasks/YYYY/MM/DD/
├── 01_login_order.json      # [필수] 요청서 (Start)
├── 01_login_progress.json   # [임시] 진행 중 (Working...)
└── 01_login_report.json     # [완료] 결과물 (Done)

```

### 2. Status Rules (상태 판별 규칙)

1. **Pending (승인 대기)**: `Order` 파일만 존재함.
2. **In Progress (작업 중)**: `Order`와 `Progress` 파일이 공존함.
3. **Review Required (검토 대기)**: `Progress` 파일 내 `status`가 `"REVIEW_REQUIRED"`임.
4. **Done (완료)**: `Order`와 `Report` 파일이 공존함. (**Progress 파일은 삭제됨**)

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

**AI는 무작정 작성하기 전, 5단계 스펙 아키텍처를 통해 '현재 상태'를 먼저 파악해야 합니다.**

1. **Context Analysis (기존 스펙 파악)**:

* **Rule**: Order 작성 전, 반드시 `docs/specs/` 하위의 문서를 교차 검토합니다.
* **검토 가이드 (For Order Reviews)**:
* `0_origin` (Read-Only): 프로젝트 기원, 불변의 규칙, 외부 API 문서 참조.
* `1_planning`: 기획 의도, 비즈니스 로직, 기능 명세 확인.
* `2_design`: UI 레이아웃, 디자인 에셋, 컴포넌트 재사용성 확인.
* `3_markup`: HTML 시맨틱 구조, 테마 변수(CSS), 접근성 전략 확인.
* `4_development`: API 명세, 데이터 스키마, 상태 관리 패턴 확인.

* 이 분석 결과는 Order JSON의 `reviews` 필드에 기록되어야 합니다.

2. **Draft Order (작성 및 정지)**:

* `_templates/order.json`을 복사하여 생성합니다.
* `status`는 반드시 **"DRAFT"**로 설정합니다.
* **� STOP**: AI는 파일을 생성한 후 작업을 멈추고 **"오더를 작성했으니 확인해주세요"**라고 보고해야 합니다. (자동 진행 금지)

3. **User Approval (승인)**:

* 사용자가 내용을 확인하고 "승인"하면, AI는 `status`를 **"APPROVED"**로 변경하고 Phase 2로 진입합니다.

---

### Phase 2. Execution Loop (실행 및 수정)

**이 단계에서는 `Report`를 만들지 않고 `Progress` 파일만 사용합니다.**

1. **Create Progress**: 작업 착수 시 `_templates/progress.json`을 복사하여 생성합니다.

* `order.json`의 핵심 요구사항을 `constraints_mirror` 필드에 복사하여 작업 내내 참고합니다.

2. **Spec First Update**:

* 코드를 작성하기 전에, **`docs/specs/` 내의 관련 문서를 먼저 업데이트**합니다.
* 문서가 코드의 진실(Source of Truth)이 되도록 합니다.

3. **Implementation**: 업데이트된 스펙을 기준으로 코드를 작성합니다.
4. **Feedback Loop**:

* 버그나 수정 사항 발생 시, `Progress` 파일의 `logs`에 기록하고 작업을 반복합니다.
* 이 과정에서 `Order`는 수정하지 않으며, `Report`는 절대 생성하지 않습니다.

> **� Tip: Log Management**
> `progress.json`의 `logs`가 너무 길어지면(20항목 이상), AI는 스스로 지난 로그를 요약하거나 중요한 에러 메시지만 남기고 정리하여 컨텍스트 낭비를 막아야 합니다.

---

### Phase 3. Review & Completion (검토 및 완료)

**AI가 마음대로 완료 처리할 수 없습니다. 반드시 사용자의 승인이 필요합니다.**

1. **Request Review (검토 요청)**:

* 모든 작업이 완료되면, AI는 `progress.json`의 `status`를 **"REVIEW_REQUIRED"**로 변경합니다.
* **� STOP**: 리포트를 만들지 않고 **"작업을 마쳤으니 확인해주세요"**라고 보고해야 합니다.

2. **User Confirmation (확인 및 승인)**:

* 사용자가 결과물을 테스트합니다.
* 문제가 있다면 -> 피드백을 주고 Phase 2로 되돌려 보냅니다.
* 문제가 없다면 -> **"완료해(Approve)"**라고 승인합니다.

3. **Generate Report (최종 완료)**:

* 사용자의 승인이 떨어진 후에만 `_templates/report.json`을 기반으로 리포트를 생성합니다.
* **Cleanup**: `..._progress.json` 파일을 **삭제**하여 Task를 종료합니다.

---

## � Usage Example

**상황**: 오늘(2025-12-19) '다크 모드 지원 로그인 폼' 구현 요청.

1. **Strategy**: "단일 작업이므로 1개의 Order로 진행하겠습니다."
2. **Draft**: `01_login_order.json` 생성 (Status: DRAFT) -> **STOP**.
3. **Approval**: 사용자 승인 -> (Status: APPROVED).
4. **Progress**: `01_login_progress.json` 생성.

* 스펙 문서(`ui_ux.md`, `theme_system.md`) 업데이트.
* 코드 구현 및 테스트.

5. **Review Request**: 구현 완료 -> `progress` 상태를 `REVIEW_REQUIRED`로 변경 -> **STOP**.
6. **Completion**: 사용자 최종 승인 -> `01_login_report.json` 생성 및 `progress` 삭제 -> **Done**.
