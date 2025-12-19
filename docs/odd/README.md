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

### 3. Roadmap (`docs/odd/roadmap.md`)

프로젝트의 전체 계획과 진행 상황을 관리하는 **단일 진실 공급원(Single Source of Truth)**입니다.

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

### Phase 0. Strategy & Roadmap (전략 및 로드맵)

**"복잡한 항해를 시작하기 전에 지도부터 그립니다."**

1. **Complexity Check**: 요청이 단일 작업(Single Task)인가, 복합 작업(Multi Task)인가?

* **Single**: 바로 Phase 1(Order)으로 진행.
* **Multi**: **반드시 `docs/odd/roadmap.md`를 먼저 작성/업데이트**해야 합니다.

2. **Roadmap Creation**:

* 요청 사항을 분석하여 Phase(단계)와 Task(단위 작업)로 나눕니다.
* `docs/odd/roadmap.md` 파일에 마크다운 체크리스트 형태로 저장합니다.
* **� STOP**: 로드맵 작성 후, **"로드맵을 승인해 주시면 첫 번째 오더를 생성하겠습니다"**라고 보고하고 멈춥니다.

3. **Execution Approval**:

* 사용자가 로드맵을 승인하면, 가장 우선순위가 높은 Task부터 Phase 1을 시작합니다.

---

### Phase 1. Planning & Order (분석 및 지시)

**AI는 무작정 작성하기 전, 5단계 스펙 아키텍처를 통해 '현재 상태'를 먼저 파악해야 합니다.**

1. **Context Analysis (기존 스펙 파악)**:

* **Rule**: Order 작성 전, 반드시 `docs/specs/` 하위의 문서를 교차 검토합니다.
* **검토 가이드 (For Order Reviews)**:
* `0_origin`: 불변의 참조 자료 확인.
* `1_planning` ~ `4_development`: 각 레이어별 영향도 분석.

* 이 분석 결과는 Order JSON의 `reviews` 필드에 기록되어야 합니다.

2. **Draft Order (작성 및 정지)**:

* `_templates/order.json`을 복사하여 `docs/odd/tasks/`에 생성합니다.
* `status`는 반드시 **"DRAFT"**로 설정합니다.
* **� STOP**: AI는 파일을 생성한 후 작업을 멈추고 **"오더를 작성했으니 확인해주세요"**라고 보고해야 합니다.

3. **User Approval (승인)**:

* 사용자가 내용을 확인하고 "승인"하면, AI는 `status`를 **"APPROVED"**로 변경하고 Phase 2로 진입합니다.

---

### Phase 2. Execution Loop (실행 및 수정)

**이 단계에서는 `Report`를 만들지 않고 `Progress` 파일만 사용합니다.**

1. **Create Progress**: 작업 착수 시 `_templates/progress.json`을 복사하여 생성합니다.

* `order.json`의 핵심 요구사항을 `constraints_mirror` 필드에 복사하여 참고합니다.

2. **Spec First Update**:

* 코드를 작성하기 전에, **`docs/specs/` 내의 관련 문서를 먼저 업데이트**합니다.

3. **Implementation**: 업데이트된 스펙을 기준으로 코드를 작성합니다.
4. **Feedback Loop**:

* `Progress` 파일의 `logs`에 기록하며 반복 작업합니다. (`Report` 생성 금지)

---

### Phase 3. Review & Completion (검토 및 완료)

**AI가 마음대로 완료 처리할 수 없습니다. 반드시 사용자의 승인이 필요합니다.**

1. **Request Review (검토 요청)**:

* 작업 완료 시 `progress.json`의 `status`를 **"REVIEW_REQUIRED"**로 변경하고 멈춥니다.

2. **User Confirmation (확인 및 승인)**:

* 사용자가 결과물을 테스트하고 승인합니다.

3. **Generate Report (최종 완료)**:

* 사용자 승인 후 `_templates/report.json` 기반으로 리포트 생성 및 `progress.json` 삭제.

4. **Archive (아카이빙)**:

* 최종 완료된 `..._order.json`과 `..._report.json` 파일을 **`docs/odd/archive/` 폴더로 이동**시킵니다.
* (Optional) `docs/odd/roadmap.md`의 해당 Task에 체크(`[x]`) 표시를 합니다.
