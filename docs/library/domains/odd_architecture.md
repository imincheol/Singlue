# 🏗️ ODD Architecture (프로젝트 아키텍처)

이 프로젝트는 **Order Driven Development (ODD) v5.0** 프로세스에 따라 관리됩니다.

## 📂 4-Layer Specs Structure

문서(`docs/specs/`)는 정보의 성격에 따라 4계층으로 분류됩니다.

| Layer | Directory | Content |
|:---:|:---|:---|
| **0. Origin** | `0_origin/` | 초기 원본 요구사항, API 문서, 외부 소스 |
| **1. Planning** | `1_planning/` | 기획서, 로드맵, 기능 명세 (`features.md`) |
| **2. Design** | `2_design/` | UI/UX 가이드, 디자인 시스템 (`ui_ux.md`) |
| **3. Markup** | `3_markup/` | 테마 시스템, 스타일 가이드 (`theme_system.md`) |
| **4. Dev** | `4_development/` | 기술 스택, DB 구조, 코딩 컨벤션 |

## 📝 Task Management (Tasks & Archive)

### Flat Task Structure
- **Active Tasks**: `docs/odd/tasks/`에 현재 진행 중인 Order/Report만 존재해야 합니다.
- **Archive**: 완료된 작업은 `docs/odd/archive/`로 즉시 이동합니다.
- **Naming**: `YYYYMMDD_{Seq}_{TaskName}_{Type}.json` 형식을 엄수합니다.

## 🏛️ Decision History

### [2025-12-19] Specs Restructuring
- **Context**: 초기에는 `planning`, `development` 등 폴더가 혼재되어 찾기 어려웠음.
- **Decision**: 4-Layer 구조를 도입하고 숫자를 접두사로 붙여 정렬 순서를 강제함.

### [2025-12-20] Flat Tasks Folder
- **Context**: `tasks/YYYY/MM/DD/` 같은 깊은 중첩 구조는 파일 탐색을 느리게 함.
- **Decision**: `tasks` 폴더는 **"현재의 작업판"**으로 정의하고, 모든 하위 디렉토리를 제거(Flat)함. 대신 파일명에 날짜를 포함하여 정렬을 지원함.

## ⚠️ Cautions

1. **Order First**:
   - 어떤 코드도 `Order` 파일 없이 작성될 수 없습니다.
   - `docs/odd/_templates/order.json`을 복사하여 사용하십시오.

2. **Sync Roadmap**:
   - 작업 시작 전 반드시 `docs/odd/roadmap.md`를 최신화하십시오.
