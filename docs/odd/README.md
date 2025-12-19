# Order Driven Development (ODD)

이 프로젝트는 **Order Driven Development** 방법론을 따릅니다.
AI와의 협업 시 컨텍스트 유실을 방지하고, 명확한 요구사항 분석을 위해 **모든 작업은 Order(작업 지시서)를 통해서만 시작**됩니다.

**모든 문서는 반드시 한국어로 작성합니다.**

## � Directory Structure

작업은 **'진행 중(Active)'**과 **'완료(Archived)'** 상태로 물리적으로 분리하여 관리합니다.

### 1. Active Tasks (`docs/odd/tasks/`)

현재 진행 중인 작업들이 위치하는 공간입니다. **날짜별 폴더를 생성하지 않고 Flat하게 관리합니다.**

* **파일명 규칙**: `YYYYMMDD_SEQ_TaskName_Type.json`
  * 예: `20251220_01_login_feature_order.json`

```text
docs/odd/tasks/
├── 20251220_01_login_order.json      # [Pending] 승인 대기
├── 20251220_01_login_progress.json   # [In Progress] 작업 중
└── 20251220_02_bugfix_order.json     # [Pending] 다른 작업

```

### 2. Archived Tasks (`docs/odd/archive/`)

완료된 작업(`Order` + `Report`)은 이 폴더로 이동하여 보관합니다.

```text
docs/odd/archive/
├── 20251219_01_init_order.json       # [Done] 완료된 오더
└── 20251219_01_init_report.json      # [Done] 완료 보고서

```

---

## � Status Rules (상태 판별 규칙)

1. **Pending (승인 대기)**: `tasks/` 폴더에 `Order` 파일만 존재함.
2. **In Progress (작업 중)**: `tasks/` 폴더에 `Order`와 `Progress` 파일이 공존함.
3. **Review Required (검토 대기)**: `Progress` 파일 내 `status`가 `"REVIEW_REQUIRED"`임.
4. **Done (완료)**: `tasks/` 폴더의 파일들이 **`archive/` 폴더로 이동됨.**

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

* `_templates/order.json`을 복사하여 `docs/odd/tasks/`에 생성합니다.
* **파일명 준수**: `YYYYMMDD_SEQ_TaskName_order.json`
* `status`는 반드시 **"DRAFT"**로 설정합니다.
* **� STOP**: AI는 파일을 생성한 후 작업을 멈추고 **"오더를 작성했으니 확인해주세요"**라고 보고해야 합니다. (자동 진행 금지)

3. **User Approval (승인)**:

* 사용자가 내용을 확인하고 "승인"하면, AI는 `status`를 **"APPROVED"**로 변경하고 Phase 2로 진입합니다.

---

### Phase 2. Execution Loop (실행 및 수정)

**이 단계에서는 `Report`를 만들지 않고 `Progress` 파일만 사용합니다.**

1. **Create Progress**: 작업 착수 시 `_templates/progress.json`을 복사하여 생성합니다.

* 파일명: `YYYYMMDD_SEQ_TaskName_progress.json`
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

* 사용자의 승인이 떨어진 후에만 `_templates/report.json`을 기반으로 `..._report.json`을 생성합니다.
* `progress.json` 파일을 **삭제**합니다.

4. **Archive (아카이빙)**:

* 최종 완료된 `..._order.json`과 `..._report.json` 파일을 **`docs/odd/archive/` 폴더로 이동**시킵니다.
* `docs/odd/tasks/` 폴더는 항상 **현재 진행 중인 작업**만 남겨둡니다.

---

## � Usage Example

**상황**: 2025년 12월 20일 '다크 모드' 구현 요청.

1. **Draft**: `tasks/20251220_01_darkmode_order.json` 생성 (DRAFT) -> **STOP**.
2. **Approval**: 사용자 승인 (APPROVED).
3. **Progress**: `tasks/20251220_01_darkmode_progress.json` 생성.

* 스펙 업데이트 -> 코드 구현 -> 테스트.

4. **Review Request**: `progress` 상태 `REVIEW_REQUIRED` 변경 -> **STOP**.
5. **Completion**: 사용자 최종 승인.

* `tasks/20251220_01_darkmode_report.json` 생성.
* `tasks/20251220_01_darkmode_progress.json` 삭제.

6. **Archive**: `order`와 `report` 파일을 `docs/odd/archive/`로 이동. -> **Done**.
