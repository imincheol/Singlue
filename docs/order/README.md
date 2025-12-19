# Order Driven Development (ODD)

이 프로젝트는 **Order Driven Development** 방법론을 따릅니다.
AI와의 협업 시 컨텍스트 유실을 방지하고, 명확한 요구사항 분석을 위해 **모든 작업은 Order(작업 지시서)를 통해서만 시작**됩니다.

**모든 문서는 반드시 한국어로 작성합니다.**

## 📂 Directory Structure (Task Archive)

작업은 `docs/order/tasks/YYYY/MM/DD/` 경로에 날짜별로 기록됩니다.
**Order(요청)와 Report(결과)는 반드시 같은 폴더 내에 쌍(Pair)으로 존재해야 합니다.**

```text
docs/order/tasks/
└── {Year}/
    └── {Month}/
        └── {Day}/
            ├── {Seq}_{TaskName}_order.json   # [필수] 작업 요청서
            └── {Seq}_{TaskName}_report.json  # [완료 시 생성] 결과 보고서

```

### 🔍 작업 상태 판별 규칙

* **Pending (작업 전)**: `..._order.json` 파일은 있지만, 동일한 이름의 `..._report.json` 파일이 **없는** 경우.
* **Done (완료)**: `..._order.json`과 `..._report.json`이 **모두 존재하는** 경우.

---

## 🚀 Workflow Rules

### **The Golden Rule: "No Order, No Work."**

Order가 확정되지 않았다면, 스펙 문서 수정이나 코드 작성 등 그 어떤 후속 작업도 진행할 수 없습니다.

### Phase 1. Planning & Order (분석 및 지시)

**가장 중요한 단계입니다. AI는 무작정 작성하기 전, '기획 의도'와 '기술적 환경'을 먼저 파악해야 합니다.**

1. **User Prompt (요청)**: 사용자가 자연어로 작업을 요청합니다.
2. **Context Analysis (기존 스펙 및 개발 환경 파악)**:
* **Rule**: 작업 전 반드시 `docs/planning/`과 `docs/development/`를 교차 검토합니다.
* **검토 가이드 (For Order Reviews)**:
* **기획/디자인 관점** (`docs/planning/` 참조):
* `features.md`: 기존 기능과의 충돌 여부 및 로직 흐름 확인.
* `ui_ux_spec.md`: UI 가이드라인 및 재사용 컴포넌트 확인.


* **마크업/개발 관점** (`docs/development/` 참조):
* `data_structure.md`: DB 스키마 및 모델링 변경 필요 여부 확인.
* `conventions.md`: 코드 스타일, 폴더 구조 규칙 확인.
* `tech_stack.md` & `theme_spec.md`: 사용 가능한 라이브러리 및 테마 변수 확인.




* 이 분석 결과는 Order JSON의 `reviews` 필드에 구체적으로 기록되어야 합니다.


3. **Create Task Folder**: 오늘 날짜의 폴더가 없다면 생성합니다. (예: `tasks/2025/12/19/`)
4. **Draft Order (지시서 작성)**:
* `_templates/order.json`을 복사하여 `01_taskname_order.json`을 생성합니다.
* 위에서 분석한 내용을 바탕으로 **4가지 관점(기획, 디자인, 마크업, 개발)**의 리뷰를 작성합니다.


5. **User Approval (승인)**:
* 사용자가 Order 내용(특히 분석 파트)을 검토합니다.
* `status`를 `APPROVED`로 변경해야만 다음 단계로 넘어갈 수 있습니다.



### Phase 2. Specification Update (문서화)

**승인된 Order를 기반으로 문서를 먼저 수정합니다.**

1. **Update Specs**:
* `docs/planning/` (기획/UI) 및 `docs/development/` (DB/개발가이드) 내의 관련 문서를 업데이트합니다.
* **Rule**: 코드를 작성하기 전에 문서가 Order의 내용을 반영하고 있어야 합니다. (Single Source of Truth)



### Phase 3. Implementation (구현)

업데이트된 스펙 문서를 기준으로 개발을 진행합니다.

1. **Code**: Order 요구사항과 최신화된 스펙 문서(`planning` + `development`)에 맞춰 코드를 작성합니다.
2. **Review**: 기획/디자인/마크업/개발 리뷰 사항이 코드에 반영되었는지 중간 점검합니다.

### Phase 4. Reporting (보고 & 완료)

1. **Write Report**:
* 작업이 끝나면 `_templates/report.json`을 복사하여, Order와 동일한 위치/이름으로 `..._report.json`을 생성합니다.
* `spec_updated`(문서 변경)와 `code_updated`(코드 변경)를 명확히 구분하여 기록합니다.
* `review_validation`을 통해 Order의 4가지 리뷰 사항이 기술적으로 올바르게 구현되었는지 자가 검증합니다.


2. **User Confirmation**:
* 사용자가 Report를 확인하면 해당 Task는 종료된 것으로 간주합니다.

---

## 📝 Usage Example

**상황**: 오늘(2025-12-19) '다크 모드 지원 로그인 폼'을 구현해야 함.

1. **Context Analysis**:
* `docs/planning/ui_ux_spec.md`에서 로그인 폼 디자인 확인.
* `docs/development/theme_spec.md`에서 다크 모드 컬러 변수 확인.
* `docs/development/conventions.md`에서 CSS(Tailwind 등) 작성 규칙 확인.


2. **Order 생성**: `tasks/2025/12/19/01_login_darkmode_order.json` 생성.
* `reviews.markup`: "theme_spec.md에 정의된 var(--bg-primary) 사용 필요" 등을 기록.


3. **승인**: 사용자 승인 (`status`: `APPROVED`).
4. **스펙 업데이트**: 필요한 경우 문서 현행화.
5. **개발 진행**: 실제 코드 작성.
6. **Report 생성**: 결과 저장 및 사용 테마 변수 검증 기록.
