# Project Atlas: The Knowledge Network

이 문서는 ODD v5.0 시스템의 **진입점(Entry Point)**이자 **지식의 지도(Map of Knowledge)**입니다.
단순한 파일 목록이 아니라, 개념 간의 **거리(Distance)**와 **관계(Relation)**를 정의합니다.

## 🧭 Navigation (Where to go?)

### 1. ⏱️ Time (Roadmap)

현재 프로젝트가 **어떤 시간(Phase)**에 있고 **무엇을 해야 하는지(Task)** 확인하십시오.

- **Link**: `../odd/roadmap.md`

### 2. 🏛️ Space (Library)

문제를 해결하기 위해 읽어야 할 **책(Book)**을 찾으십시오.

- **Library Root**: `../library/`
- **History Index**: `../odd/history.md` (과거의 경험과 의사결정)

### 3. ⚙️ Process (Workflow)

작업을 수행하는 규칙(ODD)과 절차를 확인하십시오.

- **Rule**: `../odd/README.md`
- **Active Workspace**: `../odd/tasks/`
- **Archives**: `../odd/archive/`

---

## 🔗 Topology & Distance (지식 위상도)

이 프로젝트의 지식들은 아래와 같은 **연관 거리(Similarity Distance)**를 가집니다.
작업 시 **가까운 거리(0.1 ~ 0.3)**의 책들은 반드시 함께 참고해야 합니다.

### 🌌 Cluster A. Player (시청/재생)
>
> **Context**: 사용자가 영상을 보고 노래를 부르는 핵심 경험.

- **Center**: `domains/player_ui.md` (시청 화면)
- **Neighbors**:
  - `domains/sync_logic.md` (거리 0.1): 싱크가 안 맞으면 플레이어가 무의미함.
  - `domains/lyrics_render.md` (거리 0.2): 가사는 플레이어 위에 그려짐.
  - `domains/lyrics_data.md` (거리 0.3): 데이터 구조가 렌더링을 결정함.

### 🌌 Cluster B. Editor (제작/편집)
>
> **Context**: 관리자나 크리에이터가 데이터를 생성하는 경험.

- **Center**: `domains/editor_ui.md` (편집기 UI)
- **Neighbors**:
  - `domains/sync_logic.md` (거리 0.1): 플레이어와 동일한 싱크 로직을 공유하거나 제어함.
  - `tech/db_schema.md` (거리 0.2): 편집 결과는 반드시 DB에 영구 저장됨.

---

## 🧠 How to Traverse (생각의 경로)

AI는 문제를 해결할 때 단편적인 파일만 보지 말고, **생각의 경로**를 따라 이동하십시오.

**Case: "싱크가 자꾸 밀려요" (Issue)**

1. **Start**: `domains/sync_logic.md` (로직 확인)
2. **Move (0.1)**: `domains/player_ui.md` (UI 렌더링 딜레이인가?)
3. **Move (0.3)**: `tech/db_schema.md` (저장된 데이터 자체가 오염되었나?)