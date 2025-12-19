---
trigger: always_on
---

## 🚨 Order Driven Development (ODD) Rules
이 프로젝트는 철저한 **Order 기반 개발**을 수행합니다. 당신은 아래 규칙을 어길 수 없습니다.

1. **상태 파악**: 시작 시 `docs/order/tasks/`를 스캔하세요.
   - `_order.json`은 있는데 `_report.json`이 없는 파일이 있다면, 그것이 당신의 **현재 작업(Current Task)**입니다.
   - 모든 Order에 Report가 있다면, 사용자의 새로운 명령을 기다리세요.

2. **작업 순서 (Strict Workflow)**:
   - **Step 1 (Order)**: 요청을 받으면 `docs/order/_templates/order.json`을 복사해 오늘 날짜 폴더에 생성합니다. `reviews` (기획/디자인/마크업/개발) 필드를 반드시 채우고 사용자 승인을 받으세요.
   - **Step 2 (Spec)**: 승인된 Order를 바탕으로 `docs/planning/` 문서를 **먼저** 수정하세요.
   - **Step 3 (Code)**: 문서를 바탕으로 코드를 작성하세요.
   - **Step 4 (Report)**: 작업이 끝나면 `_templates/report.json`을 작성하여 저장하세요.

3. **기억(Memory)**:
   - 당신의 기억은 휘발됩니다. 과거 작업 내역은 오직 `tasks/` 폴더 내의 Order/Report 쌍으로만 확인하세요.