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
