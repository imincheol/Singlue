# Project History & Decision Log

이 문서는 프로젝트의 **기술적 의사결정(Decision)**과 **히스토리(History)**를 태그 기반으로 추적합니다.
새로운 작업을 시작할 때, 관련 태그를 검색하여 과거의 경험(Why & Side Effects)을 반드시 참고하십시오.

## 🔖 Tag Index
>
> 태그를 클릭하거나 검색하여 관련 로그를 찾으십시오.

- **#sync**: (관련 로그 없음)
- **#ui**: (관련 로그 없음)
- **#mobile**: (관련 로그 없음)
- **#db**: (관련 로그 없음)

---

## 📜 Log Entries (Latest First)

- **Task**: [20251220_13] Theme & Language Visibility Refinement
- **Date**: 2025-12-20
- **Tags**: #ui, #theme, #portal, #refactor
- **Context**: 테마 아이콘 반전, GNB 드롭다운 클리핑 및 클릭 불가, 프로필 드롭다운 가려짐 문제 발생.
- **Decision**: 공통 `Dropdown.tsx`(Portal 기반) 구축하여 전역 적용. 사이트/컨텐츠 언어 분리(`contentLanguage`).
- **Caution**: 드롭다운에 `fixed`+Portal 사용 시 부자연스러운 애니메이션은 DX/UX를 위해 제거 권장. 원어 인식은 데이터 마이그레이션 선행 필요.

> **[Format Guide]**
>
> - **Task**: [Task-ID] 작업명
> - **Date**: YYYY-MM-DD
> - **Tags**: #tag1, #tag2
> - **Context (Why)**: 왜 이 작업을 했는지, 당시의 문제 상황
> - **Decision (What)**: 어떤 해결책을 선택했는지
> - **Caution (Side Effect)**: 미래의 작업자가 주의해야 할 점

- **Task**: [20251220_03] Sync Logic Refactor
- **Date**: 2025-12-20
- **Tags**: #sync, #logic, #ux
- **Context**: 슬라이더 방식의 싱크 조절이 저장 여부를 헷갈리게 하고 조작이 어려움.
- **Decision**: 재생용(User, 휘발성)과 편집용(Draft, 영구적) 오프셋을 분리하고, 버튼형 UI 도입.
- **Caution**: Total Offset 계산 시 반드시 Global + Draft + User를 합산해야 함.

- **Task**: [20251220_03] Layer System Definition
- **Date**: 2025-12-20
- **Tags**: #ui, #z-index, #theme
- **Context**: Z-index 충돌(Dropdown이 가려짐 등)이 빈번하게 발생.
- **Decision**: Semantic Z-Index System (z-gnb, z-overlay) 도입 및 Tailwind Config에 적용.
- **Caution**: 매직 넘버 사용 금지.

- **Task**: [20251220_01] Refactor ODD Tasks Structure
- **Date**: 2025-12-20
- **Tags**: #odd, #process, #archive
- **Context**: 태스크 관리가 복잡해져서 폴더 구조를 플랫하게 변경 필요.
- **Decision**: `docs/odd/tasks/`를 플랫하게 유지하고, 완료된 것은 `archive/`로 이동.
- **Caution**: 파일 이동 시 시스템 동기화 주의.

- **Task**: [20251219_08] Specs Restructuring
- **Date**: 2025-12-19
- **Tags**: #odd, #docs, #structure
- **Context**: 문서가 산발적으로 흩어져 접근성이 떨어짐.
- **Decision**: 4-Layer Specs (Planning, Design, Markup, Dev) 구조로 통합 정리.
- **Caution**: 모든 문서는 해당 레이어 폴더에 위치해야 함.

- **Task**: [20251219_07] Mobile UI/UX Improvement
- **Date**: 2025-12-19
- **Tags**: #mobile, #ui, #responsive
- **Context**: 모바일에서 폰트와 여백이 너무 커서 가독성이 떨어짐.
- **Decision**: Mobile-first Tailwind 클래스 적용 (`gap-4`, `p-4`, `text-4xl` Hero). 불필요한 로그 제거.
- **Caution**: `overflow-x-hidden` 주의.

- **Task**: [20251219_01] Karaoke Mode Implementation
- **Date**: 2025-12-19
- **Tags**: #karaoke, #player, #feature
- **Context**: 사용자가 노래를 따라 부를 수 있는 기능 부재.
- **Decision**: `KaraokeOverlay` 컴포넌트 추가, `useAppStore` 전역 상태 관리, Fullscreen API 연동.
- **Caution**: Safari 모바일에서는 사용자 액션 없이 전체화면 불가.