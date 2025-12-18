# 시작하기 (Getting Started)

이 문서는 개발자가 프로젝트를 로컬 환경에서 실행하고 개발하기 위한 가이드입니다.

## 1. 요구 사항 (Prerequisites)
- **Node.js**: v18 이상 권장
- **Package Manager**: **pnpm** (필수)
  - `npm`이나 `yarn` 사용 시 에러가 발생할 수 있습니다.
  - 설치: `npm install -g pnpm`

## 2. 설치 및 실행 (Installation & Run)
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

## 3. 환경 변수 설정 (Environment Variables)
**⚠️ 중요**: AI 기능을 사용하기 위해서는 **Google Gemini API Key**가 필요합니다.

프로젝트 루트의 `.env` 파일을 생성하거나 수정하여 키를 등록해주세요.

```bash
# .env 파일 생성
touch .env
```

**.env 파일 내용:**
```env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
> Gemini 키는 `AIza`로 시작하는 Google AI Studio 발급 키여야 합니다.  
> Supabase 정보는 프로젝트 설정의 API 섹션에서 확인하실 수 있습니다.

## 4. 빌드 (Build)
배포를 위한 프로덕션 빌드 명령어입니다.
```bash
pnpm build
```
