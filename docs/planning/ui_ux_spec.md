# UI/UX 상세 명세 (UI/UX Specifications)

## 1. Typography & Rendering

### 1.1. Main Title with Text Gradients
- `bg-clip-text`와 `text-transparent`를 사용하여 텍스트에 그라디언트를 적용할 경우, 일부 브라우저나 폰트 렌더링 시 **Descender**(g, j, p, q, y 등 글자 아래 부분) 또는 **Ascender**(b, d, h, k, l, t 등 글자 윗 부분)가 잘리는 현상이 발생할 수 있습니다.
- **해결 방안**:
  - `pb-2` (padding-bottom: 0.5rem) 이상의 패딩을 추가하여 클리핑 영역을 텍스트 박스보다 넓게 확보합니다.
  - 필요한 경우 `line-height` (`leading-tight` 등)를 조정하여 텍스트 상하 여백을 확보합니다.
  - 베트남어와 같이 Diacritics(성조 기호)가 많아 상하 공간을 많이 차지하는 언어의 경우, 특히 주의하여 충분한 여백을 둡니다.

## 2. Layout & Spacing

### 2.1. Home Page
- **Hero Section**: 
  - 타이틀은 사용자 시선을 가장 먼저 끄는 요소이므로 가독성을 해치지 않아야 합니다.
  - 모바일에서도 타이틀이 과도하게 줄바꿈되거나 잘리지 않도록 반응형 폰트 사이즈(`text-5xl md:text-7xl`)를 유지하되, 필요 시 미세 조정합니다.
- **Recently Added Section**: 
  - **Layout**: 반응형 그리드 (Mobile: 1열, Tablet: 2열, Desktop: 3-4열)
  - **Card Content**:
    - **Thumbnail**: 16:9 비율 유지, 호버 시 약간의 스케일 업 애니메이션 적용.
    - **Info**: 제목(Truncate 1줄), 가수(Truncate 1줄), 등록일, Synced 배지.
    - **Flag**: 썸네일 우측 상단 또는 메타데이터 영역에 해당 곡의 국가 국기 표시.
  - **Animation**: 스크롤 시 아래에서 위로 부드럽게 나타나는 등장 애니메이션 적용.

### 2.2. Authentication Pages (Login/Register)
- **Central Card Layout**: 화면 중앙에 폼을 배치하여 집중도를 높입니다.
- **Error Feedback**: 입력 오류 발생 시 필드 하단에 붉은색 텍스트로 명확히 표시합니다.
- **Login Flow**: 로그인 성공 시 메인 화면으로 이동합니다. 이메일 인증이 완료되지 않은 경우 로그인 과정에서 인증 오류 메시지가 표시됩니다.
- **Registration Success**: 회원가입 성공 시, 즉시 로그인 페이지로 보내는 대신 "이메일 인증 안내" 메시지를 화면에 표시하여 사용자가 메일을 확인하도록 유도합니다.

### 2.3. Not Found Page (404)
- **Role**: 존재하지 않는 경로로 접근 시 사용자에게 안내 메시지 표시.
- **Layout**:
  - 화면 정중앙에 배치 (Flexbox 활용).
  - **Icon**: 느낌표 아이콘(AlertCircle) 등을 사용하여 오류 상황 인지.
  - **Message**: "Page Not Found" 등의 명확한 헤드라인과 설명 텍스트.
  - **Action**: 홈으로 돌아가는 "Go Home" 버튼 제공.
- **Header/Footer**: 전역 헤더를 유지하여 사용자가 다른 메뉴로 이동할 수 있도록 함.

## 3. Global Navigation Bar (Header)

### 3.1. Layout
- **Left**: 로고 및 서비스 명 (홈으로 이동)
- **Right**: 
  - Library 링크 (회원일 경우 표시)
  - Admin 링크 (관리자일 경우만 표시)
  - **User Info**: 닉네임 표시. 클릭 시 드롭다운 메뉴 (`Settings`, `Sign Out`) 제공.
  - **다국어 지원**: 모든 네비게이션 링크(Library, Admin, Settings, Sign In/Out)는 다국어 처리되어야 합니다.
  - **Sign In**: 비로그인 상태일 경우 표시.
  - 언어 변경 (LanguageSwitcher)
  - 테마 토글

### 3.2. Theme Toggle
- **동작 원칙**:
  1. `localStorage`에 저장된 테마(`theme`)가 있으면 최우선 적용.
  2. 저장된 테마가 없으면 시스템 설정(`prefers-color-scheme`)을 따름.
  3. 시스템 설정이 불투명할 경우 `light` 모드를 기본으로 설정.
- **Interaction**: 토글 클릭 시 즉시 테마 변경 적용 (`html` 태그의 `.dark` 클래스 토글) 및 `localStorage` 업데이트.
- **Persistence**: `localStorage`에 사용자 테마 설정 저장 (`theme`: 'dark' | 'light').

## 4. Theme System

### 4.1. Dark/Light Mode Support
- **Framework**: Tailwind CSS v4 (`@tailwindcss/vite`) 기반.
- **Config Strategy**: `darkMode: 'selector'` 전략을 사용하며, `index.css`의 `@variant dark`를 통해 `.dark` 클래스 기반의 테마 전환을 지원합니다.
- **Implementation**: 
  - `useTheme` 커스텀 훅을 통해 상태 관리 및 `localStorage` 동기화.
  - `src/index.css`에 직접적인 `.dark` 클래스 배경색 fallback을 설정하여 유틸리티 지연 시에도 시각적 피드백 보장.
- **Components**: 모든 페이지(홈, 플레이어, 라이브러리) 및 팝업(가사 검색 등)은 현재 테마에 맞춰 배경색, 텍스트 색상이 변경되어야 함.

## 5. Player Page - Mini Lyrics Display (ThreeLineLyrics)

### 5.1. 레이아웃 요구사항
- **목적**: 플레이어 페이지에서 이전 가사, 현재 가사, 다음 가사를 3줄로 표시하여 사용자가 현재 진행 상황을 한눈에 파악할 수 있도록 합니다.
- **구성**: 
  - 이전 가사 (Previous Line)
  - 현재 가사 (Current Line) - 강조 표시
  - 다음 가사 (Next Line)

### 5.2. 콘텐츠 표시 규칙
- **현재 가사 (Current Line)**:
  - 원문 (Source): 크게 강조 표시
  - 발음 (Pronunciation): 있을 경우 표시 (강조 색상 및 폰트 크기 확대)
  - 번역 (Translation): 있을 경우 표시
- **이전/다음 가사 (Previous/Next Lines)**:
  - 원문, 발음, 번역 모두 표시 (사용자 학습 편의를 위해 전체 데이터 노출)
  - **다음 가사(Next Line)**: 노래를 미리 준비할 수 있도록 투명도를 높게 유지하고 블러를 제거하여 가독성 확보. 특히 발음 부분을 강조함.
  - **이전 가사(Previous Line)**: 지나간 가사임을 알 수 있도록 상대적으로 낮은 불투명도 적용.

### 5.3. 동적 높이 처리
- **문제**: 고정 높이(`min-h-[180px]`)로 인해 현재 가사에 발음과 번역이 추가되면 이전/다음 가사가 잘리는 현상 발생
- **해결 방안**:
  - 고정 높이 제거 또는 충분한 최소 높이 설정
  - 각 가사 라인에 적절한 여백(`space-y-4` 등) 적용
  - 컨테이너가 내용에 따라 자동으로 높이를 조정하도록 `flex` 레이아웃 활용
  - 필요시 `max-h` 및 `overflow-y-auto`를 사용하여 스크롤 가능하도록 설정

### 5.4. 반응형 디자인
- **모바일**: 텍스트 크기를 적절히 조정하여 가독성 유지
- **데스크톱**: 더 큰 텍스트 크기로 표시하여 시각적 임팩트 강화

## 6. Song Registration Wizard UI

### 6.1. Stepper Navigation
- 현재 단계와 전체 단계를 시각적으로 표시 (Step 1/3)하여 사용자가 진행 상황을 인지하도록 합니다.

### 6.2. Forms
- **Input Fields**: 제목, 가수 등 기본 정보 입력 필드.
- **Lyrics Area**: 대량의 텍스트(LRC)를 붙여넣기 쉽도록 충분한 높이 확보.
- **AI Action**: 원클릭으로 AI 생성을 수행하는 강조된 버튼 제공. 로딩 시 스피너 표시.
- **다국어 지원**: 단계별 제목, 입력 필드 레이블, 안내 문구, 버튼 텍스트 등 모든 요소가 사용자의 언어 설정에 따라 번역되어야 합니다.

## 7. Admin Dashboard UI
- **Table Layout**: 사용자 목록, 이메일, 역할, 상태, 가입일 등을 테이블 형태로 표시.
- **Action Buttons**: 승인(Check), 거절(X) 버튼을 아이콘으로 단순화하여 공간 효율성 확보.
- **Status Badges**: 승인(Green), 대기(Yellow), 거절(Red) 상태를 색상으로 구분.

## 8. Library Card UI
- **상태 배지 노출 조건**:
  - **Stage 1 (영상 등록), Stage 2 (가사 매칭)**: 카드의 우측 상단에 해당 단계의 명칭을 배지로 표시합니다.
  - **Stage 3 (공개된 노래)**: 최종 완료 및 공개된 상태이므로 별도의 상태 배지를 노출하지 않아 UI를 간결하게 유지합니다.
- **내 노래 표시**: 본인이 등록한 곡인 경우 좌측 하단에 '내 노래' 레이블을 표시하여 구분합니다.

## 9. Settings UI
- **Quota Banner**: 
  - 현재 쿼터 상태(사용량/최대)를 시각적으로 표시. 
  - 10회 도달 시 경고 메시지 표시.
  - API Key 등록 시 "Unlimited (Infinite)" 표시.
- **API Key Input**: 
  - Gemini API Key를 입력하는 보안 필드 (password type).
  - 저장 버튼 및 성공/실패 피드백 토스트 메시지.

## 10. Message & Feedback System (No Alert Policy)

### 10.1. Zero Browser Alerts
- 사용자 경험(UX)의 연속성을 해치는 브라우저 기본 `alert()` 창 사용을 **금지**합니다.
- 모든 피드백은 앱 내 UI 요소(인라인 메시지, 배너, 토스트 등)로 처리합니다.

### 10.2. Feedback Types
- **Inline Message**: 폼 입력 필드 하단이나 특정 영역 내부에 표시되는 에러/성공 메시지.
- **Top Banner**: 페이지 상단에 고정되거나 플로팅 형태로 나타나는 알림 (예: 회원가입 성공, 라이브러리 접근 제한).
- **Auto-Dismiss**: 일시적인 상태 안내 메시지는 3~5초 후 자동으로 사라지도록 설정하여 불필요한 클릭을 방지합니다.
- **Loading States**: 비동기 작업 시 스피너(Spinner)나 스켈레톤(Skeleton UI)을 사용하여 진행 상황을 시각화합니다.


