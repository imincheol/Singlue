# Project Roadmap & Backlog

이 문서는 프로젝트의 전체 계획과 진행 상황을 관리하는 **Single Source of Truth**입니다.
복잡한 요청이 발생하면 이 문서를 먼저 업데이트하여 승인을 받아야 합니다.

## 📊 Summary

- **Current Phase**: Phase 1 (Core UX Fixes)
- **Status**:
  - [ ] Pending: 8
  - [ ] In Progress: 2
  - [ ] Done: 2

---

## 🚀 Active Phases

### Phase 1. Core UX & Logic Refactor
>
> **Goal**: 사용자가 당장 체감하는 UI 불편함을 해소하고, 데이터 로직을 정상화합니다.

- [x] **[02_responsive]**: 반응형(Mobile) 레이아웃 및 플레이어 크기 수정
  - Priority: High
  - Status: Done

- [x] **[03_sync_refactor]**: 싱크 로직 분리 및 UI 개편
  - Priority: Critical
  - Description: 재생(임시) vs 편집(영구) 로직 분리, 슬라이더 -> 버튼형 UI 변경

- [x] **[14_urgent_build_fix]**: 긴급 빌드 수정 (미사용 변수 제거)
  - Priority: Critical
  - Status: Done

- [ ] **[13_theme_lang_visibility]**: 테마 및 다국어 가시성 개선 (진행 중)
  - Priority: High
  - Status: In Progress
  - Description: GNB 드롭다운 고착화 및 언어 분리 정책 적용

- [ ] **[21_03_player_subtitle_fix]**: 플레이어 자막 크기 및 레이아웃 재수정
  - Priority: High
  - Status: Pending
  - Description: Container Query 적용 실패 건 재진행 (Replaces Order 08)

### Phase 2. Feature Expansion & Infrastructure
>
> **Goal**: 에디터 고도화, 비즈니스 모델 연동 및 배포 안정화

- [ ] **[21_01_karaoke_data_migration]**: 카라오케 데이터 마이그레이션 & 원어 인식
  - Priority: High
  - Status: Pending
  - Description: country_code 추가 및 Legacy 데이터 마이그레이션

- [ ] **[02_branch_strategy]**: 브랜치 전략 수립 및 배포 파이프라인 분리
  - Priority: High
  - Status: Draft

- [ ] **[05_editor_advanced]**: 자막 편집기 고도화 (Split/Merge)
- [ ] **[09_watch_history]**: 시청 기록 및 이어보기

---

## 📅 Backlog (Ideas)
>
> 구체적인 일정이 잡히지 않은 아이디어 보관소

- [ ] 소셜 로그인 연동
- [ ] 관리자 대시보드 차트 시각화

---

## 🏁 Completed
>
> 완료된 Phase 및 Task 보관

- (없음)
