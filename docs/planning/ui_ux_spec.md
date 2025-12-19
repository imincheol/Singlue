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
  - **Layout**: 상단 키비주얼 영역은 뷰포트 높이의 약 75%(`75vh`)를 차지하도록 설정하여, 하단 콘텐츠(Recently Added)가 자연스럽게 보이도록 유도합니다.
  - 상단 영역과 하단 목록 영역을 물리적으로 분리하여, 목록 로딩 시 상단 콘텐츠의 레이아웃(중앙 정렬)이 침범받거나 밀리지 않도록 고정합니다.
  - 모바일에서도 타이틀이 과도하게 줄바꿈되거나 잘리지 않도록 반응형 폰트 사이즈(`text-5xl md:text-7xl`)를 유지하되, 필요 시 미세 조정합니다.
- **Recently Added Section**: 
  - **Layout**: 반응형 그리드 (Mobile: 1열, Tablet: 2열, Desktop: 3-4열)
  - Hero Section 바로 하단에 이어서 배치합니다.
  - **Card Content**:
    - **Thumbnail**: 16:9 비율 유지, 호버 시 약간의 스케일 업 애니메이션 적용.
    - **Info**: 제목(Truncate 1줄), 가수(Truncate 1줄), 등록일, Synced 배지.
    - **Flag**: 썸네일 우측 상단 또는 메타데이터 영역에 해당 곡의 국가 국기 표시.
  - **Animation**: 스크롤 시 아래에서 위로 부드럽게 나타나는 등장 애니메이션 적용.

### 2.2. Authentication Pages (Login/Register)
- **Central Card Layout**: 화면 중앙에 폼을 배치하여 집중도를 높입니다.
- **Error Feedback**: 입력 오류 발생 시 필드 하단에 붉은색 텍스트로 명확히 표시합니다.
- **Login Flow**: 로그인 성공 시 메인 화면으로 이동합니다.
- **Registration Success**: 회원가입 성공 시, 즉시 로그인 페이지로 보내는 대신 "이메일 인증 안내" 메시지를 화면에 표시하여 사용자가 메일을 확인하도록 유도합니다.


### 2.3. Not Found Page (404)
- **Role**: 존재하지 않는 경로로 접근 시 사용자에게 안내 메시지 표시.
- **Layout**:
  - 화면 정중앙에 배치 (Flexbox 활용).
  - **Icon**: 느낌표 아이콘(AlertCircle) 등을 사용하여 오류 상황 인지.
  - **Message**: "Page Not Found" 등의 명확한 헤드라인과 설명 텍스트.
  - **Action**: 홈으로 돌아가는 "Go Home" 버튼 제공.
- **Header/Footer**: 전역 헤더를 유지하여 사용자가 다른 메뉴로 이동할 수 있도록 함.

### 2.4. Player Page Layout
- **Spacing**:
  - **Vertical Margins**: 화면 상단(Top)과 하단(Bottom)에 충분한 여백을 두어 콘텐츠가 브라우저 엣지에 붙지 않도록 합니다. 데스크톱 기준 하단 여백은 `pb-25`(약 6.25rem)를 권장합니다.
  - **No Desktop Scroll**: 데스크톱(PC) 환경의 Player Page에서는 브라우저 자체의 스크롤바가 생기지 않도록 **페이지 스크롤을 방지**합니다. 콘텐츠가 뷰포트를 초과할 경우 내부 스크롤(Inner Scroll)로 처리합니다.
  - **Fluid Height**: 데스크톱 환경에서는 브라우저 높이에 맞춰 콘텐츠가 늘어나되, 하단에 최소 `2rem` (32px) 이상의 여백을 보장해야 합니다.
  - **Column Alignment**: 좌측 컬럼(영상 정보 + 플레이어 + 컨트롤)과 우측 컬럼(메인 가사창)의 상단 시작점은 반드시 **동일한 높이(Top Aligned)**를 유지해야 합니다.
  - **Header Clearance**: 상단 헤더와의 간격은 고정된 헤더 높이를 고려하여 겹치지 않으면서도 지나치게 넓지 않도록 적절히(`lg:pt-10` 등) 조정합니다.



## 3. Global Navigation Bar (Header)

### 3.1. Layout
- **Positioning**: **Static (Relative)** 배치를 사용하여 페이지 흐름에 자연스럽게 위치시킵니다.
  - 페이지 스크롤 시 상단에 고정되지 않고 콘텐츠와 함께 위로 사라집니다.
  - 이를 통해 플레이어 피이지 등에서 뷰포트 높이 계산(`100vh - headerHeight`)을 단순화하고, 콘텐츠 영역을 최대로 확보합니다.
- **Left**: 로고 및 서비스 명 (홈으로 이동)
- **Right**: 
  - Library 링크 (회원일 경우 표시)
  - Admin 링크 (관리자일 경우만 표시)
  - 언어 변경 (LanguageSwitcher): KO, EN, VI, JA, ZH 지원
  - **User Info**: 닉네임 표시. 클릭 시 드롭다운 메뉴 (`Settings`, `Sign Out`) 제공.
  - **Sign In**: 비로그인 상태일 경우 표시.
  - **User Info**: 닉네임 표시. 클릭 시 드롭다운 메뉴 (`Settings`, `Sign Out`) 제공.
  - **Sign In**: 비로그인 상태일 경우 표시.
  - 테마 토글

### 3.2. Responsive Implementation (Mobile GNB)
- **Breakpoints**: 모바일 화면(`sm` 이하)에서는 상단 메뉴 아이템들이 공간 부족으로 겹치거나 잘리지 않도록 레이아웃을 변경합니다.
- **Hamburger Menu**:
  - 기존의 `Right` 섹션 아이템들(Library, Admin, Language, User Info, Theme)을 모두 숨기고, **햄버거 메뉴 아이콘(Menu)** 하나만 표시합니다.
  - 아이콘 클릭 시, 화면 우측에서 좌측으로 슬라이드되는 **사이드 드로어(Side Drawer)** 메뉴가 열립니다.
- **Side Drawer**:
  - **구성**:
    - 최상단: 닫기 버튼(X) 및 사용자 프로필 요약.
    - 메인 메뉴: Library, Admin 등 네비게이션 링크.
    - 설정: 언어 변경, 테마 토글 등.
  - **Interaction**:
    - 메뉴 외부 영역(Overlay) 클릭 시 닫힘.
    - 메뉴 항목 클릭 시 해당 페이지로 이동하며 드로어 닫힘.
  - **Animation**: 부드러운 슬라이드 인/아웃 효과 (`transform` & `transition` 활용).

### 3.3. Theme Toggle
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
- **항목 구성**:
  - 원문 (Source): 가장 크게 강조 표시
  - 발음 (Pronunciation): 선택 시 표시
  - 번역 (Translation): 선택 시 표시
- **표시 방식**:
  - **ThreeLineLyrics (기본)**: 현재 가사를 중심으로 이전/다음 가사를 함께 표시할 수 있으나, 가독성을 위해 현재 가사 집중 형식을 권장합니다.
  - **KaraokeOverlay (노래방)**: **오직 현재 가사(Current Line)만 표시**합니다. 다음 가사는 표시하지 않아 몰입도를 높입니다.

### 5.3. Lyrics Control Bars (Split System)
- **구조**: 기능의 목적에 따라 두 개의 바(Bar)로 분리하여 레이아웃을 정돈합니다.
- **A. 재생 제어 바 (Playback Control Bar)** (Bottom of Player or Top of Lyrics):
  - **대상**: 모든 사용자.
  - **구성 요소**:
    - [재생 싱크 조절 Slider]: 개인 맞춤형 싱크 조절.
    - [언어 선택 Dropdown]: 노래 언어(KO, EN, JA 등) 선택. 데이터 상태(✅/🌑) 표시. 생성되지 않은 언어 선택 시 생성 유도 UI 표시.
    - [Toggle Buttons]: 발음(Aa) / 해석(文) 켜기/끄기.
- **B. 편집 제어 바 (Edit Control Bar)** (Authorized Only):
  - **대상**: 곡 생성자(Owner) 또는 관리자.
  - **위치**: 재생 제어 바 상단 또는 '설정/편집' 메뉴 내부. 모바일에서는 공간 절약을 위해 접혀있거나 별도 팝업으로 처리.
  - **구성 요소**:
    - [원어 싱크 조절 Slider]: DB 데이터 수정. "Global Sync" 라벨링.
    - [가사 변경 버튼]: 검색 모달 호출.
    - [AI 생성 관리]: "AI로 채우기" 또는 "언어별 생성" 버튼.

    - [AI 생성 관리]: "AI로 채우기" 또는 "언어별 생성" 버튼.

### 5.4. Karaoke Mode & Overlay UI
- **진입점**: Player Page 상단 정보 영역 **최우측** 아이콘 (Toggle).
- **레이아웃 구조**:
  - **Container**: Video Player 영역(`relative`) 내부의 하단(`absolute bottom-0`).
  - **Visual Style**: 가독성을 위해 **반투명 검정 배경**을 사용하며, 상단 모서리에 **Rounded(둥근)** 효과를 적용하여 부드러운 느낌을 줍니다.
- **콘텐츠 표시 (Lyrics Area)**:
  - **Interleaved Layout**: 가독성을 위해 **현재 라인**과 **다음 라인**을 교차하여 배치합니다.
    - 순서: `가사(현)` -> `가사(다음)` -> `발음(현)` -> `발음(다음)` -> `해석(현)` -> `해석(다음)`
  - **Visual Hierarchy**:
    - **Current Line**: 밝은 색상, 높은 불투명도(100%), 굵은 폰트.
    - **Next Line**: 무채색(Gray), 낮은 불투명도(50%), 일반 폰트.
  - **View Options**:
    - **Source(가사)**: 항상 표시 (토글 없음).
    - **Next Line**: 토글 가능 (아이콘: 목록/화살표 등).
    - **Pronunciation/Translation**: 토글 가능.
  - **Font Control (Calibration)**:
    - **Dual Scale System**: 단순 배율이 아닌 **사용성 기반의 범위 매핑**을 사용합니다.
      - **일반 모드**: 1~10단계. (실제 크기: `2vmin` ~ `6vmin`)
      - **전체화면**: 1~20단계. (실제 크기: `4vmin` ~ `15vmin`)
    - 사용자가 크기를 조절할 수 있는 **[가사 크기 + / -]** 버튼을 제공합니다.
- **제어 영역 (Controls Area)**:
  - **Layering (Z-Index)**: 가사 폰트가 커지더라도 제어바를 덮지 않도록, 제어 영역은 항상 가사 영역보다 **상위 레이어(High Z-Index)**에 위치해야 합니다.
  - **Exit 버튼 제거**: 오버레이 내부에서는 모드 종료 버튼을 제거하고, 상단 진입점 버튼으로 통일합니다.
  - **Timeline**: 재생 바는 전체화면 시 가로로 확장됩니다.
- **전체화면 (Fullscreen)**:
  - 브라우저 Fullscreen API를 Video Container 요소에 적용하여 오버레이가 영상과 함께 커지도록 합니다.

### 5.5. 동적 높이 처리
- **문제**: 고정 높이(`min-h-[180px]`)로 인해 현재 가사에 발음과 번역이 추가되면 이전/다음 가사가 잘리는 현상 발생
- **해결 방안**:
  - 고정 높이 제거 또는 충분한 최소 높이 설정
  - 각 가사 라인에 적절한 여백(`space-y-4` 등) 적용
  - 컨테이너가 내용에 따라 자동으로 높이를 조정하도록 `flex` 레이아웃 활용
  - 필요시 `max-h` 및 `overflow-y-auto`를 사용하여 스크롤 가능하도록 설정

### 5.5. 반응형 디자인
- **모바일**:
  - 텍스트 크기를 적절히 조정하여 가독성 유지.
  - 편집 제어 바는 화면을 가리지 않도록 아코디언 메뉴나 모달로 처리 권장.
- **데스크톱**: 더 큰 텍스트 크기로 표시하여 시각적 임팩트 강화.

## 6. Song Registration Wizard UI

### 6.1. Stepper Navigation
- 현재 단계와 전체 단계를 시각적으로 표시 (Step 1/3)하여 사용자가 진행 상황을 인지하도록 합니다.

### 6.2. Forms
- **Input Fields**: 제목, 가수 등 기본 정보 입력 필드.
- **Lyrics Area**: 대량의 텍스트(LRC)를 붙여넣기 쉽도록 충분한 높이 확보.
- **AI Action**: 원클릭으로 AI 생성을 수행하는 강조된 버튼 제공. 로딩 시 스피너 표시.
- **다국어 지원**: 단계별 제목, 입력 필드 레이블, 안내 문구, 버튼 텍스트 등 모든 요소가 사용자의 언어 설정에 따라 번역되어야 합니다.

## 7. Admin Dashboard UI
- **Table Layout**: 사용자 목록, 이메일, 역할, 가입일 등을 테이블 형태로 표시.

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
  - API Key 등록 시 "Unlimited (Infinite)" 표시.
- **Interaction Design**:
  - **Click over Hover**: 모바일 환경 호환성을 위해 드롭다운 메뉴 등 중요 UI 요소는 호버(hover) 대신 클릭(click) 이벤트를 사용해야 합니다.
  - **Click-Outside**: 드롭다운이 열려있는 상태에서 외부 영역을 클릭하면 닫히도록 처리해야 합니다.
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

### 10.3. 공지사항 및 업데이트 내역 (Changelog)
- **위치**: GNB 좌측 로고 및 브랜드명 바로 우측.
- **아이콘**: `Bell` (종) 아이콘.
- **Interaction**: 클릭 시 화면 중앙에 모달(Modal)로 업데이트 히스토리를 표시.
- **모달 디자인**:
  - **Header**: "업데이트 소식" 타이틀.
  - **Body**: 타임라인 형태의 버전별 변경사항 목록.
  - **Footer**: 닫기 버튼.


