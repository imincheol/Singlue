# UI/UX 가이드라인

이 문서는 화면의 레이아웃, 컴포넌트 배치, 인터랙션 상태를 정의합니다.

##  1. Layout Strategy & Breakpoints

### 1.1 Breakpoints
반응형 레이아웃은 **Mobile First**를 원칙으로 하며, 다음 Breakpoint를 기준으로 동작을 분기합니다.

- **Mobile (~767px)**:
  - Single Column Layout.
  - Sidebar: Drawer 메뉴 (Hamburger/Mypage 아이콘).
- **Tablet / Small Desktop (768px ~ 1023px)**:
  - Single Column Layout 권장.
  - Player Layout: 영상 영역 최대 너비 유지, 하단에 콘텐츠 배치.
- **Desktop (1024px ~)**:
  - Multi-column Layout 활성화.
  - Player Layout: [영상 플레이어] + [우측 정보/자막 패널] 가로 배치.
  - **PlayerPage Issue Fix**: 1024px 미만 구간(1023px 이하)에서는 영상 우측의 공백이나 패널 영역이 보이지 않도록 Full Width 처리.

##  2. Page Specific Layouts

### 2.1 Player Page (`/player/:id`)
- **Header**:
  - GNB 고정 여부 확인 (스크롤 시 사라지는지/남는지).
- **Content Area**:
  - **Desktop (>=1024px)**:
    - Left: YouTube Player (Main)
    - Right: Lyrics / Info Panel (Fixed Width or Flex ratio)
  - **Mobile/Tablet (<1024px)**:
    - Top: YouTube Player (Full Width)
    - Bottom: Lyrics / Info Components (Stacked)
- **Controls**:
  - **Karaoke Mode Button**:
    - 기존 마이크 아이콘 -> **'KARAOKE'** 텍스트 버튼으로 변경.
    - 다국어 번역 미적용 (고정 영문 텍스트).
    - 강조 색상 (Primary Color) 사용.
  - **Karaoke Mode**:
    - **Height**: 뷰포트 높이의 50% 제한을 해제하고, 오버레이가 **100% 전체 높이**를 사용하도록 변경한다.
    - **Overlay**: 영상 위에 전체 화면으로 오버레이 되며, 컨트롤바와 가사 영역이 겹치지 않도록 주의한다.

##  3. Components & Widgets

### 3.1 Sync Control
- **Sync Slider**:
  - 위치: Player Page 우측 패널(Desktop) 또는 하단 컨트롤 영역.
  - **Constraint**: 화면에 단 하나의 Sync Slider만 노출되어야 함. (중복 렌더링 제거)

### 3.2 Global Navigation
- **Mobile Menu**: Drawer 방식.
- **Desktop Menu**: Top Horizontal bar.

## 4. Typography & Scaling
- **Karaoke Lyrics**:
  - **Sizing Reference**: 브라우저 창(Window) 크기가 아닌, **실제 영상 플레이어 컨테이너(Video Container)** 크기에 비례하여 폰트 크기를 설정한다.
  - **Implementation**: Container Query 단위(`cqw`, `cqh`) 또는 JavaScript ResizeObserver를 사용하여 영상 크기 변화에 반응한다.

---
(History Log)
- 2025-12-20: 1024px Breakpoint 정책 명시, KARAOKE 버튼 텍스트 변경, Sync Slider 중복 제거 규정 추가.
