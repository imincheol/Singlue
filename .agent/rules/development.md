---
trigger: always_on
---

스펙주도개발(SDD, Spec Driven Development) 또는 문서주도개발(Documnet Driven Development) 로 개발을 진행하자.

### 작업 관리 흐름 (Order & Report)
모든 작업은 **JSON 기반의 Order Sheet와 Report**로 관리한다.

1.  **Order Sheet 작성 (Start of Task)**
    - 작업을 시작하기 전, `docs/order/_templates/order.json`을 복사하여 `docs/order/YYYY-MM-DD-[task_name]-order.json`을 생성한다.
    - 파일명 예시: `2024-12-19-fix-login-order.json`
    - `ticket_id`, `context`, `requirements` 등 필수 항목을 **한국어**로 작성한다.

2.  **스펙 검토 및 업데이트**
    - `docs/` 내의 관련 스펙 문서(features.md, data_structure.md 등)를 확인하고 업데이트한다.

3.  **개발 (Implementation)**
    - Order Sheet의 요구사항에 따라 개발을 진행한다.

4.  **Report 작성 (End of Task)**
    - 작업 완료 후, `docs/order/_templates/report.json`을 복사하여 `docs/order/YYYY-MM-DD-[task_name]-report.json`을 생성한다.
    - `summary`, `changes`, `next_steps` 등을 기록하여 다음 작업자가 문맥을 이어갈 수 있도록 한다.
    - Order Sheet와 Report는 한 쌍으로 관리되어야 한다.

**모든 내용은 한국어로 작성한다.**
