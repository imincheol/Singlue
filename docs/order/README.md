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

1. **User Prompt (요청)**: 사용자가 자연어로 작업을 요청합니다.
2. **Create Task Folder**: 오늘 날짜의 폴더가 없다면 생성합니다. (예: `tasks/2025/12/19/`)
3. **Draft Order (지시서 작성)**:
* `_templates/order.json`을 복사하여 `01_taskname_order.json`을 생성합니다.
* **핵심 요구사항**: `reviews` 섹션에 **기획, 디자인, 마크업, 개발** 4가지 관점의 분석 내용을 반드시 포함합니다.


4. **User Approval (승인)**:
* 사용자가 Order 내용(특히 분석 파트)을 검토하고 승인합니다.
* 수정이 필요하면 Order 파일을 수정합니다.



### Phase 2. Specification Update (문서화)

**승인된 Order를 기반으로 문서를 먼저 수정합니다.**

1. **Update Specs**:
* `docs/planning/` 내의 관련 문서(`features.md`, `ui_ux_spec.md` 등)를 업데이트합니다.
* 코드를 작성하기 전에 스펙 문서가 Order의 내용을 반영하고 있어야 합니다.



### Phase 3. Implementation (구현)

업데이트된 스펙 문서를 기준으로 개발을 진행합니다.

1. **Code**: Order 요구사항과 스펙 문서에 맞춰 코드를 작성합니다.
2. **Review**: 기획/디자인/마크업/개발 리뷰 사항이 반영되었는지 체크합니다.

### Phase 4. Reporting (보고 & 완료)

1. **Write Report**:
* 작업이 끝나면 `_templates/report.json`을 복사하여, Order와 동일한 위치/이름으로 `..._report.json`을 생성합니다.
* (예: `01_taskname_order.json` → `01_taskname_report.json`)
* 변경된 파일, 테스트 결과, 특이사항을 기록합니다.


2. **User Confirmation**:
* 사용자가 Report를 확인하면 해당 Task는 종료된 것으로 간주합니다.

---

## 📝 Usage Example

**상황**: 오늘(2025-12-19) 로그인 API를 만들어야 함.

1. **Order 생성**: `tasks/2025/12/19/01_login_api_order.json` 생성.
2. **분석 및 승인**: Order 내 `reviews` 작성 및 사용자 승인.
3. **스펙 업데이트**: `docs/planning/api_spec.md` 업데이트.
4. **개발 진행**: 실제 코드 작성.
5. **Report 생성**: `tasks/2025/12/19/01_login_api_report.json` 저장.

→ **다음 세션 시작 시**: AI는 `tasks` 폴더를 스캔하여 Report가 없는 Order를 찾거나, 가장 최근의 Report를 읽어 컨텍스트를 파악함.
