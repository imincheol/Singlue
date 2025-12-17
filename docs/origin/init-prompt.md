# Project Name
**Singlue** (Sing + Glue + Fluency)
> *Slogan: "Stick the Rhythm, Master the Fluency."*

# Project Philosophy
1. **Sing:** 노래를 통해 즐겁게 배운다.
2. **Glue:** 가사와 리듬을 완벽하게 동기화(Sync)한다.
3. **Fluency:** 입에 착 붙는 유창한 언어 실력을 만든다.

# Tech Stack & Package Manager
- **Environment:** React + TypeScript + Vite
- **Package Manager:** **pnpm (Strict Enforcement)**
- **Styling:** Tailwind CSS (Mobile First, Dark Mode)
- **State Management:** Zustand
- **Key Libraries:** `react-youtube`, `@google/generative-ai`, `lucide-react`, `clsx`, `tailwind-merge`

# Core Logic & Requirements

## 1. Package Manager Enforcement (Critical)
- **`package.json` 설정:**
  - `scripts` 섹션에 **`"preinstall": "npx only-allow pnpm"`**을 반드시 추가해라.
  - 이렇게 해서 팀원이나 내가 실수로 `npm install`이나 `yarn install`을 하면 에러가 나고 차단되게 만들어라.

## 2. YouTube Player (Sandbox Safety - Error 153 Fix)
- `react-youtube` 컴포넌트 설정 시:
  - `opts` 객체에 **`host: 'https://www.youtube.com'`** 필수 추가.
  - `origin` 속성은 절대 사용하지 말 것.

## 3. Data Architecture
- **Song:** `{ id, title, lyrics: [{ time, source, pron, trans }] }`
- **VideoMapping:** `{ videoId, songId, globalOffset }` (Offset으로 영상별 싱크 조절)

## 4. "Singlue Curator" (Gemini AI)
- DB에 없는 노래는 **Gemini 1.5 Flash**가 실시간으로 생성.
- **Workflow:** API Key 입력 -> 영상 정보 파싱 -> JSON 생성 -> 검수 -> 저장.
- UI: "AI가 가사와 발음을 뚝딱 만들고 있어요..." 같은 로딩 메시지로 UX 강화.

## 5. UI/UX Requirements
- **Header:** "Singlue" 로고 강조.
- **Lyrics:** 3단 구성 (원문/발음/해석) + Toggle 기능 + 현재 가사 하이라이트.
- **Controls:** Sync Slider (±Sec), Playback Rate.

# Implementation Task
위 요구사항에 맞춰 다음 파일들을 작성해줘.
1. **`package.json`** (preinstall 스크립트 포함)
2. `types/index.ts`
3. `store/useAppStore.ts`
4. `services/gemini.ts`
5. `components/YouTubePlayer.tsx` (Safe Config)
6. `components/LyricsDisplay.tsx`
7. `components/Curator.tsx`
8. `App.tsx`

코드는 에러 없이 실행 가능해야 하며, Tailwind CSS로 스타일링까지 완벽하게 해줘.