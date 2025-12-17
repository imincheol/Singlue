# 구현된 기능 목록 (Implemented Features)

## 1. 핵심 기능 (Core Features)
### 🎵 YouTube Player Integration
- **기능**: `react-youtube`를 이용한 영상 재생.
- **보안**: 샌드박스 모드 활성화 (`host: 'https://www.youtube.com'`, origin 제거) - Error 153 방지.
- **상태 동기화**: 재생/일시정지, 현재 재생 시간, 영상 길이 등 `useAppStore`를 통해 전역 상태 관리.

### 🤖 AI Curator (Gemini)
- **기능**: Gemini 1.5 Flash 모델을 이용한 실시간 가사 생성.
- **프로세스**: API Key 입력 → 영상 정보 파싱 → 프롬프트 전송 → JSON 가사(원문/발음/해석) 생성 → 로컬 저장.
- **모델**: `gemini-1.5-flash` 사용.

### 📝 Lyrics Display System
- **3단 보기**: 원문(Source), 발음(Pron), 해석(Trans) 동시 표시.
- **토글 기능**: 사용자가 발음/해석 표시 여부를 켜고 끌 수 있음 (`zustand` persist 저장).
- **오토 스크롤**: 현재 재생 시간에 맞춰 활성 가사 강조 및 자동 스크롤.

### 🌍 Internationalization (i18n)
- **지원 언어**: 한국어(ko), 영어(en), 베트남어(vi).
- **자동 감지**: 브라우저 언어 설정 기반 초기 언어 감지.
- **Language Switcher**: 헤더에서 언어 변경 가능.
- **번역 범위**: 홈, 플레이어, 모달, 큐레이터 UI 전체.

## 2. 사용자 편의 기능 (UX)
### ⏯️ Player Controls
- **제어**: 재생/일시정지, 이전/다음(히스토리 기반), 탐색 바(Progress Bar).
- **배속 조절**: 0.5x ~ 2.0x 재생 속도 조절.
- **싱크 조절**: 오디오와 가사 싱크가 안 맞을 경우 오프셋 미세 조정 가능.

### 📚 My Library (History)
- **자동 저장**: 재생한 영상은 자동으로 히스토리에 저장 (최대 50개).
- **영속성**: 브라우저를 닫아도 기록 유지 (`localStorage`).
- **메타데이터**: 썸네일, 제목, 연결된 가사 데이터(`linkedSong`) 함께 저장.

## 3. 기능 토글 및 설정
- **Pronunciation Toggle**: 발음 표시 ON/OFF.
- **Translation Toggle**: 해석 표시 ON/OFF.
- **API Key Management**: 사용자가 직접 Gemini API Key 입력 및 저장.
