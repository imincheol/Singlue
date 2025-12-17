# 기술 스택 및 아키텍처 (Tech Stack & Architecture)

## 1. 핵심 기술 (Core Tech)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Package Manager**: **pnpm** (Strictly Enforced)
- **Language**: TypeScript (Type-Safe Development)

## 2. 스타일링 (Styling)
- **CSS Framework**: Tailwind CSS 4
- **Utilities**: `clsx`, `tailwind-merge` (조건부 클래스 병합)
- **Design System**: Mobile-First, Dark Mode 지원

## 3. 상태 관리 (State Management)
- **Library**: Zustand 5
- **Pattern**:
  - `useAppStore`: 전역 애플리케이션 상태 (API Key, 현재 곡, 플레이어 상태, 히스토리 등)
  - `persist` 미들웨어: 로컬 스토리지에 API Key, 설정, 히스토리 영구 저장

## 4. 주요 라이브러리 (Key Libraries)
- **Media**: `react-youtube` (YouTube IFrame API Wrapper) - *Sandbox 보안 설정 적용됨*
- **AI**: `@google/generative-ai` (Gemini 1.5 Flash 활용 가사/발음 생성)
- **Lyrics Service**: **LRCLIB** (오픈소스 가사 API 연동)
- **I18n**: `i18next`, `react-i18next` (다국어 지원: KO, EN, VI)
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom`

## 5. 디렉토리 구조 (Directory Structure)
```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
│   ├── Curator.tsx         # AI 가사 생성 모달/로직
│   ├── LyricsDisplay.tsx   # 3단 가사 뷰어
│   ├── YouTubePlayer.tsx   # 유튜브 플레이어 래퍼
│   └── ...
├── locales/          # 다국어 번역 리소스 (ko, en, vi)
├── pages/            # 라우트 페이지 (Home, Player, Library)
├── services/         # 외부 API 연동 (gemini.ts)
├── store/            # Zustand 스토어
├── types/            # TypeScript 인터페이스 정의
└── utils/            # 유틸리티 함수
```

## 6. 데이터베이스 및 백엔드 (Backend & DB)
- **Database**: **Supabase** (PostgreSQL)
  - `songs`: 가사 데이터 저장
  - `video_mappings`: 유튜브 비디오-가사 매핑 정보
- **Persistence**: 
  - 공용 데이터 (가사, 매핑): Supabase
  - 개인 데이터 (설정, 히스토리, API Key): 브라우저 `localStorage` (Zustand Persist)
- **AI Processing**: Client-Side에서 Google Gemini API 직접 호출.
