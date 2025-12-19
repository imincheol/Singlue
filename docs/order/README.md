# Order Tracking

이 폴더는 작업을 진행하기 전에 할 일을 기록하고, 이전 작업과 다음 작업을 파악하기 위한 공간입니다.
사용자의 요청에 따라 작업을 구체화하고 이력을 관리합니다.

**모든 문서는 반드시 한국어로 작성합니다.**

## Workflow (JSON 기반)
1. **요청 접수 (Request)**
2. **Order 작성**: `docs/order/_templates/order.json` 을 복사하여 작업 요청서 작성
   - 파일명: `YYYY-MM-DD-task-name-order.json`
3. **스펙 확인 및 개발**: 스펙 문서 업데이트 후 구현
4. **Report 작성**: `docs/order/_templates/report.json` 을 복사하여 결과 보고서 작성
   - 파일명: `YYYY-MM-DD-task-name-report.json`
