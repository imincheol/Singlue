# 테마 시스템 상세 스펙 (Theme System Specification)

## 1. 개요

Singlue 애플리케이션은 다크/라이트 모드를 지원하며, 사용자의 선호도에 따라 전체 UI가 일관되게 전환됩니다.

## 2. 테마 전환 메커니즘

### 2.1. 테마 상태 관리

- **Hook**: `useTheme` (`src/hooks/useTheme.ts`)
- **상태**: `'light' | 'dark'`
- **저장소**: `localStorage` (키: `'theme'`)

### 2.2. 초기화 우선순위

1. **localStorage**: 사용자가 이전에 선택한 테마
2. **시스템 설정**: `prefers-color-scheme` 미디어 쿼리
3. **기본값**: `'dark'`

### 2.3. DOM 적용

- `document.documentElement`에 `dark` 클래스 추가/제거
- Tailwind CSS의 `dark:` 변형을 통해 스타일 적용

## 3. 색상 팔레트

### 3.1. 배경 색상

| 용도 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| 페이지 배경 | `bg-white` | `bg-black` |
| 카드/컨테이너 | `bg-zinc-100` | `bg-zinc-900` |
| 카드 보조 | `bg-zinc-200` | `bg-zinc-800` |
| 입력 필드 | `bg-zinc-100` | `bg-zinc-900` |
| 헤더 | `bg-white/80` | `bg-black/80` |

### 3.2. 텍스트 색상

| 용도 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| 주요 텍스트 | `text-zinc-900` | `text-white` |
| 보조 텍스트 | `text-zinc-600` | `text-zinc-400` |
| 비활성 텍스트 | `text-zinc-500` | `text-zinc-500` |
| 링크/버튼 | `text-zinc-700` | `text-zinc-300` |

### 3.3. 테두리 색상

| 용도 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| 기본 테두리 | `border-zinc-200` | `border-white/5` |
| 강조 테두리 | `border-zinc-300` | `border-zinc-700` |
| 입력 필드 | `border-zinc-300` | `border-zinc-700` |
| 카드 | `border-zinc-200` | `border-white/5` |

### 3.4. 그라디언트

| 용도 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| 제목 그라디언트 | `from-zinc-900 to-zinc-500` | `from-white to-zinc-600` |
| 로고 그라디언트 | `from-zinc-900 to-zinc-500` | `from-white to-zinc-400` |

### 3.5. 인터랙티브 요소

| 상태 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| 호버 배경 | `hover:bg-zinc-200` | `hover:bg-zinc-800` |
| 호버 텍스트 | `hover:text-zinc-900` | `hover:text-white` |
| 활성 배경 | `bg-indigo-600` | `bg-indigo-600` |

## 4. 컴포넌트별 적용 규칙

### 4.1. 전역 규칙

모든 컴포넌트는 다음 규칙을 따라야 합니다:

1. **하드코딩 금지**: 색상을 하나의 모드로만 하드코딩하지 않습니다.
2. **양쪽 모드 지원**: 모든 색상 속성에 `dark:` 변형을 함께 지정합니다.
3. **가독성 우선**: 양쪽 모드에서 텍스트가 명확히 읽혀야 합니다.
4. **일관성 유지**: 같은 용도의 요소는 같은 색상 팔레트를 사용합니다.

### 4.2. 페이지 컴포넌트

모든 페이지 루트 요소는 다음을 포함해야 합니다:

```tsx
<div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
  {/* 페이지 콘텐츠 */}
</div>
```

### 4.3. 카드/컨테이너

```tsx
<div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl">
  {/* 카드 콘텐츠 */}
</div>
```

### 4.4. 버튼

```tsx
// 기본 버튼
<button className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700">

// 강조 버튼 (테마 무관)
<button className="bg-indigo-600 hover:bg-indigo-700 text-white">
```

### 4.5. 입력 필드

```tsx
<input className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600" />
```

### 4.6. 모달/팝업

```tsx
// 오버레이
<div className="bg-black/50 dark:bg-black/70">

// 모달 컨테이너
<div className="bg-white dark:bg-gray-900 border border-zinc-200 dark:border-gray-800">
```

## 5. 컴포넌트별 체크리스트

### 5.1. App.tsx (헤더)

- [ ] 헤더 배경: `bg-white/80 dark:bg-black/80`
- [ ] 헤더 테두리: `border-zinc-200 dark:border-white/5`
- [ ] 로고 그라디언트: `from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400`
- [ ] 버전 텍스트: `text-zinc-600 dark:text-zinc-600`
- [ ] History 링크: `text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white`

### 5.2. ThemeToggle.tsx

- [ ] 버튼 텍스트: `text-zinc-600 dark:text-zinc-500`
- [ ] 호버 텍스트: `hover:text-zinc-900 dark:hover:text-white`
- [ ] 호버 배경: `hover:bg-zinc-200 dark:hover:bg-white/5`

### 5.3. LanguageSwitcher.tsx

- [ ] 버튼 배경: `bg-zinc-200 dark:bg-zinc-900/50`
- [ ] 버튼 테두리: `border-zinc-300 dark:border-white/10`
- [ ] 버튼 텍스트: `text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white`
- [ ] 드롭다운 배경: `bg-white dark:bg-zinc-900`
- [ ] 드롭다운 테두리: `border-zinc-200 dark:border-zinc-800`
- [ ] 드롭다운 항목: `text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800`

### 5.4. HomePage.tsx

- [ ] 페이지 배경: `bg-white dark:bg-black`
- [ ] 제목 그라디언트: `from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-600`
- [ ] 부제목: `text-zinc-600 dark:text-zinc-400`
- [ ] 검색창 배경: `bg-zinc-100 dark:bg-zinc-900`
- [ ] 검색창 테두리: `border-zinc-300 dark:border-zinc-700`
- [ ] 검색창 텍스트: `text-zinc-900 dark:text-white`
- [ ] 플레이스홀더: `placeholder-zinc-400 dark:placeholder-zinc-600`
- [ ] 아이콘: `text-zinc-400 dark:text-zinc-500`
- [ ] 링크: `text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white`

### 5.5. PlayerPage.tsx

- [ ] 페이지 배경: `bg-white dark:bg-black`
- [ ] 페이지 텍스트: `text-zinc-900 dark:text-white`
- [ ] 정보 카드 배경: `bg-zinc-100 dark:bg-zinc-900/50`
- [ ] 정보 카드 테두리: `border-zinc-200 dark:border-white/5`
- [ ] 제목: `text-zinc-900 dark:text-white`
- [ ] 아티스트: `text-zinc-600 dark:text-zinc-400`
- [ ] 버튼 배경: `bg-zinc-200 dark:bg-zinc-800`
- [ ] 버튼 호버: `hover:bg-zinc-300 dark:hover:bg-zinc-700`
- [ ] 빈 상태 배경: `bg-zinc-100 dark:bg-zinc-900/30`
- [ ] 빈 상태 아이콘: `text-zinc-400 dark:text-zinc-500`

### 5.6. LibraryPage.tsx

- [ ] 페이지 배경: `bg-white dark:bg-black`
- [ ] 제목: `text-zinc-900 dark:text-white`
- [ ] 설명: `text-zinc-600 dark:text-zinc-400`
- [ ] 카드 배경: `bg-zinc-100 dark:bg-zinc-900`
- [ ] 카드 테두리: `border-zinc-200 dark:border-white/5`
- [ ] 썸네일 배경: `bg-zinc-200 dark:bg-zinc-800`
- [ ] 빈 상태 배경: `bg-zinc-100 dark:bg-zinc-900/30`
- [ ] 빈 상태 아이콘: `text-zinc-400 dark:text-zinc-600`

### 5.7. LyricsSearchModal.tsx

- [ ] 오버레이: `bg-black/50 dark:bg-black/70`
- [ ] 모달 배경: `bg-white dark:bg-gray-900`
- [ ] 모달 테두리: `border-zinc-200 dark:border-gray-800`
- [ ] 제목: `text-zinc-900 dark:text-white`
- [ ] 닫기 버튼: `text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white`
- [ ] 검색창 배경: `bg-zinc-100 dark:bg-gray-800`
- [ ] 검색창 테두리: `border-zinc-300 dark:border-gray-700`
- [ ] 검색 결과 호버: `hover:bg-zinc-100 dark:hover:bg-gray-800`

### 5.8. ThreeLineLyrics.tsx

- [ ] 컨테이너 배경: `bg-zinc-100 dark:bg-zinc-900/50`
- [ ] 컨테이너 테두리: `border-zinc-200 dark:border-white/5`
- [ ] 현재 가사: `text-zinc-900 dark:text-white`
- [ ] 이전/다음 가사: `text-zinc-500 dark:text-zinc-500`
- [ ] 발음: `text-zinc-600 dark:text-zinc-400`
- [ ] 번역: `text-zinc-600 dark:text-zinc-400`

## 6. 테스트 가이드

### 6.1. 수동 테스트 절차

1. **초기 상태 확인**:
   - 브라우저를 시크릿 모드로 열기
   - 애플리케이션 접속
   - 시스템 설정에 따라 테마가 적용되는지 확인

2. **테마 전환 테스트**:
   - 헤더의 테마 토글 버튼 클릭
   - 모든 요소가 즉시 전환되는지 확인
   - 다시 클릭하여 원래 테마로 복귀 확인

3. **페이지별 테스트**:
   - 각 페이지(홈, 플레이어, 라이브러리)로 이동
   - 양쪽 테마에서 모든 요소가 올바르게 표시되는지 확인
   - 특히 텍스트 가독성에 주의

4. **컴포넌트별 테스트**:
   - LanguageSwitcher 드롭다운 열기
   - LyricsSearchModal 열기
   - 각 컴포넌트가 현재 테마에 맞게 표시되는지 확인

5. **지속성 테스트**:
   - 테마를 변경한 후 페이지 새로고침
   - 선택한 테마가 유지되는지 확인
   - localStorage에 `theme` 키가 저장되었는지 개발자 도구로 확인

### 6.2. 체크리스트

각 페이지/컴포넌트에서 다음을 확인:

- [ ] 배경색이 올바른가?
- [ ] 텍스트가 읽기 쉬운가?
- [ ] 테두리가 보이는가?
- [ ] 호버 효과가 작동하는가?
- [ ] 아이콘이 보이는가?
- [ ] 그라디언트가 올바른가?

## 7. 문제 해결

### 7.1. 일반적인 문제

**문제**: 일부 요소가 한 모드에서만 보임  
**원인**: 하드코딩된 색상 (예: `bg-zinc-900`만 사용)  
**해결**: `dark:` 변형 추가 (예: `bg-white dark:bg-zinc-900`)

**문제**: 테마 전환이 즉시 적용되지 않음  
**원인**: `useTheme` hook을 사용하지 않거나 `dark` 클래스가 DOM에 적용되지 않음  
**해결**: `useTheme` hook 확인 및 `document.documentElement.classList` 확인

**문제**: localStorage에 저장되지 않음  
**원인**: `useTheme` hook의 `useEffect`가 실행되지 않음  
**해결**: hook이 올바르게 마운트되었는지 확인

### 7.2. 디버깅 팁

1. 브라우저 개발자 도구에서 `document.documentElement.classList`를 확인하여 `dark` 클래스가 있는지 확인
2. localStorage에서 `theme` 키의 값을 확인
3. Tailwind CSS의 `dark:` 변형이 올바르게 컴파일되었는지 확인
