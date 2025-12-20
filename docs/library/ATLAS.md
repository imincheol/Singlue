# 🗺️ Knowledge Atlas (지식의 지도)

이 문서는 프로젝트의 **지형도(Topology)**입니다.
도서관(`docs/library/`)에 저장된 모든 지식(Books)의 위상 관계와 진입점을 정의합니다.

## 📍 Topology (지식의 연결)

### 1. Core Logic (핵심 로직)
- **[Sync Logic](domains/sync_logic.md)**: 싱크 오프셋 계산 공식과 데이터 흐름 (`totalOffset`)
- **[Player & Karaoke](domains/player_karaoke.md)**: 유튜브 플레이어 연동 및 카라오케 오버레이

### 2. Implementation (구현 상세)
- **[Web Layer System](domains/web_layer_system.md)**: Z-Index, Theme, Tailwind 설정
- **[Layout & Responsive](domains/layout_responsive.md)**: 모바일/데스크탑 반응형 처리 전략

### 3. Process & Architecture
- **[ODD Architecture](domains/odd_architecture.md)**: 4-Layer Specs, Task 관리 규칙

## 🧭 Navigation Guide (탐색 가이드)
- **UI를 건드린다면**: `Layout` -> `Web Layer` 순서로 확인.
- **싱크가 안 맞다면**: `Sync Logic` -> `Player` 확인.
