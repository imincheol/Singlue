# ODD v5.0: Agentic Workflow System

이 프로젝트는 **Order Driven Development v5.0** 방법론을 따릅니다.
모든 작업은 **Atlas**에서 시작하여 **Order**를 통해 수행되고, **Library**에 지식으로 축적됩니다.

## 🔄 Core Workflow (업무 순서)

### Step 1. Navigation (Atlas)

- 작업 시작 전, `docs/library/ATLAS.md`를 읽고 연관된 지식(Books)과 현재 목표(Roadmap)를 파악합니다.

### Step 2. Order Drafting (Student Agent)

- `_templates/order.json`을 복사하여 `docs/odd/tasks/`에 주문서를 작성합니다.
- **Rule**: 작성 후 반드시 **STOP** 하고 사용자의 승인을 기다립니다.

### Step 3. Execution (Student Agent)

- 승인 시 `_templates/progress.json`을 생성하고 작업을 시작합니다.
- 코드를 수정하기 전, 반드시 관련 **Spec 문서**를 먼저 업데이트합니다.
- **Rule**: `progress.json`에 로그를 남기며 진행합니다.

### Step 4. Reporting (Student Agent)

- 작업 완료 시 `_templates/report.json`을 작성합니다.
- `progress.json`을 삭제하고, 완료된 파일들을 `archive/` 폴더로 이동합니다.

### Step 5. Knowledge Update (Librarian Agent)

- 리포트 내용을 분석하여 `docs/odd/history.md`와 `docs/library/` 내의 문서들을 업데이트합니다.

---

## 📂 Directory Structure

- **`tasks/`**: 현재 진행 중인 작업 (Active)
- **`archive/`**: 완료된 작업 (ReadOnly)
- **`_templates/`**: 업무용 JSON 서식
- **`roadmap.md`**: 전체 진행 계획표
- **`history.md`**: 태그 기반 히스토리 인덱스